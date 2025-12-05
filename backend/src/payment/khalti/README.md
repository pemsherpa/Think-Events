# Khalti Payment Integration

## Quick Setup

### 1. Configure Environment

```env
# Testing
KHALTI_SECRET_KEY=test_secret_key_f59e8b7d18b4479e9a0bbfdc8e92949
KHALTI_PUBLIC_KEY=test_public_key_dc74e0fd57cb46cd93832aee0a390234

# Production
KHALTI_SECRET_KEY=your_production_secret_key
KHALTI_PUBLIC_KEY=your_production_public_key
```

### 2. Test Credentials

- **Khalti ID**: 9800000000, 9800000001, 9800000002, 9800000003, 9800000004, 9800000005
- **MPIN**: 1111
- **OTP**: 987654

### 3. Test Payment

1. Select Khalti as payment method
2. Complete booking flow
3. Login with test credentials
4. Verify success page

## How It Works

```
User → Select Khalti → Backend initiates payment → Khalti checkout
                                ↓
        Backend receives callback → Verifies with Khalti API → Confirms booking
                                ↓
        Redirects to success page → User sees confirmation
```

## Differences from eSewa

| Feature | eSewa | Khalti |
|---------|-------|--------|
| **Payment ID** | transaction_uuid | pidx |
| **Signature** | HMAC SHA256 | No signature (uses API key) |
| **Callback** | Base64 data to backend | Query params to backend |
| **Verification** | Status API call | Lookup API call |
| **Amount** | In rupees | In paisa (×100) |

## Production Credentials

Get from:
- **Sandbox**: https://test-admin.khalti.com
- **Production**: https://admin.khalti.com

Docs: https://docs.khalti.com/khalti-epayment/

## Security

- ✅ API key authentication
- ✅ Amount validation
- ✅ Lookup API verification
- ✅ Transaction logging
- ✅ No client-side secrets

