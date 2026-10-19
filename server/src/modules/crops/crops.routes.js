import { Router } from 'express';
import { CropsController } from './crops.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/roles.js';

const router = Router();

// Public catalog
router.get('/catalog', CropsController.getCatalog);
router.get('/catalog/:id', CropsController.getCropById);

// Protected crop cycle routes
router.use(authenticate);

router.post('/cycles', authorizeRoles('FARMER', 'ADMIN'), CropsController.createCropCycle);
router.get('/cycles', authorizeRoles('FARMER', 'ADMIN', 'AGRICULTURE_EXPERT'), CropsController.getFarmerCycles);
router.get('/cycles/:id', authorizeRoles('FARMER', 'ADMIN', 'AGRICULTURE_EXPERT'), CropsController.getCropCycleById);
router.post('/cycles/:id/activities', authorizeRoles('FARMER', 'ADMIN'), CropsController.addActivity);
router.post('/cycles/:id/harvests', authorizeRoles('FARMER', 'ADMIN'), CropsController.recordHarvest);

export default router;
