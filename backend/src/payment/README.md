# 💳 eSewa Payment Integration - Complete Guide

## 📖 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [How It Works](#how-it-works)
4. [Setup & Installation](#setup--installation)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This module provides a complete, secure eSewa payment gateway integration for Think Events platform.

### Features
- ✅ Secure HMAC SHA256 signature generation and verification
- ✅ Payment verification with eSewa API
- ✅ Automatic seat reservation and release
- ✅ Transaction logging for audit trail
- ✅ Retry logic for reliability
- ✅ Reward points integration
- ✅ Multi-layer security validation

---

## Architecture

### Folder Structure

```
payment/
├── esewa/                      # eSewa-specific implementations
│   ├── config.js              # Configuration (URLs, credentials, settings)
│   ├── constants.js           # Payment status constants
│   ├── signature.js           # HMAC signature generation/verification
│   └── api.js                 # eSewa API client (status checks)
│
├── services/                   # Business logic layer
│   ├── paymentService.js      # Main payment orchestration
│   └── transactionLogger.js   # Transaction logging service
│
├── controller.js              # HTTP request handlers
├── routes.js                  # API route definitions
└── index.js                   # Module exports
```

### Design Principles
- **Separation of Concerns**: eSewa logic isolated from business logic
- **Modularity**: Easy to add other payment gateways (Khalti, IME Pay)
- **Security First**: Multiple validation layers
- **Testability**: Each module can be tested independently

---

## How It Works

### Payment Flow

```
┌─────────────┐
│  1. User    │  Selects seats, proceeds to payment
│   Frontend  │
└──────┬──────┘
       │
       ↓ POST /api/payment/esewa/initiate
┌─────────────┐
│  2. Backend │  • Creates pending booking
│   Payment   │  • Generates transaction UUID
│   Service   │  • Creates HMAC signature
│             │  • Returns payment form params
└──────┬──────┘
       │
       ↓ Form POST to eSewa
┌─────────────┐
│  3. eSewa   │  • User logs in
│   Payment   │  • User confirms payment
│   Gateway   │  • Processes payment
└──────┬──────┘
       │
       ↓ Callback with base64 data
┌─────────────┐
│  4. Backend │  • Receives callback
│   Callback  │  • Verifies signature ✓
│   Handler   │  • Validates transaction UUID ✓
│             │  • Validates amount ✓
│             │  • Calls eSewa status API ✓
│             │  • Updates booking to 'confirmed'
│             │  • Awards reward points
└──────┬──────┘
       │
       ↓ 302 Redirect
┌─────────────┐
│  5. Frontend│  • Shows success page
│   Success   │  • Displays booking details
│   Page      │  • User downloads ticket
└─────────────┘
```

### Key Components

#### 1. Payment Initiation (`paymentService.js`)
- Validates seat availability
- Prevents double booking
- Creates pending booking
- Generates unique transaction UUID
- Calculates payment breakdown (amount, tax, service charge)
- Creates HMAC signature
- Returns payment form parameters

#### 2. HMAC Signature (`signature.js`)
**For Payment Request:**
```javascript
message = "total_amount=1000,transaction_uuid=TXN-123,product_code=EPAYTEST"
signature = HMAC_SHA256(message, secret_key)
```

**For Callback Verification:**
```javascript
message = "transaction_code=ABC,status=COMPLETE,total_amount=1000,transaction_uuid=TXN-123,product_code=EPAYTEST,signed_field_names=..."
signature = HMAC_SHA256(message, secret_key)
```

#### 3. Callback Handling (`controller.js`)
- Receives base64-encoded data from eSewa
- Decodes JSON payload
- **Verifies signature** (prevents fake callbacks)
- **Validates transaction UUID** (matches booking)
- **Validates amount** (prevents tampering)
- Calls eSewa status API for double verification
- Updates booking to confirmed
- Redirects to frontend success page

#### 4. eSewa API Verification (`api.js`)
- Calls eSewa's status API
- Includes retry logic (3 attempts, 2s delay)
- Validates payment status is 'COMPLETE'
- Returns verification result

---

## Setup & Installation

### Prerequisites
- Node.js 16+ installed
- PostgreSQL database
- eSewa merchant account (for production)

### Step 1: Run Database Migrations

```bash
cd backend

# Add payment fields to bookings table
npm run migrate:payment

# Add transaction logging table (optional but recommended)
npm run migrate:transactions
```

**What this adds:**
- `bookings.transaction_uuid` - Unique transaction identifier
- `bookings.payment_reference` - eSewa reference ID after payment
- `payment_transactions` table - Complete audit log

### Step 2: Configure Environment Variables

Create/edit `backend/.env`:

```env
# Server Configuration
BASE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173

# eSewa Configuration (Testing - UAT)
ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_PAYMENT_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_STATUS_URL=https://rc.esewa.com.np/api/epay/transaction/status/
```

### Step 3: Start the Server

```bash
npm run dev
```

The payment module is automatically loaded by `server.js`:
```javascript
import paymentRoutes from './payment/index.js';
app.use('/api/payment', paymentRoutes);
```

---

## Testing

### Test Credentials (eSewa UAT)

**eSewa Test Accounts:**
- **ID**: 9806800001, 9806800002, 9806800003, 9806800004, 9806800005
- **Password**: Nepal@123
- **MPIN**: 1122 (mobile app only)

### Manual Testing Flow

#### 1. Start Both Servers

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

#### 2. Make a Test Booking

1. Open http://localhost:5173
2. Select any event
3. Choose seats (e.g., A001, A002)
4. Fill in your information
5. Click "Pay रु X,XXX"

#### 3. Complete Payment on eSewa

1. Browser redirects to eSewa payment page
2. Login with test credentials: `9806800001` / `Nepal@123`
3. Click "Submit" to complete payment
4. eSewa processes payment

#### 4. Verify Success

**Backend logs should show:**
```
eSewa callback received
✅ Payment successful! Updating booking X to confirmed...
Redirecting to frontend success page
```

**Frontend should:**
- Redirect to success page
- Show booking confirmation
- Display transaction ID
- Show "You've earned X reward points!"

#### 5. Verify in Database

```sql
-- Check booking status
SELECT id, status, payment_status, transaction_uuid, payment_reference, total_amount
FROM bookings
WHERE id = YOUR_BOOKING_ID;

-- Should show:
-- status: 'confirmed'
-- payment_status: 'completed'
-- transaction_uuid: 'TXN-XXX-...'
-- payment_reference: '000D80X' (eSewa ref ID)

-- Check transaction log
SELECT * FROM payment_transactions
WHERE booking_id = YOUR_BOOKING_ID
ORDER BY created_at DESC;

-- Check reward points awarded
SELECT reward_points FROM users WHERE id = YOUR_USER_ID;
```

### Test Scenarios

#### ✅ Scenario 1: Successful Payment
- Select seats → Pay → Login to eSewa → Complete
- **Expected**: Success page, booking confirmed, seats booked, points awarded

#### ✅ Scenario 2: Payment Cancellation
- Select seats → Pay → Cancel on eSewa page
- **Expected**: Failure page, booking cancelled, seats released

#### ✅ Scenario 3: Payment Timeout
- Select seats → Pay → Wait 5+ minutes
- **Expected**: Session expired, seats released

#### ✅ Scenario 4: Double Booking Prevention
- User A selects seats → User B tries same seats
- **Expected**: User B gets "seats already booked" error

---

## Production Deployment

### 1. Get eSewa Production Credentials

1. Register at https://merchant.esewa.com.np
2. Complete merchant verification
3. Receive:
   - **Product Code** (e.g., `NP-ES-THINKEVENTS`)
   - **Secret Key** (keep this secure!)

### 2. Update Production Environment

```env
NODE_ENV=production
BASE_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com

# eSewa Production
ESEWA_PRODUCT_CODE=YOUR_PRODUCTION_CODE
ESEWA_SECRET_KEY=YOUR_PRODUCTION_SECRET
ESEWA_PAYMENT_URL=https://epay.esewa.com.np/api/epay/main/v2/form
ESEWA_STATUS_URL=https://esewa.com.np/api/epay/transaction/status/

# Database
DATABASE_URL=your_production_database_url

# Email
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
```

### 3. Run Migrations on Production

```bash
# SSH into production server
npm run migrate:payment
npm run migrate:transactions
```

### 4. Deploy and Test

```bash
# Deploy backend
npm install --production
npm start

# Test with small amount first
# Use real eSewa account (not test credentials)
# Verify payment in eSewa merchant dashboard
```

---

## Security

### Multi-Layer Security

#### Layer 1: HMAC Signature (Outgoing)
- Generate signature when sending to eSewa
- Prevents request tampering

#### Layer 2: Signature Verification (Incoming) ✅
- Verify eSewa's callback signature
- Prevents fake callbacks
- **Critical security layer**

#### Layer 3: Transaction UUID Validation ✅
- Callback transaction UUID must match booking
- Prevents unauthorized payment confirmation

#### Layer 4: Amount Validation ✅
- eSewa amount must match booking amount
- Prevents amount tampering

#### Layer 5: eSewa API Verification ✅
- Double-check with eSewa's status API
- Only mark paid if status = 'COMPLETE'
- Cannot be bypassed

#### Layer 6: Database Constraints
- Transaction UUID is unique
- Prevents duplicate payments

### Best Practices

1. **Never expose secret key**
   - Keep in `.env` (not in code)
   - Add `.env` to `.gitignore`
   - Rotate keys periodically

2. **Always verify callbacks**
   - Check signature
   - Check transaction UUID
   - Check amount
   - Call eSewa API

3. **Use HTTPS in production**
   - Required for secure callbacks
   - SSL certificate mandatory

4. **Monitor transactions**
   - Check `payment_transactions` table regularly
   - Alert on suspicious activity
   - Reconcile with eSewa merchant dashboard

---

## API Reference

### POST /api/payment/esewa/initiate

Initiates payment and creates pending booking.

**Auth**: Required (Bearer token)

**Request:**
```json
{
  "event_id": 123,
  "seat_numbers": ["A001", "A002"],
  "quantity": 2,
  "amount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": 456,
    "transaction_uuid": "TXN-456-1234567890-123",
    "payment_url": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    "payment_params": {
      "amount": "850",
      "tax_amount": "130",
      "total_amount": "1000",
      "transaction_uuid": "TXN-456-1234567890-123",
      "product_code": "EPAYTEST",
      "signature": "...",
      "success_url": "http://localhost:5001/api/payment/status/456",
      "failure_url": "http://localhost:5173/payment/esewa/failure?booking_id=456"
    }
  }
}
```

### GET /api/payment/status/:booking_id

Handles eSewa callback and verifies payment.

**Auth**: Not required (eSewa callback) / Required (manual status check)

**Callback from eSewa:**
```
GET /api/payment/status/456?data=base64_encoded_json
```

**Process:**
1. Decodes base64 data
2. Verifies signature ✓
3. Validates transaction UUID ✓
4. Validates amount ✓
5. Calls eSewa status API ✓
6. Updates booking to 'confirmed'
7. Awards reward points
8. Redirects to frontend success page

### GET /api/payment/esewa/failure

Handles payment failure.

**Query:** `?booking_id=456`

**Process:**
1. Marks booking as cancelled
2. Restores seats to event
3. Logs failure

---

## Troubleshooting

### Issue: "Invalid signature from eSewa callback"

**Cause**: Secret key mismatch

**Solution:**
1. Verify `ESEWA_SECRET_KEY` in `.env`
2. Ensure no trailing spaces
3. For UAT, use: `8gBm/:&EnhH.1/q`

### Issue: Payment status stays "pending"

**Cause**: Backend callback not triggered

**Solution:**
1. Check `success_url` points to backend (not frontend)
2. Verify: `http://localhost:5001/api/payment/status/{booking_id}`
3. Check backend logs for "eSewa callback received"

### Issue: Seats not released on failure

**Cause**: Failure callback not triggered

**Solution:**
1. Check `failure_url` configuration
2. Manually trigger: `GET /api/payment/esewa/failure?booking_id=X`

### Issue: Amount mismatch error

**Cause**: eSewa amount differs from booking

**Check:**
```sql
SELECT total_amount FROM bookings WHERE id = X;
-- Compare with amount from eSewa
```

---

## Configuration

### Environment Variables

| Variable | Description | Example (UAT) | Example (Prod) |
|----------|-------------|---------------|----------------|
| `ESEWA_PRODUCT_CODE` | Merchant product code | `EPAYTEST` | `NP-ES-YOUR-CODE` |
| `ESEWA_SECRET_KEY` | Secret for signatures | `8gBm/:&EnhH.1/q` | Your secret key |
| `ESEWA_PAYMENT_URL` | Payment form URL | `https://rc-epay.esewa.com.np/...` | `https://epay.esewa.com.np/...` |
| `ESEWA_STATUS_URL` | Status check API | `https://rc.esewa.com.np/...` | `https://esewa.com.np/...` |
| `BASE_URL` | Your backend URL | `http://localhost:5001` | `https://api.your-domain.com` |
| `FRONTEND_URL` | Your frontend URL | `http://localhost:5173` | `https://your-domain.com` |

### Automatic Configuration

The system automatically selects correct URLs based on `NODE_ENV`:
- `development` → Uses eSewa UAT endpoints
- `production` → Uses eSewa production endpoints

---

## Code Examples

### Using the Payment Service Directly

```javascript
import { paymentService } from './payment/index.js';

// Initiate payment
const result = await paymentService.initiatePayment(userId, {
  event_id: 123,
  seat_numbers: ['A001', 'A002'],
  quantity: 2,
  amount: 1000
});

// Check payment status
const status = await paymentService.getPaymentStatus(bookingId, userId);
```

### Adding a New Payment Gateway

Create a new folder structure similar to `esewa/`:

```
payment/
├── esewa/
├── khalti/              # New gateway
│   ├── config.js
│   ├── signature.js
│   └── api.js
```

Update `paymentService.js` to handle multiple gateways.

---

## Database Schema

### Bookings Table (Modified)

```sql
ALTER TABLE bookings
ADD COLUMN transaction_uuid VARCHAR(255) UNIQUE,
ADD COLUMN payment_reference VARCHAR(255);
```

### Payment Transactions Table (New)

```sql
CREATE TABLE payment_transactions (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  transaction_uuid VARCHAR(255),
  payment_method VARCHAR(50),
  amount DECIMAL(10, 2),
  status VARCHAR(50),
  gateway_response JSONB,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Monitoring

### Transaction Logs

```sql
-- Recent transactions
SELECT booking_id, transaction_uuid, status, amount, created_at
FROM payment_transactions
ORDER BY created_at DESC
LIMIT 50;

-- Failed transactions
SELECT * FROM payment_transactions
WHERE status = 'failed'
ORDER BY created_at DESC;

-- Success rate (last 100 transactions)
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM payment_transactions
ORDER BY created_at DESC
LIMIT 100;
```

### Health Checks

```bash
# Backend health
curl http://localhost:5001/health

# Payment endpoint
curl http://localhost:5001/api/payment/status/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Performance

### Optimizations
- **Indexed fields**: `transaction_uuid`, `booking_id`
- **Retry logic**: 3 attempts with 2s delay (configurable)
- **Async operations**: Non-blocking transaction logging
- **Connection pooling**: Database connections reused

### Expected Response Times
- Payment initiation: < 2 seconds
- Callback processing: < 4 seconds
- Booking fetch: < 1 second

---

## Support

### eSewa Support
- **Website**: https://esewa.com.np
- **Developer Docs**: https://developer.esewa.com.np
- **Merchant Portal**: https://merchant.esewa.com.np
- **Phone**: +977-1-5970002

### Internal Debugging

```bash
# Enable detailed logs (temporarily)
# Add to paymentService.js:
console.log('Payment verification:', { transaction_uuid, status });

# Check database
psql -d your_db -c "SELECT * FROM bookings WHERE id = X;"
psql -d your_db -c "SELECT * FROM payment_transactions WHERE booking_id = X;"
```

---

## Changelog

### Version 1.0.0 (Current)
- ✅ eSewa payment integration
- ✅ HMAC signature generation and verification
- ✅ Multi-layer security validation
- ✅ Transaction logging
- ✅ Automatic seat management
- ✅ Reward points integration
- ✅ Retry logic for reliability

### Planned Features
- [ ] Refund functionality
- [ ] Khalti payment gateway
- [ ] IME Pay support
- [ ] Webhook support (alternative to redirects)
- [ ] Payment analytics dashboard

---

## License

Part of Think Events platform. All rights reserved.

---

**Last Updated**: December 2025  
**Maintained By**: Think Events Development Team  
**Status**: ✅ Production Ready
