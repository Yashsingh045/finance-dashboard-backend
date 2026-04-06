import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { BaseController } from './BaseController';

export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super();
  }

  /**
   * @swagger
   * /api/users:
   *   get:
   *     tags: [Users]
   *     summary: List all users (Admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20 }
   *     responses:
   *       200: { description: List of users }
   *       401: { description: Not authenticated }
   *       403: { description: Insufficient permissions }
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = this.getPagination(req.query as Record<string, string>);
      const result = await this.userService.getAllUsers(page, limit);
      this.sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     tags: [Users]
   *     summary: Get a user by ID (Admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200: { description: User details }
   *       401: { description: Not authenticated }
   *       403: { description: Insufficient permissions }
   *       404: { description: User not found }
   */
  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params['id']!);
      this.sendSuccess(res, { user: user.toJSON() });
    } catch (err) {
      next(err);
    }
  };

  /**
   * @swagger
   * /api/users/{id}:
   *   patch:
   *     tags: [Users]
   *     summary: Update a user (Admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               role: { type: string, enum: [VIEWER, ANALYST, ADMIN] }
   *               status: { type: string, enum: [ACTIVE, INACTIVE, SUSPENDED] }
   *     responses:
   *       200: { description: User updated }
   *       401: { description: Not authenticated }
   *       403: { description: Insufficient permissions }
   *       404: { description: User not found }
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorUser = req.user!;
      const updated = await this.userService.updateUser(req.params['id']!, req.body, actorUser);
      this.sendSuccess(res, { user: updated.toJSON() });
    } catch (err) {
      next(err);
    }
  };

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     tags: [Users]
   *     summary: Deactivate a user (Admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200: { description: User deactivated }
   *       401: { description: Not authenticated }
   *       403: { description: Insufficient permissions }
   *       404: { description: User not found }
   */
  deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorUser = req.user!;
      await this.userService.deactivateUser(req.params['id']!, actorUser);
      this.sendSuccess(res, { message: 'User deactivated successfully' });
    } catch (err) {
      next(err);
    }
  };
}
