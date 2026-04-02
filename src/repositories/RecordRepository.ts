import { Decimal } from '@prisma/client/runtime/library';
import { PrismaClient } from '@prisma/client';
import { FinancialRecord } from '../entities/FinancialRecord';
import { Category, RecordType } from '../entities/enums';
import { prisma } from '../utils/prisma';
import { BaseRepository } from './BaseRepository';

interface PrismaFinancialRecord {
  id: string;
  userId: string;
  type: string;
  amount: Decimal;
  category: string;
  date: Date;
  description: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// src/repositories/RecordRepository.ts
// All queries include { isDeleted: false } by default — soft-deleted records
// are never returned unless explicitly requested.
export class RecordRepository extends BaseRepository<FinancialRecord> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  async create(data: unknown): Promise<FinancialRecord> {
    const raw = await this.prisma.financialRecord.create({
      data: data as Parameters<typeof this.prisma.financialRecord.create>[0]['data'],
    });
    return this.mapToEntity(raw);
  }

  async findById(id: string): Promise<FinancialRecord | null> {
    const raw = await this.prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
    });
    return raw ? this.mapToEntity(raw) : null;
  }

  async findAll(filters?: Record<string, unknown>): Promise<FinancialRecord[]> {
    const rows = await this.prisma.financialRecord.findMany({
      where: { isDeleted: false, ...(filters ?? {}) },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapToEntity(r));
  }

  async findByUserId(userId: string): Promise<FinancialRecord[]> {
    const rows = await this.prisma.financialRecord.findMany({
      where: { userId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapToEntity(r));
  }

  async findByCategory(category: Category): Promise<FinancialRecord[]> {
    const rows = await this.prisma.financialRecord.findMany({
      where: { category, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapToEntity(r));
  }

  async findByDateRange(
    userId: string | null,
    start: Date,
    end: Date,
  ): Promise<FinancialRecord[]> {
    const rows = await this.prisma.financialRecord.findMany({
      where: {
        ...(userId ? { userId } : {}),
        isDeleted: false,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'desc' },
    });
    return rows.map((r) => this.mapToEntity(r));
  }

  async update(id: string, data: Partial<unknown>): Promise<FinancialRecord> {
    const raw = await this.prisma.financialRecord.update({
      where: { id },
      data: data as Parameters<typeof this.prisma.financialRecord.update>[0]['data'],
    });
    return this.mapToEntity(raw);
  }

  /** Soft-delete — sets isDeleted=true and deletedAt=now(). No hard delete ever. */
  async delete(id: string): Promise<void> {
    await this.prisma.financialRecord.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  /** Alias used directly by services to make intent explicit. */
  async softDelete(id: string): Promise<void> {
    return this.delete(id);
  }

  async findMany(
    where?: Record<string, unknown>,
    skip = 0,
    take = 20,
  ): Promise<{ data: FinancialRecord[]; total: number }> {
    const baseWhere = { isDeleted: false, ...(where ?? {}) };
    const [rows, total] = await Promise.all([
      this.prisma.financialRecord.findMany({
        where: baseWhere,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.financialRecord.count({ where: baseWhere }),
    ]);
    return { data: rows.map((r) => this.mapToEntity(r)), total };
  }

  protected mapToEntity(raw: unknown): FinancialRecord {
    const r = raw as PrismaFinancialRecord;
    return new FinancialRecord(
      r.id,
      r.userId,
      r.type as RecordType,
      r.amount,
      r.category as Category,
      r.date,
      r.createdAt,
      r.updatedAt,
      r.description ?? undefined,
      r.isDeleted,
      r.deletedAt ?? undefined,
    );
  }
}
