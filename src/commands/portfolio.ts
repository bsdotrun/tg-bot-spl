import { Telegraf, Markup } from 'telegraf';
import { UserService } from '../services/userService';
import { WalletService } from '../services/walletService';
import { PortfolioService } from '../services/portfolioService';

const walletService = new WalletService();
const portfolioService = new PortfolioService();

export function portfolioCommands(bot: Telegraf, userService: UserService) {
  bot.command('portfolio', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const user = await userService.getUser(userId);
    const activeWallet = user.wallets?.find(w => w.isActive);
    
    if (!activeWallet) {
      await ctx.reply('❌ No active wallet. Please create or import one.');
      return;
    }
    
    await ctx.reply('📊 Loading portfolio...');
    
    try {
      const portfolio = await portfolioService.getPortfolio(activeWallet.publicKey);
      
      let message = `📊 *Portfolio Overview*\n\n`;
      message += `*Wallet:* \`${activeWallet.publicKey.slice(0, 8)}...${activeWallet.publicKey.slice(-8)}\`\n\n`;
      message += `*Total Value:* $${portfolio.totalValue.toFixed(2)}\n`;
      message += `*SOL Balance:* ${portfolio.solBalance.toFixed(4)} SOL\n`;
      message += `*24h PnL:* ${portfolio.pnl24h >= 0 ? '🟢' : '🔴'} ${portfolio.pnl24h.toFixed(2)}%\n\n`;
      
      if (portfolio.tokens.length > 0) {
        message += `*Token Holdings:*\n`;
        for (const token of portfolio.tokens.slice(0, 10)) {
          const pnlEmoji = token.pnl >= 0 ? '🟢' : '🔴';
          message += `\n*${token.symbol}*\n`;
          message += `Amount: ${token.balance}\n`;
          message += `Value: $${token.value.toFixed(2)}\n`;
          message += `PnL: ${pnlEmoji} ${token.pnl.toFixed(2)}%\n`;
        }
      } else {
        message += `*No token holdings*\n`;
      }
      
      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('🔄 Refresh', 'portfolio_refresh'),
          Markup.button.callback('📈 Stats', 'portfolio_stats')
        ],
        [
          Markup.button.callback('💰 Buy', 'trade_buy'),
          Markup.button.callback('💸 Sell', 'trade_sell')
        ],
        [Markup.button.callback('« Main Menu', 'main_menu')]
      ]);
      
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...keyboard
      });
    } catch (error) {
      await ctx.reply('❌ Failed to load portfolio. Please try again.');
    }
  });
  
  bot.command('pnl', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const user = await userService.getUser(userId);
    const activeWallet = user.wallets?.find(w => w.isActive);
    
    if (!activeWallet) {
      await ctx.reply('❌ No active wallet.');
      return;
    }
    
    const stats = await portfolioService.getPnLStats(activeWallet.publicKey);
    
    const message = `
📈 *Profit & Loss*

*Today:* ${stats.today >= 0 ? '🟢' : '🔴'} ${stats.today.toFixed(2)}%
*7 Days:* ${stats.week >= 0 ? '🟢' : '🔴'} ${stats.week.toFixed(2)}%
*30 Days:* ${stats.month >= 0 ? '🟢' : '🔴'} ${stats.month.toFixed(2)}%
*All Time:* ${stats.allTime >= 0 ? '🟢' : '🔴'} ${stats.allTime.toFixed(2)}%

*Total Trades:* ${stats.totalTrades}
*Win Rate:* ${stats.winRate.toFixed(1)}%
*Best Trade:* +${stats.bestTrade.toFixed(2)}%
*Worst Trade:* ${stats.worstTrade.toFixed(2)}%
    `;
    
    await ctx.replyWithMarkdown(message);
  });
  
  bot.command('stats', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const user = await userService.getUser(userId);
    const activeWallet = user.wallets?.find(w => w.isActive);
    
    if (!activeWallet) {
      await ctx.reply('❌ No active wallet.');
      return;
    }
    
    const stats = await portfolioService.getTradingStats(activeWallet.publicKey);
    
    const message = `
📊 *Trading Statistics*

*Total Trades:* ${stats.totalTrades}
*Successful:* ${stats.successfulTrades} (${stats.successRate.toFixed(1)}%)
*Failed:* ${stats.failedTrades}

*Volume:*
• Total: ${stats.totalVolume.toFixed(2)} SOL
• Average: ${stats.avgTradeSize.toFixed(4)} SOL

*Speed:*
• Avg Execution: ${stats.avgExecutionTime}ms
• Fastest: ${stats.fastestTrade}ms

*Tokens Traded:* ${stats.uniqueTokens}
*Active Days:* ${stats.activeDays}
    `;
    
    await ctx.replyWithMarkdown(message);
  });
  
  // Portfolio refresh
  bot.action('portfolio_refresh', async (ctx) => {
    await ctx.answerCbQuery('Refreshing portfolio...');
    // Trigger portfolio command
    await ctx.deleteMessage();
    // Re-run portfolio logic here
  });
}
