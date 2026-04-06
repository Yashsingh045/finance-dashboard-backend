import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { AuditAction } from '../entities/enums';
import { BaseService } from './BaseService';

// Injected into RecordService and AuthService so they can log changes automatically.
// AuditService.log() never throws — a logging failure must not break the main operation.
export class AuditService extends BaseService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {
    super();
  }

  /**
   * Persist an audit log entry.
   * Silently catches errors to prevent audit failures from cascading to callers.
   */
  async log(
    action: AuditAction,
    resource: string,
    resourceId: string,
    userId: string,
    changes?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.auditLogRepository.create({
        action,
        resource,
        resourceId,
        userId,
        changes: changes ?? undefined,
      });
    } catch (err) {
      this.logger.error('Failed to write audit log', { action, resource, resourceId, userId, err });
    }
  }

  async getLogs(
    where?: Record<string, unknown>,
    skip = 0,
    take = 20,
  ): Promise<{ data: ReturnType<import('../entities/AuditLog').AuditLog['toJSON']>[]; total: number }> {
    const result = await this.auditLogRepository.findMany(where, skip, take);
    return { data: result.data.map((l) => l.toJSON()), total: result.total };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(_data: unknown): void {
    // AuditService has no external input to validate — log() args are typed.
  }
}
