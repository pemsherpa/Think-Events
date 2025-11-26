import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticateToken } from '../middleware/auth.js';
import { commonValidations, handleValidationErrors } from '../utils/validation.js';
import { body } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get available seats for an event
router.get('/seats/:event_id', bookingController.getAvailableSeats);

// Get user's bookings
router.get('/', bookingController.getUserBookings);

// Get specific booking
router.get('/:id', bookingController.getBookingById);

// Create new booking
router.post('/', [
  body('event_id').isInt().withMessage('Event ID must be an integer'),
  commonValidations.bookingSeats,
  commonValidations.bookingQuantity,
  body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('payment_method').notEmpty().withMessage('Payment method is required'),
  handleValidationErrors
], bookingController.createBooking);

// Update booking status
router.put('/:id/status', [
  body('status').optional().isIn(['pending', 'confirmed', 'cancelled']).withMessage('Invalid status'),
  body('payment_status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid payment status'),
  handleValidationErrors
], bookingController.updateBookingStatus);

// Cancel booking (disabled for customers)
// router.delete('/:id', bookingController.cancelBooking);

// Get booking statistics
router.get('/stats/summary', bookingController.getBookingStats);

export default router;
