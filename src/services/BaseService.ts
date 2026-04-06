import { Logger } from 'winston';
import { logger } from '../utils/logger';

// All services extend this class. The logger is injected via constructor for easy
// mocking in tests. validate() must be implemented by each concrete service.
export abstract class BaseService {
  protected logger: Logger;

  constructor(serviceLogger: Logger = logger) {
    this.logger = serviceLogger;
  }

  /** Each service validates its own domain input before processing. */
  abstract validate(data: unknown): void;
}
