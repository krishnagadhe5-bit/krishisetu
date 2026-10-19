import { Router } from 'express';
import { ShipmentsController } from './shipments.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/order/:orderId', ShipmentsController.getShipmentByOrder);
router.patch('/:id', ShipmentsController.updateShipment);
router.post('/plan-route', ShipmentsController.planRoute);

export default router;
