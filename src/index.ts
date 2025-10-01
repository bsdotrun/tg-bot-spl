import { Telegraf, Context } from 'telegraf';
import dotenv from 'dotenv';
import { setupCommands } from './commands';
import { setupMiddleware } from './middleware';
import { logger } from './utils/logger';
import { UserService } from './services/userService';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// Initialize services
const userService = new UserService();

// Setup middleware
setupMiddleware(bot);

// Setup commands
setupCommands(bot, userService);

// Error handling
bot.catch((err: any, ctx: Context) => {
  logger.error('Bot error:', err);
  ctx.reply('❌ An error occurred. Please try again.');
});

// Set bot commands (shows as menu in Telegram UI)
bot.telegram.setMyCommands([
  { command: 'start', description: '💩 Start bot & show main menu' },
  { command: 'menu', description: '📱 Show main menu' },
  { command: 'wallet', description: '💼 Manage wallets' },
  { command: 'buy', description: '💰 Buy tokens' },
  { command: 'sell', description: '💸 Sell tokens' },
  { command: 'portfolio', description: '📊 View portfolio' },
  { command: 'pnl', description: '📈 Profit & Loss stats' },
  { command: 'snipe', description: '🎯 Token sniper' },
  { command: 'copy', description: '👥 Copy trading' },
  { command: 'limits', description: '📈 Limit orders' },
  { command: 'settings', description: '⚙️ Bot settings' },
  { command: 'help', description: '❓ Help & commands' }
]).catch(err => logger.error('Failed to set commands:', err));

// Start bot
bot.launch()
  .then(() => {
    logger.info('🚀 Bullshit Bot is running!');
    logger.info('Press Ctrl+C to stop');
  })
  .catch((err) => {
    logger.error('Failed to start bot:', err);
    process.exit(1);
  });

// Enable graceful stop
process.once('SIGINT', () => {
  logger.info('Stopping bot...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  logger.info('Stopping bot...');
  bot.stop('SIGTERM');
});

export { bot };
