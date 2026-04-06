import { BaseException } from './BaseException';

export class AuthorizationException extends BaseException {
  constructor(message = 'Insufficient permissions', details?: unknown) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
  }
}
