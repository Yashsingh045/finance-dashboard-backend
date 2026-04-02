import { PrismaClient } from '@prisma/client';
import { BaseEntity } from '../entities/BaseEntity';

// src/repositories/BaseRepository.ts
// Generic repository contract. Concrete repositories extend this with a specific
// entity type T. Swapping the DB engine only requires new concrete implementations.
export abstract class BaseRepository<T extends BaseEntity> {
  constructor(protected readonly prisma: PrismaClient) {}

  abstract create(data: unknown): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(filters?: Record<string, unknown>): Promise<T[]>;
  abstract update(id: string, data: Partial<unknown>): Promise<T>;
  abstract delete(id: string): Promise<void>;
  abstract findMany(
    where?: Record<string, unknown>,
    skip?: number,
    take?: number,
  ): Promise<{ data: T[]; total: number }>;

  protected abstract mapToEntity(raw: unknown): T;
}
