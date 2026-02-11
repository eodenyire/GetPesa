/**
 * Payment Service
 * Main service for handling payment operations
 */

import {
  PaymentRequest,
  PaymentResponse,
  Transaction,
  TransactionStatus,
  TransactionType,
  PaymentMethod,
} from '../types/payment.types';
import { transactionRepository } from '../models/transaction.repository';
import { PaymentProviderFactory } from './provider.factory';
import {
  generateTransactionId,
  generateReference,
  validateAmount,
  validatePhoneNumber,
} from '../utils/helpers';
import config from '../config/config';
import { logger } from '../utils/logger';

export class PaymentService {
  constructor() {
    // Providers are now created by the factory as needed
  }

  /**
   * Initiate a payment
   */
  async initiatePayment(userId: string, request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate request
      if (!validateAmount(request.amount, config.limits.minAmount, config.limits.maxAmount)) {
        return {
          success: false,
          transactionId: '',
          reference: '',
          status: TransactionStatus.FAILED,
          message: `Invalid amount. Must be between ${config.limits.minAmount} and ${config.limits.maxAmount}`,
        };
      }

      if (!validatePhoneNumber(request.phoneNumber)) {
        return {
          success: false,
          transactionId: '',
          reference: '',
          status: TransactionStatus.FAILED,
          message: 'Invalid phone number format',
        };
      }

      // Create transaction record
      const transactionId = generateTransactionId();
      const reference = generateReference();

      const transaction: Transaction = {
        id: transactionId,
        userId,
        amount: request.amount,
        currency: request.currency || config.defaultCurrency,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.PENDING,
        method: request.method,
        reference,
        description: request.description,
        metadata: request.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save transaction
      transactionRepository.saveTransaction(transaction);

      // Validate payment method is supported
      if (!PaymentProviderFactory.isSupported(request.method)) {
        return {
          success: false,
          transactionId,
          reference,
          status: TransactionStatus.FAILED,
          message: `Payment method ${request.method} not supported`,
        };
      }

      // Get the appropriate provider and initiate payment
      const provider = PaymentProviderFactory.getProvider(request.method);
      const response = await provider.initiate(request);

      // Update transaction with response
      if (response.success) {
        transactionRepository.updateTransaction(transactionId, {
          status: response.status,
          reference: response.reference,
        });
      } else {
        transactionRepository.updateTransaction(transactionId, {
          status: TransactionStatus.FAILED,
        });
      }

      return {
        ...response,
        transactionId,
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        transactionId: '',
        reference: '',
        status: TransactionStatus.FAILED,
        message: 'An error occurred while processing payment',
      };
    }
  }

  /**
   * Get transaction by ID
   */
  getTransaction(transactionId: string): Transaction | undefined {
    return transactionRepository.getTransaction(transactionId);
  }

  /**
   * Get user transactions
   */
  getUserTransactions(userId: string): Transaction[] {
    return transactionRepository.getUserTransactions(userId);
  }

  /**
   * Get wallet balance
   */
  getWalletBalance(userId: string, currency: string = 'KES') {
    return transactionRepository.getOrCreateWallet(userId, currency);
  }

  /**
   * Complete a transaction (called after successful payment confirmation)
   */
  async completeTransaction(transactionId: string): Promise<Transaction | undefined> {
    const transaction = transactionRepository.getTransaction(transactionId);
    
    if (!transaction) {
      return undefined;
    }

    // Update transaction status
    const updated = transactionRepository.updateTransaction(transactionId, {
      status: TransactionStatus.COMPLETED,
      completedAt: new Date(),
    });

    // Update wallet balance
    if (updated && updated.type === TransactionType.DEPOSIT) {
      transactionRepository.updateWalletBalance(updated.userId, updated.amount, updated.currency);
    } else if (updated && updated.type === TransactionType.WITHDRAWAL) {
      transactionRepository.updateWalletBalance(updated.userId, -updated.amount, updated.currency);
    }

    return updated;
  }

  /**
   * Process webhook callback
   */
  async processCallback(method: PaymentMethod, data: any): Promise<Transaction> {
    // Validate payment method is supported
    if (!PaymentProviderFactory.isSupported(method)) {
      throw new Error(`Unsupported payment method: ${method}`);
    }

    // Get the appropriate provider and process callback
    const provider = PaymentProviderFactory.getProvider(method);
    const transaction = await provider.processCallback(data);

    // Save or update transaction
    const existing = transactionRepository.getTransaction(transaction.id);
    if (existing) {
      transactionRepository.updateTransaction(transaction.id, transaction);
    } else {
      transactionRepository.saveTransaction(transaction);
    }

    // Update wallet if completed
    if (transaction.status === TransactionStatus.COMPLETED) {
      await this.completeTransaction(transaction.id);
    }

    return transaction;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
