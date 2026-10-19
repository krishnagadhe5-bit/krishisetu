import prisma from '../../config/db.js';

export class SchemesService {
  static async getSchemes(query = {}) {
    const { state = 'Maharashtra' } = query;

    return prisma.scheme.findMany({
      where: {
        isActive: true,
        OR: [
          { applicability: 'National' },
          { state: { contains: state, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getSchemeById(id) {
    const scheme = await prisma.scheme.findUnique({ where: { id } });
    if (!scheme) {
      const err = new Error('Scheme not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
    return scheme;
  }

  static async createScheme(data) {
    return prisma.scheme.create({ data });
  }
}
