import { query } from '../../config/database.js';

const logTransaction = async (transactionData) => {
  try {
    const {
      booking_id,
      transaction_uuid,
      payment_method,
      amount,
      status,
      gateway_response,
      error_message = null,
      metadata = {},
    } = transactionData;

    await query(`
      INSERT INTO payment_transactions (
        booking_id, transaction_uuid, payment_method, amount, status,
        gateway_response, error_message, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
    `, [
      booking_id, transaction_uuid, payment_method, amount, status,
      JSON.stringify(gateway_response), error_message, JSON.stringify(metadata),
    ]);
  } catch (error) {
    console.error('Transaction logging failed:', error);
  }
};

export const logPaymentInitiation = (booking_id, transaction_uuid, amount) => 
  logTransaction({
    booking_id,
    transaction_uuid,
    payment_method: 'esewa',
    amount,
    status: 'initiated',
    gateway_response: {},
    metadata: { event: 'payment_initiated' },
  });

export const logPaymentSuccess = (booking_id, transaction_uuid, amount, gatewayResponse) =>
  logTransaction({
    booking_id,
    transaction_uuid,
    payment_method: 'esewa',
    amount,
    status: 'completed',
    gateway_response: gatewayResponse,
    metadata: { event: 'payment_completed' },
  });

export const logPaymentFailure = (booking_id, transaction_uuid, amount, errorMessage, gatewayResponse = {}) =>
  logTransaction({
    booking_id,
    transaction_uuid,
    payment_method: 'esewa',
    amount,
    status: 'failed',
    gateway_response: gatewayResponse,
    error_message: errorMessage,
    metadata: { event: 'payment_failed' },
  });

