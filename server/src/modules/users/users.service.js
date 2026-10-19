import prisma from '../../config/db.js';

export class UsersService {
  static async updateProfile(userId, data) {
    const { fullName, phone, state, district, preferredLang, bio, avatarUrl } = data;

    const updated = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(state && { state }),
        ...(district !== undefined && { district }),
        ...(preferredLang && { preferredLang }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      create: {
        userId,
        fullName: fullName || 'User',
        phone,
        state: state || 'Maharashtra',
        district,
        preferredLang: preferredLang || 'en',
        bio,
        avatarUrl,
      },
    });

    return updated;
  }

  static async getProfile(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        accountStatus: true,
        createdAt: true,
        profile: true,
        expertProfile: true,
      },
    });
  }
}
