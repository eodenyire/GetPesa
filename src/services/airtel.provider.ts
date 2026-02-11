/**
 * Airtel Money Payment Provider
 * Handles Airtel Money payment processing
 */

import {
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../types/payment.types';
import { generateTransactionId, generateReference, formatPhoneNumber } from '../utils/helpers';
import { logger } from '../utils/logger';
import config from '../config/config';

export class AirtelProvider implements PaymentProvider {
  /**
   * Initiate Airtel Money payment
   */
  async initiate(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const transactionId = generateTransactionId();
      const reference = generateReference();
      const formattedPhone = formatPhoneNumber(request.phoneNumber);

      // In a real implementation, this would call Airtel Money API
      console.log('Initiating Airtel Money payment:', {
        amount: request.amount,
        phone: formattedPhone,
        reference,
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate success (in production, this would be actual Airtel Money API response)
      return {
        success: true,
        transactionId,
        reference,
        status: TransactionStatus.PENDING,
        message: 'Payment initiated successfully. Please approve the payment on your phone.',
      };
    } catch (error) {
      console.error('Airtel Money initiation error:', error);
      return {
        success: false,
        transactionId: generateTransactionId(),
        reference: generateReference(),
        status: TransactionStatus.FAILED,
        message: 'Failed to initiate payment',
      };
    }
  }

  /**
   * Check transaction status
   */
  async checkStatus(transactionId: string): Promise<Transaction> {
    // In production, this would query Airtel Money API
    return {
      id: transactionId,
      userId: 'user-123',
      amount: 100,
      currency: 'UGX',
      type: TransactionType.PAYMENT,
      status: TransactionStatus.COMPLETED,
      method: 'AIRTEL_MONEY' as any,
      reference: generateReference(),
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
    };
  }

  /**
   * Process Airtel Money callback/webhook
   */
  async processCallback(data: any): Promise<Transaction> {
    console.log('Processing Airtel Money callback:', data);

    // Validate required data
    if (!data.userId) {
      logger.warn('Airtel Money callback missing userId', { data });
      throw new Error('Missing required field: userId');
    }

    const transaction: Transaction = {
      id: data.transactionId || generateTransactionId(),
      userId: data.userId,
      amount: data.amount || 0,
      currency: data.currency || 'UGX',
      type: TransactionType.PAYMENT,
      status: data.status === 'SUCCESS' ? TransactionStatus.COMPLETED : TransactionStatus.FAILED,
      method: 'AIRTEL_MONEY' as any,
      reference: data.reference || generateReference(),
      description: data.description,
      metadata: data.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: data.status === 'SUCCESS' ? new Date() : undefined,
    };

    return transaction;
  }
}
