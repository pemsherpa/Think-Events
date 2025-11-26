import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../config/database.js';
import config from '../config/config.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { validatePhoneNumber } from '../utils/twilio.js';
import { sendOtpEmail } from '../utils/emailService.js';

// Helper to generate numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const googleClient = new OAuth2Client(config.googleClientId);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
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

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { 
    expiresIn: config.jwtExpiresIn 
  });
};

// User registration
export const signup = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Validate and format phone number if provided
    let formattedPhone = null;
    if (phone) {
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({
          success: false,
          message: phoneValidation.message
        });
      }
      formattedPhone = phoneValidation.formatted;
    }

    // Hash password
    const saltRounds = config.bcryptRounds;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with OTP and is_verified = false
    const newUser = await query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_verified, otp_code, otp_expires) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, username, email, first_name, last_name, phone, is_organizer, is_verified`,
      [username, email, passwordHash, first_name, last_name, formattedPhone, false, otpCode, otpExpires]
    );

    const user = newUser.rows[0];

    // Send OTP via Email
    const emailResult = await sendOtpEmail(email, otpCode);

    if (!emailResult.success) {
      // If email fails, log the OTP to console for development/fallback
      console.error('Failed to send signup OTP email. FALLBACK OTP:', otpCode);
      console.error('Error details:', emailResult.error);
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully. Please check your email for the verification code.',
      userId: user.id,
      requiresVerification: true
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify OTP for signup
export const verifySignupOTP = async (req, res) => {
  try {
    const { userId, otpCode } = req.body;

    if (!userId || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP code are required'
      });
    }

    // Get user and OTP details
    const user = await query(
      'SELECT id, otp_code, otp_expires, username, email, first_name, last_name, phone, is_organizer FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = user.rows[0];

    // Verify OTP
    if (userData.otp_code !== otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code'
      });
    }

    if (new Date(userData.otp_expires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Mark user as verified and clear OTP
    await query(
      'UPDATE users SET is_verified = $1, phone_verified = $2, otp_code = NULL, otp_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [true, true, userId]
    );

    // Generate token
    const token = generateToken(userId);

    res.json({
      success: true,
      message: 'Email verified successfully!',
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
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Resend OTP for signup
export const resendSignupOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user details
    const user = await query(
      'SELECT id, email, is_verified FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = user.rows[0];

    if (userData.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update OTP in database
    await query(
      'UPDATE users SET otp_code = $1, otp_expires = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [otpCode, otpExpires, userId]
    );

    // Send new OTP via Email
    const emailResult = await sendOtpEmail(userData.email, otpCode);
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email. FALLBACK OTP:', otpCode);
      // Still return error to frontend but log OTP for dev
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Check server logs for code.'
      });
    }

    res.json({
      success: true,
      message: 'New OTP sent successfully to your email.'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
};

// User login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await query(
      'SELECT id, username, email, password_hash, first_name, last_name, phone, is_organizer, is_verified FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const userData = user.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, userData.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(userData.id);

    res.json({
      success: true,
      message: 'Login successful',
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
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Google OAuth login/signup
export const googleAuth = async (req, res) => {
  try {
    console.log('Google Auth Request Received');
    const { idToken } = req.body;

    if (!idToken) {
      console.log('No ID token provided');
      return res.status(400).json({
        success: false,
        message: 'Google ID token required'
      });
    }

    // Verify Google token
    console.log('Verifying Google token...');
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.googleClientId
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name, picture } = payload;
    console.log('Token verified. User:', email, googleId);

    // Check if user exists with Google ID
    let user = await query(
      'SELECT id, username, email, first_name, last_name, phone, is_organizer, is_verified FROM users WHERE google_id = $1',
      [googleId]
    );

    if (user.rows.length === 0) {
      console.log('User not found by Google ID. Checking by email...');
      // Check if user exists with email
      user = await query(
        'SELECT id, username, email, first_name, last_name, phone, is_organizer, is_verified FROM users WHERE email = $1',
        [email]
      );

      if (user.rows.length === 0) {
        console.log('User not found by email. Creating new user...');
        // Create new user
        const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
        
        try {
          const newUser = await query(
            `INSERT INTO users (username, email, first_name, last_name, avatar_url, google_id, is_verified) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, username, email, first_name, last_name, phone, is_organizer, is_verified`,
            [username, email, given_name, family_name, picture, googleId, true]
          );
          user = newUser;
          console.log('New user created:', user.rows[0].id);
        } catch (createError) {
          console.error('Error creating user:', createError);
          return res.status(500).json({
            success: false,
            message: 'Failed to create user: ' + createError.message
          });
        }
      } else {
        console.log('User found by email. Updating Google ID...');
        // Update existing user with Google ID
        await query(
          'UPDATE users SET google_id = $1, avatar_url = $2, is_verified = $3 WHERE email = $4',
          [googleId, picture, true, email]
        );
      }
    } else {
      console.log('User found by Google ID.');
    }

    const userData = user.rows[0];
    const token = generateToken(userData.id);

    res.json({
      success: true,
      message: 'Google authentication successful',
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
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed: ' + error.message
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await query(
      'SELECT id, username, email, first_name, last_name, phone, date_of_birth, gender, address, city, state, zip_code, avatar_url, is_organizer, is_verified, preferences, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.rows[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
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

    // Update basic user info
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

    // Update preferences if provided
    if (preferences) {
      await query(
        `UPDATE users 
         SET preferences = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [JSON.stringify(preferences), req.user.id]
      );
    }

    // Get the complete updated user data
    const updatedUser = await query(
      `SELECT id, username, email, first_name, last_name, phone, date_of_birth, gender, address, city, state, zip_code, avatar_url, is_organizer, is_verified, preferences, created_at, updated_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const user = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, config.bcryptRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    upload.single('avatar')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Generate avatar URL
      const avatarUrl = `${config.baseUrl}/uploads/avatars/${req.file.filename}`;

      // Update user's avatar_url in database
      await query(
        'UPDATE users SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [avatarUrl, req.user.id]
      );

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatar_url: avatarUrl
        }
      });
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout (optional - client-side token removal)
export const logout = async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return success and let the client remove the token
    
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Forgot password - send OTP to phone
export const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Validate and format phone number
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({
        success: false,
        message: phoneValidation.message
      });
    }

    const formattedPhone = phoneValidation.formatted;

    // Check if user exists
    const user = await query(
      'SELECT id, username, first_name, last_name FROM users WHERE phone = $1',
      [formattedPhone]
    );

    if (user.rows.length === 0) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that phone number exists, an OTP has been sent.'
      });
    }

    const userData = user.rows[0];
    
    // Generate OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await query(
      'UPDATE users SET otp_code = $1, otp_expires = $2 WHERE id = $3',
      [otpCode, otpExpires, userData.id]
    );

    // Send OTP via SMS
    const smsResult = await sendOTP(formattedPhone, otpCode);
    
    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP: ${smsResult.error}`
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your phone number',
      requiresOTP: true,
      userId: userData.id,
      phoneInfo: {
        formatted: formattedPhone,
        country: phoneValidation.country
      }
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
};

