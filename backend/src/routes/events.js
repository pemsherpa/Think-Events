import express from 'express';
import { body } from 'express-validator';
import * as eventController from '../controllers/eventController.js';
import { authenticateToken } from '../middleware/auth.js';
import { commonValidations, handleValidationErrors, validateEventDates } from '../utils/validation.js';

const router = express.Router();

// Public routes
router.get('/', eventController.getEvents);
router.get('/categories', eventController.getCategories);
router.get('/venues', eventController.getVenues);
router.get('/:id', eventController.getEventById);
router.get('/venues/:id', eventController.getVenueById);
router.get('/me/list', authenticateToken, eventController.getMyEvents);

// Protected routes (authenticated users)
router.post('/', [
  authenticateToken,
  commonValidations.eventTitle,
  commonValidations.eventDescription,
  body('category_id').isInt().withMessage('Category ID must be an integer'),
  body('venue_id').optional().isInt().withMessage('Venue ID must be an integer'),
  body('venue_name').optional().isString().withMessage('Venue name must be a string'),
  body('venue_city').optional().isString().withMessage('Venue city must be a string'),
  commonValidations.eventDate,
  commonValidations.eventTime,
  commonValidations.eventPrice,
  commonValidations.eventSeats,
  commonValidations.imageUrl,
  validateEventDates,
  handleValidationErrors
], eventController.createEvent);

router.put('/:id', [
  authenticateToken,
  handleValidationErrors
], eventController.updateEvent);

router.delete('/:id', [
  authenticateToken,
], eventController.deleteEvent);

// Upload event image
router.post('/upload-image', [
  authenticateToken,
], eventController.uploadEventImage);

export default router;
