import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationException } from '../exceptions/ValidationException';

// Factory middleware: validate(schema) parses req.body against the given Zod schema.
// On failure, throws ValidationException with error.format() details.
// On success, replaces req.body with the parsed (and coerced) data.
export const validate = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        new ValidationException('Request body validation failed', result.error.format()),
      );
    }
    req.body = result.data;
    next();
  };
