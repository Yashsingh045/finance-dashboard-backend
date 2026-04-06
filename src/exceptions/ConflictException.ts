import { BaseException } from './BaseException';

export class ConflictException extends BaseException {
  constructor(message: string, details?: unknown) {
    super(message, 409, 'CONFLICT_ERROR', details);
  }
}
