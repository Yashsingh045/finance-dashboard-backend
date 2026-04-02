import { RoleStrategy } from './RoleStrategy';

// src/strategies/AdminStrategy.ts
// ADMIN: full access — can do everything including delete, manage users, and view audit logs.
export class AdminStrategy implements RoleStrategy {
  canCreateRecord(): boolean { return true; }
  canUpdateRecord(_isOwner: boolean): boolean { return true; }
  canDeleteRecord(): boolean { return true; }
  canViewAllRecords(): boolean { return true; }
  canManageUsers(): boolean { return true; }
  canViewAuditLogs(): boolean { return true; }
}
