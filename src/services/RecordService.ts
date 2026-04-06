import { Decimal } from '@prisma/client/runtime/library';
import { FinancialRecord } from '../entities/FinancialRecord';
import { AuditAction, Category, RecordType, UserRole } from '../entities/enums';
import { AuthorizationException } from '../exceptions/AuthorizationException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { RecordRepository } from '../repositories/RecordRepository';
import { RoleStrategyFactory } from '../strategies/RoleStrategyFactory';
import { RecordValidator, CreateRecordInput, UpdateRecordInput } from '../validators/RecordValidator';
import { AuditService } from './AuditService';
import { BaseService } from './BaseService';
import { JwtPayload } from './AuthService';

export interface RecordFilters {
  category?: Category;
  type?: RecordType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class RecordService extends BaseService {
  constructor(
    private readonly recordRepository: RecordRepository,
    private readonly validator: RecordValidator,
    private readonly auditService: AuditService,
  ) {
    super();
  }

  async createRecord(
    userId: string,
    user: JwtPayload,
    data: CreateRecordInput,
  ): Promise<FinancialRecord> {
    const strategy = RoleStrategyFactory.getStrategy(user.role);
    if (!strategy.canCreateRecord()) {
      throw new AuthorizationException('You do not have permission to create records');
    }

    const record = await this.recordRepository.create({
      userId,
      type: data.type,
      amount: new Decimal(data.amount),
      category: data.category,
      date: new Date(data.date),
      description: data.description,
    });

    if (!record.validate()) {
      throw new Error('Record entity failed internal validation');
    }

    await this.auditService.log(AuditAction.CREATE, 'Record', record.getId(), userId, {
      type: data.type,
      amount: data.amount,
      category: data.category,
    });

    this.logger.info('Record created', { recordId: record.getId(), userId });
    return record;
  }

  async getRecords(
    userId: string,
    user: JwtPayload,
    filters: RecordFilters,
  ): Promise<{ data: ReturnType<FinancialRecord['toJSON']>[]; total: number; page: number; pages: number }> {
    const strategy = RoleStrategyFactory.getStrategy(user.role);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    // VIEWER gets an empty list — dashboard is the right entrypoint for viewers
    if (!strategy.canCreateRecord() && !strategy.canViewAllRecords()) {
      return { data: [], total: 0, page, pages: 0 };
    }

    const where: Record<string, unknown> = {};

    // ADMIN sees all records; ANALYST sees only own
    if (!strategy.canViewAllRecords()) {
      where.userId = userId;
    }

    if (filters.category) where.category = filters.category;
    if (filters.type) where.type = filters.type;
    if (filters.startDate || filters.endDate) {
      where.date = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      };
    }

    const result = await this.recordRepository.findMany(where, skip, limit);
    const pages = Math.ceil(result.total / limit);

    return {
      data: result.data.map((r) => r.toJSON()),
      total: result.total,
      page,
      pages,
    };
  }

  async getRecordById(
    id: string,
    user: JwtPayload,
  ): Promise<FinancialRecord> {
    const record = await this.recordRepository.findById(id);
    if (!record) throw new NotFoundException('Record');

    const strategy = RoleStrategyFactory.getStrategy(user.role);
    const isOwner = record.getUserId() === user.id;

    // Admin can see any record; others must own it
    if (!strategy.canViewAllRecords() && !isOwner) {
      throw new AuthorizationException('You do not have permission to view this record');
    }

    return record;
  }

  async updateRecord(
    id: string,
    userId: string,
    user: JwtPayload,
    data: UpdateRecordInput,
  ): Promise<FinancialRecord> {
    const record = await this.recordRepository.findById(id);
    if (!record) throw new NotFoundException('Record');

    const strategy = RoleStrategyFactory.getStrategy(user.role);
    const isOwner = record.getUserId() === userId;

    if (!strategy.canUpdateRecord(isOwner)) {
      throw new AuthorizationException('You do not have permission to update this record');
    }

    const updateData: Record<string, unknown> = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.amount !== undefined) updateData.amount = new Decimal(data.amount);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;

    const updated = await this.recordRepository.update(id, updateData);

    await this.auditService.log(AuditAction.UPDATE, 'Record', id, userId, data as Record<string, unknown>);

    this.logger.info('Record updated', { recordId: id, userId });
    return updated;
  }

  async deleteRecord(id: string, user: JwtPayload): Promise<void> {
    const record = await this.recordRepository.findById(id);
    if (!record) throw new NotFoundException('Record');

    const strategy = RoleStrategyFactory.getStrategy(user.role);
    if (!strategy.canDeleteRecord()) {
      throw new AuthorizationException('You do not have permission to delete records');
    }

    await this.recordRepository.softDelete(id);
    await this.auditService.log(AuditAction.DELETE, 'Record', id, user.id);

    this.logger.info('Record soft-deleted', { recordId: id, userId: user.id });
  }

  validate(data: unknown): void {
    this.validator.validateCreate(data);
  }
}