// Verify OTP for password reset
export const verifyResetOTP = async (req, res) => {
  try {
    const { userId, otpCode } = req.body;

    if (!userId || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP code are required'
      });
    }

    // Get user and OTP details
    const user = await query(
      'SELECT id, otp_code, otp_expires FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = user.rows[0];

    // Verify OTP
    const otpVerification = verifyOTP(userData.otp_code, userData.otp_expires, otpCode);
    
    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: userData.id, type: 'password_reset' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    // Store reset token and clear OTP
    await query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2, otp_code = NULL, otp_expires = NULL WHERE id = $3',
      [resetToken, new Date(Date.now() + 60 * 60 * 1000), userData.id]
    );

    res.json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      resetToken: config.nodeEnv === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
};

// Resend OTP for password reset
export const resendResetOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user details
    const user = await query(
      'SELECT id, phone FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = user.rows[0];

    // Generate new OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update OTP in database
    await query(
      'UPDATE users SET otp_code = $1, otp_expires = $2 WHERE id = $3',
      [otpCode, otpExpires, userId]
    );

    // Send new OTP
    const smsResult = await sendOTP(userData.phone, otpCode);
    
    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'New OTP sent successfully to your phone number.'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Check if token exists and is not expired in database
    const user = await query(
      'SELECT id, reset_token, reset_token_expires FROM users WHERE id = $1 AND reset_token = $2',
      [decoded.userId, token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    const userData = user.rows[0];
    
    if (new Date() > new Date(userData.reset_token_expires)) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Hash new password
    const saltRounds = config.bcryptRounds;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, decoded.userId]
    );

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Start a transaction to ensure all related data is deleted
    await query('BEGIN');

    try {
      // Delete user's bookings
      await query('DELETE FROM bookings WHERE user_id = $1', [userId]);
      
      // Delete user's reviews
      await query('DELETE FROM reviews WHERE user_id = $1', [userId]);
      
      // Delete user's events (if they're an organizer)
      await query('DELETE FROM events WHERE organizer_id = $1', [userId]);
      
      // Delete user's created events tracking
      await query('DELETE FROM created_events WHERE user_id = $1', [userId]);
      
      // Finally, delete the user
      await query('DELETE FROM users WHERE id = $1', [userId]);

      // Commit the transaction
      await query('COMMIT');

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      // Rollback the transaction if any error occurs
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's join date
    const userResult = await query(
      'SELECT created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const memberSince = new Date(userResult.rows[0].created_at).getFullYear().toString();

    // Get events attended count
    const eventsAttendedResult = await query(
      'SELECT COUNT(*) as count FROM bookings WHERE user_id = $1 AND status = $2',
      [userId, 'confirmed']
    );
    const eventsAttended = parseInt(eventsAttendedResult.rows[0].count);

    // Get total spent
    const totalSpentResult = await query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE user_id = $1 AND status = $2',
      [userId, 'confirmed']
    );
    const totalSpent = parseFloat(totalSpentResult.rows[0].total);

    // Get events created count
    const eventsCreatedResult = await query(
      'SELECT COUNT(*) as count FROM events WHERE organizer_id = $1',
      [userId]
    );
    const eventsCreated = parseInt(eventsCreatedResult.rows[0].count);

    res.json({
      success: true,
      data: {
        memberSince,
        eventsAttended,
        totalSpent,
        eventsCreated
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
};