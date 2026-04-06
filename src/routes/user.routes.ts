import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { AuditService } from '../services/AuditService';
import { UserValidator } from '../validators/UserValidator';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { UserRole } from '../entities/enums';

const router = Router();

const userRepository = new UserRepository();
const auditLogRepository = new AuditLogRepository();
const auditService = new AuditService(auditLogRepository);
const userValidator = new UserValidator();
const userService = new UserService(userRepository, userValidator, auditService);
const userController = new UserController(userService);

// All user management routes require authentication + ADMIN role
router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/', userController.list);
router.get('/:id', userController.getOne);
router.patch('/:id', validate(UserValidator.updateSchema), userController.update);
router.delete('/:id', userController.deactivate);

export default router;
