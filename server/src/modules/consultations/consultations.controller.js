import { ConsultationsService } from './consultations.service.js';
import { apiSuccess } from '../../utils/response.js';

export class ConsultationsController {
  static async createConsultation(req, res, next) {
    try {
      const consultation = await ConsultationsService.createConsultation(req.user.id, req.body);
      return apiSuccess(res, consultation, 'Consultation case submitted', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getConsultations(req, res, next) {
    try {
      const consultations = await ConsultationsService.getConsultations(req.user.id, req.user.role);
      return apiSuccess(res, consultations, 'Consultations retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getConsultationById(req, res, next) {
    try {
      const consultation = await ConsultationsService.getConsultationById(req.user.id, req.params.id);
      return apiSuccess(res, consultation, 'Consultation details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async addMessage(req, res, next) {
    try {
      const message = await ConsultationsService.addMessage(req.user.id, req.params.id, req.body);
      return apiSuccess(res, message, 'Message sent', 201);
    } catch (error) {
      next(error);
    }
  }

  static async closeConsultation(req, res, next) {
    try {
      const closed = await ConsultationsService.closeConsultation(req.user.id, req.params.id);
      return apiSuccess(res, closed, 'Consultation marked as resolved');
    } catch (error) {
      next(error);
    }
  }
}
