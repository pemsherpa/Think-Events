import { query } from '../../config/database.js';
import { esewaConfig } from '../esewa/config.js';
import { khaltiConfig } from '../khalti/config.js';
import { createPaymentParams } from '../esewa/signature.js';
import { verifyPaymentStatus as verifyEsewaStatus, isPaymentSuccessful as isEsewaSuccessful, isPaymentPending as isEsewaPending, getStatusMessage as getEsewaMessage } from '../esewa/api.js';
import { initiateKhaltiPayment, verifyKhaltiPayment, isKhaltiPaymentSuccessful, isKhaltiPaymentPending, getKhaltiStatusMessage } from '../khalti/api.js';
import { PAYMENT_STATUS, BOOKING_STATUS, PAYMENT_METHODS } from '../esewa/constants.js';
import { logPaymentInitiation, logPaymentSuccess, logPaymentFailure } from './transactionLogger.js';

const generateTransactionUUID = (bookingId) => {
  return `TXN-${bookingId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const calculateBreakdown = (totalAmount) => {
  const total = Math.round(totalAmount);
  return {
    amount: Math.round(total * 0.85),
    tax_amount: Math.round(total * 0.13),
    service_charge: Math.round(total * 0.02),
    total_amount: total,
  };
};

const validateSeatAvailability = async (event_id, seat_numbers, quantity) => {
  const eventResult = await query(
    'SELECT available_seats, price, currency FROM events WHERE id = $1',
    [event_id]
  );

  if (eventResult.rows.length === 0) throw new Error('Event not found');

  const event = eventResult.rows[0];
  if (event.available_seats < quantity) {
    throw new Error(`Only ${event.available_seats} seats available`);
  }

  const existingBookings = await query(
    'SELECT seat_numbers FROM bookings WHERE event_id = $1 AND status != $2',
    [event_id, BOOKING_STATUS.CANCELLED]
  );

  const bookedSeats = existingBookings.rows.flatMap(b => b.seat_numbers);
  const conflictingSeats = seat_numbers.filter(seat => bookedSeats.includes(seat));

  if (conflictingSeats.length > 0) {
    throw new Error(`Seats ${conflictingSeats.join(', ')} are already booked`);
  }

  return event;
};

const createBooking = async (userId, event, event_id, seat_numbers, quantity, amount, gateway) => {
  const paymentMethod = gateway === 'khalti' ? PAYMENT_METHODS.KHALTI : PAYMENT_METHODS.ESEWA;
  
  const newBooking = await query(`
    INSERT INTO bookings (
      user_id, event_id, seat_numbers, quantity, total_amount,
      currency, payment_method, status, payment_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [
    userId, event_id, seat_numbers, quantity, amount,
    event.currency, paymentMethod, BOOKING_STATUS.PENDING, PAYMENT_STATUS.PENDING
  ]);

  const booking = newBooking.rows[0];
  const transaction_uuid = generateTransactionUUID(booking.id);

  await query('UPDATE bookings SET transaction_uuid = $1 WHERE id = $2', [transaction_uuid, booking.id]);
  await query('UPDATE events SET available_seats = available_seats - $1 WHERE id = $2', [quantity, event_id]);

  return { booking, transaction_uuid };
};

export const initiatePayment = async (userId, { event_id, seat_numbers, quantity, amount, customer_info, gateway = 'esewa' }) => {
  const event = await validateSeatAvailability(event_id, seat_numbers, quantity);
  const { booking, transaction_uuid } = await createBooking(userId, event, event_id, seat_numbers, quantity, amount, gateway);

  await logPaymentInitiation(booking.id, transaction_uuid, amount);

  if (gateway === 'khalti') {
    const khaltiPayment = await initiateKhaltiPayment({
      purchase_order_id: transaction_uuid,
      purchase_order_name: `Event Booking #${booking.id}`,
      amount,
      customer_info: customer_info || {},
    });

    return {
      booking_id: booking.id,
      pidx: khaltiPayment.pidx,
      payment_url: khaltiPayment.payment_url,
      expires_at: khaltiPayment.expires_at,
    };
  }

  const breakdown = calculateBreakdown(amount);
  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  
  const paymentParams = createPaymentParams({
    ...breakdown,
    transaction_uuid,
    product_code: esewaConfig.productCode,
    product_service_charge: breakdown.service_charge,
    product_delivery_charge: 0,
    success_url: `${baseUrl}/api/payment/status/${booking.id}`,
    failure_url: `${esewaConfig.failureUrl}?booking_id=${booking.id}`,
  });

  return {
    booking_id: booking.id,
    transaction_uuid,
    payment_url: esewaConfig.paymentUrl,
    payment_params: paymentParams,
  };
};

const restoreSeats = async (booking) => {
  await query(
    'UPDATE events SET available_seats = available_seats + $1 WHERE id = $2',
    [booking.quantity, booking.event_id]
  );
};

const awardRewardPoints = async (userId, quantity) => {
  const points = quantity * 100;
  await query(
    'UPDATE users SET reward_points = COALESCE(reward_points, 0) + $1 WHERE id = $2',
    [points, userId]
  );
};

