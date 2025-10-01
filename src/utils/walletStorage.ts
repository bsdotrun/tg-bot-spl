import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bs58 from 'bs58';
import { logger } from './logger';

const WALLETS_FILE = path.join(process.cwd(), 'wallets.json');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-this';

interface StoredWallet {
  publicKey: string;
  privateKeyBase58: string;
  encryptedPrivateKey: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface UserWallets {
  [userId: string]: StoredWallet[];
}

export class WalletStorage {
  private static instance: WalletStorage;
  
  private constructor() {
    this.ensureWalletsFile();
  }
  
  static getInstance(): WalletStorage {
    if (!WalletStorage.instance) {
      WalletStorage.instance = new WalletStorage();
    }
    return WalletStorage.instance;
  }
  
  private ensureWalletsFile(): void {
    if (!fs.existsSync(WALLETS_FILE)) {
      fs.writeFileSync(WALLETS_FILE, JSON.stringify({}, null, 2));
      logger.info('Created wallets.json file');
    }
  }
  
  private encrypt(text: string): string {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32),
      Buffer.alloc(16, 0)
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  private decrypt(encrypted: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32),
      Buffer.alloc(16, 0)
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  private readWallets(): UserWallets {
    try {
      const data = fs.readFileSync(WALLETS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Error reading wallets file:', error);
      return {};
    }
  }
  
  private writeWallets(wallets: UserWallets): void {
    try {
      fs.writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2));
      logger.info('Wallets saved to file');
    } catch (error) {
      logger.error('Error writing wallets file:', error);
    }
  }
  
  saveWallet(
    userId: string,
    publicKey: string,
    privateKey: Uint8Array,
    name: string,
    isActive: boolean = true
  ): void {
    const wallets = this.readWallets();
    
    if (!wallets[userId]) {
      wallets[userId] = [];
    }
    
    // Deactivate other wallets if this one is active
    if (isActive) {
      wallets[userId].forEach(w => w.isActive = false);
    }
    
    // Convert private key to base58 (standard Solana format)
    const privateKeyBase58 = bs58.encode(privateKey);
    
    // Also encrypt it for security
    const encryptedPrivateKey = this.encrypt(privateKeyBase58);
    
    wallets[userId].push({
      publicKey,
      privateKeyBase58,
      encryptedPrivateKey,
      name,
      isActive,
      createdAt: new Date().toISOString()
    });
    
    this.writeWallets(wallets);
    logger.info(`Wallet saved for user ${userId}: ${publicKey}`);
  }
  
  getUserWallets(userId: string): Array<{
    publicKey: string;
    privateKey: Uint8Array;
    name: string;
    isActive: boolean;
    createdAt?: Date;
  }> {
    const wallets = this.readWallets();
    const userWallets = wallets[userId] || [];
    
    return userWallets.map(w => {
      // Try to use base58 format first (new format)
      let privateKey: Uint8Array;
      
      if (w.privateKeyBase58) {
        // New format: base58 string
        privateKey = bs58.decode(w.privateKeyBase58);
      } else {
        // Old format: encrypted base64 (for backwards compatibility)
        const decryptedKey = this.decrypt(w.encryptedPrivateKey);
        privateKey = Uint8Array.from(Buffer.from(decryptedKey, 'base64'));
      }
      
      return {
        publicKey: w.publicKey,
        privateKey,
        name: w.name,
        isActive: w.isActive,
        createdAt: w.createdAt ? new Date(w.createdAt) : undefined
      };
    });
  }
  
  setActiveWallet(userId: string, publicKey: string): void {
    const wallets = this.readWallets();
    
    if (!wallets[userId]) {
      return;
    }
    
    wallets[userId].forEach(w => {
      w.isActive = w.publicKey === publicKey;
    });
    
    this.writeWallets(wallets);
    logger.info(`Active wallet set for user ${userId}: ${publicKey}`);
  }
  
  deleteWallet(userId: string, publicKey: string): void {
    const wallets = this.readWallets();
    
    if (!wallets[userId]) {
      return;
    }
    
    wallets[userId] = wallets[userId].filter(w => w.publicKey !== publicKey);
    
    this.writeWallets(wallets);
    logger.info(`Wallet deleted for user ${userId}: ${publicKey}`);
  }
  
  getAllUsers(): string[] {
    const wallets = this.readWallets();
    return Object.keys(wallets);
  }
}

export const walletStorage = WalletStorage.getInstance();
