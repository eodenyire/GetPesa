/**
 * In-Memory Transaction Store
 * Simple storage for transactions (in production, use PostgreSQL/MongoDB)
 */

import { Transaction, Wallet } from '../types/payment.types';

class TransactionStore {
  private transactions: Map<string, Transaction> = new Map();
  private wallets: Map<string, Wallet> = new Map();

  // Transaction methods
  saveTransaction(transaction: Transaction): Transaction {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  getTransactionByReference(reference: string): Transaction | undefined {
    return Array.from(this.transactions.values()).find(
      t => t.reference === reference
    );
  }

  getUserTransactions(userId: string): Transaction[] {
    return Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | undefined {
    const transaction = this.transactions.get(id);
    if (transaction) {
      const updated = { ...transaction, ...updates, updatedAt: new Date() };
      this.transactions.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Wallet methods
  getOrCreateWallet(userId: string, currency: string = 'KES'): Wallet {
    const key = `${userId}-${currency}`;
    let wallet = this.wallets.get(key);
    
    if (!wallet) {
      wallet = {
        userId,
        balance: 0,
        currency,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.wallets.set(key, wallet);
    }
    
    return wallet;
  }

  updateWalletBalance(userId: string, amount: number, currency: string = 'KES'): Wallet {
    const wallet = this.getOrCreateWallet(userId, currency);
    wallet.balance += amount;
    wallet.updatedAt = new Date();
    const key = `${userId}-${currency}`;
    this.wallets.set(key, wallet);
    return wallet;
  }

  getWallet(userId: string, currency: string = 'KES'): Wallet | undefined {
    const key = `${userId}-${currency}`;
    return this.wallets.get(key);
  }
}

// Export singleton instance
export const transactionStore = new TransactionStore();
