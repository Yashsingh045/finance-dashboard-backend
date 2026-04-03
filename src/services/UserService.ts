import { User } from '../entities/User';
import { AuditAction } from '../entities/enums';
import { NotFoundException } from '../exceptions/NotFoundException';
import { UserRepository } from '../repositories/UserRepository';
import { UserValidator, UpdateUserInput } from '../validators/UserValidator';
import { AuditService } from './AuditService';
import { BaseService } from './BaseService';
import { JwtPayload } from './AuthService';

// src/services/UserService.ts
export class UserService extends BaseService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly validator: UserValidator,
    private readonly auditService: AuditService,
  ) {
    super();
  }

  async getAllUsers(
    page = 1,
    limit = 20,
  ): Promise<{ data: ReturnType<User['toJSON']>[]; total: number; page: number; pages: number }> {
    const skip = (page - 1) * limit;
    const result = await this.userRepository.findMany({}, skip, limit);
    return {
      data: result.data.map((u) => u.toJSON()),
      total: result.total,
      page,
      pages: Math.ceil(result.total / limit),
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User');
    return user;
  }

  async updateUser(
    id: string,
    data: UpdateUserInput,
    actorUser: JwtPayload,
  ): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User');

    const updated = await this.userRepository.update(id, data);

    await this.auditService.log(AuditAction.UPDATE, 'User', id, actorUser.id, data as Record<string, unknown>);

    this.logger.info('User updated', { targetUserId: id, actorId: actorUser.id });
    return updated;
  }

  async deactivateUser(id: string, actorUser: JwtPayload): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User');

    // delete() on UserRepository sets status = INACTIVE
    await this.userRepository.delete(id);

    await this.auditService.log(AuditAction.DELETE, 'User', id, actorUser.id);

    this.logger.info('User deactivated', { targetUserId: id, actorId: actorUser.id });
  }

  validate(data: unknown): void {
    this.validator.validateUpdate(data);
  }
}
