import { RoleStrategy } from './RoleStrategy';

// src/strategies/ViewerStrategy.ts
// VIEWER: read-only access to dashboard only. Cannot create, update, or delete anything.
export class ViewerStrategy implements RoleStrategy {
  canCreateRecord(): boolean { return false; }
  canUpdateRecord(_isOwner: boolean): boolean { return false; }
  canDeleteRecord(): boolean { return false; }
  canViewAllRecords(): boolean { return false; }
  canManageUsers(): boolean { return false; }
  canViewAuditLogs(): boolean { return false; }
}
