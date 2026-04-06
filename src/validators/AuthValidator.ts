import { z } from 'zod';
import { BaseValidator } from './BaseValidator';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(100).trim(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export class AuthValidator extends BaseValidator {
  validateRegister(data: unknown): RegisterInput {
    return this.validate(registerSchema, data);
  }

  validateLogin(data: unknown): LoginInput {
    return this.validate(loginSchema, data);
  }

  // Expose schemas for use in middleware validate() calls
  static get registerSchema() {
    return registerSchema;
  }

  static get loginSchema() {
    return loginSchema;
  }
}
