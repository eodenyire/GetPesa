/**
 * GetPesa Payment System Server
 * Main entry point for the application
 */

import express, { Application } from 'express';
import config from './config/config';
import routes from './api/routes';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (for development)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key, x-user-id');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// API Routes
app.use(`/api/${config.apiVersion}`, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'GetPesa Payment System',
    version: '1.0.0',
    description: 'East African mobile money payment gateway',
    documentation: '/api/v1/health',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`🚀 GetPesa Payment System started`);
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`💰 API endpoint: http://localhost:${PORT}/api/${config.apiVersion}`);
  });
}

export default app;
