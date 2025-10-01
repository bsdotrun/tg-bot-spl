import { Telegraf, Markup } from 'telegraf';
import { UserService } from '../services/userService';

export function startCommand(bot: Telegraf, userService: UserService) {
  bot.command('start', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const userName = ctx.from!.username || ctx.from!.first_name;
    
    // Initialize user
    await userService.initializeUser(userId, userName);
    
    const welcomeMessage = `
💩 *Welcome to Bullshit Trading Bot!*

Your high-performance Solana trading terminal.

*Get Started:*
1️⃣ Create or import a wallet
2️⃣ Fund your wallet with SOL
3️⃣ Start trading!

*Quick Actions:*
    `;
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('💼 Create Wallet', 'wallet_create'),
        Markup.button.callback('📥 Import Wallet', 'wallet_import')
      ],
      [
        Markup.button.callback('💰 Balance', 'wallet_balance'),
        Markup.button.callback('📤 Deposit', 'wallet_deposit')
      ],
      [
        Markup.button.callback('🔑 Export Key', 'wallet_export'),
        Markup.button.callback('🔄 Wallet Menu', 'wallet_main')
      ],
      [
        Markup.button.callback('💵 Buy', 'quick_buy'),
        Markup.button.callback('💸 Sell', 'quick_sell')
      ],
      [
        Markup.button.callback('🎯 Snipe', 'sniper_menu'),
        Markup.button.callback('👥 Copy Trade', 'copy_menu')
      ],
      [
        Markup.button.callback('📊 Portfolio', 'portfolio_view'),
        Markup.button.callback('⚙️ Settings', 'settings_main')
      ],
      [
        Markup.button.callback('📈 Limit Orders', 'limits_menu'),
        Markup.button.callback('🤖 AFK Mode', 'afk_menu')
      ]
    ]);
    
    await ctx.replyWithMarkdown(welcomeMessage, keyboard);
  });
  
  // Main menu
  bot.command('menu', async (ctx) => {
    const welcomeMessage = `
💩 *Bullshit Main Menu*

Choose an action below:
    `;
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('💼 Create Wallet', 'wallet_create'),
        Markup.button.callback('📥 Import Wallet', 'wallet_import')
      ],
      [
        Markup.button.callback('💰 Balance', 'wallet_balance'),
        Markup.button.callback('📤 Deposit', 'wallet_deposit')
      ],
      [
        Markup.button.callback('🔑 Export Key', 'wallet_export'),
        Markup.button.callback('🔄 Wallet Menu', 'wallet_main')
      ],
      [
        Markup.button.callback('💵 Buy', 'quick_buy'),
        Markup.button.callback('💸 Sell', 'quick_sell')
      ],
      [
        Markup.button.callback('🎯 Snipe', 'sniper_menu'),
        Markup.button.callback('👥 Copy Trade', 'copy_menu')
      ],
      [
        Markup.button.callback('📊 Portfolio', 'portfolio_view'),
        Markup.button.callback('⚙️ Settings', 'settings_main')
      ]
    ]);
    
    await ctx.replyWithMarkdown(welcomeMessage, keyboard);
  });
  
  // Quick buy action
  bot.action('quick_buy', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      '💵 *Quick Buy*\n\nPaste the token address you want to buy:',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('« Back to Menu', 'back_to_start')]
        ])
      }
    );
    
    await userService.setUserState(ctx.from!.id.toString(), 'AWAITING_TOKEN_ADDRESS_BUY');
  });
  
  // Quick sell action
  bot.action('quick_sell', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      '💸 *Quick Sell*\n\nPaste the token address you want to sell:',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('« Back to Menu', 'back_to_start')]
        ])
      }
    );
    
    await userService.setUserState(ctx.from!.id.toString(), 'AWAITING_TOKEN_ADDRESS_SELL');
  });
  
  // Back to start menu
  bot.action('back_to_start', async (ctx) => {
    await ctx.answerCbQuery();
    
    const welcomeMessage = `
💩 *Bullshit Main Menu*

Choose an action below:
    `;
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('💼 Create Wallet', 'wallet_create'),
        Markup.button.callback('📥 Import Wallet', 'wallet_import')
      ],
      [
        Markup.button.callback('💰 Balance', 'wallet_balance'),
        Markup.button.callback('📤 Deposit', 'wallet_deposit')
      ],
      [
        Markup.button.callback('🔑 Export Key', 'wallet_export'),
        Markup.button.callback('🔄 Wallet Menu', 'wallet_main')
      ],
      [
        Markup.button.callback('💵 Buy', 'quick_buy'),
        Markup.button.callback('💸 Sell', 'quick_sell')
      ],
      [
        Markup.button.callback('🎯 Snipe', 'sniper_menu'),
        Markup.button.callback('👥 Copy Trade', 'copy_menu')
      ],
      [
        Markup.button.callback('📊 Portfolio', 'portfolio_view'),
        Markup.button.callback('⚙️ Settings', 'settings_main')
      ]
    ]);
    
    await ctx.editMessageText(welcomeMessage, {
      parse_mode: 'Markdown',
      ...keyboard
    });
  });
}
