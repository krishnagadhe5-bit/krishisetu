import { AiService } from './ai.service.js';
import { apiSuccess } from '../../utils/response.js';

export class AiController {
  static async recommendCrop(req, res, next) {
    try {
      const result = await AiService.recommendCrop(req.user.id, req.body);
      return apiSuccess(res, result, 'Crop suitability recommendation generated');
    } catch (error) {
      next(error);
    }
  }

  static async analyzeDisease(req, res, next) {
    try {
      if (!req.file) {
        const err = new Error('Please upload an image file (JPEG, PNG, or WebP)');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }

      const cropCycleId = req.body.cropCycleId || null;
      const result = await AiService.analyzeCropDisease(req.user.id, req.file, cropCycleId);
      return apiSuccess(res, result, 'Crop image disease analysis complete');
    } catch (error) {
      next(error);
    }
  }

  static async getIrrigationRecommendation(req, res, next) {
    try {
      const result = await AiService.getIrrigationRecommendation(req.params.farmId, req.body);
      return apiSuccess(res, result, 'Smart irrigation advisory calculated');
    } catch (error) {
      next(error);
    }
  }

  static async askAssistant(req, res, next) {
    try {
      const { question, conversationId } = req.body;
      if (!question) {
        const err = new Error('Question text is required');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }
      const result = await AiService.askAssistant(req.user.id, question, conversationId);
      return apiSuccess(res, result, 'Assistant response generated');
    } catch (error) {
      next(error);
    }
  }
}
