# 🚀 Quick Start Guide - Bullshit Telegram Bot

Get your Bullshit trading bot up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org/))
- A Telegram account
- Basic terminal/command line knowledge

---

## Step 1: Get Telegram Bot Token (2 minutes)

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Choose a name for your bot (e.g., "My Bullshit Bot")
4. Choose a username (must end with 'bot', e.g., "mybullshit_bot")
5. **Copy the bot token** you receive (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

---

## Step 2: Install & Configure (2 minutes)

### Install dependencies:
```bash
npm install
```

### Create configuration file:

Create a file named `.env` in the project root with:

```env
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
ENCRYPTION_KEY=my-super-secret-key-12345678
```

**Replace:**
- `YOUR_BOT_TOKEN_HERE` with your actual bot token from Step 1
- `my-super-secret-key-12345678` with any random secure string

---

## Step 3: Run the Bot (1 minute)

### Development Mode:
```bash
npm run dev
```

### Production Mode:
```bash
npm run build
npm start
```

You should see:
```
🚀 Bloom Bot is running!
Press Ctrl+C to stop
```

---

## Step 4: Test Your Bot

1. Open Telegram
2. Search for your bot by username
3. Click "Start" or send `/start`
4. You should see the welcome message!

---

## First Steps After Setup

### 1. Create a Wallet
- Click "💼 Create Wallet" button
- **SAVE YOUR PRIVATE KEY SECURELY**
- Never share it with anyone!

### 2. Fund Your Wallet
- Click "📤 Deposit" to get your wallet address
- Send some SOL to this address (minimum 0.1 SOL recommended)

### 3. Make Your First Trade
- Click "💰 Buy Token"
- Paste a token address (e.g., from DexScreener)
- Select amount
- Confirm transaction

---

## Common Commands

| Command | What it does |
|---------|-------------|
| `/start` | Show main menu |
| `/wallet` | Manage wallets |
| `/buy` | Buy tokens |
| `/sell` | Sell tokens |
| `/portfolio` | View your holdings |
| `/settings` | Configure bot |

---

## Example Trading Flow

1. **Get a token address** from:
   - [DexScreener](https://dexscreener.com/solana)
   - [Birdeye](https://birdeye.so/)
   - [Jupiter](https://jup.ag/)

2. **Send `/buy` to your bot**

3. **Paste the token address** when prompted

4. **Select amount** (0.1 SOL, 0.5 SOL, etc.)

5. **Wait for confirmation** ✅

6. **Check portfolio** with `/portfolio`

7. **Sell when ready** with `/sell`

---

## Need Better Performance?

### Upgrade to Private RPC (Optional)

Free public RPCs are slow. For better speed:

1. **Get Helius API Key** (recommended)
   - Sign up at [helius.dev](https://helius.dev/)
   - Free tier: 100 requests/second
   - Copy your RPC URL

2. **Update `.env`:**
   ```env
   SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
   ```

3. **Restart bot**

### Alternative RPC Providers:
- [QuickNode](https://www.quicknode.com/) - $49/month
- [Alchemy](https://www.alchemy.com/) - Free tier available
- [GetBlock](https://getblock.io/) - Pay as you go

---

## Troubleshooting

### Bot doesn't respond
```bash
# Check if bot is running
# You should see console output

# Check .env file
# Make sure TELEGRAM_BOT_TOKEN is correct
```

### "Failed to create wallet"
```bash
# Install dependencies again
npm install --force

# Clear cache
rm -rf node_modules package-lock.json
npm install
```

### Trades are slow
- Upgrade to private RPC (see above)
- Increase priority fees in `/settings`
- Use aggressive preset

### Balance shows 0
- Wait a few seconds for blockchain sync
- Click refresh button
- Check if RPC is working

---

## Security Tips ⚠️

1. **Never share your private key** - Not even with "support"
2. **Use a dedicated trading wallet** - Don't use your main wallet
3. **Start with small amounts** - Test with 0.1-0.5 SOL first
4. **Keep bot token secret** - Don't share your bot
5. **Regular backups** - Save your private keys offline

---

## Next Steps

### Beginner
- ✅ Create wallet
- ✅ Make first trade
- ✅ Try different settings
- ✅ Explore portfolio features

### Intermediate
- 📊 Set up limit orders (`/limits`)
- 🎯 Try token sniper (`/snipe`)
- 💾 Create custom presets
- 📈 Track PnL

### Advanced
- 👥 Copy successful traders (`/copy`)
- 🤖 Enable AFK mode (`/afk`)
- ⚡ Optimize for speed
- 🔧 Customize settings

---

## Getting Help

### Documentation
- `README.md` - Overview
- `SETUP.md` - Detailed setup
- `FEATURES.md` - All features
- `DEPLOYMENT.md` - Production deployment

### Support
- Check logs in `logs/` folder
- Read error messages carefully
- Search issues on GitHub
- Ask in community chat

---

## You're Ready! 🎉

Your bot is now running and ready to trade!

**Pro Tips:**
- Start conservative, increase gradually
- Always DYOR (Do Your Own Research)
- Monitor gas fees during high activity
- Use stop losses to protect profits

**Happy Trading! 🚀**

---

## Quick Reference Card

```
📱 Basic Flow:
/start → Create Wallet → Fund Wallet → /buy → Paste Address → Select Amount → ✅

🔧 Settings:
/settings → Slippage (50%) → Priority Fee (0.001 SOL) → Preset (Balanced)

📊 Monitor:
/portfolio → /pnl → /stats

🚀 Advanced:
/snipe (auto-buy new tokens)
/copy (mirror trades)
/limits (auto buy/sell at price)

⚠️ Security:
Never share: Private Key, Bot Token, Seed Phrase
Always verify: Token Address, Transaction, Amount
```

---

*Built by traders, for traders* 💩
