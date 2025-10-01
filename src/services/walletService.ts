import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
import bs58 from 'bs58';
import { logger } from '../utils/logger';

interface TokenBalance {
  mint: string;
  symbol: string;
  balance: string;
  decimals: number;
}

export class WalletService {
  private connection: Connection;
  
  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );
  }
  
  async createWallet(): Promise<Keypair> {
    const keypair = Keypair.generate();
    logger.info(`New wallet created: ${keypair.publicKey.toBase58()}`);
    return keypair;
  }
  
  async importWallet(privateKeyOrSeed: string): Promise<Keypair> {
    try {
      // Try as base58 private key
      const decoded = bs58.decode(privateKeyOrSeed.trim());
      const keypair = Keypair.fromSecretKey(decoded);
      logger.info(`Wallet imported: ${keypair.publicKey.toBase58()}`);
      return keypair;
    } catch (e1) {
      try {
        // Try as JSON array
        const secretKey = JSON.parse(privateKeyOrSeed);
        const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
        logger.info(`Wallet imported: ${keypair.publicKey.toBase58()}`);
        return keypair;
      } catch (e2) {
        throw new Error('Invalid private key format');
      }
    }
  }
  
  async getBalance(publicKeyStr: string): Promise<number> {
    try {
      const publicKey = new PublicKey(publicKeyStr);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      logger.error('Error fetching balance:', error);
      return 0;
    }
  }
  
  async getTokenBalances(publicKeyStr: string): Promise<TokenBalance[]> {
    try {
      const publicKey = new PublicKey(publicKeyStr);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );
      
      const balances: TokenBalance[] = [];
      
      for (const account of tokenAccounts.value) {
        const parsedInfo = account.account.data.parsed.info;
        const balance = parsedInfo.tokenAmount.uiAmount;
        
        if (balance > 0) {
          balances.push({
            mint: parsedInfo.mint,
            symbol: 'Unknown', // Would need to fetch from metadata
            balance: balance.toString(),
            decimals: parsedInfo.tokenAmount.decimals
          });
        }
      }
      
      return balances;
    } catch (error) {
      logger.error('Error fetching token balances:', error);
      return [];
    }
  }
  
  async getTokenBalance(walletAddress: string, tokenMint: string): Promise<number> {
    try {
      const walletPubkey = new PublicKey(walletAddress);
      const mintPubkey = new PublicKey(tokenMint);
      
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintPubkey,
        walletPubkey
      );
      
      const tokenAccount = await getAccount(this.connection, associatedTokenAddress);
      const mintInfo = await getMint(this.connection, mintPubkey);
      
      return Number(tokenAccount.amount) / Math.pow(10, mintInfo.decimals);
    } catch (error) {
      logger.error('Error fetching token balance:', error);
      return 0;
    }
  }
  
  getKeypairFromPrivateKey(privateKey: Uint8Array): Keypair {
    return Keypair.fromSecretKey(privateKey);
  }
}
