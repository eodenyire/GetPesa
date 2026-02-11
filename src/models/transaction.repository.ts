/**
 * Transaction Repository
 * Database operations for transactions using SQLite
 */

import { db } from '../config/database';
import { Transaction, Wallet } from '../types/payment.types';
import { logger } from '../utils/logger';

export class TransactionRepository {
  /**
   * Save a new transaction
   */
  saveTransaction(transaction: Transaction): Transaction {
    try {
      const stmt = db.prepare(`
        INSERT INTO transactions (
          id, user_id, amount, currency, type, status, method, reference,
          description, metadata, created_at, updated_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        transaction.id,
        transaction.userId,
        transaction.amount,
        transaction.currency,
        transaction.type,
        transaction.status,
        transaction.method,
        transaction.reference,
        transaction.description || null,
        transaction.metadata ? JSON.stringify(transaction.metadata) : null,
        transaction.createdAt.getTime(),
        transaction.updatedAt.getTime(),
        transaction.completedAt ? transaction.completedAt.getTime() : null
      );

      logger.debug('Transaction saved', { id: transaction.id });
      return transaction;
    } catch (error) {
      logger.error('Failed to save transaction', { error, transactionId: transaction.id });
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  getTransaction(id: string): Transaction | undefined {
    try {
      const stmt = db.prepare('SELECT * FROM transactions WHERE id = ?');
      const row = stmt.get(id) as any;
      
      if (!row) return undefined;
      
      return this.mapRowToTransaction(row);
    } catch (error) {
      logger.error('Failed to get transaction', { error, id });
      throw error;
    }
  }

  /**
   * Get transaction by reference
   */
  getTransactionByReference(reference: string): Transaction | undefined {
    try {
      const stmt = db.prepare('SELECT * FROM transactions WHERE reference = ?');
      const row = stmt.get(reference) as any;
      
      if (!row) return undefined;
      
      return this.mapRowToTransaction(row);
    } catch (error) {
      logger.error('Failed to get transaction by reference', { error, reference });
      throw error;
    }
  }

  /**
   * Get all transactions for a user
   */
  getUserTransactions(userId: string, limit: number = 100, offset: number = 0): Transaction[] {
    try {
      const stmt = db.prepare(`
        SELECT * FROM transactions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `);
      
      const rows = stmt.all(userId, limit, offset) as any[];
      return rows.map(row => this.mapRowToTransaction(row));
    } catch (error) {
      logger.error('Failed to get user transactions', { error, userId });
      throw error;
    }
  }

  /**
   * Get all transactions
   */
  getAllTransactions(limit: number = 100, offset: number = 0): Transaction[] {
    try {
      const stmt = db.prepare(`
        SELECT * FROM transactions 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `);
      
      const rows = stmt.all(limit, offset) as any[];
      return rows.map(row => this.mapRowToTransaction(row));
    } catch (error) {
      logger.error('Failed to get all transactions', { error });
      throw error;
    }
  }

  /**
   * Update transaction
   */
  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | undefined {
    try {
      const existing = this.getTransaction(id);
      if (!existing) return undefined;

      const updated = { ...existing, ...updates, updatedAt: new Date() };
      
      const stmt = db.prepare(`
        UPDATE transactions 
        SET user_id = ?, amount = ?, currency = ?, type = ?, status = ?, 
            method = ?, reference = ?, description = ?, metadata = ?, 
            updated_at = ?, completed_at = ?
        WHERE id = ?
      `);

      stmt.run(
        updated.userId,
        updated.amount,
        updated.currency,
        updated.type,
        updated.status,
        updated.method,
        updated.reference,
        updated.description || null,
        updated.metadata ? JSON.stringify(updated.metadata) : null,
        updated.updatedAt.getTime(),
        updated.completedAt ? updated.completedAt.getTime() : null,
        id
      );

      logger.debug('Transaction updated', { id });
      return updated;
    } catch (error) {
      logger.error('Failed to update transaction', { error, id });
      throw error;
    }
  }

  /**
   * Map database row to Transaction object
   */
  private mapRowToTransaction(row: any): Transaction {
    return {
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      currency: row.currency,
      type: row.type,
      status: row.status,
      method: row.method,
      reference: row.reference,
      description: row.description,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    };
  }

  /**
   * Get or create wallet
   */
  getOrCreateWallet(userId: string, currency: string = 'KES'): Wallet {
    try {
      // Try to get existing wallet
      const stmt = db.prepare('SELECT * FROM wallets WHERE user_id = ? AND currency = ?');
      let row = stmt.get(userId, currency) as any;

      if (!row) {
        // Create new wallet
        const now = Date.now();
        const insertStmt = db.prepare(`
          INSERT INTO wallets (user_id, currency, balance, created_at, updated_at)
          VALUES (?, ?, 0, ?, ?)
        `);
        
        insertStmt.run(userId, currency, now, now);
        row = stmt.get(userId, currency) as any;
      }

      return this.mapRowToWallet(row);
    } catch (error) {
      logger.error('Failed to get or create wallet', { error, userId, currency });
      throw error;
    }
  }

  /**
   * Update wallet balance
   */
  updateWalletBalance(userId: string, amount: number, currency: string = 'KES'): Wallet {
    try {
      const wallet = this.getOrCreateWallet(userId, currency);
      const newBalance = wallet.balance + amount;
      
      // Prevent negative balances
      if (newBalance < 0) {
        throw new Error(`Insufficient balance. Current: ${wallet.balance}, Requested: ${Math.abs(amount)}`);
      }
      
      const stmt = db.prepare(`
        UPDATE wallets 
        SET balance = ?, updated_at = ?
        WHERE user_id = ? AND currency = ?
      `);
      
      const now = Date.now();
      stmt.run(newBalance, now, userId, currency);
      
      logger.info('Wallet balance updated', { userId, amount, newBalance, currency });
      
      return {
        ...wallet,
        balance: newBalance,
        updatedAt: new Date(now),
      };
    } catch (error) {
      logger.error('Failed to update wallet balance', { error, userId, amount, currency });
      throw error;
    }
  }

  /**
   * Get wallet
   */
  getWallet(userId: string, currency: string = 'KES'): Wallet | undefined {
    try {
      const stmt = db.prepare('SELECT * FROM wallets WHERE user_id = ? AND currency = ?');
      const row = stmt.get(userId, currency) as any;
      
      if (!row) return undefined;
      
      return this.mapRowToWallet(row);
    } catch (error) {
      logger.error('Failed to get wallet', { error, userId, currency });
      throw error;
    }
  }

  /**
   * Map database row to Wallet object
   */
  private mapRowToWallet(row: any): Wallet {
    return {
      userId: row.user_id,
      balance: row.balance,
      currency: row.currency,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

// Export singleton instance
export const transactionRepository = new TransactionRepository();
