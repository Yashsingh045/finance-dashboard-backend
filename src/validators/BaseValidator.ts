import { ZodSchema } from 'zod';
import { ValidationException } from '../exceptions/ValidationException';

// Provides the shared validate() helper used by all concrete validator classes.
// All schemas live in the same class for easy reference by services/middleware.
export abstract class BaseValidator {
  /**
   * Parses data against the given Zod schema.
   * Throws ValidationException with formatted errors on failure.
   */
  protected validate<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new ValidationException(
        'Validation failed',
        result.error.format(),
      );
    }
    return result.data;
  }
}
