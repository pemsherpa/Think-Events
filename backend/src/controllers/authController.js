import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../config/database.js';
import config from '../config/config.js';
import { validatePhoneNumber, generateOTP, sendOTP, verifyOTP } from '../utils/twilio.js';
import { sendOtpEmail } from '../utils/emailService.js';
import { avatarUpload } from '../utils/upload.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { OTP_EXPIRY_MINUTES, RESET_TOKEN_EXPIRY_HOURS } from '../utils/constants.js';
import logger from '../utils/logger.js';

const googleClient = new OAuth2Client(config.googleClientId);

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.googleClientId
    });
    return ticket;
  } catch (error) {
    logger.error('Google token verification failed:', error.message);
    if (error.message?.includes('audience')) {
      throw new AppError('Invalid Google client ID configuration', 400);
    }
    throw new AppError('Google token verification failed', 401);
  }
};

const getOtpExpiry = () => new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
const getResetTokenExpiry = () => new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

export const signup = asyncHandler(async (req, res) => {
  const { username, email, password, first_name, last_name, phone } = req.body;

  const existingUsername = await query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );

  if (existingUsername.rows.length > 0) {
    return errorResponse(res, 'Username already exists. Please choose a different username.', 400);
  }

  const existingEmail = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingEmail.rows.length > 0) {
    return errorResponse(res, 'Email already exists. Please use a different email or login instead.', 400);
  }

  let formattedPhone = null;
  if (phone) {
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return errorResponse(res, phoneValidation.message, 400);
    }
    formattedPhone = phoneValidation.formatted;
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  const otpCode = generateOTP();
  const otpExpires = getOtpExpiry();

  const newUser = await query(
    `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_verified, otp_code, otp_expires) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, username, email, first_name, last_name, phone, is_organizer, is_verified`,
    [username, email, passwordHash, first_name, last_name, formattedPhone, false, otpCode, otpExpires]
  );

  const user = newUser.rows[0];
  const emailResult = await sendOtpEmail(email, otpCode);

  if (!emailResult.success) {
    logger.error('Failed to send signup OTP email. FALLBACK OTP:', otpCode);
  }

  return successResponse(res, {
    userId: user.id,
    requiresVerification: true
  }, 'User created successfully. Please check your email for the verification code.', 201);
});

