import { UserRole } from '../../../src/entities/enums';
import { RoleStrategyFactory } from '../../../src/strategies/RoleStrategyFactory';
import { ViewerStrategy } from '../../../src/strategies/ViewerStrategy';
import { AnalystStrategy } from '../../../src/strategies/AnalystStrategy';
import { AdminStrategy } from '../../../src/strategies/AdminStrategy';

describe('RoleStrategyFactory', () => {
  it('returns ViewerStrategy for VIEWER role', () => {
    const strategy = RoleStrategyFactory.getStrategy(UserRole.VIEWER);
    expect(strategy).toBeInstanceOf(ViewerStrategy);
  });

  it('returns AnalystStrategy for ANALYST role', () => {
    const strategy = RoleStrategyFactory.getStrategy(UserRole.ANALYST);
    expect(strategy).toBeInstanceOf(AnalystStrategy);
  });

  it('returns AdminStrategy for ADMIN role', () => {
    const strategy = RoleStrategyFactory.getStrategy(UserRole.ADMIN);
    expect(strategy).toBeInstanceOf(AdminStrategy);
  });
});

describe('ViewerStrategy', () => {
  const strategy = new ViewerStrategy();

  it('canCreateRecord returns false', () => expect(strategy.canCreateRecord()).toBe(false));
  it('canUpdateRecord returns false regardless of ownership', () => {
    expect(strategy.canUpdateRecord(true)).toBe(false);
    expect(strategy.canUpdateRecord(false)).toBe(false);
  });
  it('canDeleteRecord returns false', () => expect(strategy.canDeleteRecord()).toBe(false));
  it('canViewAllRecords returns false', () => expect(strategy.canViewAllRecords()).toBe(false));
  it('canManageUsers returns false', () => expect(strategy.canManageUsers()).toBe(false));
  it('canViewAuditLogs returns false', () => expect(strategy.canViewAuditLogs()).toBe(false));
});

describe('AnalystStrategy', () => {
  const strategy = new AnalystStrategy();

  it('canCreateRecord returns true', () => expect(strategy.canCreateRecord()).toBe(true));
  it('canUpdateRecord returns true only when isOwner=true', () => {
    expect(strategy.canUpdateRecord(true)).toBe(true);
    expect(strategy.canUpdateRecord(false)).toBe(false);
  });
  it('canDeleteRecord returns false', () => expect(strategy.canDeleteRecord()).toBe(false));
  it('canViewAllRecords returns false', () => expect(strategy.canViewAllRecords()).toBe(false));
  it('canManageUsers returns false', () => expect(strategy.canManageUsers()).toBe(false));
  it('canViewAuditLogs returns false', () => expect(strategy.canViewAuditLogs()).toBe(false));
});

describe('AdminStrategy', () => {
  const strategy = new AdminStrategy();

  it('canCreateRecord returns true', () => expect(strategy.canCreateRecord()).toBe(true));
  it('canUpdateRecord returns true regardless of ownership', () => {
    expect(strategy.canUpdateRecord(true)).toBe(true);
    expect(strategy.canUpdateRecord(false)).toBe(true);
  });
  it('canDeleteRecord returns true', () => expect(strategy.canDeleteRecord()).toBe(true));
  it('canViewAllRecords returns true', () => expect(strategy.canViewAllRecords()).toBe(true));
  it('canManageUsers returns true', () => expect(strategy.canManageUsers()).toBe(true));
  it('canViewAuditLogs returns true', () => expect(strategy.canViewAuditLogs()).toBe(true));
});
