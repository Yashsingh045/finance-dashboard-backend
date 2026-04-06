// Interface that every role strategy must satisfy.
// canUpdateRecord takes a single boolean (isOwner) — never two string args.
export interface RoleStrategy {
  canCreateRecord(): boolean;
  canUpdateRecord(isOwner: boolean): boolean;
  canDeleteRecord(): boolean;
  canViewAllRecords(): boolean;
  canManageUsers(): boolean;
  canViewAuditLogs(): boolean;
}
