import { esewaConfig } from './config.js';
import { ESEWA_STATUS } from './constants.js';
import logger from '../../utils/logger.js';

export const verifyPaymentStatus = async (transaction_uuid, total_amount, product_code) => {
  const { retryAttempts, retryDelay, statusUrl } = esewaConfig;
  let lastError;

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const url = `${statusUrl}?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      if (!response.ok) throw new Error(`eSewa API returned ${response.status}`);

      const data = await response.json();
      if (!data.status) throw new Error('Invalid eSewa API response');

      return {
        success: true,
        status: data.status,
        ref_id: data.ref_id,
        transaction_uuid: data.transaction_uuid,
        total_amount: data.total_amount,
        product_code: data.product_code,
      };

    } catch (error) {
      lastError = error;
      logger.error(`eSewa verification attempt ${attempt}/${retryAttempts} failed:`, error.message);
      if (attempt < retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw new Error(`Payment verification failed after ${retryAttempts} attempts: ${lastError.message}`);
};

export const isPaymentSuccessful = (status) => status === ESEWA_STATUS.COMPLETE;
export const isPaymentPending = (status) => status === ESEWA_STATUS.PENDING;
export const isPaymentFailed = (status) => [
  ESEWA_STATUS.NOT_FOUND,
  ESEWA_STATUS.CANCELED,
  ESEWA_STATUS.AMBIGUOUS,
].includes(status);

export const getStatusMessage = (status) => {
  const messages = {
    [ESEWA_STATUS.COMPLETE]: 'Payment completed successfully',
    [ESEWA_STATUS.PENDING]: 'Payment is being processed',
    [ESEWA_STATUS.NOT_FOUND]: 'Payment not found or expired',
    [ESEWA_STATUS.CANCELED]: 'Payment was cancelled',
    [ESEWA_STATUS.AMBIGUOUS]: 'Payment status unclear, please contact support',
    [ESEWA_STATUS.FULL_REFUND]: 'Payment has been fully refunded',
    [ESEWA_STATUS.PARTIAL_REFUND]: 'Payment has been partially refunded',
  };
  return messages[status] || 'Unknown payment status';
};

