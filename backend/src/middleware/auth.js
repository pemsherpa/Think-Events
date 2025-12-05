import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import { errorResponse } from '../utils/response.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'Access token required', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    
    const userResult = await query(
      'SELECT id, username, email, first_name, last_name, is_organizer, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return errorResponse(res, 'User not found', 401);
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }

    logger.error('Auth middleware error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

export const requireOrganizer = (req, res, next) => {
  if (!req.user?.is_organizer) {
    return errorResponse(res, 'Organizer access required', 403);
  }
  next();
};

export const requireVerified = (req, res, next) => {
  if (!req.user?.is_verified) {
    return errorResponse(res, 'Account verification required', 403);
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

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
    next();
  }
};
