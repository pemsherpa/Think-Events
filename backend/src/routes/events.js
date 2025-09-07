import express from 'express';
import { body } from 'express-validator';
import * as eventController from '../controllers/eventController.js';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';
import { commonValidations, handleValidationErrors, validateEventDates } from '../utils/validation.js';

const router = express.Router();

// Multer storage for image uploads - using memory storage to store in database
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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
  body('venue_id').optional().isInt().withMessage('Venue ID must be an integer'),
  body('venue_name').optional().isString().withMessage('Venue name must be a string'),
  body('venue_city').optional().isString().withMessage('Venue city must be a string'),
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
