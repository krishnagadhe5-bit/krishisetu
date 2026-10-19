import { AnalyticsService } from './analytics.service.js';
import { apiSuccess } from '../../utils/response.js';

export class AnalyticsController {
  static async getFinancials(req, res, next) {
    try {
      const financials = await AnalyticsService.getFarmFinancials(req.user.id, req.params.farmId);
      return apiSuccess(res, financials, 'Farm financial statement and analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async simulateScenario(req, res, next) {
    try {
      const simulation = await AnalyticsService.simulateScenario(req.user.id, req.body);
      return apiSuccess(res, simulation, 'Farm scenario simulation computed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getScenarios(req, res, next) {
    try {
      const scenarios = await AnalyticsService.getSavedScenarios(req.user.id, req.params.farmId);
      return apiSuccess(res, scenarios, 'Saved farm scenarios retrieved');
    } catch (error) {
      next(error);
    }
  }
}
