import express from 'express';
import { body } from 'express-validator';
import * as eventController from '../controllers/eventController.js';
import { authenticateToken, requireOrganizer } from '../middleware/auth.js';
import { commonValidations, handleValidationErrors, validateEventDates } from '../utils/validation.js';

const router = express.Router();

// Public routes
router.get('/', eventController.getEvents);
router.get('/categories', eventController.getCategories);
router.get('/venues', eventController.getVenues);
router.get('/:id', eventController.getEventById);
router.get('/venues/:id', eventController.getVenueById);

// Protected routes (organizer only)
router.post('/', [
  authenticateToken,
  requireOrganizer,
  commonValidations.eventTitle,
  commonValidations.eventDescription,
  body('category_id').isInt().withMessage('Category ID must be an integer'),
  body('venue_id').isInt().withMessage('Venue ID must be an integer'),
  commonValidations.eventDate,
  commonValidations.eventTime,
  commonValidations.eventPrice,
  commonValidations.eventSeats,
  validateEventDates,
  handleValidationErrors
], eventController.createEvent);

router.put('/:id', [
  authenticateToken,
  requireOrganizer,
  handleValidationErrors
], eventController.updateEvent);

router.delete('/:id', [
  authenticateToken,
  requireOrganizer
], eventController.deleteEvent);

export default router;
