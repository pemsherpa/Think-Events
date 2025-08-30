import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../config/database.js';
import config from '../config/config.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

    // Hash password
    const saltRounds = config.bcryptRounds;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, username, email, first_name, last_name, phone, is_organizer, is_verified, created_at`,
      [username, email, passwordHash, first_name, last_name, phone, false]
    );

    const user = newUser.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        is_organizer: user.is_organizer,
        is_verified: user.is_verified
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token required'
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.googleClientId
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name, picture } = payload;

    // Check if user exists with Google ID
    let user = await query(
      'SELECT id, username, email, first_name, last_name, phone, is_organizer, is_verified FROM users WHERE google_id = $1',
      [googleId]
    );

    if (user.rows.length === 0) {
      // Check if user exists with email
      user = await query(
        'SELECT id, username, email, first_name, last_name, phone, is_organizer, is_verified FROM users WHERE email = $1',
        [email]
      );

      if (user.rows.length === 0) {
        // Create new user
        const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
        
        const newUser = await query(
          `INSERT INTO users (username, email, first_name, last_name, avatar_url, google_id, is_verified) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING id, username, email, first_name, last_name, phone, is_organizer, is_verified`,
          [username, email, given_name, family_name, picture, googleId, true]
        );

        user = newUser;
      } else {
        // Update existing user with Google ID
        await query(
          'UPDATE users SET google_id = $1, avatar_url = $2, is_verified = $3 WHERE email = $4',
          [googleId, picture, true, email]
        );
      }
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
      message: 'Google authentication failed'
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
    const updatedUser = await query(
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
       WHERE id = $10 
       RETURNING id, username, email, first_name, last_name, phone, date_of_birth, gender, address, city, state, zip_code, avatar_url, is_organizer, is_verified`,
      [first_name, last_name, phone, date_of_birth, gender, address, city, state, zip_code, req.user.id]
    );

    // Update preferences if provided
    if (preferences) {
      await query(
        `UPDATE users 
         SET preferences = COALESCE($1, preferences),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [JSON.stringify(preferences), req.user.id]
      );
    }

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
