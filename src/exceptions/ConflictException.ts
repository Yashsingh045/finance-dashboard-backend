import { BaseException } from './BaseException';

// src/exceptions/ConflictException.ts
export class ConflictException extends BaseException {
  constructor(message: string, details?: unknown) {
    super(message, 409, 'CONFLICT_ERROR', details);
  }
}
