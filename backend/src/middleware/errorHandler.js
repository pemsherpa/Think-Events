import config from '../config/config.js';
import logger from '../utils/logger.js';

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  if (error.code === '23505') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry'
    });
  }

  if (error.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record not found'
    });
  }

  if (error.code === '23502') {
    return res.status(400).json({
      success: false,
      message: 'Required field is missing'
    });
  }

  logger.error('Error:', error.message, error.stack);

  res.status(error.status || 500).json({
    success: false,
    message: config.nodeEnv === 'development' ? error.message : 'Internal server error'
  });
};

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.status = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

