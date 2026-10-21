import { Router } from 'express';
import { FieldsController } from './fields.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/roles.js';

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('FARMER'), FieldsController.createField);
router.get('/farm/:farmId', authorizeRoles('FARMER'), FieldsController.getFieldsByFarm);
router.get('/:id', authorizeRoles('FARMER'), FieldsController.getFieldById);
router.post('/:id/soil-tests', authorizeRoles('FARMER'), FieldsController.addSoilTest);

export default router;