export const verifySignupOTP = asyncHandler(async (req, res) => {
  const { userId, otpCode } = req.body;

  if (!userId || !otpCode) {
    return errorResponse(res, 'User ID and OTP code are required', 400);
  }

  const user = await query(
    'SELECT id, otp_code, otp_expires, username, email, first_name, last_name, phone, is_organizer FROM users WHERE id = $1',
    [userId]
  );

  if (user.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const userData = user.rows[0];
  const otpVerification = verifyOTP(userData.otp_code, userData.otp_expires, otpCode);

  if (!otpVerification.valid) {
    return errorResponse(res, otpVerification.message, 400);
  }

  await query(
    'UPDATE users SET is_verified = $1, phone_verified = $2, otp_code = NULL, otp_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
    [true, true, userId]
  );

  const token = generateToken(userId);

  return successResponse(res, {
    token,
    user: {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      is_organizer: userData.is_organizer,
      is_verified: true,
      phone_verified: true
    }
  }, 'Email verified successfully!');
});

export const resendSignupOTP = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return errorResponse(res, 'User ID is required', 400);
  }

  const user = await query(
    'SELECT id, email, is_verified FROM users WHERE id = $1',
    [userId]
  );

  if (user.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const userData = user.rows[0];

  if (userData.is_verified) {
    return errorResponse(res, 'User is already verified', 400);
  }

  const otpCode = generateOTP();
  const otpExpires = getOtpExpiry();

  await query(
    'UPDATE users SET otp_code = $1, otp_expires = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
    [otpCode, otpExpires, userId]
  );

  const emailResult = await sendOtpEmail(userData.email, otpCode);

  if (!emailResult.success) {
    logger.error('Failed to send OTP email. FALLBACK OTP:', otpCode);
    return errorResponse(res, 'Failed to send OTP email. Check server logs for code.', 500);
  }

  return successResponse(res, null, 'New OTP sent successfully to your email.');
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await query(
    'SELECT id, username, email, password_hash, first_name, last_name, phone, is_organizer, is_verified, reward_points FROM users WHERE username = $1 OR email = $1',
    [username]
  );

  if (user.rows.length === 0) {
    return errorResponse(res, 'No account found with this username or email. Please check your credentials or sign up.', 401);
  }

  const userData = user.rows[0];
  const isValidPassword = await bcrypt.compare(password, userData.password_hash);

  if (!isValidPassword) {
    return errorResponse(res, 'Incorrect password. Please try again or use forgot password.', 401);
  }

  const token = generateToken(userData.id);

  return successResponse(res, {
    token,
    user: {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      is_organizer: userData.is_organizer,
      is_verified: userData.is_verified
    }
  }, 'Login successful');
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return errorResponse(res, 'Google ID token required', 400);
  }

  if (!config.googleClientId) {
    logger.error('Google OAuth not configured: GOOGLE_CLIENT_ID missing');
    throw new AppError('Google authentication is not configured', 500);
  }

  const ticket = await verifyGoogleToken(idToken);
  const payload = ticket.getPayload();
  if (!payload) {
    return errorResponse(res, 'Invalid Google token payload', 401);
  }

  const { sub: googleId, email, given_name, family_name, picture } = payload;

  if (!email) {
    return errorResponse(res, 'Email not provided by Google', 400);
  }

  let user = await query(
    'SELECT id, username, email, first_name, last_name, phone, is_organizer, is_verified FROM users WHERE google_id = $1',
    [googleId]
  );

  if (user.rows.length === 0) {
    user = await query(
      'SELECT id, username, email, first_name, last_name, phone, is_organizer, is_verified FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
      const newUser = await query(
        `INSERT INTO users (username, email, first_name, last_name, avatar_url, google_id, is_verified) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, username, email, first_name, last_name, phone, is_organizer, is_verified`,
        [username, email, given_name, family_name, picture, googleId, true]
      );
      user = newUser;
    } else {
      await query(
        'UPDATE users SET google_id = $1, avatar_url = $2, is_verified = $3 WHERE email = $4',
        [googleId, picture, true, email]
      );
    }
  }

  const userData = user.rows[0];
  const token = generateToken(userData.id);

  return successResponse(res, {
    token,
    user: {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      is_organizer: userData.is_organizer,
      is_verified: userData.is_verified
    }
  }, 'Google authentication successful');
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await query(
    'SELECT id, username, email, first_name, last_name, phone, date_of_birth, gender, address, city, state, zip_code, avatar_url, is_organizer, is_verified, preferences, created_at FROM users WHERE id = $1',
    [req.user.id]
  );

  if (user.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  return successResponse(res, { user: user.rows[0] });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    phone,
    date_of_birth,
    gender,
    address,
    city,
    state,
    zip_code,
    preferences
  } = req.body;

  await query(
    `UPDATE users 
       SET first_name = COALESCE($1, first_name), 
           last_name = COALESCE($2, last_name), 
           phone = COALESCE($3, phone),
           date_of_birth = COALESCE($4, date_of_birth),
           gender = COALESCE($5, gender),
           address = COALESCE($6, address),
           city = COALESCE($7, city),
           state = COALESCE($8, state),
           zip_code = COALESCE($9, zip_code),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10`,
    [first_name, last_name, phone, date_of_birth, gender, address, city, state, zip_code, req.user.id]
  );

  if (preferences) {
    await query(
      `UPDATE users 
         SET preferences = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
      [JSON.stringify(preferences), req.user.id]
    );
  }

  const updatedUser = await query(
    `SELECT id, username, email, first_name, last_name, phone, date_of_birth, gender, address, city, state, zip_code, avatar_url, is_organizer, is_verified, preferences, created_at, updated_at 
       FROM users WHERE id = $1`,
    [req.user.id]
  );

  return successResponse(res, { user: updatedUser.rows[0] }, 'Profile updated successfully');
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await query(
    'SELECT password_hash FROM users WHERE id = $1',
    [req.user.id]
  );

  if (user.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
  if (!isValidPassword) {
    return errorResponse(res, 'Current password is incorrect', 400);
  }

  const newPasswordHash = await bcrypt.hash(newPassword, config.bcryptRounds);

  await query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [newPasswordHash, req.user.id]
  );

  return successResponse(res, null, 'Password changed successfully');
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  return new Promise((resolve, reject) => {
    avatarUpload.single('avatar')(req, res, async (err) => {
      if (err) {
        return resolve(errorResponse(res, err.message, 400));
      }

      if (!req.file) {
        return resolve(errorResponse(res, 'No file uploaded', 400));
      }

      const avatarUrl = `${config.baseUrl}/uploads/avatars/${req.file.filename}`;

      await query(
        'UPDATE users SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [avatarUrl, req.user.id]
      );

      return resolve(successResponse(res, { avatar_url: avatarUrl }, 'Avatar uploaded successfully'));
    });
  });
});

export const logout = asyncHandler(async (req, res) => {
  return successResponse(res, null, 'Logout successful');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return errorResponse(res, 'Phone number is required', 400);
  }

  const phoneValidation = validatePhoneNumber(phone);
  if (!phoneValidation.valid) {
    return errorResponse(res, phoneValidation.message, 400);
  }

  const formattedPhone = phoneValidation.formatted;
  const user = await query(
    'SELECT id, username, first_name, last_name FROM users WHERE phone = $1',
    [formattedPhone]
  );

  if (user.rows.length === 0) {
    return successResponse(res, null, 'If an account with that phone number exists, an OTP has been sent.');
  }

  const userData = user.rows[0];
  const otpCode = generateOTP();
  const otpExpires = getOtpExpiry();

  await query(
    'UPDATE users SET otp_code = $1, otp_expires = $2 WHERE id = $3',
    [otpCode, otpExpires, userData.id]
  );

  const smsResult = await sendOTP(formattedPhone, otpCode);

  if (!smsResult.success) {
    return errorResponse(res, `Failed to send OTP: ${smsResult.error}`, 500);
  }

  return successResponse(res, {
    requiresOTP: true,
    userId: userData.id,
    phoneInfo: {
      formatted: formattedPhone,
      country: phoneValidation.country
    }
  }, 'OTP sent to your phone number');
});

export const verifyResetOTP = asyncHandler(async (req, res) => {
  const { userId, otpCode } = req.body;

  if (!userId || !otpCode) {
    return errorResponse(res, 'User ID and OTP code are required', 400);
  }

  const user = await query(
    'SELECT id, otp_code, otp_expires FROM users WHERE id = $1',
    [userId]
  );

  if (user.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const userData = user.rows[0];
  const otpVerification = verifyOTP(userData.otp_code, userData.otp_expires, otpCode);

  if (!otpVerification.valid) {
    return errorResponse(res, otpVerification.message, 400);
  }

  const resetToken = jwt.sign(
    { userId: userData.id, type: 'password_reset' },
    config.jwtSecret,
    { expiresIn: `${RESET_TOKEN_EXPIRY_HOURS}h` }
  );

  await query(
    'UPDATE users SET reset_token = $1, reset_token_expires = $2, otp_code = NULL, otp_expires = NULL WHERE id = $3',
    [resetToken, getResetTokenExpiry(), userData.id]
  );

  return successResponse(res, {
    resetToken: config.nodeEnv === 'development' ? resetToken : undefined
  }, 'OTP verified successfully. You can now reset your password.');
});

export const resendResetOTP = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return errorResponse(res, 'User ID is required', 400);
  }

  const user = await query(
    'SELECT id, phone FROM users WHERE id = $1',
    [userId]
  );

  if (user.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const userData = user.rows[0];
  const otpCode = generateOTP();
  const otpExpires = getOtpExpiry();

  await query(
    'UPDATE users SET otp_code = $1, otp_expires = $2 WHERE id = $3',
    [otpCode, otpExpires, userId]
  );

  const smsResult = await sendOTP(userData.phone, otpCode);

  if (!smsResult.success) {
    return errorResponse(res, 'Failed to send OTP. Please try again.', 500);
  }

  return successResponse(res, null, 'New OTP sent successfully to your phone number.');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return errorResponse(res, 'Token and new password are required', 400);
  }

  if (newPassword.length < 8) {
    return errorResponse(res, 'Password must be at least 8 characters long', 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return errorResponse(res, 'Invalid or expired reset token', 400);
  }

  if (decoded.type !== 'password_reset') {
    return errorResponse(res, 'Invalid token type', 400);
  }

  const user = await query(
    'SELECT id, reset_token, reset_token_expires FROM users WHERE id = $1 AND reset_token = $2',
    [decoded.userId, token]
  );

  if (user.rows.length === 0) {
    return errorResponse(res, 'Invalid reset token', 400);
  }

  const userData = user.rows[0];

  if (new Date() > new Date(userData.reset_token_expires)) {
    return errorResponse(res, 'Reset token has expired', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, config.bcryptRounds);

  await query(
    'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [passwordHash, decoded.userId]
  );

  return successResponse(res, null, 'Password has been reset successfully');
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await query('BEGIN');

  try {
    await query('DELETE FROM bookings WHERE user_id = $1', [userId]);
    await query('DELETE FROM reviews WHERE user_id = $1', [userId]);
    await query('DELETE FROM events WHERE organizer_id = $1', [userId]);
    await query('DELETE FROM created_events WHERE user_id = $1', [userId]);
    await query('DELETE FROM users WHERE id = $1', [userId]);
    await query('COMMIT');
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }

  return successResponse(res, null, 'Account deleted successfully');
});

export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const userResult = await query(
    'SELECT created_at FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const memberSince = new Date(userResult.rows[0].created_at).getFullYear().toString();

  const [eventsAttendedResult, totalSpentResult, eventsCreatedResult] = await Promise.all([
    query('SELECT COUNT(*) as count FROM bookings WHERE user_id = $1 AND status = $2', [userId, 'confirmed']),
    query('SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE user_id = $1 AND status = $2', [userId, 'confirmed']),
    query('SELECT COUNT(*) as count FROM events WHERE organizer_id = $1', [userId])
  ]);

  return successResponse(res, {
    memberSince,
    eventsAttended: parseInt(eventsAttendedResult.rows[0].count),
    totalSpent: parseFloat(totalSpentResult.rows[0].total),
    eventsCreated: parseInt(eventsCreatedResult.rows[0].count)
  });
});