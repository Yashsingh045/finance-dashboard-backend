import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService';
import { TrendPeriod } from '../entities/enums';
import { BaseController } from './BaseController';

export class DashboardController extends BaseController {
  constructor(private readonly dashboardService: DashboardService) {
    super();
  }

  /**
   * @swagger
   * /api/dashboard/summary:
   *   get:
   *     tags: [Dashboard]
   *     summary: Get dashboard summary (totals & averages)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200: { description: Summary statistics }
   *       401: { description: Not authenticated }
   */
  summary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const data = await this.dashboardService.getSummary(user.id, user);
      this.sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  /**
   * @swagger
   * /api/dashboard/category-breakdown:
   *   get:
   *     tags: [Dashboard]
   *     summary: Get record amounts grouped by category
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200: { description: Category breakdown data }
   *       401: { description: Not authenticated }
   */
  categoryBreakdown = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const data = await this.dashboardService.getCategoryBreakdown(user.id, user);
      this.sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  /**
   * @swagger
   * /api/dashboard/trends:
   *   get:
   *     tags: [Dashboard]
   *     summary: Get income/expense trends over time
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: period
   *         schema: { type: string, enum: [WEEKLY, MONTHLY, YEARLY], default: MONTHLY }
   *     responses:
   *       200: { description: Trend data series }
   *       401: { description: Not authenticated }
   */
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

  /**
   * @swagger
   * /api/dashboard/recent-activity:
   *   get:
   *     tags: [Dashboard]
   *     summary: Get latest records
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 10, maximum: 50 }
   *     responses:
   *       200: { description: List of latest records }
   *       401: { description: Not authenticated }
   */
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
