import { Telegraf, Markup } from 'telegraf';
import { logger } from '../utils/logger';

export function setupMiddleware(bot: Telegraf) {
  // Logging middleware
  bot.use(async (ctx, next) => {
    const start = Date.now();
    const userId = ctx.from?.id;
    const username = ctx.from?.username || ctx.from?.first_name;
    
    logger.info(`Incoming update from user ${userId} (${username})`);
    
    await next();
    
    const ms = Date.now() - start;
    logger.info(`Response time: ${ms}ms`);
  });
  
  // Error handling middleware
  bot.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      logger.error('Middleware error:', error);
      await ctx.reply('❌ An error occurred. Please try again later.');
    }
  });
  
  // Navigation handlers
  bot.action('main_menu', async (ctx) => {
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
  
  bot.action(/(.+)_menu/, async (ctx) => {
    await ctx.answerCbQuery();
    const section = ctx.match[1];
    
    // Redirect to appropriate command
    const commands: Record<string, string> = {
      wallet: '/wallet',
      trade: '/buy',
      portfolio: '/portfolio',
      settings: '/settings',
      sniper: '/snipe',
      copy: '/copy',
      limits: '/limits',
      afk: '/afk'
    };
    
    if (commands[section]) {
      await ctx.deleteMessage();
      // Trigger the command programmatically
    }
  });
}
