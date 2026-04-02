import { BaseException } from './BaseException';

// src/exceptions/AuthorizationException.ts
export class AuthorizationException extends BaseException {
  constructor(message = 'Insufficient permissions', details?: unknown) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
  }
}
