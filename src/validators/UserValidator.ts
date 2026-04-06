import { z } from 'zod';
import { UserRole, UserStatus } from '../entities/enums';
import { BaseValidator } from './BaseValidator';

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export class UserValidator extends BaseValidator {
  validateUpdate(data: unknown): UpdateUserInput {
    return this.validate(updateUserSchema, data);
  }

  // Expose schema for middleware validate() calls
  static get updateSchema() {
    return updateUserSchema;
  }
}
