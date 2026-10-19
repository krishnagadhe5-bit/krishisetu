import { ExpensesService } from './expenses.service.js';
import { apiSuccess } from '../../utils/response.js';

export class ExpensesController {
  static async createExpense(req, res, next) {
    try {
      const expense = await ExpensesService.createExpense(req.user.id, req.body);
      return apiSuccess(res, expense, 'Expense recorded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getExpensesByFarm(req, res, next) {
    try {
      const expenses = await ExpensesService.getExpensesByFarm(req.user.id, req.params.farmId, req.query);
      return apiSuccess(res, expenses, 'Farm expenses retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async deleteExpense(req, res, next) {
    try {
      await ExpensesService.deleteExpense(req.user.id, req.params.id);
      return apiSuccess(res, null, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
