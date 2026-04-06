import { Request, Response, NextFunction } from 'express';
import { AuthenticationException } from '../exceptions/AuthenticationException';
import { UserStatus } from '../entities/enums';
import { JwtPayload } from '../services/AuthService';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { AuthValidator } from '../validators/AuthValidator';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { AuditService } from '../services/AuditService';

// Extend Express Request to include the authenticated user payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Lazy-initialise a shared AuthService instance (avoids circular deps in tests)
let _authService: AuthService | null = null;
function getAuthService(): AuthService {
  if (!_authService) {
    const userRepo = new UserRepository();
    const auditRepo = new AuditLogRepository();
    const auditService = new AuditService(auditRepo);
    _authService = new AuthService(userRepo, new AuthValidator(), auditService);
  }
  return _authService;
}

// Verifies the JWT and attaches req.user. Throws AuthenticationException on failure.
// Downstream middleware and controllers always read req.user — they never re-parse tokens.
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationException('Authorization header missing or malformed');
    }

    const token = authHeader.slice(7); // Strip "Bearer "
    const authService = getAuthService();
    const payload = authService.verifyToken(token);

    // Guard: only ACTIVE users may pass. Inactive/suspended users are rejected here.
    if (payload.status !== UserStatus.ACTIVE) {
      throw new AuthenticationException('Account is not active');
    }

    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};
