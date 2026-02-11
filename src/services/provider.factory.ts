/**
 * Payment Provider Factory
 * Creates payment provider instances based on payment method
 */

import { PaymentMethod, PaymentProvider } from '../types/payment.types';
import { MPesaProvider } from './mpesa.provider';
import { AirtelProvider } from './airtel.provider';
import { BankTransferProvider } from './bank.provider';

export class PaymentProviderFactory {
  private static providers: Map<PaymentMethod, PaymentProvider> = new Map();

  /**
   * Get payment provider instance for the specified method
   */
  static getProvider(method: PaymentMethod): PaymentProvider {
    // Return cached provider if exists
    if (this.providers.has(method)) {
      return this.providers.get(method)!;
    }

    // Create new provider instance
    let provider: PaymentProvider;
    
    switch (method) {
      case PaymentMethod.MPESA:
        provider = new MPesaProvider();
        break;
      case PaymentMethod.AIRTEL_MONEY:
        provider = new AirtelProvider();
        break;
      case PaymentMethod.BANK_TRANSFER:
        provider = new BankTransferProvider();
        break;
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }

    // Cache the provider
    this.providers.set(method, provider);
    return provider;
  }

  /**
   * Get all supported payment methods
   */
  static getSupportedMethods(): PaymentMethod[] {
    return [
      PaymentMethod.MPESA,
      PaymentMethod.AIRTEL_MONEY,
      PaymentMethod.BANK_TRANSFER,
    ];
  }

  /**
   * Check if a payment method is supported
   */
  static isSupported(method: PaymentMethod): boolean {
    return this.getSupportedMethods().includes(method);
  }
}
