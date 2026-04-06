import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AuditAction, UserRole, UserStatus } from '../entities/enums';
import { AuthenticationException } from '../exceptions/AuthenticationException';
import { ConflictException } from '../exceptions/ConflictException';
import { UserRepository } from '../repositories/UserRepository';
import { AuthValidator } from '../validators/AuthValidator';
import { AuditService } from './AuditService';
import { BaseService } from './BaseService';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  iat?: number;
  exp?: number;
}

export interface UserWithToken {
  user: ReturnType<User['toJSON']>;
  token: string;
}

export class AuthService extends BaseService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly validator: AuthValidator,
    private readonly auditService: AuditService,
  ) {
    super();
  }

  async register(email: string, password: string, name: string): Promise<UserWithToken> {
    // Check for duplicate email before hashing (faster fail)
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await this.userRepository.create({
      email,
      hashedPassword,
      name,
      role: UserRole.VIEWER, // New registrations always start as VIEWER
      status: UserStatus.ACTIVE,
    });

    const token = this.signToken(user);

    await this.auditService.log(AuditAction.LOGIN, 'User', user.getId(), user.getId(), {
      event: 'register',
    });

    this.logger.info('User registered', { userId: user.getId(), email });
    return { user: user.toJSON(), token };
  }

  async login(email: string, password: string): Promise<UserWithToken> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationException('Invalid email or password');
    }

    if (user.getStatus() !== UserStatus.ACTIVE) {
      throw new AuthenticationException('Account is not active');
    }

    const passwordValid = user.validatePassword(password);
    if (!passwordValid) {
      throw new AuthenticationException('Invalid email or password');
    }

    const token = this.signToken(user);

    await this.auditService.log(AuditAction.LOGIN, 'User', user.getId(), user.getId());

    this.logger.info('User logged in', { userId: user.getId(), email });
    return { user: user.toJSON(), token };
  }

  verifyToken(token: string): JwtPayload {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');

    try {
      return jwt.verify(token, secret) as JwtPayload;
    } catch {
      throw new AuthenticationException('Invalid or expired token');
    }
  }

  private signToken(user: User): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');

    const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'];

    const payload: JwtPayload = {
      id: user.getId(),
      email: user.getEmail(),
      role: user.getRole(),
      status: user.getStatus(),
    };

    return jwt.sign(payload, secret, { expiresIn });
  }

  validate(data: unknown): void {
    this.validator.validateLogin(data);
  }
}
