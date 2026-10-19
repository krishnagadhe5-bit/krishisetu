import prisma from '../../config/db.js';

export class FieldsService {
  static async createField(userId, farmId, data) {
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      const err = new Error('Farm not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
    if (farm.userId !== userId) {
      const err = new Error('Access denied. Farm does not belong to you.');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    return prisma.field.create({
      data: {
        farmId,
        ...data,
      },
    });
  }

  static async getFieldsByFarm(userId, farmId) {
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm || farm.userId !== userId) {
      const err = new Error('Farm not found or access denied');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    return prisma.field.findMany({
      where: { farmId, isActive: true },
      include: {
        cropCycles: {
          where: { status: { not: 'COMPLETED' } },
          include: { crop: true },
        },
        soilTests: { orderBy: { testDate: 'desc' }, take: 1 },
      },
    });
  }

  static async getFieldById(userId, fieldId) {
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        farm: true,
        cropCycles: {
          include: {
            crop: true,
            activities: { orderBy: { activityDate: 'desc' } },
            harvests: true,
          },
        },
        soilTests: { orderBy: { testDate: 'desc' } },
      },
    });

    if (!field) {
      const err = new Error('Field not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    if (field.farm.userId !== userId) {
      const err = new Error('Access denied to this field');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    return field;
  }

  static async addSoilTest(userId, fieldId, data) {
    const field = await this.getFieldById(userId, fieldId);

    return prisma.soilTest.create({
      data: {
        fieldId,
        ...data,
      },
    });
  }
}
