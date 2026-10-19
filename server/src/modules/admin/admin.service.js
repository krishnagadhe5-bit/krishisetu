import prisma from '../../config/db.js';

export class AdminService {
  static async getPlatformAnalytics() {
    const [
      totalUsers,
      farmersCount,
      buyersCount,
      expertsCount,
      totalFarms,
      activeListings,
      totalOrders,
      ordersVolume,
      totalConsultations,
      activeModels,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.user.count({ where: { role: 'AGRICULTURE_EXPERT' } }),
      prisma.farm.count({ where: { isArchived: false } }),
      prisma.cropListing.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
      prisma.consultation.count(),
      prisma.modelVersion.findMany({ where: { isActive: true } }),
    ]);

    return {
      users: {
        total: totalUsers,
        farmers: farmersCount,
        buyers: buyersCount,
        experts: expertsCount,
      },
      operations: {
        totalFarms,
        activeListings,
        totalOrders,
        grossVolumeInr: Number(ordersVolume._sum.totalAmount || 0),
        totalConsultations,
      },
      aiModels: activeModels,
      systemHealth: 'OPERATIONAL',
      timestamp: new Date().toISOString(),
    };
  }

  static async getUsers(query = {}) {
    const { role, status, search, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(role && { role }),
      ...(status && { accountStatus: status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { profile: { fullName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          accountStatus: true,
          createdAt: true,
          profile: true,
          expertProfile: true,
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  static async updateUserStatus(adminId, userId, accountStatus) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE_USER_STATUS',
        resource: 'User',
        resourceId: userId,
        details: { newStatus: accountStatus },
      },
    });

    return updated;
  }

  static async verifyExpert(adminId, expertProfileId, verified = true) {
    const expert = await prisma.expertProfile.update({
      where: { id: expertProfileId },
      data: {
        verified,
        verifiedAt: verified ? new Date() : null,
        verifiedBy: adminId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'VERIFY_EXPERT',
        resource: 'ExpertProfile',
        resourceId: expertProfileId,
        details: { verified },
      },
    });

    return expert;
  }

  static async getAuditLogs(page = 1, limit = 50) {
    const skip = (Number(page) - 1) * Number(limit);
    return prisma.auditLog.findMany({
      include: {
        user: { select: { email: true, role: true } },
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });
  }
}
