import { apiError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}: ${err.message}`, err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return apiError(res, 'Validation failed', 400, formattedErrors);
  }

  // Handle Prisma known request errors
  if (err.code === 'P2002') {
    return apiError(res, `A record with this ${err.meta?.target || 'field'} already exists`, 409);
  }
  if (err.code === 'P2025') {
    return apiError(res, 'Requested resource was not found', 404);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return apiError(res, 'Invalid token. Authorization denied.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return apiError(res, 'Token has expired. Please log in again.', 401);
  }

  // Fallback internal server error
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message);
  return apiError(res, message, statusCode);
};
