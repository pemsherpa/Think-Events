# 🚀 eSewa Integration - Quick Start Guide


This guide covers how to set up, test, and deploy the eSewa payment integration.


## 📦 Installation

### 1. Run Database Migrations

```bash
cd backend

# Add payment fields (transaction_uuid, payment_reference)
npm run migrate:payment

# Add transaction logging table
npm run migrate:transactions
```

---

## 🧪 Testing

### Test Credentials

**eSewa Test Account:**
- **ID**: 9806800001 (or 002, 003, 004, 005)
- **Password**: Nepal@123
- **MPIN**: 1122 (mobile app only)
- **Verification Token**: 123456

### Test Payment Flow

1. **Navigate**: http://localhost:5173
2. **Select Event**: Click any event
3. **Book Seats**: Choose seats → Fill info → Click "Pay"
4. **eSewa Login**: Use test credentials above
5. **Complete**: Click Submit on eSewa
6. **Verify**: You should see success page!

### What to Check

✅ **Success Page Shows:**
- Booking ID
- Transaction ID
- Payment Reference
- Reward points earned

✅ **Database Verification:**
```sql
SELECT id, status, payment_status, payment_reference
FROM bookings
ORDER BY created_at DESC
LIMIT 1;

-- Should show:
-- status = 'confirmed'
-- payment_status = 'completed'
```


## 🌐 Production Deployment

### Prerequisites

1. ✅ eSewa merchant account verified
2. ✅ Production credentials received
3. ✅ SSL certificate installed (HTTPS required)
4. ✅ Production database ready

### Steps

#### 1. Update Environment

```env
NODE_ENV=production

ESEWA_PRODUCT_CODE=YOUR_PRODUCTION_CODE
ESEWA_SECRET_KEY=YOUR_PRODUCTION_SECRET
ESEWA_PAYMENT_URL=https://epay.esewa.com.np/api/epay/main/v2/form
ESEWA_STATUS_URL=https://esewa.com.np/api/epay/transaction/status/
```

#### 2. Run Migrations

```bash
npm run migrate:payment
npm run migrate:transactions
```

#### 3. Deploy

```bash
# Backend
npm install --production
npm start

# Frontend
npm run build
# Deploy dist/ to hosting service
```

#### 4. Test with Real eSewa

1. Use your actual eSewa account
2. Start with small amount (रू 10)
3. Complete full payment flow
4. Verify in eSewa merchant dashboard

---


## 📊 Monitoring

### Check Transaction Logs

```sql
-- All transactions today
SELECT * FROM payment_transactions
WHERE created_at >= CURRENT_DATE
ORDER BY created_at DESC;

-- Failed payments
SELECT booking_id, error_message, created_at
FROM payment_transactions
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;
```

## 🔗 Resources

### Documentation
- **Architecture**: `/backend/src/payment/README.md`
- **eSewa Developer Docs**: https://developer.esewa.com.np
- **eSewa Merchant**: https://merchant.esewa.com.np

### Support
- eSewa: +977-1-5970002
- eSewa Email: support@esewa.com.np
