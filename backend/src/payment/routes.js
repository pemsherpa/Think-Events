import express from 'express';
import * as controller from './controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, query as queryValidator } from 'express-validator';
import { handleValidationErrors } from '../utils/validation.js';

const router = express.Router();

router.post('/esewa/initiate', [
  authenticateToken,
  body('event_id').isInt(),
  body('seat_numbers').isArray(),
  body('quantity').isInt({ min: 1 }),
  body('amount').isFloat({ min: 0 }),
  handleValidationErrors
], controller.initiateEsewaPayment);

router.get('/esewa/verify', [
  queryValidator('booking_id').isInt(),
  handleValidationErrors
], controller.verifyEsewaPayment);

router.get('/esewa/failure', [
  queryValidator('booking_id').isInt(),
  handleValidationErrors
], controller.handleEsewaFailure);

router.get('/status/:booking_id', 
  (req, res, next) => req.query.data ? next() : authenticateToken(req, res, next),
  controller.checkPaymentStatus
);

export default router;

