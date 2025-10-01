import { Telegraf, Markup } from 'telegraf';
import { UserService } from '../services/userService';
import { TradingService } from '../services/tradingService';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const tradingService = new TradingService();

export function tradingCommands(bot: Telegraf, userService: UserService) {
  // Buy command
  bot.command('buy', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('0.1 SOL', 'buy_0.1'),
        Markup.button.callback('0.5 SOL', 'buy_0.5'),
        Markup.button.callback('1 SOL', 'buy_1')
      ],
      [
        Markup.button.callback('5 SOL', 'buy_5'),
        Markup.button.callback('10 SOL', 'buy_10'),
        Markup.button.callback('Custom', 'buy_custom')
      ],
      [Markup.button.callback('« Back to Menu', 'main_menu')]
    ]);
    
    await ctx.reply(
      '💰 *Buy Tokens*\n\nPaste token address and select amount:',
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
    
    await userService.setUserState(ctx.from!.id.toString(), 'AWAITING_TOKEN_ADDRESS_BUY');
  });
  
  // Sell command
  bot.command('sell', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('25%', 'sell_25'),
        Markup.button.callback('50%', 'sell_50'),
        Markup.button.callback('75%', 'sell_75')
      ],
      [
        Markup.button.callback('100%', 'sell_100'),
        Markup.button.callback('Custom', 'sell_custom')
      ],
      [Markup.button.callback('« Back to Menu', 'main_menu')]
    ]);
    
    await ctx.reply(
      '💸 *Sell Tokens*\n\nPaste token address and select percentage:',
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
    
    await userService.setUserState(ctx.from!.id.toString(), 'AWAITING_TOKEN_ADDRESS_SELL');
  });
  
  // Quick swap
  bot.command('swap', async (ctx) => {
    await ctx.reply('🔄 *Quick Swap*\n\nFormat: [amount] [from_token] to [to_token]\n\nExample: 1 SOL to USDC');
  });
  
  // Buy callbacks
  bot.action(/buy_(.+)/, async (ctx) => {
    const amount = ctx.match[1];
    const userId = ctx.from!.id.toString();
    const userData = await userService.getUserData(userId);
    
    if (!userData.pendingTokenAddress) {
      await ctx.answerCbQuery('Please enter token address first');
      return;
    }
    
    const user = await userService.getUser(userId);
    const activeWallet = user.wallets?.find(w => w.isActive);
    
    if (!activeWallet) {
      await ctx.answerCbQuery('No active wallet');
      return;
    }
    
    await ctx.answerCbQuery('Processing buy order...');
    
    try {
      const amountSol = amount === 'custom' ? userData.customAmount : parseFloat(amount);
      
      const message = `
🔄 *Processing Buy Order*

Token: \`${userData.pendingTokenAddress}\`
Amount: ${amountSol} SOL
Slippage: ${user.settings?.slippage || 50}%
Priority Fee: ${user.settings?.priorityFee || 0.001} SOL

Please wait...
      `;
      
      await ctx.editMessageText(message, { parse_mode: 'Markdown' });
      
      const result = await tradingService.buyToken(
        activeWallet,
        userData.pendingTokenAddress,
        amountSol,
        user.settings?.slippage || 50,
        user.settings?.priorityFee || 0.001
      );
      
      if (result.success) {
        const successMessage = `
✅ *Buy Order Successful!*

Token: \`${userData.pendingTokenAddress}\`
Amount Spent: ${amountSol} SOL
Tokens Received: ${result.tokensReceived}
Transaction: [View on Solscan](https://solscan.io/tx/${result.signature})

⏱ Execution Time: ${result.executionTime}ms
        `;
        
        await ctx.editMessageText(successMessage, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback('💸 Sell', 'sell_token'),
              Markup.button.callback('📊 Portfolio', 'portfolio_view')
            ],
            [Markup.button.callback('« Main Menu', 'main_menu')]
          ])
        });
      } else {
        await ctx.editMessageText(
          `❌ *Buy Order Failed*\n\nError: ${result.error}\n\nPlease try again.`,
          {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [Markup.button.callback('🔄 Retry', 'buy_retry')],
              [Markup.button.callback('« Main Menu', 'main_menu')]
            ])
          }
        );
      }
    } catch (error: any) {
      await ctx.editMessageText(
        `❌ Error: ${error.message}`,
        { parse_mode: 'Markdown' }
      );
    }
    
    await userService.clearUserData(userId);
  });
  
  // Sell callbacks
  bot.action(/sell_(.+)/, async (ctx) => {
    const percentage = ctx.match[1];
    const userId = ctx.from!.id.toString();
    const userData = await userService.getUserData(userId);
    
    if (!userData.pendingTokenAddress) {
      await ctx.answerCbQuery('Please enter token address first');
      return;
    }
    
    const user = await userService.getUser(userId);
    const activeWallet = user.wallets?.find(w => w.isActive);
    
    if (!activeWallet) {
      await ctx.answerCbQuery('No active wallet');
      return;
    }
    
    await ctx.answerCbQuery('Processing sell order...');
    
    try {
      const sellPercentage = percentage === 'custom' ? userData.customAmount : parseFloat(percentage);
      
      const message = `
🔄 *Processing Sell Order*

Token: \`${userData.pendingTokenAddress}\`
Amount: ${sellPercentage}%
Slippage: ${user.settings?.slippage || 50}%
Priority Fee: ${user.settings?.priorityFee || 0.001} SOL

Please wait...
      `;
      
      await ctx.editMessageText(message, { parse_mode: 'Markdown' });
      
      const result = await tradingService.sellToken(
        activeWallet,
        userData.pendingTokenAddress,
        sellPercentage,
        user.settings?.slippage || 50,
        user.settings?.priorityFee || 0.001
      );
      
      if (result.success) {
        const successMessage = `
✅ *Sell Order Successful!*

Token: \`${userData.pendingTokenAddress}\`
Percentage Sold: ${sellPercentage}%
SOL Received: ${result.solReceived} SOL
Transaction: [View on Solscan](https://solscan.io/tx/${result.signature})

⏱ Execution Time: ${result.executionTime}ms
        `;
        
        await ctx.editMessageText(successMessage, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback('💰 Buy More', 'buy_token'),
              Markup.button.callback('📊 Portfolio', 'portfolio_view')
            ],
            [Markup.button.callback('« Main Menu', 'main_menu')]
          ])
        });
      } else {
        await ctx.editMessageText(
          `❌ *Sell Order Failed*\n\nError: ${result.error}\n\nPlease try again.`,
          {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [Markup.button.callback('🔄 Retry', 'sell_retry')],
              [Markup.button.callback('« Main Menu', 'main_menu')]
            ])
          }
        );
      }
    } catch (error: any) {
      await ctx.editMessageText(
        `❌ Error: ${error.message}`,
        { parse_mode: 'Markdown' }
      );
    }
    
    await userService.clearUserData(userId);
  });
  
  // Handle token address input for buy
  bot.on('text', async (ctx, next) => {
    const userId = ctx.from!.id.toString();
    const userState = await userService.getUserState(userId);
    
    if (userState === 'AWAITING_TOKEN_ADDRESS_BUY') {
      const tokenAddress = ctx.message.text.trim();
      
      // Validate Solana address
      try {
        new PublicKey(tokenAddress);
        await userService.setUserData(userId, { pendingTokenAddress: tokenAddress });
        await userService.setUserState(userId, 'IDLE');
        
        const keyboard = Markup.inlineKeyboard([
          [
            Markup.button.callback('0.1 SOL', 'buy_0.1'),
            Markup.button.callback('0.5 SOL', 'buy_0.5'),
            Markup.button.callback('1 SOL', 'buy_1')
          ],
          [
            Markup.button.callback('5 SOL', 'buy_5'),
            Markup.button.callback('10 SOL', 'buy_10'),
            Markup.button.callback('Custom', 'buy_custom')
          ]
        ]);
        
        await ctx.reply(
          `✅ Token address set!\n\nSelect buy amount:`,
          keyboard
        );
      } catch {
        await ctx.reply('❌ Invalid token address. Please try again.');
      }
      
      return;
    }
    
    if (userState === 'AWAITING_TOKEN_ADDRESS_SELL') {
      const tokenAddress = ctx.message.text.trim();
      
      try {
        new PublicKey(tokenAddress);
        await userService.setUserData(userId, { pendingTokenAddress: tokenAddress });
        await userService.setUserState(userId, 'IDLE');
        
        const keyboard = Markup.inlineKeyboard([
          [
            Markup.button.callback('25%', 'sell_25'),
            Markup.button.callback('50%', 'sell_50'),
            Markup.button.callback('75%', 'sell_75')
          ],
          [
            Markup.button.callback('100%', 'sell_100'),
            Markup.button.callback('Custom', 'sell_custom')
          ]
        ]);
        
        await ctx.reply(
          `✅ Token address set!\n\nSelect sell percentage:`,
          keyboard
        );
      } catch {
        await ctx.reply('❌ Invalid token address. Please try again.');
      }
      
      return;
    }
    
    return next();
  });
}
