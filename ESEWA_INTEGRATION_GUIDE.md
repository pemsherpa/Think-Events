# 🚀 eSewa Integration - Quick Start Guide

## ✅ Status: Working & Production Ready

This guide covers how to set up, test, and deploy the eSewa payment integration.

---

## 🎯 What You Get

- ✅ Secure payment processing with eSewa
- ✅ Automatic booking confirmation
- ✅ Seat management (hold/release)
- ✅ Transaction logging for audit
- ✅ Reward points integration
- ✅ Email confirmations with tickets

---

## 📦 Installation

### 1. Run Database Migrations

```bash
cd backend

# Add payment fields (transaction_uuid, payment_reference)
npm run migrate:payment

# Add transaction logging table
npm run migrate:transactions
```

### 2. Configure Environment

**Backend `.env`:**
```env
# Server URLs
BASE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173

# eSewa Testing Credentials (UAT)
ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_PAYMENT_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_STATUS_URL=https://rc.esewa.com.np/api/epay/transaction/status/
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5001
```

### 3. Start Servers

```bash
# Backend
cd backend && npm run dev

# Frontend (new terminal)
cd frontend && npm run dev
```

---

## 🧪 Testing

### Test Credentials

**eSewa Test Account:**
- **ID**: 9806800001 (or 002, 003, 004, 005)
- **Password**: Nepal@123
- **MPIN**: 1122 (mobile app only)

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

---

## 🔒 Security Features

### 1. HMAC Signature Verification
- Verifies eSewa callback signatures
- Prevents fake payment confirmations
- Uses SHA256 algorithm

### 2. Transaction Validation
- Transaction UUID must match booking
- Amount must match exactly
- No bypasses or fallbacks

### 3. eSewa API Verification
- Calls eSewa API to verify payment
- Only confirms if status = 'COMPLETE'
- Has retry logic for reliability

### 4. Amount Matching
- eSewa amount = Booking amount
- Detects tampering attempts
- Rejects mismatched payments

---

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
BASE_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com

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

## 🐛 Troubleshooting

### Payment Verification Failed

**Check:**
1. Backend logs for "eSewa callback received"
2. Database: `SELECT * FROM bookings WHERE id = X;`
3. eSewa merchant dashboard for transaction

**Common Causes:**
- Invalid signature → Check secret key
- Wrong transaction UUID → Check database
- Network timeout → Check eSewa API connectivity

### Seats Not Released

**Fix:**
```bash
# Manually trigger failure handler
curl "http://localhost:5001/api/payment/esewa/failure?booking_id=X"
```

### Amount Mismatch

**Check:**
```sql
SELECT total_amount FROM bookings WHERE id = X;
-- Compare with eSewa transaction amount
```

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

### Success Metrics

Monitor these:
- Payment success rate (should be > 95%)
- Average completion time
- Failed payment reasons

---

## 🔗 Resources

### Documentation
- **Architecture**: `/backend/src/payment/README.md`
- **eSewa Developer Docs**: https://developer.esewa.com.np
- **eSewa Merchant**: https://merchant.esewa.com.np

### Support
- eSewa: +977-1-5970002
- eSewa Email: support@esewa.com.np

---

## ✨ Success Checklist

Before going live:

- [ ] Migrations run successfully
- [ ] Test payment completed successfully
- [ ] Success page displays correctly
- [ ] Booking confirmed in database
- [ ] Reward points awarded
- [ ] Email confirmation sent
- [ ] Production credentials obtained
- [ ] SSL certificate active
- [ ] First production payment tested
- [ ] Monitoring set up

---

**Your payment integration is production-ready!** 🎉

For detailed technical information, see `/backend/src/payment/README.md`

---

**Version**: 1.0.0  
**Status**: ✅ Working  
**Last Updated**: December 2025

