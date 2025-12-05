import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const URLS = {
  development: {
    base: 'https://dev.khalti.com/api/v2',
    checkout: 'https://test-pay.khalti.com',
  },
  production: {
    base: 'https://khalti.com/api/v2',
    checkout: 'https://pay.khalti.com',
  }
};

const urls = isProduction ? URLS.production : URLS.development;

export const khaltiConfig = {
  secretKey: process.env.KHALTI_SECRET_KEY,
  publicKey: process.env.KHALTI_PUBLIC_KEY,
  baseUrl: urls.base,
  checkoutUrl: urls.checkout,
  returnUrl: `${process.env.BASE_URL || 'http://localhost:5001'}/api/payment/khalti/callback`,
  websiteUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  timeout: 3600000,
  isProduction,
};

if (!khaltiConfig.secretKey) {
  console.warn('⚠️  KHALTI_SECRET_KEY not configured. Khalti payments will not work.');
  console.warn('📝 Get test keys from: https://test-admin.khalti.com (OTP: 987654)');
}

export default khaltiConfig;

