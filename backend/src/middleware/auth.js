import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import config from '../config/config.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Get user from database to ensure they still exist
    const userResult = await query(
      'SELECT id, username, email, first_name, last_name, is_organizer, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Middleware to check if user is an organizer
export const requireOrganizer = (req, res, next) => {
  if (!req.user.is_organizer) {
    return res.status(403).json({ 
      success: false, 
      message: 'Organizer access required' 
    });
  }
  next();
};

// Middleware to check if user is verified
export const requireVerified = (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Account verification required' 
    });
  }
  next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const userResult = await query(
        'SELECT id, username, email, first_name, last_name, is_organizer, is_verified FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length > 0) {
        req.user = userResult.rows[0];
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
