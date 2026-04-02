import { BaseException } from './BaseException';

// src/exceptions/NotFoundException.ts
export class NotFoundException extends BaseException {
  constructor(resource = 'Resource', details?: unknown) {
    super(`${resource} not found`, 404, 'NOT_FOUND', details);
  }
}
