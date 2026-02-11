/**
 * Payment System Types for GetPesa
 * Defines core types and interfaces for the payment system
 */

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  PAYMENT = 'PAYMENT'
}

export enum PaymentMethod {
  MPESA = 'MPESA',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD'
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  method: PaymentMethod;
  reference: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  method: PaymentMethod;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  reference: string;
  status: TransactionStatus;
  message: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentProvider {
  initiate(request: PaymentRequest): Promise<PaymentResponse>;
  checkStatus(transactionId: string): Promise<Transaction>;
  processCallback(data: any): Promise<Transaction>;
}
