import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { commonValidations, handleValidationErrors } from '../utils/validation.js';

const router = express.Router();

// Public routes
router.post('/signup', [
  commonValidations.username,
  commonValidations.email,
  commonValidations.password,
  commonValidations.firstName,
  commonValidations.lastName,
  commonValidations.phone,
  handleValidationErrors
], authController.signup);

router.post('/login', [
  body('username').notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
], authController.login);

router.post('/google', [
  body('idToken').notEmpty().withMessage('Google ID token is required'),
  handleValidationErrors
], authController.googleAuth);

router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/resend-reset-otp', authController.resendResetOTP);
router.post('/reset-password', authController.resetPassword);

// OTP verification for signup
router.post('/verify-signup-otp', authController.verifySignupOTP);
router.post('/resend-signup-otp', authController.resendSignupOTP);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', [
  authenticateToken,
  commonValidations.firstName,
  commonValidations.lastName,
  commonValidations.phone,
  handleValidationErrors
], authController.updateProfile);

router.post('/upload-avatar', authenticateToken, authController.uploadAvatar);

router.put('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  commonValidations.password,
  handleValidationErrors
], authController.changePassword);

router.post('/logout', authenticateToken, authController.logout);

router.delete('/account', authenticateToken, authController.deleteAccount);

export default router;
