import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const URLS = {
  development: {
    payment: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    status: 'https://rc.esewa.com.np/api/epay/transaction/status/',
  },
  production: {
    payment: 'https://epay.esewa.com.np/api/epay/main/v2/form',
    status: 'https://esewa.com.np/api/epay/transaction/status/',
  }
};

const urls = isProduction ? URLS.production : URLS.development;

export const esewaConfig = {
  productCode: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  paymentUrl: process.env.ESEWA_PAYMENT_URL || urls.payment,
  statusUrl: process.env.ESEWA_STATUS_URL || urls.status,
  successUrl: process.env.ESEWA_SUCCESS_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/esewa/success`,
  failureUrl: process.env.ESEWA_FAILURE_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/esewa/failure`,
  timeout: 300000,
  retryAttempts: 3,
  retryDelay: 2000,
  isProduction,
};

export default esewaConfig;

