import { Response } from 'express';
import { BaseException } from '../exceptions/BaseException';

// Shared response helpers used by all concrete controllers.
// Controllers call sendCreated/sendSuccess — never write to res directly on success.
// On error they simply throw — errorHandler middleware catches and formats.
export abstract class BaseController {
  protected sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
    res.status(statusCode).json({ success: true, data });
  }

  protected sendCreated<T>(res: Response, data: T): void {
    this.sendSuccess(res, data, 201);
  }

  // Used by controllers that catch known errors before passing to errorHandler
  protected sendError(res: Response, error: BaseException): void {
    res.status(error.statusCode).json(error.toJSON());
  }

  protected getPagination(query: Record<string, string>): {
    page: number;
    limit: number;
    skip: number;
  } {
    const page = Math.max(1, parseInt(query['page'] ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query['limit'] ?? '20', 10)));
    return { page, limit, skip: (page - 1) * limit };
  }
}
