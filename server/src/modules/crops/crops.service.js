import prisma from '../../config/db.js';

export class CropsService {
  static async getCropCatalog() {
    return prisma.crop.findMany({
      include: {
        varieties: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getCropById(id) {
    const crop = await prisma.crop.findUnique({
      where: { id },
      include: {
        varieties: true,
      },
    });
    if (!crop) {
      const err = new Error('Crop not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
    return crop;
  }

  static async createCropCycle(userId, data) {
    const { fieldId, cropId, varietyName, sowingDate, expectedHarvest, areaAcres, seedQuantityKg, seedCost, notes } = data;

    // Verify field ownership
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: { farm: true },
    });

    if (!field || field.farm.userId !== userId) {
      const err = new Error('Field not found or access denied');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    const cropCycle = await prisma.cropCycle.create({
      data: {
        fieldId,
        cropId,
        varietyName,
        sowingDate: sowingDate ? new Date(sowingDate) : new Date(),
        expectedHarvest: expectedHarvest ? new Date(expectedHarvest) : null,
        areaAcres,
        seedQuantityKg,
        seedCost,
        notes,
        status: 'GROWING',
        growthStage: 'VEGETATIVE',
      },
      include: {
        crop: true,
        field: { include: { farm: true } },
      },
    });

    // Automatically create a seed expense if seedCost is provided
    if (seedCost && Number(seedCost) > 0) {
      await prisma.expense.create({
        data: {
          farmId: field.farmId,
          cropCycleId: cropCycle.id,
          category: 'SEEDS',
          description: `Seed purchase for ${cropCycle.crop.name} (${varietyName || 'Standard'})`,
          amount: seedCost,
          quantity: seedQuantityKg,
          unit: 'kg',
          expenseDate: cropCycle.sowingDate || new Date(),
        },
      });
    }

    return cropCycle;
  }

  static async getCropCyclesByFarmer(userId) {
    return prisma.cropCycle.findMany({
      where: { field: { farm: { userId } } },
      include: {
        crop: true,
        field: { select: { id: true, name: true, farm: { select: { id: true, name: true, district: true } } } },
        activities: { orderBy: { activityDate: 'desc' }, take: 3 },
        harvests: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getCropCycleById(userId, cycleId) {
    const cycle = await prisma.cropCycle.findUnique({
      where: { id: cycleId },
      include: {
        crop: true,
        field: { include: { farm: true } },
        activities: { orderBy: { activityDate: 'desc' } },
        harvests: { orderBy: { harvestDate: 'desc' } },
        diseaseObs: { include: { analysis: true }, orderBy: { observedDate: 'desc' } },
      },
    });

    if (!cycle) {
      const err = new Error('Crop cycle not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    if (cycle.field.farm.userId !== userId) {
      const err = new Error('Access denied to this crop cycle');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    return cycle;
  }

  static async addActivity(userId, cycleId, data) {
    await this.getCropCycleById(userId, cycleId);

    const activity = await prisma.cropActivity.create({
      data: {
        cropCycleId: cycleId,
        activityType: data.activityType,
        activityDate: data.activityDate ? new Date(data.activityDate) : new Date(),
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        cost: data.cost,
        notes: data.notes,
      },
    });

    // If activity has an associated cost, log to expenses automatically
    if (data.cost && Number(data.cost) > 0) {
      const cycle = await prisma.cropCycle.findUnique({
        where: { id: cycleId },
        include: { field: true },
      });

      let category = 'OTHER';
      if (data.activityType === 'FERTILIZER') category = 'FERTILIZERS';
      if (data.activityType === 'IRRIGATION') category = 'IRRIGATION';
      if (data.activityType === 'PESTICIDE') category = 'CROP_PROTECTION';
      if (data.activityType === 'HARVESTING') category = 'LABOR';

      await prisma.expense.create({
        data: {
          farmId: cycle.field.farmId,
          cropCycleId: cycleId,
          category,
          description: `${data.activityType} activity: ${data.description || ''}`,
          amount: data.cost,
          quantity: data.quantity,
          unit: data.unit,
          expenseDate: activity.activityDate,
        },
      });
    }

    return activity;
  }

  static async recordHarvest(userId, cycleId, data) {
    const cycle = await this.getCropCycleById(userId, cycleId);

    const totalRevenue = data.pricePerKg && data.quantityKg
      ? Number(data.pricePerKg) * Number(data.quantityKg)
      : data.totalRevenue || 0;

    const harvest = await prisma.harvest.create({
      data: {
        cropCycleId: cycleId,
        harvestDate: data.harvestDate ? new Date(data.harvestDate) : new Date(),
        quantityKg: data.quantityKg,
        qualityGrade: data.qualityGrade,
        pricePerKg: data.pricePerKg,
        totalRevenue,
        buyerName: data.buyerName,
        notes: data.notes,
      },
    });

    // Update crop cycle status to HARVESTING or COMPLETED
    await prisma.cropCycle.update({
      where: { id: cycleId },
      data: {
        status: data.isFinalHarvest ? 'COMPLETED' : 'HARVESTING',
        actualHarvest: harvest.harvestDate,
        growthStage: 'HARVEST',
      },
    });

    return harvest;
  }
}
