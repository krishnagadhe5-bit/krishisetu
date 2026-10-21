import { Router } from 'express';
import { FarmsController } from './farms.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/roles.js';
import { validateRequest } from '../../middleware/validate.js';
import { createFarmSchema, updateFarmSchema } from './farms.validation.js';

const router = Router();

router.use(authenticate);

// Farmer dashboard overview
router.get('/dashboard', authorizeRoles('FARMER'), FarmsController.getDashboard);

// CRUD
router.post('/', authorizeRoles('FARMER'), validateRequest(createFarmSchema), FarmsController.createFarm);
router.get('/', authorizeRoles('FARMER'), FarmsController.getFarms);
router.get('/:id', authorizeRoles('FARMER'), FarmsController.getFarmById);
router.patch('/:id', authorizeRoles('FARMER'), validateRequest(updateFarmSchema), FarmsController.updateFarm);
router.delete('/:id', authorizeRoles('FARMER'), FarmsController.deleteFarm);

export default router;
