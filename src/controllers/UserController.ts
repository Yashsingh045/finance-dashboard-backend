import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { BaseController } from './BaseController';

// src/controllers/UserController.ts
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super();
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = this.getPagination(req.query as Record<string, string>);
      const result = await this.userService.getAllUsers(page, limit);
      this.sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params['id']!);
      this.sendSuccess(res, { user: user.toJSON() });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorUser = req.user!;
      const updated = await this.userService.updateUser(req.params['id']!, req.body, actorUser);
      this.sendSuccess(res, { user: updated.toJSON() });
    } catch (err) {
      next(err);
    }
  };

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
