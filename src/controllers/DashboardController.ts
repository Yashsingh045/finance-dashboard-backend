import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService';
import { TrendPeriod } from '../entities/enums';
import { BaseController } from './BaseController';

// src/controllers/DashboardController.ts
export class DashboardController extends BaseController {
  constructor(private readonly dashboardService: DashboardService) {
    super();
  }

  summary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const data = await this.dashboardService.getSummary(user.id, user);
      this.sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  categoryBreakdown = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const data = await this.dashboardService.getCategoryBreakdown(user.id, user);
      this.sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  trends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const period = (req.query['period'] as TrendPeriod) ?? TrendPeriod.MONTHLY;
      const data = await this.dashboardService.getTrends(user.id, user, period);
      this.sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  recentActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const limit = Math.min(50, parseInt((req.query['limit'] as string) ?? '10', 10));
      const data = await this.dashboardService.getRecentActivity(user.id, user, limit);
      this.sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };
}
