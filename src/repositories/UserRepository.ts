import { PrismaClient } from '@prisma/client';
import { User } from '../entities/User';
import { UserRole, UserStatus } from '../entities/enums';
import { prisma } from '../utils/prisma';
import { BaseRepository } from './BaseRepository';

// Shape coming back from Prisma for the User model
interface PrismaUser {
  id: string;
  email: string;
  hashedPassword: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepository extends BaseRepository<User> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  async create(data: unknown): Promise<User> {
    const d = data as Omit<PrismaUser, 'id' | 'createdAt' | 'updatedAt'>;
    const raw = await this.prisma.user.create({ data: d as Parameters<typeof this.prisma.user.create>[0]['data'] });
    return this.mapToEntity(raw);
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw ? this.mapToEntity(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? this.mapToEntity(raw) : null;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ where: { role } });
    return rows.map((r) => this.mapToEntity(r));
  }

  async findActiveUsers(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      where: { status: UserStatus.ACTIVE },
    });
    return rows.map((r) => this.mapToEntity(r));
  }

  async findAll(filters?: Record<string, unknown>): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ where: filters ?? {} });
    return rows.map((r) => this.mapToEntity(r));
  }

  async update(id: string, data: Partial<unknown>): Promise<User> {
    const raw = await this.prisma.user.update({
      where: { id },
      data: data as Parameters<typeof this.prisma.user.update>[0]['data'],
    });
    return this.mapToEntity(raw);
  }

  /** Soft-delete: sets status to INACTIVE — never removes the DB row. */
  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
    });
  }

  async findMany(
    where?: Record<string, unknown>,
    skip = 0,
    take = 20,
  ): Promise<{ data: User[]; total: number }> {
    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({ where: where ?? {}, skip, take }),
      this.prisma.user.count({ where: where ?? {} }),
    ]);
    return { data: rows.map((r) => this.mapToEntity(r)), total };
  }

  protected mapToEntity(raw: unknown): User {
    const r = raw as PrismaUser;
    return new User(
      r.id,
      r.email,
      r.hashedPassword,
      r.name,
      r.role as UserRole,
      r.status as UserStatus,
      r.createdAt,
      r.updatedAt,
    );
  }
}
