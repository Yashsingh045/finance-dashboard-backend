import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../exceptions/BaseException';
import { logger } from '../utils/logger';

// src/middleware/errorHandler.ts
// Global 4-argument Express error handler. All errors thrown in controllers,
// services, and middleware are caught here and formatted into a consistent envelope.
// Stack traces are never exposed to the client.
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof BaseException) {
    // Known domain error — use its status code and formatted body
    logger.warn('Request error', {
      code: err.code,
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
    });
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Unknown error — log full details server-side, hide them from the client
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      details: null,
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
  });
};
