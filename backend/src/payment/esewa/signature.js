import crypto from 'crypto';
import { esewaConfig } from './config.js';
import { SIGNATURE_FIELDS } from './constants.js';
import logger from '../../utils/logger.js';

const generateHmacSignature = (message, secretKey) => {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  return hmac.digest('base64');
};

const createPaymentMessage = (total_amount, transaction_uuid, product_code) => {
  return `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
};

export const generateEsewaSignature = ({ total_amount, transaction_uuid, product_code }) => {
  const message = createPaymentMessage(total_amount, transaction_uuid, product_code);
  return generateHmacSignature(message, esewaConfig.secretKey);
};

export const verifyEsewaSignature = (callbackData) => {
  const { 
    transaction_code, 
    status, 
    total_amount, 
    transaction_uuid, 
    product_code, 
    signed_field_names,
    signature 
  } = callbackData;

  if (!signature || !signed_field_names) {
    logger.error('Missing signature in eSewa callback');
    return false;
  }

  const message = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code},signed_field_names=${signed_field_names}`;
  const expectedSignature = generateHmacSignature(message, esewaConfig.secretKey);
  
  return signature === expectedSignature;
};

export const createPaymentParams = (paymentData) => {
  const {
    amount,
    tax_amount = 0,
    total_amount,
    transaction_uuid,
    product_code = esewaConfig.productCode,
    product_service_charge = 0,
    product_delivery_charge = 0,
    success_url,
    failure_url,
  } = paymentData;

  if (!total_amount || !transaction_uuid) {
    throw new Error('Missing required payment parameters');
  }

  const signature = generateEsewaSignature({ total_amount, transaction_uuid, product_code });

  return {
    amount: amount.toString(),
    tax_amount: tax_amount.toString(),
    total_amount: total_amount.toString(),
    transaction_uuid,
    product_code,
    product_service_charge: product_service_charge.toString(),
    product_delivery_charge: product_delivery_charge.toString(),
    success_url,
    failure_url,
    signed_field_names: SIGNATURE_FIELDS,
    signature,
  };
};

