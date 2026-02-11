/**
 * Bank Transfer Payment Provider
 * Handles bank transfer payment processing
 */

import {
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../types/payment.types';
import { generateTransactionId, generateReference } from '../utils/helpers';
import { logger } from '../utils/logger';

export class BankTransferProvider implements PaymentProvider {
  /**
   * Initiate Bank Transfer payment
   */
  async initiate(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const transactionId = generateTransactionId();
      const reference = generateReference();

      console.log('Initiating Bank Transfer:', {
        amount: request.amount,
        reference,
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 150));

      // Bank transfers typically require manual confirmation
      return {
        success: true,
        transactionId,
        reference,
        status: TransactionStatus.PENDING,
        message: `Bank transfer initiated. Please use reference ${reference} when making the transfer.`,
      };
    } catch (error) {
      console.error('Bank Transfer initiation error:', error);
      return {
        success: false,
        transactionId: generateTransactionId(),
        reference: generateReference(),
        status: TransactionStatus.FAILED,
        message: 'Failed to initiate bank transfer',
      };
    }
  }

  /**
   * Check transaction status
   */
  async checkStatus(transactionId: string): Promise<Transaction> {
    return {
      id: transactionId,
      userId: 'user-123',
      amount: 100,
      currency: 'KES',
      type: TransactionType.PAYMENT,
      status: TransactionStatus.PENDING,
      method: 'BANK_TRANSFER' as any,
      reference: generateReference(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Process Bank Transfer callback/webhook
   */
  async processCallback(data: any): Promise<Transaction> {
    console.log('Processing Bank Transfer callback:', data);

    // Validate required data
    if (!data.userId) {
      logger.warn('Bank Transfer callback missing userId', { data });
      throw new Error('Missing required field: userId');
    }

    const transaction: Transaction = {
      id: data.transactionId || generateTransactionId(),
      userId: data.userId,
      amount: data.amount || 0,
      currency: data.currency || 'KES',
      type: TransactionType.PAYMENT,
      status: data.confirmed ? TransactionStatus.COMPLETED : TransactionStatus.PENDING,
      method: 'BANK_TRANSFER' as any,
      reference: data.reference || generateReference(),
      description: data.description,
      metadata: data.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: data.confirmed ? new Date() : undefined,
    };

    return transaction;
  }
}
