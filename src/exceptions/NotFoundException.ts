import { BaseException } from './BaseException';

export class NotFoundException extends BaseException {
  constructor(resource = 'Resource', details?: unknown) {
    super(`${resource} not found`, 404, 'NOT_FOUND', details);
  }
}
