/**
 * GetPesa Payment System Server
 * Main entry point for the application
 */

import express, { Application } from 'express';
import config from './config/config';
import routes from './api/routes';
import { logger } from './utils/logger';
import { apiRateLimiter } from './middleware/rate-limiter';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (for development)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key, x-user-id, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Rate limiting (global)
app.use(apiRateLimiter);

// API Routes
app.use(`/api/${config.apiVersion}`, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'GetPesa Payment System',
    version: '2.0.0',
    description: 'East African mobile money payment gateway - Enhanced Edition',
    documentation: '/api/v1/health',
    features: [
      'Multi-provider support (M-Pesa, Airtel Money, Bank Transfer)',
      'JWT Authentication',
      'Rate Limiting',
      'SQLite Database',
      'Structured Logging',
    ],
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('Endpoint not found', { path: req.path });
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Server error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    logger.info('GetPesa Payment System started', {
      port: PORT,
      environment: config.nodeEnv,
      version: '2.0.0',
    });
    console.log(`🚀 GetPesa Payment System started`);
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`💰 API endpoint: http://localhost:${PORT}/api/${config.apiVersion}`);
    console.log(`🔒 Enhanced with JWT Auth, Rate Limiting, and Database`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

export default app;
