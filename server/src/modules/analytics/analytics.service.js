import prisma from '../../config/db.js';

export class AnalyticsService {
  static async getFarmFinancials(userId, farmId) {
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      include: {
        fields: {
          include: {
            cropCycles: {
              include: {
                crop: true,
                harvests: true,
              },
            },
          },
        },
      },
    });

    if (!farm || farm.userId !== userId) {
      const err = new Error('Farm not found or access denied');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    // 1. Group expenses by category
    const expensesByCategory = await prisma.expense.groupBy({
      by: ['category'],
      where: { farmId },
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalExpense = expensesByCategory.reduce(
      (sum, item) => sum + Number(item._sum.amount || 0),
      0
    );

    // 2. Total harvest revenue & total produce quantity
    const harvests = await prisma.harvest.findMany({
      where: { cropCycle: { field: { farmId } } },
    });

    const totalRevenue = harvests.reduce(
      (sum, h) => sum + Number(h.totalRevenue || 0),
      0
    );

    const totalHarvestKg = harvests.reduce(
      (sum, h) => sum + Number(h.quantityKg || 0),
      0
    );

    const netProfit = totalRevenue - totalExpense;
    const farmAcres = Number(farm.areaAcres) || 1.0;
    const costPerAcre = Number((totalExpense / farmAcres).toFixed(2));
    const costPerKg = totalHarvestKg > 0 ? Number((totalExpense / totalHarvestKg).toFixed(2)) : 0;
    const profitMarginPct = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;

    // 3. Crop-wise comparison
    const cropPerformance = [];
    for (const field of farm.fields) {
      for (const cycle of field.cropCycles) {
        const cycleRevenue = cycle.harvests.reduce((sum, h) => sum + Number(h.totalRevenue || 0), 0);
        const cycleKg = cycle.harvests.reduce((sum, h) => sum + Number(h.quantityKg || 0), 0);
        const cycleArea = Number(cycle.areaAcres) || 1;

        cropPerformance.push({
          cropName: cycle.crop.name,
          fieldName: field.name,
          cycleId: cycle.id,
          status: cycle.status,
          areaAcres: cycleArea,
          revenueInr: cycleRevenue,
          harvestKg: cycleKg,
          revenuePerAcre: Math.round(cycleRevenue / cycleArea),
        });
      }
    }

    return {
      farm: {
        id: farm.id,
        name: farm.name,
        district: farm.district,
        areaAcres: farm.areaAcres,
      },
      summary: {
        totalExpense,
        totalRevenue,
        netProfit,
        profitMarginPct,
        costPerAcre,
        costPerKg,
        totalHarvestKg,
      },
      expensesByCategory: expensesByCategory.map((c) => ({
        category: c.category,
        amount: Number(c._sum.amount || 0),
        count: c._count.id,
        percentage: totalExpense > 0 ? Number(((Number(c._sum.amount) / totalExpense) * 100).toFixed(1)) : 0,
      })),
      cropPerformance,
      dataTimestamp: new Date().toISOString(),
    };
  }

  static async simulateScenario(userId, data) {
    const { farmId, title, cropChoice, rainfallScenario, costInflationPct = 0, marketPriceShockPct = 0 } = data;

    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm || farm.userId !== userId) {
      const err = new Error('Farm not found or access denied');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    const farmArea = Number(farm.areaAcres) || 3.0;

    // Agronomic production parameters based on Maharashtra universities (MPKV / VNMKV)
    const cropBaselines = {
      'Cotton (कापूस)': { baseCostPerAcre: 28000, baseYieldKgPerAcre: 850, basePricePerKg: 72 },
      'Soybean (सोयाबीन)': { baseCostPerAcre: 18000, baseYieldKgPerAcre: 950, basePricePerKg: 46 },
      'Onion (कांदा)': { baseCostPerAcre: 42000, baseYieldKgPerAcre: 7500, basePricePerKg: 18 },
      'Sugarcane (ऊस)': { baseCostPerAcre: 65000, baseYieldKgPerAcre: 38000, basePricePerKg: 3.1 },
      'Pigeon Pea / Tur (तूर)': { baseCostPerAcre: 16000, baseYieldKgPerAcre: 650, basePricePerKg: 95 },
      'Wheat (गहू)': { baseCostPerAcre: 20000, baseYieldKgPerAcre: 1500, basePricePerKg: 28 },
    };

    const baseline = cropBaselines[cropChoice] || { baseCostPerAcre: 22000, baseYieldKgPerAcre: 1000, basePricePerKg: 40 };

    // Rainfall impact factor on yield
    let rainfallYieldMultiplier = 1.0;
    if (rainfallScenario === 'deficient_20') rainfallYieldMultiplier = 0.82;
    if (rainfallScenario === 'drought') rainfallYieldMultiplier = 0.55;
    if (rainfallScenario === 'excess_20') rainfallYieldMultiplier = 0.90; // potential waterlogging

    // Cost inflation multiplier
    const costMultiplier = 1 + (Number(costInflationPct) / 100);

    // Market price shock multiplier
    const priceMultiplier = 1 + (Number(marketPriceShockPct) / 100);

    const projectedCost = Math.round(baseline.baseCostPerAcre * farmArea * costMultiplier);
    const projectedYieldKg = Math.round(baseline.baseYieldKgPerAcre * farmArea * rainfallYieldMultiplier);
    const projectedPricePerKg = baseline.basePricePerKg * priceMultiplier;
    const projectedRevenue = Math.round(projectedYieldKg * projectedPricePerKg);
    const projectedProfit = projectedRevenue - projectedCost;

    // Baseline (normal conditions without shocks)
    const baseCost = baseline.baseCostPerAcre * farmArea;
    const baseYield = baseline.baseYieldKgPerAcre * farmArea;
    const baseRevenue = baseYield * baseline.basePricePerKg;
    const baseProfit = baseRevenue - baseCost;

    const simulation = await prisma.farmScenario.create({
      data: {
        userId,
        farmId,
        title: title || `Simulation: ${cropChoice} under ${rainfallScenario}`,
        cropChoice,
        rainfallScenario,
        costInflationPct,
        marketPriceShockPct,
        projectedCost,
        projectedYieldKg,
        projectedRevenue,
        projectedProfit,
        assumptions: {
          baseline: { baseCost, baseYield, baseRevenue, baseProfit },
          multipliers: { rainfallYieldMultiplier, costMultiplier, priceMultiplier },
          cropBaselineParams: baseline,
        },
      },
    });

    return {
      simulationId: simulation.id,
      title: simulation.title,
      cropChoice,
      farmAreaAcres: farmArea,
      scenarioComparison: {
        baseline: {
          cost: baseCost,
          yieldKg: baseYield,
          revenue: baseRevenue,
          netProfit: baseProfit,
        },
        simulated: {
          cost: projectedCost,
          yieldKg: projectedYieldKg,
          revenue: projectedRevenue,
          netProfit: projectedProfit,
        },
        deltas: {
          profitDifference: projectedProfit - baseProfit,
          profitChangePct: baseProfit !== 0 ? Number((((projectedProfit - baseProfit) / Math.abs(baseProfit)) * 100).toFixed(1)) : 0,
        },
      },
      notice: 'Digital Twin Scenario Engine uses calibrated agronomic models. External extreme climatic deviations or unmonitored pest outbreaks may alter actual field outcomes.',
    };
  }

  static async getSavedScenarios(userId, farmId) {
    return prisma.farmScenario.findMany({
      where: { userId, farmId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
