import express from 'express';
import { body } from 'express-validator';
import * as eventController from '../controllers/eventController.js';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';
import { commonValidations, handleValidationErrors, validateEventDates } from '../utils/validation.js';

const router = express.Router();

// Multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'backend', 'uploads', 'events'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `event-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

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
  upload.single('image'),
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
  handleValidationErrors
], eventController.updateEvent);

router.delete('/:id', [
  authenticateToken,
], eventController.deleteEvent);

export default router;
