import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../utils/validation.js';
import * as seatLayoutController from '../controllers/seatLayoutController.js';

const router = express.Router();

// Seat Categories Routes
router.get('/categories', seatLayoutController.getSeatCategories);
router.post('/categories', [
  authenticateToken,
  body('name').notEmpty().withMessage('Category name is required'),
  body('color').isHexColor().withMessage('Valid color is required'),
  body('description').optional().isString(),
  handleValidationErrors
], seatLayoutController.createSeatCategory);

// Seat Layout Routes
router.get('/event/:eventId', seatLayoutController.getSeatLayout);
router.get('/event/:eventId/available', seatLayoutController.getAvailableSeats);

// Protected routes (authenticated users only)
router.post('/event/:eventId', [
  authenticateToken,
  body('venueType').isIn(['theater', 'open_ground', 'simple_counter']).withMessage('Invalid venue type'),
  body('layoutName').notEmpty().withMessage('Layout name is required'),
  body('totalRows').isInt({ min: 1 }).withMessage('Total rows must be a positive integer'),
  body('totalColumns').isInt({ min: 1 }).withMessage('Total columns must be a positive integer'),
  body('bookingType').isIn(['one_time', 'multiple']).withMessage('Invalid booking type'),
  body('maxBookingsPerSeat').optional().isInt({ min: 1 }).withMessage('Max bookings per seat must be a positive integer'),
  body('layoutConfig').optional().isObject(),
  body('seats').optional().isArray(),
  handleValidationErrors
], seatLayoutController.createSeatLayout);

router.put('/layout/:layoutId', [
  authenticateToken,
  body('venueType').isIn(['theater', 'open_ground', 'simple_counter']).withMessage('Invalid venue type'),
  body('layoutName').notEmpty().withMessage('Layout name is required'),
  body('totalRows').isInt({ min: 1 }).withMessage('Total rows must be a positive integer'),
  body('totalColumns').isInt({ min: 1 }).withMessage('Total columns must be a positive integer'),
  body('bookingType').isIn(['one_time', 'multiple']).withMessage('Invalid booking type'),
  body('maxBookingsPerSeat').optional().isInt({ min: 1 }).withMessage('Max bookings per seat must be a positive integer'),
  body('layoutConfig').optional().isObject(),
  body('seats').optional().isArray(),
  handleValidationErrors
], seatLayoutController.updateSeatLayout);

router.delete('/layout/:layoutId', [
  authenticateToken
], seatLayoutController.deleteSeatLayout);

// Seat Booking Routes
router.post('/event/:eventId/book', [
  authenticateToken,
  body('seatSelections').isArray({ min: 1 }).withMessage('At least one seat selection is required'),
  body('seatSelections.*.seatId').isInt().withMessage('Valid seat ID is required'),
  body('seatSelections.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors
], seatLayoutController.bookSeats);

export default router;
