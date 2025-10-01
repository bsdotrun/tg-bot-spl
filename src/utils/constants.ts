import { PublicKey } from '@solana/web3.js';

// Solana Program IDs
export const PROGRAM_IDS = {
  TOKEN_PROGRAM: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  ASSOCIATED_TOKEN_PROGRAM: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
  SYSTEM_PROGRAM: new PublicKey('11111111111111111111111111111111'),
  
  // DEX Programs
  RAYDIUM_V4: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
  ORCA_WHIRLPOOL: new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'),
  JUPITER_V6: new PublicKey('JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4')
};

// Common Token Mints
export const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'
};

// Trading Constants
export const TRADING = {
  MIN_SOL_BALANCE: 0.01, // Minimum SOL balance required for trading
  DEFAULT_SLIPPAGE: 50, // 50%
  DEFAULT_PRIORITY_FEE: 0.001, // 0.001 SOL
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Limits
  MAX_SLIPPAGE: 100,
  MAX_PRIORITY_FEE: 0.1,
  MIN_BUY_AMOUNT: 0.001,
  MAX_BUY_AMOUNT: 100
};

// API Endpoints
export const API_ENDPOINTS = {
  JUPITER: 'https://quote-api.jup.ag/v6',
  BIRDEYE: 'https://public-api.birdeye.so',
  DEXSCREENER: 'https://api.dexscreener.com/latest',
  HELIUS: 'https://api.helius.xyz/v0'
};

// User States
export const USER_STATES = {
  IDLE: 'IDLE',
  AWAITING_PRIVATE_KEY: 'AWAITING_PRIVATE_KEY',
  AWAITING_TOKEN_ADDRESS_BUY: 'AWAITING_TOKEN_ADDRESS_BUY',
  AWAITING_TOKEN_ADDRESS_SELL: 'AWAITING_TOKEN_ADDRESS_SELL',
  AWAITING_COPY_WALLET: 'AWAITING_COPY_WALLET',
  AWAITING_CUSTOM_AMOUNT: 'AWAITING_CUSTOM_AMOUNT'
} as const;
