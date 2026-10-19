import { Router } from 'express';
import { FarmsController } from './farms.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/roles.js';
import { validateRequest } from '../../middleware/validate.js';
import { createFarmSchema, updateFarmSchema } from './farms.validation.js';

const router = Router();

router.use(authenticate);

// Farmer dashboard overview
router.get('/dashboard', authorizeRoles('FARMER', 'ADMIN'), FarmsController.getDashboard);

// CRUD
router.post('/', authorizeRoles('FARMER', 'ADMIN'), validateRequest(createFarmSchema), FarmsController.createFarm);
router.get('/', authorizeRoles('FARMER', 'ADMIN'), FarmsController.getFarms);
router.get('/:id', authorizeRoles('FARMER', 'ADMIN', 'AGRICULTURE_EXPERT'), FarmsController.getFarmById);
router.patch('/:id', authorizeRoles('FARMER', 'ADMIN'), validateRequest(updateFarmSchema), FarmsController.updateFarm);
router.delete('/:id', authorizeRoles('FARMER', 'ADMIN'), FarmsController.deleteFarm);

export default router;
