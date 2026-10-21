import { Router } from 'express';
import { SchemesController } from './schemes.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/roles.js';

const router = Router();

router.get('/', SchemesController.getSchemes);
router.get('/:id', SchemesController.getSchemeById);
router.post('/', authenticate, SchemesController.createScheme);

export default router;
