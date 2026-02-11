# GetPesa

**GetPesa** (Swahili for "Get Money") is a modern, developer-friendly payment gateway for East African mobile money services, with primary support for M-Pesa and extensibility for other payment providers.

## 🚀 Features

- **Mobile Money Integration**: M-Pesa STK Push support with easy extensibility for other providers
- **RESTful API**: Clean, intuitive API for payment processing
- **Transaction Management**: Complete transaction lifecycle handling
- **Wallet System**: Built-in wallet management for users
- **Type-Safe**: Built with TypeScript for enhanced developer experience
- **Real-time Callbacks**: Webhook support for payment status updates
- **East Africa Focused**: Optimized for KES, UGX, TZS, and other regional currencies

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

### Payment Methods
Currently supported:
- **MPESA**: Safaricom M-Pesa (Kenya)

Easily extensible for:
- Airtel Money
- Bank transfers
- Card payments

### Transaction Limits
Default limits (configurable in `src/config/config.ts`):
- Minimum: KES 1
- Maximum: KES 150,000

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
│   ├── api/           # API routes and controllers
│   ├── config/        # Configuration management
│   ├── models/        # Data models and storage
│   ├── services/      # Business logic and payment providers
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── index.ts       # Application entry point
├── dist/              # Compiled JavaScript (generated)
├── .env.example       # Environment variables template
├── tsconfig.json      # TypeScript configuration
└── package.json       # Project dependencies
```

## 🔐 Security

- API key authentication for all requests
- Input validation on all endpoints
- Transaction verification
- Secure webhook handling
- Environment-based configuration

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

