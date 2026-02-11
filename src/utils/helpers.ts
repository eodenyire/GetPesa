/**
 * Utility functions for GetPesa
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(): string {
  return `TXN-${uuidv4()}`;
}

/**
 * Generate a unique reference number
 */
export function generateReference(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REF-${timestamp}-${random}`;
}

/**
 * Validate phone number format (East African format)
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Accepts formats: +254... , 254... , 0...
  const pattern = /^(\+?254|0)[17]\d{8}$/; // Kenya M-Pesa format
  return pattern.test(phoneNumber);
}

/**
 * Format phone number to international format
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove spaces and dashes
  let cleaned = phoneNumber.replace(/[\s-]/g, '');
  
  // Convert to international format
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  return cleaned;
}

/**
 * Validate amount
 */
export function validateAmount(amount: number, min: number = 1, max: number = 150000): boolean {
  return amount >= min && amount <= max && Number.isFinite(amount);
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'KES'): string {
  return `${currency} ${amount.toFixed(2)}`;
}
