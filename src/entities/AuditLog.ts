import { BaseEntity } from './BaseEntity';
import { AuditAction } from './enums';

// src/entities/AuditLog.ts
// Immutable audit trail entry. Changes are stored as JSON for full flexibility.
export class AuditLog extends BaseEntity {
  private userId: string;
  private action: AuditAction;
  private resource: string;
  private resourceId: string;
  private changes?: Record<string, unknown>;

  constructor(
    id: string,
    userId: string,
    action: AuditAction,
    resource: string,
    resourceId: string,
    createdAt: Date,
    // AuditLog has no updatedAt — it is append-only. We pass createdAt for both.
    changes?: Record<string, unknown>,
  ) {
    super(id, createdAt, createdAt);
    this.userId = userId;
    this.action = action;
    this.resource = resource;
    this.resourceId = resourceId;
    this.changes = changes;
  }

  validate(): boolean {
    return (
      typeof this.userId === 'string' &&
      this.userId.length > 0 &&
      Object.values(AuditAction).includes(this.action) &&
      typeof this.resource === 'string' &&
      this.resource.length > 0 &&
      typeof this.resourceId === 'string' &&
      this.resourceId.length > 0
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      action: this.action,
      resource: this.resource,
      resourceId: this.resourceId,
      changes: this.changes ?? null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
