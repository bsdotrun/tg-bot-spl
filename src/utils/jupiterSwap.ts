import axios from 'axios';
import { Connection, Keypair, VersionedTransaction, TransactionMessage } from '@solana/web3.js';
import { logger } from './logger';

/**
 * Jupiter Swap Integration
 * This module provides integration with Jupiter Aggregator for token swaps
 */

const JUPITER_API = 'https://quote-api.jup.ag/v6';

interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: any;
  priceImpactPct: string;
  routePlan: any[];
  contextSlot?: number;
}

interface SwapOptions {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
  priorityFee?: number;
  onlyDirectRoutes?: boolean;
}

export class JupiterSwapService {
  private connection: Connection;
  
  constructor(connection: Connection) {
    this.connection = connection;
  }
  
  /**
   * Get a quote for a swap
   */
  async getQuote(options: SwapOptions): Promise<JupiterQuote | null> {
    try {
      const { inputMint, outputMint, amount, slippageBps = 500, onlyDirectRoutes = false } = options;
      
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
        onlyDirectRoutes: onlyDirectRoutes.toString()
      });
      
      const response = await axios.get(`${JUPITER_API}/quote?${params}`);
      
      logger.info(`Jupiter quote received: ${response.data.outAmount} tokens`);
      
      return response.data;
    } catch (error: any) {
      logger.error('Error getting Jupiter quote:', error.response?.data || error.message);
      return null;
    }
  }
  
  /**
   * Execute a swap
   */
  async executeSwap(
    wallet: Keypair,
    quote: JupiterQuote,
    priorityFee: number = 0.001
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      // Get swap transaction
      const swapResponse = await axios.post(`${JUPITER_API}/swap`, {
        quoteResponse: quote,
        userPublicKey: wallet.publicKey.toBase58(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: priorityFee * 1_000_000_000 // Convert SOL to lamports
      });
      
      const { swapTransaction } = swapResponse.data;
      
      // Deserialize the transaction
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      
      // Sign the transaction
      transaction.sign([wallet]);
      
      // Send and confirm
      const signature = await this.connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: false,
        maxRetries: 3
      });
      
      logger.info(`Swap transaction sent: ${signature}`);
      
      // Confirm transaction
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }
      
      logger.info(`Swap confirmed: ${signature}`);
      
      return {
        success: true,
        signature
      };
    } catch (error: any) {
      logger.error('Error executing swap:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get token price from Jupiter
   */
  async getTokenPrice(tokenMint: string): Promise<number | null> {
    try {
      const response = await axios.get(`${JUPITER_API}/price?ids=${tokenMint}`);
      const price = response.data.data[tokenMint]?.price;
      
      return price || null;
    } catch (error) {
      logger.error('Error fetching token price:', error);
      return null;
    }
  }
  
  /**
   * Perform a complete buy operation
   */
  async buyToken(
    wallet: Keypair,
    tokenMint: string,
    solAmount: number,
    slippageBps: number = 500,
    priorityFee: number = 0.001
  ): Promise<{ success: boolean; signature?: string; tokensReceived?: string; error?: string }> {
    try {
      const SOL_MINT = 'So11111111111111111111111111111111111111112';
      const amountLamports = Math.floor(solAmount * 1_000_000_000);
      
      // Get quote
      const quote = await this.getQuote({
        inputMint: SOL_MINT,
        outputMint: tokenMint,
        amount: amountLamports,
        slippageBps
      });
      
      if (!quote) {
        return { success: false, error: 'Failed to get quote' };
      }
      
      // Execute swap
      const result = await this.executeSwap(wallet, quote, priorityFee);
      
      if (result.success) {
        return {
          success: true,
          signature: result.signature,
          tokensReceived: quote.outAmount
        };
      }
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Perform a complete sell operation
   */
  async sellToken(
    wallet: Keypair,
    tokenMint: string,
    tokenAmount: number,
    slippageBps: number = 500,
    priorityFee: number = 0.001
  ): Promise<{ success: boolean; signature?: string; solReceived?: string; error?: string }> {
    try {
      const SOL_MINT = 'So11111111111111111111111111111111111111112';
      
      // Get quote
      const quote = await this.getQuote({
        inputMint: tokenMint,
        outputMint: SOL_MINT,
        amount: tokenAmount,
        slippageBps
      });
      
      if (!quote) {
        return { success: false, error: 'Failed to get quote' };
      }
      
      // Execute swap
      const result = await this.executeSwap(wallet, quote, priorityFee);
      
      if (result.success) {
        return {
          success: true,
          signature: result.signature,
          solReceived: (parseInt(quote.outAmount) / 1_000_000_000).toString()
        };
      }
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export a singleton instance
export const jupiterSwap = (connection: Connection) => new JupiterSwapService(connection);
