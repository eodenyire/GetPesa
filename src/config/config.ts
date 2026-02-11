/**
 * Configuration Management for GetPesa
 * Handles environment variables and application settings
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API Configuration
  apiKey: process.env.API_KEY || 'default-api-key-change-in-production',
  apiVersion: 'v1',
  
  // M-Pesa Configuration
  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
    shortcode: process.env.MPESA_SHORTCODE || '',
    passkey: process.env.MPESA_PASSKEY || '',
    callbackUrl: process.env.MPESA_CALLBACK_URL || '',
    environment: process.env.MPESA_ENVIRONMENT || 'sandbox', // sandbox or production
  },
  
  // Currency Configuration
  defaultCurrency: 'KES',
  supportedCurrencies: ['KES', 'UGX', 'TZS', 'USD'],
  
  // Transaction limits
  limits: {
    minAmount: 1,
    maxAmount: 150000, // KES
  },
};

export default config;
