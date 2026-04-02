import { BaseException } from './BaseException';

// src/exceptions/AuthenticationException.ts
export class AuthenticationException extends BaseException {
  constructor(message = 'Authentication required', details?: unknown) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
  }
}
