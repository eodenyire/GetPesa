/**
 * API Routes for GetPesa Payment System
 */

import express, { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { PaymentRequest, PaymentMethod } from '../types/payment.types';
import { PaymentProviderFactory } from '../services/provider.factory';
import config from '../config/config';
import { logger } from '../utils/logger';
import { paymentRateLimiter } from '../middleware/rate-limiter';

const router = express.Router();

/**
 * Middleware for API key authentication
 */
function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== config.apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid API key',
    });
  }
  
  next();
}

/**
 * Health check endpoint with detailed diagnostics
 */
router.get('/health', (req: Request, res: Response) => {
  const supportedMethods = PaymentProviderFactory.getSupportedMethods();
  
  res.json({
    success: true,
    message: 'GetPesa Payment System is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: {
      paymentProviders: supportedMethods,
      authentication: ['API Key', 'JWT'],
      database: 'SQLite',
      rateLimiting: true,
      structuredLogging: true,
    },
  });
});

/**
 * Initiate payment
 * POST /api/v1/payments/initiate
 */
router.post('/payments/initiate', authenticateApiKey, paymentRateLimiter, async (req: Request, res: Response) => {
  try {
    const { amount, currency, phoneNumber, method, description, metadata } = req.body;
    const userId = req.headers['x-user-id'] as string || 'default-user';

    logger.info('Payment initiation request', { userId, amount, method });

    // Validate required fields
    if (!amount || !phoneNumber || !method) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, phoneNumber, method',
      });
    }

    const paymentRequest: PaymentRequest = {
      amount: parseFloat(amount),
      currency: currency || config.defaultCurrency,
      phoneNumber,
      method: method as PaymentMethod,
      description,
      metadata,
    };

    const response = await paymentService.initiatePayment(userId, paymentRequest);

    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error('Payment initiation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get transaction status
 * GET /api/v1/transactions/:transactionId
 */
router.get('/transactions/:transactionId', authenticateApiKey, (req: Request, res: Response) => {
  try {
    const transactionId = req.params.transactionId as string;
    const transaction = paymentService.getTransaction(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    return res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get user transactions
 * GET /api/v1/users/:userId/transactions
 */
router.get('/users/:userId/transactions', authenticateApiKey, (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const transactions = paymentService.getUserTransactions(userId);

    return res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get wallet balance
 * GET /api/v1/wallet/:userId
 */
router.get('/wallet/:userId', authenticateApiKey, (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const currency = req.query.currency as string || config.defaultCurrency;
    const wallet = paymentService.getWalletBalance(userId, currency);

    return res.json({
      success: true,
      wallet,
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Webhook callback for payment providers
 * POST /api/v1/callbacks/:method
 */
router.post('/callbacks/:method', async (req: Request, res: Response) => {
  try {
    const { method } = req.params;
    const callbackData = req.body;

    const transaction = await paymentService.processCallback(
      method as PaymentMethod,
      callbackData
    );

    return res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Callback processing error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
