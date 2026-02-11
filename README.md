# GetPesa

**GetPesa** (Swahili for "Get Money") is a production-grade payment gateway for East African mobile money services. Version 2.0 features multi-provider support, JWT authentication, rate limiting, and SQLite database persistence.

## 🚀 Features

### Core Features
- **Multi-Provider Support**: M-Pesa, Airtel Money, and Bank Transfer integration
- **RESTful API**: Clean, intuitive API for payment processing
- **Transaction Management**: Complete transaction lifecycle handling with database persistence
- **Wallet System**: Built-in wallet management with SQLite storage
- **Type-Safe**: Built with TypeScript for enhanced developer experience
- **Real-time Callbacks**: Webhook support for payment status updates
- **East Africa Focused**: Optimized for KES, UGX, TZS, and other regional currencies

### Security & Performance (v2.0)
- **JWT Authentication**: Secure token-based user authentication
- **Rate Limiting**: Protection against API abuse (100 req/min general, 10 req/min payments)
- **API Key Auth**: Dual authentication support
- **SQLite Database**: Persistent storage with indexed queries
- **Structured Logging**: Winston-based logging with file rotation
- **Graceful Shutdown**: Proper cleanup on termination

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- M-Pesa API credentials (for production use)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/eodenyire/GetPesa.git
cd GetPesa
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
API_KEY=your-secure-api-key
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=your-business-shortcode
MPESA_PASSKEY=your-mpesa-passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/callbacks/mpesa
MPESA_ENVIRONMENT=sandbox
```

## 🎯 Quick Start

### Development Mode

```bash
npm run dev
```

### Build and Run Production

```bash
npm run build
npm start
```

## 📖 API Documentation

### Authentication

All API requests require an API key in the header:
```
x-api-key: your-api-key
```

### Endpoints

#### 1. Health Check
```http
GET /api/v1/health
```

**Response:**
```json
{
  "success": true,
  "message": "GetPesa Payment System is running",
  "version": "v1",
  "timestamp": "2026-02-11T15:00:00.000Z"
}
```

#### 2. Initiate Payment
```http
POST /api/v1/payments/initiate
Content-Type: application/json
x-api-key: your-api-key
x-user-id: user-123

{
  "amount": 100,
  "currency": "KES",
  "phoneNumber": "254712345678",
  "method": "MPESA",
  "description": "Payment for services"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "TXN-uuid-here",
  "reference": "REF-1234567890-1234",
  "status": "PENDING",
  "message": "Payment initiated successfully. Please check your phone for M-Pesa prompt."
}
```

#### 3. Get Transaction Status
```http
GET /api/v1/transactions/:transactionId
x-api-key: your-api-key
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "TXN-uuid-here",
    "userId": "user-123",
    "amount": 100,
    "currency": "KES",
    "type": "PAYMENT",
    "status": "COMPLETED",
    "method": "MPESA",
    "reference": "REF-1234567890-1234",
    "createdAt": "2026-02-11T15:00:00.000Z",
    "updatedAt": "2026-02-11T15:00:30.000Z",
    "completedAt": "2026-02-11T15:00:30.000Z"
  }
}
```

#### 4. Get User Transactions
```http
GET /api/v1/users/:userId/transactions
x-api-key: your-api-key
```

#### 5. Get Wallet Balance
```http
GET /api/v1/wallet/:userId?currency=KES
x-api-key: your-api-key
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "userId": "user-123",
    "balance": 1500.00,
    "currency": "KES",
    "createdAt": "2026-02-11T15:00:00.000Z",
    "updatedAt": "2026-02-11T15:30:00.000Z"
  }
}
```

## 🔧 Configuration

### Payment Methods (v2.0)
**Currently Supported:**
- **M-Pesa**: Safaricom M-Pesa (Kenya) - STK Push ready
- **Airtel Money**: Airtel Money (Uganda, Tanzania, Kenya)
- **Bank Transfer**: Direct bank transfers with reference tracking

**Coming Soon:**
- Card payments (Visa, Mastercard)
- PayPal integration
- Cryptocurrency payments

### Transaction Limits
Default limits (configurable in `src/config/config.ts`):
- Minimum: KES 1
- Maximum: KES 150,000

### Rate Limiting
- General API: 100 requests per minute
- Payment endpoints: 10 requests per minute (stricter)

### Supported Currencies
- KES (Kenyan Shilling)
- UGX (Ugandan Shilling)
- TZS (Tanzanian Shilling)
- USD (US Dollar)

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📁 Project Structure

```
GetPesa/
├── src/
│   ├── __tests__/       # Test files
│   ├── api/             # API routes and controllers
│   ├── config/          # Configuration and database setup
│   ├── middleware/      # Authentication and rate limiting
│   ├── models/          # Data models and repositories
│   ├── services/        # Business logic and payment providers
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions and logger
│   └── index.ts         # Application entry point
├── data/                # SQLite database (generated)
├── logs/                # Log files (generated)
├── dist/                # Compiled JavaScript (generated)
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## 🆕 What's New in v2.0

### Multi-Provider Architecture
- Factory pattern for payment provider management
- Easy addition of new payment methods
- Provider-specific configurations

### Database Persistence
- SQLite database with optimized indexes
- Repository pattern for data access
- Transaction and wallet persistence
- User management for JWT auth

### Enhanced Security
- JWT token-based authentication
- Bcrypt password hashing
- Rate limiting per IP address
- Request logging and monitoring

### Monitoring & Observability
- Structured logging with Winston
- Rotating log files (error.log, combined.log)
- Request/response logging
- Graceful shutdown handling

## 🔐 Security

### v1.0 Features
- API key authentication for all requests
- Input validation on all endpoints
- Transaction verification
- Secure webhook handling
- Environment-based configuration

### v2.0 Enhancements ✨
- **JWT Authentication**: Secure token-based user auth
- **Rate Limiting**: Prevents API abuse and DDoS attacks
- **Password Hashing**: Bcrypt with salt rounds
- **SQL Injection Prevention**: Prepared statements
- **Structured Logging**: Audit trail for all operations

**Important**: Never commit your `.env` file or expose API credentials.

## 🌍 Use Cases

- **E-commerce platforms**: Accept mobile money payments
- **Service providers**: Bill payments and subscriptions
- **Peer-to-peer transfers**: User-to-user money transfers
- **Merchant solutions**: POS and invoice payments
- **Wallet services**: Digital wallet implementations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Safaricom M-Pesa API
- East African fintech community

## 📞 Support

For issues and questions:
- GitHub Issues: [https://github.com/eodenyire/GetPesa/issues](https://github.com/eodenyire/GetPesa/issues)

---

Made with ❤️ for the East African developer community

