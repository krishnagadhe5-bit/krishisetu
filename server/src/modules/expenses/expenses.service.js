import prisma from '../../config/db.js';

export class ExpensesService {
  static async createExpense(userId, data) {
    const { farmId, cropCycleId, category, description, amount, quantity, unit, expenseDate, vendor, notes } = data;

    // Verify farm ownership
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm || farm.userId !== userId) {
      const err = new Error('Farm not found or access denied');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    return prisma.expense.create({
      data: {
        farmId,
        cropCycleId,
        category,
        description,
        amount,
        quantity,
        unit,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        vendor,
        notes,
      },
    });
  }

  static async getExpensesByFarm(userId, farmId, query = {}) {
    const { category, startDate, endDate } = query;

    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm || farm.userId !== userId) {
      const err = new Error('Farm not found or access denied');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    return prisma.expense.findMany({
      where: {
        farmId,
        ...(category && { category }),
        ...(startDate || endDate
          ? {
              expenseDate: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
              },
            }
          : {}),
      },
      orderBy: { expenseDate: 'desc' },
    });
  }

  static async deleteExpense(userId, expenseId) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { farm: true },
    });

    if (!expense || expense.farm.userId !== userId) {
      const err = new Error('Expense not found or access denied');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    return prisma.expense.delete({ where: { id: expenseId } });
  }
}
