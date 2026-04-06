import { Router } from 'express';
import { RecordController } from '../controllers/RecordController';
import { RecordService } from '../services/RecordService';
import { RecordRepository } from '../repositories/RecordRepository';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { AuditService } from '../services/AuditService';
import { RecordValidator } from '../validators/RecordValidator';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { UserRole } from '../entities/enums';

const router = Router();

const recordRepository = new RecordRepository();
const auditLogRepository = new AuditLogRepository();
const auditService = new AuditService(auditLogRepository);
const recordValidator = new RecordValidator();
const recordService = new RecordService(recordRepository, recordValidator, auditService);
const recordController = new RecordController(recordService);

// Middleware: authenticate → authorize → validate → controller
router.post(
  '/',
  authenticate,
  authorize(UserRole.ANALYST, UserRole.ADMIN),
  validate(RecordValidator.createSchema),
  recordController.create,
);

router.get('/', authenticate, recordController.list);

router.get('/:id', authenticate, recordController.getOne);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ANALYST, UserRole.ADMIN),
  validate(RecordValidator.updateSchema),
  recordController.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  recordController.remove,
);

export default router;
