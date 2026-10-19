import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/roles.js';

const router = Router();

router.use(authenticate);

router.get('/farm/:farmId', authorizeRoles('FARMER', 'ADMIN'), AnalyticsController.getFinancials);
router.post('/simulate', authorizeRoles('FARMER', 'ADMIN'), AnalyticsController.simulateScenario);
router.get('/scenarios/:farmId', authorizeRoles('FARMER', 'ADMIN'), AnalyticsController.getScenarios);

export default router;
