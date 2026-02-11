/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../utils/logger';

// Create rate limiter for API endpoints
const apiLimiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds (1 minute)
  blockDuration: 60, // Block for 60 seconds if exceeded
});

// Create stricter rate limiter for payment endpoints
const paymentLimiter = new RateLimiterMemory({
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 300, // Block for 5 minutes if exceeded
});

/**
 * General API rate limiting middleware
 */
export const apiRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the real client IP (handle proxy chains)
    let key = req.ip || 'unknown';
    if (req.headers['x-forwarded-for']) {
      const forwarded = req.headers['x-forwarded-for'] as string;
      key = forwarded.split(',')[0].trim();
    }
    
    await apiLimiter.consume(key);
    next();
  } catch (error) {
    logger.warn('API rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: 60,
    });
  }
};

/**
 * Payment endpoint rate limiting middleware
 */
export const paymentRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the real client IP (handle proxy chains)
    let key = req.ip || 'unknown';
    if (req.headers['x-forwarded-for']) {
      const forwarded = req.headers['x-forwarded-for'] as string;
      key = forwarded.split(',')[0].trim();
    }
    
    await paymentLimiter.consume(key);
    next();
  } catch (error) {
    logger.warn('Payment rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json({
      success: false,
      error: 'Too many payment requests. Please try again in 5 minutes.',
      retryAfter: 300,
    });
  }
};

/**
 * Custom rate limiter factory
 */
export const createRateLimiter = (points: number, duration: number) => {
  const limiter = new RateLimiterMemory({ points, duration });
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract the real client IP (handle proxy chains)
      let key = req.ip || 'unknown';
      if (req.headers['x-forwarded-for']) {
        const forwarded = req.headers['x-forwarded-for'] as string;
        key = forwarded.split(',')[0].trim();
      }
      
      await limiter.consume(key);
      next();
    } catch (error) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: duration,
      });
    }
  };
};
