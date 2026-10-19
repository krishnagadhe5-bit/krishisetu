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

  static async getConsultations(userId, role) {
    if (role === 'AGRICULTURE_EXPERT') {
      const expert = await prisma.expertProfile.findUnique({ where: { userId } });
      return prisma.consultation.findMany({
        where: {
          OR: [
            { status: 'OPEN' },
            { expertId: expert?.id },
          ],
        },
        include: {
          farmer: { select: { email: true, profile: true } },
          expert: { include: { user: { select: { profile: true } } } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Farmer view
    return prisma.consultation.findMany({
      where: { farmerId: userId },
      include: {
        expert: { include: { user: { select: { profile: true } } } },
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
        expert: { include: { user: { select: { profile: true } } } },
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
      include: { expert: true },
    });

    if (!consultation) {
      const err = new Error('Consultation not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    // Check if user is an expert responding
    const expertProfile = await prisma.expertProfile.findUnique({ where: { userId } });
    if (expertProfile && !consultation.expertId) {
      // Assign expert to this consultation
      await prisma.consultation.update({
        where: { id: consultationId },
        data: {
          expertId: expertProfile.id,
          status: 'IN_PROGRESS',
        },
      });
    }

    const message = await prisma.consultationMessage.create({
      data: {
        consultationId,
        senderId: userId,
        message: data.message,
        imageUrls: data.imageUrls || [],
      },
    });

    // Notify farmer or expert
    const notifyId = userId === consultation.farmerId ? consultation.expert?.userId : consultation.farmerId;
    if (notifyId) {
      await prisma.notification.create({
        data: {
          userId: notifyId,
          type: 'CONSULTATION_RESPONSE',
          title: 'Consultation Reply',
          message: `New message on consultation "${consultation.subject}": ${data.message.slice(0, 80)}`,
          data: { consultationId },
        },
      });
    }

    return message;
  }

  static async closeConsultation(userId, consultationId) {
    return prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'RESOLVED' },
    });
  }
}