export const verifyAndConfirmPayment = async ({ transaction_uuid, product_code, total_amount, ref_id, booking_id, pidx, gateway }) => {
  const bookingResult = await query(
    transaction_uuid 
      ? 'SELECT * FROM bookings WHERE id = $1 AND transaction_uuid = $2'
      : 'SELECT * FROM bookings WHERE id = $1',
    transaction_uuid ? [booking_id, transaction_uuid] : [booking_id]
  );

  if (bookingResult.rows.length === 0) throw new Error('Booking not found');

  const booking = bookingResult.rows[0];
  
  if (booking.payment_status === PAYMENT_STATUS.COMPLETED) {
    return { alreadyVerified: true, booking };
  }

  if (gateway === 'khalti' && pidx) {
    return verifyKhaltiPaymentInternal(booking, pidx, booking_id);
  }

  return verifyEsewaPaymentInternal(booking, transaction_uuid, product_code, total_amount, ref_id, booking_id);
};

const verifyEsewaPaymentInternal = async (booking, transaction_uuid, product_code, total_amount, ref_id, booking_id) => {
  if (!transaction_uuid) throw new Error('Transaction UUID is required');

  const finalProductCode = product_code || esewaConfig.productCode;
  const finalTotalAmount = total_amount || booking.total_amount;
  
  if (parseFloat(finalTotalAmount) !== parseFloat(booking.total_amount)) {
    console.error('eSewa amount mismatch:', { esewa: finalTotalAmount, booking: booking.total_amount });
    throw new Error('Payment amount mismatch');
  }

  const verificationResult = await verifyEsewaStatus(transaction_uuid, finalTotalAmount, finalProductCode);

  if (isEsewaSuccessful(verificationResult.status)) {
    return completePayment(booking, booking_id, ref_id || verificationResult.ref_id, transaction_uuid, verificationResult);
  }

  if (isEsewaPending(verificationResult.status)) {
    return { success: false, pending: true, message: 'Payment is being processed' };
  }

  await failPayment(booking, booking_id, transaction_uuid, getEsewaMessage(verificationResult.status), verificationResult);
  throw new Error(`Payment verification failed: ${getEsewaMessage(verificationResult.status)}`);
};

const verifyKhaltiPaymentInternal = async (booking, pidx, booking_id) => {
  const verificationResult = await verifyKhaltiPayment(pidx);

  if (parseFloat(verificationResult.total_amount) !== parseFloat(booking.total_amount * 100)) {
    console.error('Khalti amount mismatch:', { khalti: verificationResult.total_amount, booking: booking.total_amount * 100 });
    throw new Error('Payment amount mismatch');
  }

  if (isKhaltiPaymentSuccessful(verificationResult.status)) {
    return completePayment(booking, booking_id, verificationResult.transaction_id, pidx, verificationResult);
  }

  if (isKhaltiPaymentPending(verificationResult.status)) {
    return { success: false, pending: true, message: 'Payment is being processed' };
  }

  await failPayment(booking, booking_id, pidx, getKhaltiStatusMessage(verificationResult.status), verificationResult);
  throw new Error(`Payment verification failed: ${getKhaltiStatusMessage(verificationResult.status)}`);
};

const completePayment = async (booking, booking_id, payment_reference, transaction_id, verificationResult) => {
  const updatedBooking = await query(`
    UPDATE bookings
    SET payment_status = $1, status = $2, payment_reference = $3, updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
  `, [PAYMENT_STATUS.COMPLETED, BOOKING_STATUS.CONFIRMED, payment_reference, booking_id]);

  await awardRewardPoints(booking.user_id, booking.quantity);
  await logPaymentSuccess(booking_id, transaction_id, booking.total_amount, verificationResult);

  return {
    success: true,
    booking: updatedBooking.rows[0],
    message: 'Payment verified and booking confirmed',
  };
};

const failPayment = async (booking, booking_id, transaction_id, errorMessage, verificationResult) => {
  await restoreSeats(booking);
  await query(`
    UPDATE bookings
    SET payment_status = $1, status = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `, [PAYMENT_STATUS.FAILED, BOOKING_STATUS.CANCELLED, booking_id]);

  await logPaymentFailure(booking_id, transaction_id, booking.total_amount, errorMessage, verificationResult);
};

export const handlePaymentFailure = async (booking_id) => {
  const bookingResult = await query('SELECT * FROM bookings WHERE id = $1', [booking_id]);
  if (bookingResult.rows.length === 0) throw new Error('Booking not found');

  const booking = bookingResult.rows[0];

  if (booking.payment_status !== PAYMENT_STATUS.COMPLETED) {
    await restoreSeats(booking);
    await query(`
      UPDATE bookings
      SET payment_status = $1, status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [PAYMENT_STATUS.FAILED, BOOKING_STATUS.CANCELLED, booking_id]);

    await logPaymentFailure(booking_id, booking.transaction_uuid, booking.total_amount, 'Payment cancelled by user', {});
  }

  return { booking_id };
};

export const getPaymentStatus = async (booking_id, user_id) => {
  const bookingResult = await query(
    'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
    [booking_id, user_id]
  );

  if (bookingResult.rows.length === 0) throw new Error('Booking not found');

  const booking = bookingResult.rows[0];
  return {
    booking_id: booking.id,
    payment_status: booking.payment_status,
    booking_status: booking.status,
    transaction_uuid: booking.transaction_uuid,
    payment_reference: booking.payment_reference,
  };
};

