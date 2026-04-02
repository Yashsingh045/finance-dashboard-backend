import bcrypt from 'bcryptjs';
import { BaseEntity } from './BaseEntity';
import { UserRole, UserStatus } from './enums';

// src/entities/User.ts
// Domain entity for a user. hashedPassword is intentionally excluded from toJSON()
// so it can never leak into API responses.
export class User extends BaseEntity {
  private email: string;
  private hashedPassword: string;
  private name: string;
  private role: UserRole;
  private status: UserStatus;

  constructor(
    id: string,
    email: string,
    hashedPassword: string,
    name: string,
    role: UserRole,
    status: UserStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.hashedPassword = hashedPassword;
    this.name = name;
    this.role = role;
    this.status = status;
  }

  getEmail(): string {
    return this.email;
  }

  getRole(): UserRole {
    return this.role;
  }

  getStatus(): UserStatus {
    return this.status;
  }

  /**
   * Synchronously compare a plain-text password against the stored hash.
   * Using bcryptjs.compareSync here because the entity is a pure domain object;
   * async comparison is done in AuthService which controls IO.
   */
  validatePassword(plain: string): boolean {
    return bcrypt.compareSync(plain, this.hashedPassword);
  }

  validate(): boolean {
    return (
      typeof this.email === 'string' &&
      this.email.includes('@') &&
      typeof this.name === 'string' &&
      this.name.length >= 2 &&
      Object.values(UserRole).includes(this.role) &&
      Object.values(UserStatus).includes(this.status)
    );
  }

  /** hashedPassword is intentionally omitted — never expose it in responses. */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
