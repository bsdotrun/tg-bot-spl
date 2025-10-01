# Bullshit Telegram Trading Bot

A high-performance Solana trading bot for Telegram with advanced features including copy-trading, sniping, limit orders, and automated trading.

## Features

- 🚀 **Fast Trading**: Buy, sell, and snipe tokens with minimal latency
- 👛 **Multi-Wallet Support**: Manage multiple wallets seamlessly
- 📊 **Copy Trading**: Mirror trades from successful wallets in real-time
- 🎯 **Sniping**: Auto-buy new token launches
- 📈 **Limit Orders**: Set buy/sell limits with auto-execution
- 🤖 **AFK Mode**: Automated trading based on blockchain events
- 📱 **Telegram Interface**: Full trading terminal in Telegram
- 💼 **Portfolio Tracking**: Monitor your holdings and PnL

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your configuration:
   ```bash
   cp .env.example .env
   ```

4. Get a Telegram Bot Token from [@BotFather](https://t.me/BotFather)

5. Run the bot:
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## Environment Variables

- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
- `SOLANA_RPC_URL`: Solana RPC endpoint (use private RPC for better performance)
- `ENCRYPTION_KEY`: Key for encrypting wallet private keys

## Usage

1. Start a chat with your bot on Telegram
2. Use `/start` to initialize
3. Create or import a wallet
4. Start trading!

## Commands

- `/start` - Initialize the bot
- `/wallet` - Wallet management
- `/buy` - Buy tokens
- `/sell` - Sell tokens
- `/snipe` - Snipe new launches
- `/copy` - Copy trading setup
- `/limits` - Manage limit orders
- `/portfolio` - View your portfolio
- `/settings` - Configure bot settings

## Security

- Private keys are encrypted and stored locally
- Always use a dedicated trading wallet
- Never share your private keys or seed phrases
- Use at your own risk

## Disclaimer

This bot is for educational purposes. Trading cryptocurrencies involves substantial risk of loss. Use at your own risk.

## License

MIT
