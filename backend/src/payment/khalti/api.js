import { khaltiConfig } from './config.js';
import { KHALTI_ENDPOINTS, KHALTI_STATUS } from './constants.js';

const makeKhaltiRequest = async (endpoint, data) => {
  const url = `${khaltiConfig.baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${khaltiConfig.secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || `Khalti API error: ${response.status}`);
  }

  return response.json();
};

export const initiateKhaltiPayment = async (paymentData) => {
  const {
    purchase_order_id,
    purchase_order_name,
    amount,
    customer_info,
  } = paymentData;

  const payload = {
    return_url: khaltiConfig.returnUrl,
    website_url: khaltiConfig.websiteUrl,
    amount: Math.round(amount * 100),
    purchase_order_id: purchase_order_id.toString(),
    purchase_order_name: purchase_order_name.toString(),
  };

  if (customer_info && Object.keys(customer_info).length > 0) {
    payload.customer_info = customer_info;
  }

  const result = await makeKhaltiRequest(KHALTI_ENDPOINTS.INITIATE, payload);
  
  return {
    pidx: result.pidx,
    payment_url: result.payment_url,
    expires_at: result.expires_at,
    expires_in: result.expires_in,
  };
};

export const verifyKhaltiPayment = async (pidx) => {
  const result = await makeKhaltiRequest(KHALTI_ENDPOINTS.LOOKUP, { pidx });
  
  return {
    pidx: result.pidx,
    status: result.status,
    transaction_id: result.transaction_id,
    total_amount: result.total_amount,
    fee: result.fee,
    refunded: result.refunded,
  };
};

export const isKhaltiPaymentSuccessful = (status) => status === KHALTI_STATUS.COMPLETED;
export const isKhaltiPaymentPending = (status) => status === KHALTI_STATUS.PENDING || status === KHALTI_STATUS.INITIATED;
export const isKhaltiPaymentFailed = (status) => [
  KHALTI_STATUS.EXPIRED,
  KHALTI_STATUS.USER_CANCELED,
].includes(status);

export const getKhaltiStatusMessage = (status) => {
  const messages = {
    [KHALTI_STATUS.COMPLETED]: 'Payment completed successfully',
    [KHALTI_STATUS.PENDING]: 'Payment is pending',
    [KHALTI_STATUS.INITIATED]: 'Payment initiated',
    [KHALTI_STATUS.EXPIRED]: 'Payment link expired',
    [KHALTI_STATUS.USER_CANCELED]: 'Payment cancelled by user',
    [KHALTI_STATUS.REFUNDED]: 'Payment refunded',
    [KHALTI_STATUS.PARTIALLY_REFUNDED]: 'Payment partially refunded',
  };
  return messages[status] || 'Unknown payment status';
};

