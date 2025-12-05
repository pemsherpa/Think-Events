import { query } from '../../config/database.js';
import { esewaConfig } from '../esewa/config.js';
import { createPaymentParams } from '../esewa/signature.js';
import { verifyPaymentStatus, isPaymentSuccessful, isPaymentPending, getStatusMessage } from '../esewa/api.js';
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

export const initiatePayment = async (userId, { event_id, seat_numbers, quantity, amount }) => {
  const event = await validateSeatAvailability(event_id, seat_numbers, quantity);

  const newBooking = await query(`
    INSERT INTO bookings (
      user_id, event_id, seat_numbers, quantity, total_amount,
      currency, payment_method, status, payment_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [
    userId, event_id, seat_numbers, quantity, amount,
    event.currency, PAYMENT_METHODS.ESEWA, BOOKING_STATUS.PENDING, PAYMENT_STATUS.PENDING
  ]);

  const booking = newBooking.rows[0];
  const transaction_uuid = generateTransactionUUID(booking.id);

  await query('UPDATE bookings SET transaction_uuid = $1 WHERE id = $2', [transaction_uuid, booking.id]);
  await query('UPDATE events SET available_seats = available_seats - $1 WHERE id = $2', [quantity, event_id]);

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

  await logPaymentInitiation(booking.id, transaction_uuid, amount);

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

export const verifyAndConfirmPayment = async ({ transaction_uuid, product_code, total_amount, ref_id, booking_id }) => {
  if (!transaction_uuid) throw new Error('Transaction UUID is required');

  const bookingResult = await query(
    'SELECT * FROM bookings WHERE id = $1 AND transaction_uuid = $2',
    [booking_id, transaction_uuid]
  );

  if (bookingResult.rows.length === 0) {
    throw new Error('Booking not found or transaction UUID mismatch');
  }

  const booking = bookingResult.rows[0];
  
  if (booking.payment_status === PAYMENT_STATUS.COMPLETED) {
    return { alreadyVerified: true, booking };
  }

  const finalProductCode = product_code || esewaConfig.productCode;
  const finalTotalAmount = total_amount || booking.total_amount;
  
  if (parseFloat(finalTotalAmount) !== parseFloat(booking.total_amount)) {
    console.error('Amount mismatch - possible fraud:', {
      esewa: finalTotalAmount,
      booking: booking.total_amount
    });
    throw new Error('Payment amount mismatch');
  }

  const verificationResult = await verifyPaymentStatus(transaction_uuid, finalTotalAmount, finalProductCode);

  if (isPaymentSuccessful(verificationResult.status)) {
    const updatedBooking = await query(`
      UPDATE bookings
      SET payment_status = $1, status = $2, payment_reference = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [PAYMENT_STATUS.COMPLETED, BOOKING_STATUS.CONFIRMED, ref_id || verificationResult.ref_id, booking_id]);

    await awardRewardPoints(booking.user_id, booking.quantity);
    await logPaymentSuccess(booking_id, transaction_uuid, booking.total_amount, verificationResult);

    return {
      success: true,
      booking: updatedBooking.rows[0],
      message: 'Payment verified and booking confirmed',
    };
  }

  if (isPaymentPending(verificationResult.status)) {
    return { success: false, pending: true, message: 'Payment is being processed' };
  }

  await restoreSeats(booking);
  await query(`
    UPDATE bookings
    SET payment_status = $1, status = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `, [PAYMENT_STATUS.FAILED, BOOKING_STATUS.CANCELLED, booking_id]);

  await logPaymentFailure(booking_id, transaction_uuid, booking.total_amount, getStatusMessage(verificationResult.status), verificationResult);

  throw new Error(`Payment verification failed: ${getStatusMessage(verificationResult.status)}`);
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

