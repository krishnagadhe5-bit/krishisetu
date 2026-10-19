import { Router } from 'express';
import { OrdersController } from './orders.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/roles.js';

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('BUYER', 'ADMIN'), OrdersController.createOrder);
router.get('/', OrdersController.getOrders);
router.get('/:id', OrdersController.getOrderById);
router.patch('/:id/status', OrdersController.updateStatus);

export default router;
