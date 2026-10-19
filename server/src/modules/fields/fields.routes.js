import { Router } from 'express';
import { FieldsController } from './fields.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/roles.js';

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('FARMER', 'ADMIN'), FieldsController.createField);
router.get('/farm/:farmId', authorizeRoles('FARMER', 'ADMIN', 'AGRICULTURE_EXPERT'), FieldsController.getFieldsByFarm);
router.get('/:id', authorizeRoles('FARMER', 'ADMIN', 'AGRICULTURE_EXPERT'), FieldsController.getFieldById);
router.post('/:id/soil-tests', authorizeRoles('FARMER', 'ADMIN'), FieldsController.addSoilTest);

export default router;
