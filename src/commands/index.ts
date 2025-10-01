import { Telegraf, Markup } from 'telegraf';
import { UserService } from '../services/userService';
import { startCommand } from './start';
import { walletCommands } from './wallet';
import { tradingCommands } from './trading';
import { settingsCommands } from './settings';
import { portfolioCommands } from './portfolio';
import { advancedCommands } from './advanced';

export function setupCommands(bot: Telegraf, userService: UserService) {
  // Basic commands
  startCommand(bot, userService);
  
  // Wallet management
  walletCommands(bot, userService);
  
  // Trading commands
  tradingCommands(bot, userService);
  
  // Settings
  settingsCommands(bot, userService);
  
  // Portfolio
  portfolioCommands(bot, userService);
  
  // Advanced features (copy-trading, sniping, etc.)
  advancedCommands(bot, userService);
  
  // Help command
  bot.command('help', (ctx) => {
    const helpText = `
💩 *Bullshit Bot - Command List*

*Wallet Management*
/wallet - Manage wallets
/balance - Check balance
/deposit - Get deposit address

*Trading*
/buy - Buy tokens
/sell - Sell tokens
/swap - Quick swap

*Advanced*
/snipe - Configure sniping
/copy - Copy trading
/limits - Limit orders
/afk - AFK mode

*Portfolio & Info*
/portfolio - View portfolio
/pnl - Profit & Loss
/stats - Trading statistics

*Settings*
/settings - Bot settings
/presets - Trading presets
/help - Show this help

Built by traders, for traders 🚀
    `;
    
    ctx.replyWithMarkdown(helpText);
  });
}
