import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../entities/enums';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { AuditService } from '../services/AuditService';
import { BaseController } from '../controllers/BaseController';

import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import recordRoutes from './record.routes';
import dashboardRoutes from './dashboard.routes';

// Mounts all sub-routers under /api and adds the audit-logs endpoint here
// since it doesn't warrant its own controller (simple paginated list).

class AuditController extends BaseController {
  private readonly auditService: AuditService;

  constructor() {
    super();
    this.auditService = new AuditService(new AuditLogRepository());
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, skip } = this.getPagination(req.query as Record<string, string>);
      const result = await this.auditService.getLogs({}, skip, limit);
      this.sendSuccess(res, { ...result, page, pages: Math.ceil(result.total / limit) });
    } catch (err) {
      next(err);
    }
  };
}

const router = Router();
const auditController = new AuditController();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/records', recordRoutes);
router.use('/dashboard', dashboardRoutes);

// Audit logs: admin only
router.get(
  '/audit-logs',
  authenticate,
  authorize(UserRole.ADMIN),
  auditController.list,
);

export default router;
