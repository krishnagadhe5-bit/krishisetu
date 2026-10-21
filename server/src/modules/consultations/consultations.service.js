import prisma from '../../config/db.js';

export class ConsultationsService {
  static async createConsultation(farmerId, data) {
    const { cropName, subject, description, imageUrls = [] } = data;

    const consultation = await prisma.consultation.create({
      data: {
        farmerId,
        cropName,
        subject,
        description,
        imageUrls,
        status: 'OPEN',
      },
      include: {
        farmer: { select: { email: true, profile: true } },
      },
    });

    return consultation;
  }

  static async getConsultations(userId) {
    return prisma.consultation.findMany({
      where: { farmerId: userId },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getConsultationById(userId, consultationId) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        farmer: { select: { id: true, email: true, profile: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!consultation) {
      const err = new Error('Consultation not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    return consultation;
  }

  static async addMessage(userId, consultationId, data) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      const err = new Error('Consultation not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const message = await prisma.consultationMessage.create({
      data: {
        consultationId,
        senderId: userId,
        message: data.message,
        imageUrls: data.imageUrls || [],
      },
    });

    return message;
  }

  static async closeConsultation(userId, consultationId) {
    return prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'RESOLVED' },
    });
  }
}
