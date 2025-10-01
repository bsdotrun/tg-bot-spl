import NodeCache from 'node-cache';
import { logger } from '../utils/logger';
import { walletStorage } from '../utils/walletStorage';

interface Wallet {
  publicKey: string;
  privateKey: Uint8Array;
  name: string;
  isActive: boolean;
}

interface UserSettings {
  slippage?: number;
  priorityFee?: number;
  autoApprove?: boolean;
  antiMev?: boolean;
  activePreset?: string;
}

interface User {
  id: string;
  username: string;
  wallets?: Wallet[];
  settings?: UserSettings;
  createdAt: Date;
  lastActive: Date;
}

export class UserService {
  private cache: NodeCache;
  private userStates: Map<string, string>;
  private userData: Map<string, any>;
  
  constructor() {
    // Cache expires after 1 hour
    this.cache = new NodeCache({ stdTTL: 3600 });
    this.userStates = new Map();
    this.userData = new Map();
  }
  
  async initializeUser(userId: string, username: string): Promise<User> {
    let user = this.cache.get<User>(userId);
    
    if (!user) {
      user = {
        id: userId,
        username,
        wallets: [],
        settings: {
          slippage: 50,
          priorityFee: 0.001,
          autoApprove: false,
          antiMev: true,
          activePreset: 'Balanced'
        },
        createdAt: new Date(),
        lastActive: new Date()
      };
      
      this.cache.set(userId, user);
      logger.info(`New user initialized: ${userId} (${username})`);
    } else {
      user.lastActive = new Date();
      this.cache.set(userId, user);
    }
    
    return user;
  }
  
  async getUser(userId: string): Promise<User> {
    let user = this.cache.get<User>(userId);
    
    if (!user) {
      throw new Error('User not found. Please use /start to initialize.');
    }
    
    // Load wallets from file if not in cache
    if (!user.wallets || user.wallets.length === 0) {
      user.wallets = walletStorage.getUserWallets(userId);
      this.cache.set(userId, user);
    }
    
    return user;
  }
  
  async addWallet(userId: string, wallet: Wallet): Promise<void> {
    const user = await this.getUser(userId);
    
    if (!user.wallets) {
      user.wallets = [];
    }
    
    // Deactivate other wallets if this one is active
    if (wallet.isActive) {
      user.wallets.forEach(w => w.isActive = false);
    }
    
    user.wallets.push(wallet);
    this.cache.set(userId, user);
    
    // Save to file
    walletStorage.saveWallet(
      userId,
      wallet.publicKey,
      wallet.privateKey,
      wallet.name,
      wallet.isActive
    );
    
    logger.info(`Wallet added for user ${userId}: ${wallet.publicKey}`);
  }
  
  async removeWallet(userId: string, publicKey: string): Promise<void> {
    const user = await this.getUser(userId);
    
    if (!user.wallets) {
      return;
    }
    
    user.wallets = user.wallets.filter(w => w.publicKey !== publicKey);
    this.cache.set(userId, user);
    
    // Delete from file
    walletStorage.deleteWallet(userId, publicKey);
    
    logger.info(`Wallet removed for user ${userId}: ${publicKey}`);
  }
  
  async setActiveWallet(userId: string, publicKey: string): Promise<void> {
    const user = await this.getUser(userId);
    
    if (!user.wallets) {
      throw new Error('No wallets found');
    }
    
    user.wallets.forEach(w => {
      w.isActive = w.publicKey === publicKey;
    });
    
    this.cache.set(userId, user);
    
    // Update in file
    walletStorage.setActiveWallet(userId, publicKey);
    
    logger.info(`Active wallet set for user ${userId}: ${publicKey}`);
  }
  
  async updateSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    const user = await this.getUser(userId);
    
    user.settings = {
      ...user.settings,
      ...settings
    };
    
    this.cache.set(userId, user);
    logger.info(`Settings updated for user ${userId}`);
  }
  
  async getUserState(userId: string): Promise<string> {
    return this.userStates.get(userId) || 'IDLE';
  }
  
  async setUserState(userId: string, state: string): Promise<void> {
    this.userStates.set(userId, state);
  }
  
  async getUserData(userId: string): Promise<any> {
    return this.userData.get(userId) || {};
  }
  
  async setUserData(userId: string, data: any): Promise<void> {
    const existing = this.userData.get(userId) || {};
    this.userData.set(userId, { ...existing, ...data });
  }
  
  async clearUserData(userId: string): Promise<void> {
    this.userData.delete(userId);
  }
}
