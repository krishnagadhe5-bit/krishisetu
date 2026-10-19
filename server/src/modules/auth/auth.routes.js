import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.getMe);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), AuthController.resetPassword);
router.post('/logout', authenticate, AuthController.logout);

export default router;
