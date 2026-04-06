import { Decimal } from '@prisma/client/runtime/library';
import { User } from '../../../src/entities/User';
import { FinancialRecord } from '../../../src/entities/FinancialRecord';
import { AuditLog } from '../../../src/entities/AuditLog';
import { UserRole, UserStatus, RecordType, Category, AuditAction } from '../../../src/entities/enums';

describe('User entity', () => {
  const makeUser = () =>
    new User(
      'uuid-1',
      'test@example.com',
      '$2a$12$hashedpasswordhere',
      'Test User',
      UserRole.ANALYST,
      UserStatus.ACTIVE,
      new Date('2024-01-01'),
      new Date('2024-01-01'),
    );

  it('getId() returns the user id', () => {
    expect(makeUser().getId()).toBe('uuid-1');
  });

  it('getEmail() returns the email', () => {
    expect(makeUser().getEmail()).toBe('test@example.com');
  });

  it('getRole() returns the role', () => {
    expect(makeUser().getRole()).toBe(UserRole.ANALYST);
  });

  it('getStatus() returns the status', () => {
    expect(makeUser().getStatus()).toBe(UserStatus.ACTIVE);
  });

  it('validate() returns true for valid user', () => {
    expect(makeUser().validate()).toBe(true);
  });

  it('toJSON() never exposes hashedPassword', () => {
    const json = makeUser().toJSON();
    expect(json['hashedPassword']).toBeUndefined();
    expect(json['email']).toBe('test@example.com');
  });
});

describe('FinancialRecord entity', () => {
  const makeRecord = () =>
    new FinancialRecord(
      'rec-1',
      'user-1',
      RecordType.INCOME,
      new Decimal('1000.00'),
      Category.SALARY,
      new Date('2024-06-15'),
      new Date('2024-06-15'),
      new Date('2024-06-15'),
      'Test salary',
    );

  it('getUserId() returns the user id', () => {
    expect(makeRecord().getUserId()).toBe('user-1');
  });

  it('getAmount() returns the Decimal amount', () => {
    expect(makeRecord().getAmount().equals(new Decimal('1000.00'))).toBe(true);
  });

  it('validate() returns true for a valid record', () => {
    expect(makeRecord().validate()).toBe(true);
  });

  it('softDelete() sets isDeleted and deletedAt', () => {
    const record = makeRecord();
    record.softDelete();
    const json = record.toJSON();
    expect(json['isDeleted']).toBe(true);
    expect(json['deletedAt']).not.toBeNull();
  });

  it('toJSON() returns amount as number not Decimal object', () => {
    const json = makeRecord().toJSON();
    expect(typeof json['amount']).toBe('number');
    expect(json['amount']).toBe(1000);
  });
});

describe('AuditLog entity', () => {
  const makeLog = () =>
    new AuditLog(
      'log-1',
      'user-1',
      AuditAction.CREATE,
      'Record',
      'rec-1',
      new Date('2024-01-01'),
      { field: 'value' },
    );

  it('validate() returns true for a valid log', () => {
    expect(makeLog().validate()).toBe(true);
  });

  it('toJSON() includes all required fields', () => {
    const json = makeLog().toJSON();
    expect(json['id']).toBe('log-1');
    expect(json['action']).toBe('CREATE');
    expect(json['resource']).toBe('Record');
    expect(json['resourceId']).toBe('rec-1');
    expect(json['changes']).toEqual({ field: 'value' });
  });
});
