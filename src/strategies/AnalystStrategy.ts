import { RoleStrategy } from './RoleStrategy';

// src/strategies/AnalystStrategy.ts
// ANALYST: can create and update their own records but cannot delete or manage users.
export class AnalystStrategy implements RoleStrategy {
  canCreateRecord(): boolean { return true; }
  // Analysts can only update records they own — enforced via the isOwner boolean.
  canUpdateRecord(isOwner: boolean): boolean { return isOwner; }
  canDeleteRecord(): boolean { return false; }
  canViewAllRecords(): boolean { return false; }
  canManageUsers(): boolean { return false; }
  canViewAuditLogs(): boolean { return false; }
}
