# Bullshit Telegram Bot - Setup Guide

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- A Telegram account
- Solana RPC endpoint (recommend using Helius, QuickNode, or similar)

## Step-by-Step Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Save the **Bot Token** you receive

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
ENCRYPTION_KEY=your_secure_random_key_here
```

**Important Notes:**
- For `ENCRYPTION_KEY`, generate a random string (at least 32 characters)
- For production, use a private RPC endpoint for better performance:
  - [Helius](https://helius.dev/) - Recommended
  - [QuickNode](https://www.quicknode.com/)
  - [Alchemy](https://www.alchemy.com/)

### 4. Run the Bot

**Development Mode** (with hot reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm run build
npm start
```

### 5. Test Your Bot

1. Open Telegram
2. Search for your bot by username
3. Send `/start` to initialize
4. Create or import a wallet
5. Start trading!

## Recommended RPC Setup

For optimal performance (like the real Bloom bot), you'll need:

1. **Private RPC Endpoint**
   - Helius Pro: $99/month for unlimited requests
   - QuickNode: Starting at $49/month

2. **WebSocket Support**
   - Required for copy-trading and sniping features
   - Included with most premium RPC providers

3. **Multiple Endpoints** (Optional but recommended)
   - Set up fallback RPCs for high availability
   - Implement load balancing across multiple providers

## Advanced Configuration

### Jupiter Integration (for swaps)

The bot uses Jupiter Aggregator for best swap routes. No API key required, but you can:

1. Use Jupiter API v6 (already integrated)
2. Configure slippage and routing preferences
3. Add custom DEX preferences

### Price Feeds

For real-time price data, configure these services:

1. **Birdeye** (recommended)
   - Get API key from https://birdeye.so
   - Add to `.env`: `BIRDEYE_API_KEY=your_key`

2. **DexScreener**
   - Free tier available
   - No API key required for basic usage

### Database (Optional)

For persistent storage of user data and trade history:

1. Install MongoDB:
```bash
npm install mongodb
```

2. Add connection string to `.env`:
```env
DATABASE_URL=mongodb://localhost:27017/bloom-bot
```

3. Implement database service (see `src/services/databaseService.ts`)

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use encryption for private keys** - Already implemented
3. **Limit bot permissions** - Only allow necessary Telegram permissions
4. **Regular backups** - Backup user wallet data regularly
5. **Rate limiting** - Implement rate limits to prevent abuse

## Troubleshooting

### Bot doesn't respond
- Check if `TELEGRAM_BOT_TOKEN` is correct
- Ensure bot is running without errors
- Check bot permissions in Telegram

### Trades failing
- Verify RPC endpoint is working
- Check wallet has sufficient SOL balance
- Increase slippage tolerance
- Increase priority fees

### WebSocket errors
- Ensure `SOLANA_WS_URL` is configured
- Use wss:// protocol, not https://
- Check RPC provider supports WebSocket

## Performance Optimization

1. **Use Premium RPC**
   - Helius or QuickNode for best speeds
   - Enable transaction broadcasting to multiple nodes

2. **Optimize Priority Fees**
   - Monitor network congestion
   - Dynamically adjust fees based on demand

3. **Implement Caching**
   - Cache token metadata
   - Cache price data (with TTL)

4. **Connection Pooling**
   - Reuse WebSocket connections
   - Implement connection pooling for HTTP requests

## Next Steps

1. Deploy to a VPS for 24/7 uptime
2. Set up monitoring and alerts
3. Implement additional features
4. Join the Bloom community for updates

## Support

- Documentation: See README.md
- Issues: Open a GitHub issue
- Community: Join our Discord/Telegram

---

**Happy Trading! 🚀**
