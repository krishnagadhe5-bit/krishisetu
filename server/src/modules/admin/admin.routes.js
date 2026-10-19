import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/roles.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/analytics', AdminController.getAnalytics);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.patch('/experts/:expertId/verify', AdminController.verifyExpert);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
