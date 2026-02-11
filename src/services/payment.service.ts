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
import { transactionStore } from '../models/transaction.store';
import { MPesaProvider } from './mpesa.provider';
import {
  generateTransactionId,
  generateReference,
  validateAmount,
  validatePhoneNumber,
} from '../utils/helpers';
import config from '../config/config';

export class PaymentService {
  private mpesaProvider: MPesaProvider;

  constructor() {
    this.mpesaProvider = new MPesaProvider();
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
      transactionStore.saveTransaction(transaction);

      // Initiate payment based on method
      let response: PaymentResponse;
      
      switch (request.method) {
        case PaymentMethod.MPESA:
          response = await this.mpesaProvider.initiate(request);
          break;
        default:
          response = {
            success: false,
            transactionId,
            reference,
            status: TransactionStatus.FAILED,
            message: 'Payment method not supported',
          };
      }

      // Update transaction with response
      if (response.success) {
        transactionStore.updateTransaction(transactionId, {
          status: response.status,
          reference: response.reference,
        });
      } else {
        transactionStore.updateTransaction(transactionId, {
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
    return transactionStore.getTransaction(transactionId);
  }

  /**
   * Get user transactions
   */
  getUserTransactions(userId: string): Transaction[] {
    return transactionStore.getUserTransactions(userId);
  }

  /**
   * Get wallet balance
   */
  getWalletBalance(userId: string, currency: string = 'KES') {
    return transactionStore.getOrCreateWallet(userId, currency);
  }

  /**
   * Complete a transaction (called after successful payment confirmation)
   */
  async completeTransaction(transactionId: string): Promise<Transaction | undefined> {
    const transaction = transactionStore.getTransaction(transactionId);
    
    if (!transaction) {
      return undefined;
    }

    // Update transaction status
    const updated = transactionStore.updateTransaction(transactionId, {
      status: TransactionStatus.COMPLETED,
      completedAt: new Date(),
    });

    // Update wallet balance
    if (updated && updated.type === TransactionType.DEPOSIT) {
      transactionStore.updateWalletBalance(updated.userId, updated.amount, updated.currency);
    } else if (updated && updated.type === TransactionType.WITHDRAWAL) {
      transactionStore.updateWalletBalance(updated.userId, -updated.amount, updated.currency);
    }

    return updated;
  }

  /**
   * Process webhook callback
   */
  async processCallback(method: PaymentMethod, data: any): Promise<Transaction> {
    let transaction: Transaction;

    switch (method) {
      case PaymentMethod.MPESA:
        transaction = await this.mpesaProvider.processCallback(data);
        break;
      default:
        throw new Error('Unsupported payment method');
    }

    // Save or update transaction
    const existing = transactionStore.getTransaction(transaction.id);
    if (existing) {
      transactionStore.updateTransaction(transaction.id, transaction);
    } else {
      transactionStore.saveTransaction(transaction);
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
