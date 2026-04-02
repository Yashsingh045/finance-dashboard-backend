import { Decimal } from '@prisma/client/runtime/library';
import { BaseEntity } from './BaseEntity';
import { Category, RecordType } from './enums';

// src/entities/FinancialRecord.ts
// Domain entity for financial records. Uses Prisma's Decimal type so arithmetic
// is never done with JS floats (avoids IEEE-754 rounding errors on currency).
export class FinancialRecord extends BaseEntity {
  private userId: string;
  private type: RecordType;
  private amount: Decimal;
  private category: Category;
  private date: Date;
  private description?: string;
  private isDeleted: boolean;
  private deletedAt?: Date;

  constructor(
    id: string,
    userId: string,
    type: RecordType,
    amount: Decimal,
    category: Category,
    date: Date,
    createdAt: Date,
    updatedAt: Date,
    description?: string,
    isDeleted = false,
    deletedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.userId = userId;
    this.type = type;
    this.amount = amount;
    this.category = category;
    this.date = date;
    this.description = description;
    this.isDeleted = isDeleted;
    this.deletedAt = deletedAt;
  }

  getUserId(): string {
    return this.userId;
  }

  getAmount(): Decimal {
    return this.amount;
  }

  getType(): RecordType {
    return this.type;
  }

  getCategory(): Category {
    return this.category;
  }

  getIsDeleted(): boolean {
    return this.isDeleted;
  }

  /** Soft-delete: marks the record as deleted without removing the DB row. */
  softDelete(): void {
    this.isDeleted = true;
    this.deletedAt = new Date();
  }

  validate(): boolean {
    return (
      typeof this.userId === 'string' &&
      this.userId.length > 0 &&
      Object.values(RecordType).includes(this.type) &&
      this.amount.greaterThan(0) &&
      Object.values(Category).includes(this.category) &&
      this.date instanceof Date &&
      !isNaN(this.date.getTime())
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      amount: parseFloat(this.amount.toString()),
      category: this.category,
      date: this.date.toISOString(),
      description: this.description ?? null,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
