/**
 * Tests for utility helper functions
 */

// Mock uuid module before importing helpers
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

import {
  generateTransactionId,
  generateReference,
  validatePhoneNumber,
  formatPhoneNumber,
  validateAmount,
  formatCurrency,
} from '../utils/helpers';

describe('Helper Functions', () => {
  describe('generateTransactionId', () => {
    it('should generate a transaction ID with TXN prefix', () => {
      const id = generateTransactionId();
      expect(id).toMatch(/^TXN-/);
      expect(id.length).toBeGreaterThan(4);
    });

    it('should generate transaction IDs using uuid', () => {
      const id1 = generateTransactionId();
      expect(id1).toBe('TXN-test-uuid-1234');
    });
  });

  describe('generateReference', () => {
    it('should generate a reference with REF prefix', () => {
      const ref = generateReference();
      expect(ref).toMatch(/^REF-\d+-\d+$/);
    });

    it('should generate unique references', () => {
      const ref1 = generateReference();
      const ref2 = generateReference();
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate correct Kenyan phone numbers', () => {
      expect(validatePhoneNumber('254712345678')).toBe(true);
      expect(validatePhoneNumber('+254712345678')).toBe(true);
      expect(validatePhoneNumber('0712345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123456')).toBe(false);
      expect(validatePhoneNumber('254612345678')).toBe(false);
      expect(validatePhoneNumber('abc123')).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format phone number to international format', () => {
      expect(formatPhoneNumber('0712345678')).toBe('254712345678');
      expect(formatPhoneNumber('+254712345678')).toBe('254712345678');
      expect(formatPhoneNumber('254712345678')).toBe('254712345678');
    });

    it('should remove spaces and dashes', () => {
      expect(formatPhoneNumber('0712 345 678')).toBe('254712345678');
      expect(formatPhoneNumber('0712-345-678')).toBe('254712345678');
    });
  });

  describe('validateAmount', () => {
    it('should validate amounts within range', () => {
      expect(validateAmount(100, 1, 150000)).toBe(true);
      expect(validateAmount(1, 1, 150000)).toBe(true);
      expect(validateAmount(150000, 1, 150000)).toBe(true);
    });

    it('should reject amounts outside range', () => {
      expect(validateAmount(0, 1, 150000)).toBe(false);
      expect(validateAmount(150001, 1, 150000)).toBe(false);
      expect(validateAmount(-100, 1, 150000)).toBe(false);
    });

    it('should reject non-finite numbers', () => {
      expect(validateAmount(Infinity, 1, 150000)).toBe(false);
      expect(validateAmount(NaN, 1, 150000)).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(100, 'KES')).toBe('KES 100.00');
      expect(formatCurrency(1234.56, 'USD')).toBe('USD 1234.56');
    });

    it('should use default currency when not specified', () => {
      expect(formatCurrency(100)).toBe('KES 100.00');
    });

    it('should format to 2 decimal places', () => {
      expect(formatCurrency(100.1, 'KES')).toBe('KES 100.10');
      expect(formatCurrency(100.999, 'KES')).toBe('KES 101.00');
    });
  });
});
