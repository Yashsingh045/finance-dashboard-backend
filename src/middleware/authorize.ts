import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../entities/enums';
import { AuthorizationException } from '../exceptions/AuthorizationException';
import { AuthenticationException } from '../exceptions/AuthenticationException';

// Factory middleware: authorize(ANALYST, ADMIN) returns a middleware that
// checks req.user.role is in the provided list.
// Must run AFTER authenticate — req.user is expected to already be populated.
export const authorize = (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationException('Not authenticated');
      }

      if (!roles.includes(req.user.role as UserRole)) {
        throw new AuthorizationException(
          `Role '${req.user.role}' is not permitted. Required: ${roles.join(', ')}`,
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
