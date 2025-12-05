import { query } from '../config/database.js';
import * as paymentService from './services/paymentService.js';
import { verifyEsewaSignature } from './esewa/signature.js';

export const initiateEsewaPayment = async (req, res) => {
  try {
    const { event_id, seat_numbers, quantity, amount } = req.body;
    const paymentData = await paymentService.initiatePayment(req.user.id, {
      event_id,
      seat_numbers,
      quantity,
      amount,
      gateway: 'esewa',
    });

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: paymentData,
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment',
    });
  }
};

export const initiateKhaltiPayment = async (req, res) => {
  try {
    const { event_id, seat_numbers, quantity, amount, customer_info } = req.body;
    const paymentData = await paymentService.initiatePayment(req.user.id, {
      event_id,
      seat_numbers,
      quantity,
      amount,
      customer_info,
      gateway: 'khalti',
    });

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: paymentData,
    });
  } catch (error) {
    console.error('Khalti payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment',
    });
  }
};

export const verifyEsewaPayment = async (req, res) => {
  try {
    const { transaction_uuid, product_code, total_amount, ref_id, booking_id } = req.query;

    if (!booking_id) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const result = await paymentService.verifyAndConfirmPayment({
      transaction_uuid,
      product_code,
      total_amount,
      ref_id,
      booking_id,
    });

    if (result.alreadyVerified) {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: result.booking,
      });
    }

    if (result.pending) {
      return res.status(200).json({
        success: false,
        message: result.message,
        status: 'pending',
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.booking,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
    });
  }
};

export const handleEsewaFailure = async (req, res) => {
  try {
    const { booking_id } = req.query;
    const result = await paymentService.handlePaymentFailure(booking_id);

    res.status(200).json({
      success: false,
      message: 'Payment cancelled or failed',
      data: result,
    });
  } catch (error) {
    console.error('Handle payment failure error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to handle payment failure',
    });
  }
};

export const handleKhaltiCallback = async (req, res) => {
  try {
    const { pidx, purchase_order_id, transaction_id, status } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!pidx) return res.redirect(`${frontendUrl}/payment/khalti/failure?error=missing_pidx`);

    const bookingResult = await query('SELECT id FROM bookings WHERE transaction_uuid = $1', [purchase_order_id]);
    if (bookingResult.rows.length === 0) {
      return res.redirect(`${frontendUrl}/payment/khalti/failure?error=booking_not_found`);
    }

    const booking_id = bookingResult.rows[0].id;

    if (status === 'Completed') {
      const result = await paymentService.verifyAndConfirmPayment({ pidx, booking_id, gateway: 'khalti' });
      if (result.success || result.alreadyVerified) {
        return res.redirect(`${frontendUrl}/payment/khalti/success?booking_id=${booking_id}&pidx=${pidx}&transaction_id=${transaction_id}`);
      }
    }

    return res.redirect(`${frontendUrl}/payment/khalti/failure?booking_id=${booking_id}&status=${status}`);
  } catch (error) {
    console.error('Khalti callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/payment/khalti/failure?error=${encodeURIComponent(error.message)}`);
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { data } = req.query;
    
    if (data) {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const esewaData = JSON.parse(decodedData);

      if (!verifyEsewaSignature(esewaData)) {
        console.error('Invalid eSewa callback signature:', { booking_id, transaction_uuid: esewaData.transaction_uuid });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/payment/esewa/failure?booking_id=${booking_id}&error=invalid_signature`);
      }

      const result = await paymentService.verifyAndConfirmPayment({
        transaction_uuid: esewaData.transaction_uuid,
        product_code: esewaData.product_code,
        total_amount: esewaData.total_amount,
        ref_id: esewaData.transaction_code,
        booking_id: parseInt(booking_id),
        gateway: 'esewa',
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      if (result.success || result.alreadyVerified) {
        const redirectUrl = new URL(`${frontendUrl}/payment/esewa/success`);
        redirectUrl.searchParams.set('booking_id', booking_id);
        redirectUrl.searchParams.set('transaction_uuid', esewaData.transaction_uuid);
        redirectUrl.searchParams.set('product_code', esewaData.product_code);
        redirectUrl.searchParams.set('total_amount', esewaData.total_amount);
        if (esewaData.transaction_code) {
          redirectUrl.searchParams.set('refId', esewaData.transaction_code);
        }
        return res.redirect(redirectUrl.toString());
      }
      
      return res.redirect(`${frontendUrl}/payment/esewa/failure?booking_id=${booking_id}`);
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const status = await paymentService.getPaymentStatus(booking_id, req.user.id);
    res.status(200).json({ success: true, data: status });

  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check payment status',
    });
  }
};

export default {
  initiateEsewaPayment,
  initiateKhaltiPayment,
  verifyEsewaPayment,
  handleEsewaFailure,
  handleKhaltiCallback,
  checkPaymentStatus,
};
