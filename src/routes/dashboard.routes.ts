import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { DashboardService } from '../services/DashboardService';
import { RecordRepository } from '../repositories/RecordRepository';
import { authenticate } from '../middleware/authenticate';

const router = Router();

const recordRepository = new RecordRepository();
const dashboardService = new DashboardService(recordRepository);
const dashboardController = new DashboardController(dashboardService);

// All dashboard endpoints require authentication only — role filtering is inside the service
router.use(authenticate);

router.get('/summary', dashboardController.summary);
router.get('/category-breakdown', dashboardController.categoryBreakdown);
router.get('/trends', dashboardController.trends);
router.get('/recent-activity', dashboardController.recentActivity);

export default router;
