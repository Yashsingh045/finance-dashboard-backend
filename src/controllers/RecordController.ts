import { Request, Response, NextFunction } from 'express';
import { RecordService, RecordFilters } from '../services/RecordService';
import { Category, RecordType } from '../entities/enums';
import { BaseController } from './BaseController';

// src/controllers/RecordController.ts
export class RecordController extends BaseController {
  constructor(private readonly recordService: RecordService) {
    super();
  }

  /**
   * @swagger
   * /api/records:
   *   post:
   *     tags: [Records]
   *     summary: Create a financial record
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [type, amount, category, date]
   *             properties:
   *               type: { type: string, enum: [INCOME, EXPENSE] }
   *               amount: { type: number, minimum: 0.01 }
   *               category: { type: string }
   *               date: { type: string, format: date-time }
   *               description: { type: string }
   *     responses:
   *       201: { description: Record created }
   *       400: { description: Validation error }
   *       401: { description: Not authenticated }
   *       403: { description: Insufficient permissions }
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const record = await this.recordService.createRecord(user.id, user, req.body);
      this.sendCreated(res, { record: record.toJSON() });
    } catch (err) {
      next(err);
    }
  };

  /**
   * @swagger
   * /api/records:
   *   get:
   *     tags: [Records]
   *     summary: List records (role-filtered)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20 }
   *       - in: query
   *         name: category
   *         schema: { type: string }
   *       - in: query
   *         name: type
   *         schema: { type: string, enum: [INCOME, EXPENSE] }
   *       - in: query
   *         name: startDate
   *         schema: { type: string, format: date-time }
   *       - in: query
   *         name: endDate
   *         schema: { type: string, format: date-time }
   *     responses:
   *       200: { description: Paginated records list }
   *       401: { description: Not authenticated }
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const { page, limit } = this.getPagination(req.query as Record<string, string>);

      const filters: RecordFilters = {
        page,
        limit,
        category: req.query['category'] as Category | undefined,
        type: req.query['type'] as RecordType | undefined,
        startDate: req.query['startDate'] as string | undefined,
        endDate: req.query['endDate'] as string | undefined,
      };

      const result = await this.recordService.getRecords(user.id, user, filters);
      this.sendSuccess(res, { records: result.data, total: result.total, page: result.page, pages: result.pages });
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const record = await this.recordService.getRecordById(req.params['id']!, user);
      this.sendSuccess(res, { record: record.toJSON() });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const record = await this.recordService.updateRecord(
        req.params['id']!,
        user.id,
        user,
        req.body,
      );
      this.sendSuccess(res, { record: record.toJSON() });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      await this.recordService.deleteRecord(req.params['id']!, user);
      this.sendSuccess(res, {});
    } catch (err) {
      next(err);
    }
  };
}
