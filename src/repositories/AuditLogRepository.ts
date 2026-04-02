import { PrismaClient } from '@prisma/client';
import { AuditLog } from '../entities/AuditLog';
import { AuditAction } from '../entities/enums';
import { prisma } from '../utils/prisma';
import { BaseRepository } from './BaseRepository';

interface PrismaAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, unknown> | null;
  createdAt: Date;
}

// src/repositories/AuditLogRepository.ts
export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  async create(data: unknown): Promise<AuditLog> {
    const raw = await this.prisma.auditLog.create({
      data: data as Parameters<typeof this.prisma.auditLog.create>[0]['data'],
    });
    return this.mapToEntity(raw);
  }

  async findById(id: string): Promise<AuditLog | null> {
    const raw = await this.prisma.auditLog.findUnique({ where: { id } });
    return raw ? this.mapToEntity(raw) : null;
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    const rows = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapToEntity(r));
  }

  async findByResource(resource: string): Promise<AuditLog[]> {
    const rows = await this.prisma.auditLog.findMany({
      where: { resource },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapToEntity(r));
  }

  async findAll(filters?: Record<string, unknown>): Promise<AuditLog[]> {
    const rows = await this.prisma.auditLog.findMany({
      where: filters ?? {},
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapToEntity(r));
  }

  async update(_id: string, _data: Partial<unknown>): Promise<AuditLog> {
    // AuditLogs are append-only — updates are never allowed.
    throw new Error('AuditLog records are immutable and cannot be updated.');
  }

  async delete(_id: string): Promise<void> {
    // AuditLogs are append-only — deletes are never allowed.
    throw new Error('AuditLog records cannot be deleted.');
  }

  async findMany(
    where?: Record<string, unknown>,
    skip = 0,
    take = 20,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: where ?? {},
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: where ?? {} }),
    ]);
    return { data: rows.map((r) => this.mapToEntity(r)), total };
  }

  protected mapToEntity(raw: unknown): AuditLog {
    const r = raw as PrismaAuditLog;
    return new AuditLog(
      r.id,
      r.userId,
      r.action as AuditAction,
      r.resource,
      r.resourceId,
      r.createdAt,
      r.changes ?? undefined,
    );
  }
}
