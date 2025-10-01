import { Telegraf, Markup } from 'telegraf';
import { UserService } from '../services/userService';
import { CopyTradingService } from '../services/copyTradingService';
import { SniperService } from '../services/sniperService';
import { LimitOrderService } from '../services/limitOrderService';

const copyTradingService = new CopyTradingService();
const sniperService = new SniperService();
const limitOrderService = new LimitOrderService();

export function advancedCommands(bot: Telegraf, userService: UserService) {
  // Copy Trading
  bot.command('copy', async (ctx) => {
    const message = `
👥 *Copy Trading*

Mirror trades from successful wallets in real-time.

*Features:*
• Slot-perfect execution
• Same-block copying
• Auto buy/sell following
• Multiple wallet tracking
    `;
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('➕ Add Wallet', 'copy_add'),
        Markup.button.callback('📋 My Copies', 'copy_list')
      ],
      [
        Markup.button.callback('⚙️ Settings', 'copy_settings'),
        Markup.button.callback('▶️ Start', 'copy_start')
      ],
      [
        Markup.button.callback('⏸ Pause', 'copy_pause'),
        Markup.button.callback('⏹ Stop', 'copy_stop')
      ],
      [Markup.button.callback('« Back to Menu', 'main_menu')]
    ]);
    
    await ctx.replyWithMarkdown(message, keyboard);
  });
  
  bot.action('copy_add', async (ctx) => {
    await ctx.editMessageText(
      '👥 *Add Copy Trading Wallet*\n\nSend the wallet address you want to copy:',
      { parse_mode: 'Markdown' }
    );
    
    await userService.setUserState(ctx.from!.id.toString(), 'AWAITING_COPY_WALLET');
  });
  
  bot.action('copy_list', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const copies = await copyTradingService.getUserCopies(userId);
    
    if (copies.length === 0) {
      await ctx.editMessageText('No copy trading wallets configured.', {
        ...Markup.inlineKeyboard([
          [Markup.button.callback('➕ Add Wallet', 'copy_add')]
        ])
      });
      return;
    }
    
    let message = '👥 *Your Copy Trading Wallets*\n\n';
    
    for (const copy of copies) {
      message += `${copy.isActive ? '✅' : '⚪️'} \`${copy.walletAddress}\`\n`;
      message += `  Trades Copied: ${copy.tradesCopied}\n`;
      message += `  PnL: ${copy.pnl >= 0 ? '🟢' : '🔴'} ${copy.pnl.toFixed(2)}%\n\n`;
    }
    
    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('➕ Add More', 'copy_add')],
        [Markup.button.callback('« Back', 'copy_menu')]
      ])
    });
  });
  
  // Sniper
  bot.command('snipe', async (ctx) => {
    const message = `
🎯 *Token Sniper*

Auto-buy new token launches instantly.

*Features:*
• Sub-millisecond detection
• First-block execution
• Custom filters
• Dev wallet tracking
    `;
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('⚙️ Configure', 'sniper_config'),
        Markup.button.callback('📋 Active Snipes', 'sniper_list')
      ],
      [
        Markup.button.callback('▶️ Start', 'sniper_start'),
        Markup.button.callback('⏹ Stop', 'sniper_stop')
      ],
      [Markup.button.callback('« Back to Menu', 'main_menu')]
    ]);
    
    await ctx.replyWithMarkdown(message, keyboard);
  });
  
  bot.action('sniper_config', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const config = await sniperService.getConfig(userId);
    
    const message = `
🎯 *Sniper Configuration*

*Current Settings:*
• Buy Amount: ${config.buyAmount} SOL
• Min Liquidity: ${config.minLiquidity} SOL
• Max Buy Tax: ${config.maxBuyTax}%
• Max Sell Tax: ${config.maxSellTax}%
• Auto Sell: ${config.autoSell ? '✅' : '❌'}
    `;
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('💰 Buy Amount', 'sniper_buy_amount'),
        Markup.button.callback('💧 Min Liquidity', 'sniper_min_liq')
      ],
      [
        Markup.button.callback('📊 Tax Limits', 'sniper_tax'),
        Markup.button.callback('🔄 Auto Sell', 'sniper_auto_sell')
      ],
      [Markup.button.callback('« Back', 'sniper_menu')]
    ]);
    
    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...keyboard
    });
  });
  
  // Limit Orders
  bot.command('limits', async (ctx) => {
    const message = `
📈 *Limit Orders*

Set buy/sell orders with auto-execution.

*Features:*
• Price-based triggers
• Market cap triggers
• Time-based orders
• DCA support
    `;
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('➕ New Order', 'limit_new'),
        Markup.button.callback('📋 Active Orders', 'limit_list')
      ],
      [
        Markup.button.callback('📊 History', 'limit_history'),
        Markup.button.callback('❌ Cancel All', 'limit_cancel_all')
      ],
      [Markup.button.callback('« Back to Menu', 'main_menu')]
    ]);
    
    await ctx.replyWithMarkdown(message, keyboard);
  });
  
  bot.action('limit_new', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('💰 Buy Limit', 'limit_new_buy'),
        Markup.button.callback('💸 Sell Limit', 'limit_new_sell')
      ],
      [
        Markup.button.callback('🎯 Stop Loss', 'limit_stop_loss'),
        Markup.button.callback('🎯 Take Profit', 'limit_take_profit')
      ],
      [Markup.button.callback('« Back', 'limits_menu')]
    ]);
    
    await ctx.editMessageText(
      '📈 *Create Limit Order*\n\nSelect order type:',
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
  });
  
  bot.action('limit_list', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const orders = await limitOrderService.getActiveOrders(userId);
    
    if (orders.length === 0) {
      await ctx.editMessageText('No active limit orders.', {
        ...Markup.inlineKeyboard([
          [Markup.button.callback('➕ Create Order', 'limit_new')]
        ])
      });
      return;
    }
    
    let message = '📈 *Active Limit Orders*\n\n';
    
    for (const order of orders) {
      message += `*${order.type.toUpperCase()}*\n`;
      message += `Token: \`${order.tokenAddress}\`\n`;
      message += `Trigger: ${order.triggerPrice} ${order.triggerType}\n`;
      message += `Amount: ${order.amount}\n\n`;
    }
    
    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('« Back', 'limits_menu')]
      ])
    });
  });
  
  // AFK Mode
  bot.command('afk', async (ctx) => {
    const message = `
🤖 *AFK Mode*

Automated trading based on blockchain events.

*Features:*
• Auto-buy new launches
• Dev sell protection
• Social signal trading
• Custom triggers
    `;
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('⚙️ Configure', 'afk_config'),
        Markup.button.callback('📋 Active Tasks', 'afk_list')
      ],
      [
        Markup.button.callback('▶️ Start', 'afk_start'),
        Markup.button.callback('⏹ Stop', 'afk_stop')
      ],
      [Markup.button.callback('« Back to Menu', 'main_menu')]
    ]);
    
    await ctx.replyWithMarkdown(message, keyboard);
  });
  
  // Handle copy wallet input
  bot.on('text', async (ctx, next) => {
    const userId = ctx.from!.id.toString();
    const userState = await userService.getUserState(userId);
    
    if (userState === 'AWAITING_COPY_WALLET') {
      const walletAddress = ctx.message.text.trim();
      
      try {
        await copyTradingService.addCopyWallet(userId, walletAddress);
        await userService.setUserState(userId, 'IDLE');
        
        await ctx.reply(
          `✅ Copy trading wallet added!\n\nWallet: \`${walletAddress}\`\n\nThe bot will now monitor and copy trades from this wallet.`,
          { parse_mode: 'Markdown' }
        );
      } catch (error: any) {
        await ctx.reply(`❌ Error: ${error.message}`);
      }
      
      return;
    }
    
    return next();
  });
}
