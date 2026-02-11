# GetPesa API Examples

This document provides examples of how to use the GetPesa Payment System API.

## Prerequisites

1. Start the server:
```bash
npm run dev
```

2. Set your API key in the `.env` file or use the default: `default-api-key-change-in-production`

## Example 1: Initiate a Payment

```bash
curl -X POST http://localhost:3000/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -H "x-api-key: default-api-key-change-in-production" \
  -H "x-user-id: user-123" \
  -d '{
    "amount": 1000,
    "currency": "KES",
    "phoneNumber": "254712345678",
    "method": "MPESA",
    "description": "Payment for Order #12345"
  }'
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

## Example 2: Check Transaction Status

```bash
curl http://localhost:3000/api/v1/transactions/TXN-uuid-here \
  -H "x-api-key: default-api-key-change-in-production"
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "TXN-uuid-here",
    "userId": "user-123",
    "amount": 1000,
    "currency": "KES",
    "type": "PAYMENT",
    "status": "PENDING",
    "method": "MPESA",
    "reference": "REF-1234567890-1234",
    "description": "Payment for Order #12345",
    "createdAt": "2026-02-11T15:00:00.000Z",
    "updatedAt": "2026-02-11T15:00:00.000Z"
  }
}
```

## Example 3: Get User Transaction History

```bash
curl http://localhost:3000/api/v1/users/user-123/transactions \
  -H "x-api-key: default-api-key-change-in-production"
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "transactions": [
    {
      "id": "TXN-uuid-1",
      "userId": "user-123",
      "amount": 1000,
      "currency": "KES",
      "type": "PAYMENT",
      "status": "COMPLETED",
      "method": "MPESA",
      "reference": "REF-1234567890-1234",
      "createdAt": "2026-02-11T15:00:00.000Z",
      "completedAt": "2026-02-11T15:00:30.000Z"
    }
  ]
}
```

## Example 4: Check Wallet Balance

```bash
curl "http://localhost:3000/api/v1/wallet/user-123?currency=KES" \
  -H "x-api-key: default-api-key-change-in-production"
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "userId": "user-123",
    "balance": 5000.00,
    "currency": "KES",
    "createdAt": "2026-02-11T15:00:00.000Z",
    "updatedAt": "2026-02-11T15:30:00.000Z"
  }
}
```

## Example 5: Using with JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'default-api-key-change-in-production';

// Initiate payment
async function initiatePayment(userId: string, amount: number, phoneNumber: string) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/payments/initiate`,
      {
        amount,
        currency: 'KES',
        phoneNumber,
        method: 'MPESA',
        description: 'Payment for services',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'x-user-id': userId,
        },
      }
    );
    
    console.log('Payment initiated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}

// Check transaction status
async function checkTransactionStatus(transactionId: string) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/transactions/${transactionId}`,
      {
        headers: {
          'x-api-key': API_KEY,
        },
      }
    );
    
    return response.data.transaction;
  } catch (error) {
    console.error('Failed to check status:', error);
    throw error;
  }
}

// Example usage
async function main() {
  const payment = await initiatePayment('user-123', 1000, '254712345678');
  console.log('Payment ID:', payment.transactionId);
  
  // Check status after some delay
  setTimeout(async () => {
    const status = await checkTransactionStatus(payment.transactionId);
    console.log('Payment status:', status.status);
  }, 5000);
}

main();
```

## Example 6: Using with Python

```python
import requests
import time

API_BASE_URL = 'http://localhost:3000/api/v1'
API_KEY = 'default-api-key-change-in-production'

def initiate_payment(user_id, amount, phone_number):
    """Initiate a payment"""
    url = f'{API_BASE_URL}/payments/initiate'
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-user-id': user_id,
    }
    payload = {
        'amount': amount,
        'currency': 'KES',
        'phoneNumber': phone_number,
        'method': 'MPESA',
        'description': 'Payment for services',
    }
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

def check_transaction_status(transaction_id):
    """Check transaction status"""
    url = f'{API_BASE_URL}/transactions/{transaction_id}'
    headers = {'x-api-key': API_KEY}
    
    response = requests.get(url, headers=headers)
    return response.json()

# Example usage
if __name__ == '__main__':
    # Initiate payment
    payment = initiate_payment('user-123', 1000, '254712345678')
    print(f"Payment initiated: {payment['transactionId']}")
    
    # Wait and check status
    time.sleep(5)
    status = check_transaction_status(payment['transactionId'])
    print(f"Payment status: {status['transaction']['status']}")
```

## Error Handling

### Invalid API Key
```bash
curl http://localhost:3000/api/v1/health \
  -H "x-api-key: invalid-key"
```

**Response:**
```json
{
  "success": false,
  "error": "Unauthorized - Invalid API key"
}
```

### Invalid Amount
```bash
curl -X POST http://localhost:3000/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -H "x-api-key: default-api-key-change-in-production" \
  -H "x-user-id: user-123" \
  -d '{"amount": -100, "phoneNumber": "254712345678", "method": "MPESA"}'
```

**Response:**
```json
{
  "success": false,
  "transactionId": "",
  "reference": "",
  "status": "FAILED",
  "message": "Invalid amount. Must be between 1 and 150000"
}
```

## Webhook Callback Example

When M-Pesa processes a payment, it will send a callback to your configured URL:

```bash
curl -X POST http://localhost:3000/api/v1/callbacks/MPESA \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN-uuid-here",
    "userId": "user-123",
    "amount": 1000,
    "currency": "KES",
    "resultCode": "0",
    "resultDesc": "Success",
    "reference": "REF-1234567890-1234"
  }'
```

## Testing Tips

1. Use the health endpoint to verify the server is running:
```bash
curl http://localhost:3000/api/v1/health
```

2. Test with different phone number formats:
   - `0712345678` (local format)
   - `254712345678` (international without +)
   - `+254712345678` (international with +)

3. Test with different currencies: KES, UGX, TZS, USD

4. Monitor server logs for debugging information

## Next Steps

1. Configure your M-Pesa credentials in `.env` file
2. Implement proper database (PostgreSQL recommended)
3. Add user authentication and authorization
4. Set up proper logging and monitoring
5. Deploy to production with HTTPS
6. Configure proper webhook URLs for M-Pesa callbacks
