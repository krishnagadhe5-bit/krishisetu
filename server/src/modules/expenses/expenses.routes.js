import { Router } from 'express';
import { ExpensesController } from './expenses.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/roles.js';

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('FARMER'), ExpensesController.createExpense);
router.get('/farm/:farmId', authorizeRoles('FARMER'), ExpensesController.getExpensesByFarm);
router.delete('/:id', authorizeRoles('FARMER'), ExpensesController.deleteExpense);

export default router;
