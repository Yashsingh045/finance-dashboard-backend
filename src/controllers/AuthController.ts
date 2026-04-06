import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuditAction } from '../entities/enums';
import { BaseController } from './BaseController';

export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Register a new user account
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password, name]
   *             properties:
   *               email: { type: string, format: email }
   *               password: { type: string, minLength: 8 }
   *               name: { type: string, minLength: 2 }
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Validation error
   *       409:
   *         description: Email already exists
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = req.body as { email: string; password: string; name: string };
      const result = await this.authService.register(email, password, name);
      this.sendCreated(res, result);
    } catch (err) {
      next(err);
    }
  };

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Login with email and password
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email: { type: string, format: email }
   *               password: { type: string }
   *     responses:
   *       200:
   *         description: Login successful, returns JWT token
   *       400:
   *         description: Validation error
   *       401:
   *         description: Invalid credentials or inactive account
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const result = await this.authService.login(email, password);
      this.sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     tags: [Auth]
   *     summary: Logout (client-side token discard)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logged out successfully
   *       401:
   *         description: Not authenticated
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // JWT logout is client-side token discard — no server-side blacklist.
      // Audit the event for compliance.
      this.sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  };
}
