import { WalletService } from './walletService';
import { logger } from '../utils/logger';

interface TokenHolding {
  symbol: string;
  balance: number;
  value: number;
  pnl: number;
}

interface Portfolio {
  totalValue: number;
  solBalance: number;
  pnl24h: number;
  tokens: TokenHolding[];
}

interface PnLStats {
  today: number;
  week: number;
  month: number;
  allTime: number;
  totalTrades: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
}

interface TradingStats {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  successRate: number;
  totalVolume: number;
  avgTradeSize: number;
  avgExecutionTime: number;
  fastestTrade: number;
  uniqueTokens: number;
  activeDays: number;
}

export class PortfolioService {
  private walletService: WalletService;
  
  constructor() {
    this.walletService = new WalletService();
  }
  
  async getPortfolio(walletAddress: string): Promise<Portfolio> {
    try {
      const solBalance = await this.walletService.getBalance(walletAddress);
      const tokens = await this.walletService.getTokenBalances(walletAddress);
      
      // Mock token values - in production, fetch real prices
      const tokenHoldings: TokenHolding[] = tokens.map(token => ({
        symbol: token.symbol,
        balance: parseFloat(token.balance),
        value: parseFloat(token.balance) * 0.01, // Mock price
        pnl: Math.random() * 200 - 100 // Mock PnL
      }));
      
      const totalTokenValue = tokenHoldings.reduce((sum, t) => sum + t.value, 0);
      const totalValue = solBalance * 150 + totalTokenValue; // Assuming SOL = $150
      
      return {
        totalValue,
        solBalance,
        pnl24h: Math.random() * 40 - 20, // Mock 24h PnL
        tokens: tokenHoldings
      };
    } catch (error) {
      logger.error('Error fetching portfolio:', error);
      throw error;
    }
  }
  
  async getPnLStats(walletAddress: string): Promise<PnLStats> {
    // Mock data - in production, track actual trades
    return {
      today: Math.random() * 20 - 10,
      week: Math.random() * 50 - 25,
      month: Math.random() * 100 - 50,
      allTime: Math.random() * 200 - 100,
      totalTrades: Math.floor(Math.random() * 500),
      winRate: 50 + Math.random() * 30,
      bestTrade: Math.random() * 500,
      worstTrade: -(Math.random() * 200)
    };
  }
  
  async getTradingStats(walletAddress: string): Promise<TradingStats> {
    // Mock data - in production, track actual trades
    const totalTrades = Math.floor(Math.random() * 500) + 100;
    const successfulTrades = Math.floor(totalTrades * (0.7 + Math.random() * 0.2));
    
    return {
      totalTrades,
      successfulTrades,
      failedTrades: totalTrades - successfulTrades,
      successRate: (successfulTrades / totalTrades) * 100,
      totalVolume: Math.random() * 1000,
      avgTradeSize: Math.random() * 5,
      avgExecutionTime: 100 + Math.random() * 400,
      fastestTrade: 50 + Math.random() * 100,
      uniqueTokens: Math.floor(Math.random() * 50) + 10,
      activeDays: Math.floor(Math.random() * 90) + 1
    };
  }
}
