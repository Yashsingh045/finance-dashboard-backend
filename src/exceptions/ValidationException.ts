import { BaseException } from './BaseException';

export class ValidationException extends BaseException {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}
