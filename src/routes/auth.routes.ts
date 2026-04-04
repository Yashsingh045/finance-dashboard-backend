import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { AuthValidator } from '../validators/AuthValidator';
import { UserRepository } from '../repositories/UserRepository';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { AuditService } from '../services/AuditService';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';

// src/routes/auth.routes.ts
const router = Router();

// Wire up dependencies
const userRepository = new UserRepository();
const auditLogRepository = new AuditLogRepository();
const auditService = new AuditService(auditLogRepository);
const authValidator = new AuthValidator();
const authService = new AuthService(userRepository, authValidator, auditService);
const authController = new AuthController(authService);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

router.post('/register', validate(AuthValidator.registerSchema), authController.register);
router.post('/login', validate(AuthValidator.loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);

export default router;
