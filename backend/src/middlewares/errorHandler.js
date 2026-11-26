import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : (err.meta?.target || 'field');
    error = ApiError.conflict(`Duplicate value for unique field: ${target}`);
  } else if (err.code === 'P2025') {
    error = ApiError.notFound(err.meta?.cause || 'Record not found in database');
  } else if (err.code === 'P2003') {
    const field = err.meta?.field_name || 'relation';
    error = ApiError.badRequest(`Foreign key constraint failed on ${field}`);
  } else if (err.name === 'PrismaClientValidationError') {
    error = ApiError.badRequest('Database query validation error: invalid data provided');
  } else if (err.name === 'ValidationError') {
    error = ApiError.badRequest(err.message || 'Validation failed', err.errors || []);
  } else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  logger.error(`${req.method} ${req.url} - ${error.message}`);

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

