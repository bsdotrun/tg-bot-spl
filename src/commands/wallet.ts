import { Telegraf, Markup } from 'telegraf';
import { UserService } from '../services/userService';
import { WalletService } from '../services/walletService';
import bs58 from 'bs58';

const walletService = new WalletService();

export function walletCommands(bot: Telegraf, userService: UserService) {
  // Shared wallet menu function
  const showWalletMenu = async (ctx: any, isEdit: boolean = false) => {
    const userId = ctx.from!.id.toString();
    const user = await userService.getUser(userId);
    
    const hasWallet = user.wallets && user.wallets.length > 0;
    const activeWallet = hasWallet ? user.wallets.find(w => w.isActive) : null;
    
    let message = '💼 *Wallet Management*\n\n';
    
    if (activeWallet) {
      const balance = await walletService.getBalance(activeWallet.publicKey);
      message += `*Active Wallet:*\n`;
      message += `Address: \`${activeWallet.publicKey}\`\n`;
      message += `Balance: ${balance.toFixed(4)} SOL\n`;
      message += `Name: ${activeWallet.name}\n\n`;
    } else {
      message += 'No active wallet. Please create or import one.\n\n';
    }
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('➕ Create Wallet', 'wallet_create'),
        Markup.button.callback('📥 Import Wallet', 'wallet_import')
      ],
      [
        Markup.button.callback('💰 Balance', 'wallet_balance'),
        Markup.button.callback('📤 Deposit', 'wallet_deposit')
      ],
      [
        Markup.button.callback('🔄 Switch Wallet', 'wallet_switch'),
        Markup.button.callback('📋 List Wallets', 'wallet_list')
      ],
      [
        Markup.button.callback('🔑 Export Key', 'wallet_export'),
        Markup.button.callback('❌ Delete Wallet', 'wallet_delete')
      ],
      [Markup.button.callback('« Back to Menu', 'main_menu')]
    ]);
    
    if (isEdit) {
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        ...keyboard
      });
    } else {
      await ctx.replyWithMarkdown(message, keyboard);
    }
  };
  
  // Wallet main menu command
  bot.command('wallet', async (ctx) => {
    await showWalletMenu(ctx, false);
  });
  
  // Wallet main menu callback (for "Back to Wallet" button)
  bot.action('wallet_main', async (ctx) => {
    await ctx.answerCbQuery();
    await showWalletMenu(ctx, true);
  });
  
  // Create wallet callback
  bot.action('wallet_create', async (ctx) => {
    const userId = ctx.from!.id.toString();
    
    try {
      const wallet = await walletService.createWallet();
      await userService.addWallet(userId, {
        publicKey: wallet.publicKey.toBase58(),
        privateKey: wallet.secretKey,
        name: `Wallet ${Date.now()}`,
        isActive: true
      });
      
      // Convert private key to base58 (standard Solana format)
      const privateKeyBase58 = bs58.encode(wallet.secretKey);
      
      const message = `
✅ *Wallet Created Successfully!*

*Address:*
\`${wallet.publicKey.toBase58()}\`

*Private Key (Base58):* (Click to reveal)
||${privateKeyBase58}||

⚠️ *IMPORTANT:*
• Save your private key securely
• Never share it with anyone
• You'll need it to recover your wallet
• This is the same format used by Phantom/Solflare

Fund your wallet to start trading!
      `;
      
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('« Back to Wallet', 'wallet_main')]
        ])
      });
    } catch (error) {
      await ctx.answerCbQuery('❌ Failed to create wallet');
    }
  });
  
  // Import wallet callback
  bot.action('wallet_import', async (ctx) => {
    await ctx.editMessageText(
      '📥 *Import Wallet*\n\nPlease send your private key or seed phrase.\n\n⚠️ Make sure you\'re in a private chat!',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('« Cancel', 'wallet_main')]
        ])
      }
    );
    
    // Set user state to expect private key
    await userService.setUserState(ctx.from!.id.toString(), 'AWAITING_PRIVATE_KEY');
  });
  
  // Balance callback
  bot.action('wallet_balance', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const user = await userService.getUser(userId);
    const activeWallet = user.wallets?.find(w => w.isActive);
    
    if (!activeWallet) {
      await ctx.answerCbQuery('No active wallet');
      return;
    }
    
    try {
      const balance = await walletService.getBalance(activeWallet.publicKey);
      const tokens = await walletService.getTokenBalances(activeWallet.publicKey);
      
      let message = `💰 *Wallet Balance*\n\n`;
      message += `*SOL Balance:* ${balance.toFixed(4)} SOL\n\n`;
      
      if (tokens.length > 0) {
        message += `*Token Holdings:*\n`;
        for (const token of tokens.slice(0, 10)) {
          message += `• ${token.symbol}: ${token.balance}\n`;
        }
      } else {
        message += `No token holdings\n`;
      }
      
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback('🔄 Refresh', 'wallet_balance'),
            Markup.button.callback('« Back', 'wallet_main')
          ]
        ])
      });
    } catch (error) {
      await ctx.answerCbQuery('❌ Failed to fetch balance');
    }
  });
  
  // Deposit callback
  bot.action('wallet_deposit', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const user = await userService.getUser(userId);
    const activeWallet = user.wallets?.find(w => w.isActive);
    
    if (!activeWallet) {
      await ctx.answerCbQuery('No active wallet');
      return;
    }
    
    const message = `
📤 *Deposit Address*

Send SOL or SPL tokens to this address:

\`${activeWallet.publicKey}\`

⚠️ Only send Solana-based assets to this address!
    `;
    
    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('« Back to Wallet', 'wallet_main')]
      ])
    });
  });
  
  // List wallets callback
  bot.action('wallet_list', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const user = await userService.getUser(userId);
    
    if (!user.wallets || user.wallets.length === 0) {
      await ctx.answerCbQuery('No wallets found');
      return;
    }
    
    let message = '📋 *Your Wallets*\n\n';
    
    for (const wallet of user.wallets) {
      const balance = await walletService.getBalance(wallet.publicKey);
      message += `${wallet.isActive ? '✅' : '⚪️'} *${wallet.name}*\n`;
      message += `Address: \`${wallet.publicKey.slice(0, 8)}...${wallet.publicKey.slice(-8)}\`\n`;
      message += `Balance: ${balance.toFixed(4)} SOL\n\n`;
    }
    
    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('« Back to Wallet', 'wallet_main')]
      ])
    });
  });
  
  // Export private key callback
  bot.action('wallet_export', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const user = await userService.getUser(userId);
    const activeWallet = user.wallets?.find(w => w.isActive);
    
    if (!activeWallet) {
      await ctx.answerCbQuery('No active wallet');
      return;
    }
    
    // Convert private key to base58
    const privateKeyBase58 = bs58.encode(activeWallet.privateKey);
    
    const message = `
🔑 *Export Private Key*

*Wallet:* ${activeWallet.name}
*Address:*
\`${activeWallet.publicKey}\`

*Private Key (Base58):* (Click to reveal)
||${privateKeyBase58}||

⚠️ *SECURITY WARNING:*
• NEVER share this key with anyone
• Anyone with this key can access your funds
• Make sure you're in a private chat
• Delete this message after saving
    `;
    
    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('« Back to Wallet', 'wallet_main')]
      ])
    });
  });
  
  // Handle private key import
  bot.on('text', async (ctx, next) => {
    const userId = ctx.from!.id.toString();
    const userState = await userService.getUserState(userId);
    
    if (userState === 'AWAITING_PRIVATE_KEY') {
      try {
        const input = ctx.message.text;
        const wallet = await walletService.importWallet(input);
        
        await userService.addWallet(userId, {
          publicKey: wallet.publicKey.toBase58(),
          privateKey: wallet.secretKey,
          name: `Imported ${Date.now()}`,
          isActive: true
        });
        
        await userService.setUserState(userId, 'IDLE');
        
        const message = `
✅ *Wallet Imported Successfully!*

*Address:*
\`${wallet.publicKey.toBase58()}\`

Your wallet is now active and ready to use!
        `;
        
        await ctx.reply(message, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback('💰 View Balance', 'wallet_balance'),
              Markup.button.callback('📤 Deposit', 'wallet_deposit')
            ],
            [
              Markup.button.callback('💵 Buy Tokens', 'quick_buy'),
              Markup.button.callback('💸 Sell Tokens', 'quick_sell')
            ],
            [
              Markup.button.callback('🔄 Wallet Menu', 'wallet_main'),
              Markup.button.callback('« Main Menu', 'main_menu')
            ]
          ])
        });
        
        // Delete the message with private key for security
        await ctx.deleteMessage();
      } catch (error) {
        await ctx.reply('❌ Invalid private key or seed phrase. Please try again.', {
          ...Markup.inlineKeyboard([
            [Markup.button.callback('« Cancel', 'wallet_main')]
          ])
        });
      }
      
      return;
    }
    
    return next();
  });
}
