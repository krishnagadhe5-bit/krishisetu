import prisma from '../../config/db.js';

export class FarmsService {
  static async createFarm(userId, data) {
    const farm = await prisma.farm.create({
      data: {
        userId,
        ...data,
      },
      include: {
        fields: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_FARM',
        resource: 'Farm',
        resourceId: farm.id,
      },
    });

    return farm;
  }

  static async getFarms(userId, includeArchived = false) {
    return prisma.farm.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { isArchived: false }),
      },
      include: {
        fields: {
          include: {
            cropCycles: {
              where: { status: { not: 'COMPLETED' } },
              include: { crop: true },
            },
          },
        },
        _count: {
          select: { fields: true, expenses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getFarmById(userId, farmId) {
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      include: {
        fields: {
          include: {
            cropCycles: {
              include: {
                crop: true,
                activities: { orderBy: { activityDate: 'desc' }, take: 5 },
                harvests: true,
              },
            },
            soilTests: { orderBy: { testDate: 'desc' }, take: 3 },
          },
        },
        expenses: {
          orderBy: { expenseDate: 'desc' },
          take: 10,
        },
        weatherObs: {
          orderBy: { observedAt: 'desc' },
          take: 5,
        },
        irrigationRecs: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    if (!farm) {
      const err = new Error('Farm not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    if (farm.userId !== userId) {
      const err = new Error('Access denied. You do not own this farm.');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    return farm;
  }

  static async updateFarm(userId, farmId, data) {
    // Ownership check
    await this.getFarmById(userId, farmId);

    const updated = await prisma.farm.update({
      where: { id: farmId },
      data,
    });

    return updated;
  }

  static async deleteFarm(userId, farmId) {
    // Soft delete / archive
    await this.getFarmById(userId, farmId);

    return prisma.farm.update({
      where: { id: farmId },
      data: { isArchived: true },
    });
  }

  static async getFarmerDashboard(userId) {
    // 1. Farms count
    const totalFarms = await prisma.farm.count({
      where: { userId, isArchived: false },
    });

    // 2. Fields count
    const totalFields = await prisma.field.count({
      where: { farm: { userId, isArchived: false }, isActive: true },
    });

    // 3. Active crop cycles
    const activeCropCycles = await prisma.cropCycle.findMany({
      where: {
        field: { farm: { userId, isArchived: false } },
        status: { in: ['PLANNING', 'SOWING', 'GROWING', 'FLOWERING', 'HARVESTING'] },
      },
      include: {
        crop: true,
        field: { select: { name: true, farm: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Recent expenses & total expense sum
    const recentExpenses = await prisma.expense.findMany({
      where: { farm: { userId, isArchived: false } },
      orderBy: { expenseDate: 'desc' },
      take: 5,
      include: { farm: { select: { name: true } } },
    });

    const expenseAggregate = await prisma.expense.aggregate({
      where: { farm: { userId, isArchived: false } },
      _sum: { amount: true },
    });

    // 5. Total harvested quantity & revenue
    const harvestAggregate = await prisma.harvest.aggregate({
      where: { cropCycle: { field: { farm: { userId } } } },
      _sum: { quantityKg: true, totalRevenue: true },
    });

    // 6. Active marketplace listings
    const activeListings = await prisma.cropListing.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { crop: true },
      take: 5,
    });

    // 7. Active orders as seller
    const recentOrders = await prisma.order.findMany({
      where: { sellerId: userId },
      include: {
        buyer: { select: { profile: { select: { fullName: true } } } },
        items: { include: { listing: { include: { crop: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 8. Recent disease observations
    const recentDiseases = await prisma.diseaseObservation.findMany({
      where: { cropCycle: { field: { farm: { userId } } } },
      include: {
        analysis: true,
        cropCycle: { include: { crop: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    return {
      metrics: {
        totalFarms,
        totalFields,
        activeCropCyclesCount: activeCropCycles.length,
        totalExpenses: Number(expenseAggregate._sum.amount || 0),
        totalHarvestKg: Number(harvestAggregate._sum.quantityKg || 0),
        totalHarvestRevenue: Number(harvestAggregate._sum.totalRevenue || 0),
        activeListingsCount: activeListings.length,
      },
      activeCropCycles,
      recentExpenses,
      activeListings,
      recentOrders,
      recentDiseases,
    };
  }
}
