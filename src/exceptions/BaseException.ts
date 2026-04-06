// All custom exceptions extend this class so the global error handler can
// identify them (instanceof BaseException) and format a consistent JSON envelope.
export class BaseException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    // Restore the prototype chain — required when extending built-in Error in TS.
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details ?? null,
        statusCode: this.statusCode,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
