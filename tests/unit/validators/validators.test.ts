import { AuthValidator } from '../../../src/validators/AuthValidator';
import { RecordValidator } from '../../../src/validators/RecordValidator';
import { UserValidator } from '../../../src/validators/UserValidator';
import { ValidationException } from '../../../src/exceptions/ValidationException';
import { UserRole, UserStatus } from '../../../src/entities/enums';

// tests/unit/validators/validators.test.ts
describe('AuthValidator', () => {
  const validator = new AuthValidator();

  describe('validateRegister', () => {
    it('accepts valid registration data', () => {
      expect(() =>
        validator.validateRegister({
          email: 'user@example.com',
          password: 'ValidPass123',
          name: 'John Doe',
        }),
      ).not.toThrow();
    });

    it('throws ValidationException for invalid email', () => {
      expect(() =>
        validator.validateRegister({
          email: 'not-an-email',
          password: 'ValidPass123',
          name: 'John Doe',
        }),
      ).toThrow(ValidationException);
    });

    it('throws for password shorter than 8 characters', () => {
      expect(() =>
        validator.validateRegister({ email: 'a@b.com', password: 'short', name: 'Name' }),
      ).toThrow(ValidationException);
    });

    it('throws for name shorter than 2 characters', () => {
      expect(() =>
        validator.validateRegister({ email: 'a@b.com', password: 'ValidPass123', name: 'X' }),
      ).toThrow(ValidationException);
    });
  });

  describe('validateLogin', () => {
    it('accepts valid login data', () => {
      expect(() =>
        validator.validateLogin({ email: 'user@example.com', password: 'anypass' }),
      ).not.toThrow();
    });

    it('throws for missing password', () => {
      expect(() => validator.validateLogin({ email: 'user@example.com' })).toThrow(
        ValidationException,
      );
    });
  });
});

describe('RecordValidator', () => {
  const validator = new RecordValidator();

  it('accepts a valid record', () => {
    expect(() =>
      validator.validateCreate({
        type: 'INCOME',
        amount: 1000.0,
        category: 'SALARY',
        date: '2024-01-15T00:00:00.000Z',
        description: 'Test',
      }),
    ).not.toThrow();
  });

  it('rejects a future date', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(() =>
      validator.validateCreate({
        type: 'INCOME',
        amount: 500,
        category: 'SALARY',
        date: future,
      }),
    ).toThrow(ValidationException);
  });

  it('rejects non-positive amount', () => {
    expect(() =>
      validator.validateCreate({
        type: 'INCOME',
        amount: 0,
        category: 'SALARY',
        date: '2024-01-15T00:00:00.000Z',
      }),
    ).toThrow(ValidationException);
  });

  it('rejects invalid category enum', () => {
    expect(() =>
      validator.validateCreate({
        type: 'INCOME',
        amount: 100,
        category: 'INVALID_CATEGORY',
        date: '2024-01-15T00:00:00.000Z',
      }),
    ).toThrow(ValidationException);
  });

  it('updateSchema allows partial data without date', () => {
    expect(() => validator.validateUpdate({ amount: 500 })).not.toThrow();
  });
});

describe('UserValidator', () => {
  const validator = new UserValidator();

  it('accepts all optional fields', () => {
    expect(() =>
      validator.validateUpdate({ name: 'New Name', role: UserRole.ANALYST, status: UserStatus.ACTIVE }),
    ).not.toThrow();
  });

  it('accepts empty object (all optional)', () => {
    expect(() => validator.validateUpdate({})).not.toThrow();
  });

  it('rejects invalid role enum', () => {
    expect(() => validator.validateUpdate({ role: 'SUPERUSER' })).toThrow(ValidationException);
  });
});
