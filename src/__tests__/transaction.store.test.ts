/**
 * Tests for Transaction Store
 */

import { transactionStore } from '../models/transaction.store';
import { Transaction, TransactionStatus, TransactionType, PaymentMethod } from '../types/payment.types';

describe('Transaction Store', () => {
  const mockTransaction: Transaction = {
    id: 'test-txn-123',
    userId: 'user-123',
    amount: 100,
    currency: 'KES',
    type: TransactionType.PAYMENT,
    status: TransactionStatus.PENDING,
    method: PaymentMethod.MPESA,
    reference: 'REF-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('saveTransaction', () => {
    it('should save a transaction', () => {
      const saved = transactionStore.saveTransaction(mockTransaction);
      expect(saved).toEqual(mockTransaction);
    });
  });

  describe('getTransaction', () => {
    it('should retrieve a saved transaction', () => {
      transactionStore.saveTransaction(mockTransaction);
      const retrieved = transactionStore.getTransaction(mockTransaction.id);
      expect(retrieved).toEqual(mockTransaction);
    });

    it('should return undefined for non-existent transaction', () => {
      const retrieved = transactionStore.getTransaction('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getTransactionByReference', () => {
    it('should retrieve transaction by reference', () => {
      transactionStore.saveTransaction(mockTransaction);
      const retrieved = transactionStore.getTransactionByReference(mockTransaction.reference);
      expect(retrieved).toEqual(mockTransaction);
    });
  });

  describe('getUserTransactions', () => {
    it('should retrieve all transactions for a user', () => {
      const txn1 = { ...mockTransaction, id: 'txn-1' };
      const txn2 = { ...mockTransaction, id: 'txn-2', userId: 'user-456' };
      
      transactionStore.saveTransaction(txn1);
      transactionStore.saveTransaction(txn2);
      
      const userTransactions = transactionStore.getUserTransactions('user-123');
      expect(userTransactions.length).toBeGreaterThan(0);
      expect(userTransactions.some(t => t.id === 'txn-1')).toBe(true);
      expect(userTransactions.some(t => t.id === 'txn-2')).toBe(false);
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction fields', () => {
      transactionStore.saveTransaction(mockTransaction);
      const updated = transactionStore.updateTransaction(mockTransaction.id, {
        status: TransactionStatus.COMPLETED,
      });
      
      expect(updated?.status).toBe(TransactionStatus.COMPLETED);
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(mockTransaction.updatedAt.getTime());
    });

    it('should return undefined for non-existent transaction', () => {
      const updated = transactionStore.updateTransaction('non-existent', {
        status: TransactionStatus.COMPLETED,
      });
      expect(updated).toBeUndefined();
    });
  });

  describe('Wallet methods', () => {
    describe('getOrCreateWallet', () => {
      it('should create a new wallet if it does not exist', () => {
        const wallet = transactionStore.getOrCreateWallet('new-user', 'KES');
        expect(wallet.userId).toBe('new-user');
        expect(wallet.currency).toBe('KES');
        expect(wallet.balance).toBe(0);
      });

      it('should return existing wallet if it exists', () => {
        const wallet1 = transactionStore.getOrCreateWallet('existing-user', 'KES');
        wallet1.balance = 100;
        const wallet2 = transactionStore.getOrCreateWallet('existing-user', 'KES');
        expect(wallet2.balance).toBe(100);
      });
    });

    describe('updateWalletBalance', () => {
      it('should update wallet balance', () => {
        const wallet = transactionStore.updateWalletBalance('user-wallet', 100, 'KES');
        expect(wallet.balance).toBe(100);
        
        const updated = transactionStore.updateWalletBalance('user-wallet', 50, 'KES');
        expect(updated.balance).toBe(150);
      });

      it('should handle negative amounts (withdrawals)', () => {
        transactionStore.updateWalletBalance('user-withdrawal', 200, 'KES');
        const updated = transactionStore.updateWalletBalance('user-withdrawal', -50, 'KES');
        expect(updated.balance).toBe(150);
      });
    });
  });
});
