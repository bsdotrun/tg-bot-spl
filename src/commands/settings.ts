import { Telegraf, Markup } from 'telegraf';
import { UserService } from '../services/userService';

export function settingsCommands(bot: Telegraf, userService: UserService) {
  bot.command('settings', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const user = await userService.getUser(userId);
    const settings = user.settings || {};
    
    const message = `
⚙️ *Bot Settings*

*Trading Settings:*
• Slippage: ${settings.slippage || 50}%
• Priority Fee: ${settings.priorityFee || 0.001} SOL
• Auto-Approve: ${settings.autoApprove ? '✅' : '❌'}
• Anti-MEV: ${settings.antiMev ? '✅' : '❌'}

*Preset: ${settings.activePreset || 'Default'}*
    `;
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('📊 Slippage', 'settings_slippage'),
        Markup.button.callback('⚡️ Priority Fee', 'settings_priority')
      ],
      [
        Markup.button.callback('✅ Auto-Approve', 'settings_auto_approve'),
        Markup.button.callback('🛡 Anti-MEV', 'settings_anti_mev')
      ],
      [
        Markup.button.callback('💾 Presets', 'settings_presets'),
        Markup.button.callback('🔔 Notifications', 'settings_notifications')
      ],
      [Markup.button.callback('« Back to Menu', 'main_menu')]
    ]);
    
    await ctx.replyWithMarkdown(message, keyboard);
  });
  
  // Slippage settings
  bot.action('settings_slippage', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('10%', 'slippage_10'),
        Markup.button.callback('25%', 'slippage_25'),
        Markup.button.callback('50%', 'slippage_50')
      ],
      [
        Markup.button.callback('75%', 'slippage_75'),
        Markup.button.callback('100%', 'slippage_100'),
        Markup.button.callback('Custom', 'slippage_custom')
      ],
      [Markup.button.callback('« Back', 'settings_main')]
    ]);
    
    await ctx.editMessageText(
      '📊 *Set Slippage Tolerance*\n\nHigher slippage = more likely to execute but worse price.',
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
  });
  
  bot.action(/slippage_(\d+)/, async (ctx) => {
    const slippage = parseInt(ctx.match[1]);
    const userId = ctx.from!.id.toString();
    
    await userService.updateSettings(userId, { slippage });
    await ctx.answerCbQuery(`✅ Slippage set to ${slippage}%`);
    await ctx.deleteMessage();
  });
  
  // Priority fee settings
  bot.action('settings_priority', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('0.0001', 'priority_0.0001'),
        Markup.button.callback('0.001', 'priority_0.001'),
        Markup.button.callback('0.005', 'priority_0.005')
      ],
      [
        Markup.button.callback('0.01', 'priority_0.01'),
        Markup.button.callback('0.05', 'priority_0.05'),
        Markup.button.callback('Custom', 'priority_custom')
      ],
      [Markup.button.callback('« Back', 'settings_main')]
    ]);
    
    await ctx.editMessageText(
      '⚡️ *Set Priority Fee*\n\nHigher fees = faster transaction processing.',
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
  });
  
  bot.action(/priority_(.+)/, async (ctx) => {
    const priorityFee = parseFloat(ctx.match[1]);
    const userId = ctx.from!.id.toString();
    
    await userService.updateSettings(userId, { priorityFee });
    await ctx.answerCbQuery(`✅ Priority fee set to ${priorityFee} SOL`);
    await ctx.deleteMessage();
  });
  
  // Toggle settings
  bot.action('settings_auto_approve', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const user = await userService.getUser(userId);
    const newValue = !user.settings?.autoApprove;
    
    await userService.updateSettings(userId, { autoApprove: newValue });
    await ctx.answerCbQuery(`Auto-Approve ${newValue ? 'enabled' : 'disabled'}`);
  });
  
  bot.action('settings_anti_mev', async (ctx) => {
    const userId = ctx.from!.id.toString();
    const user = await userService.getUser(userId);
    const newValue = !user.settings?.antiMev;
    
    await userService.updateSettings(userId, { antiMev: newValue });
    await ctx.answerCbQuery(`Anti-MEV ${newValue ? 'enabled' : 'disabled'}`);
  });
  
  // Presets
  bot.action('settings_presets', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('🚀 Aggressive', 'preset_aggressive'),
        Markup.button.callback('⚖️ Balanced', 'preset_balanced')
      ],
      [
        Markup.button.callback('🛡 Conservative', 'preset_conservative'),
        Markup.button.callback('💾 Custom', 'preset_custom')
      ],
      [Markup.button.callback('« Back', 'settings_main')]
    ]);
    
    await ctx.editMessageText(
      '💾 *Trading Presets*\n\nChoose a preset configuration:',
      {
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
  });
  
  bot.action('preset_aggressive', async (ctx) => {
    const userId = ctx.from!.id.toString();
    await userService.updateSettings(userId, {
      slippage: 100,
      priorityFee: 0.01,
      antiMev: false,
      activePreset: 'Aggressive'
    });
    await ctx.answerCbQuery('✅ Aggressive preset activated');
  });
  
  bot.action('preset_balanced', async (ctx) => {
    const userId = ctx.from!.id.toString();
    await userService.updateSettings(userId, {
      slippage: 50,
      priorityFee: 0.005,
      antiMev: true,
      activePreset: 'Balanced'
    });
    await ctx.answerCbQuery('✅ Balanced preset activated');
  });
  
  bot.action('preset_conservative', async (ctx) => {
    const userId = ctx.from!.id.toString();
    await userService.updateSettings(userId, {
      slippage: 25,
      priorityFee: 0.001,
      antiMev: true,
      activePreset: 'Conservative'
    });
    await ctx.answerCbQuery('✅ Conservative preset activated');
  });
}
