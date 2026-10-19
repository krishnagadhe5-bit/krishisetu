import { FarmsService } from './farms.service.js';
import { apiSuccess } from '../../utils/response.js';

export class FarmsController {
  static async createFarm(req, res, next) {
    try {
      const farm = await FarmsService.createFarm(req.user.id, req.body);
      return apiSuccess(res, farm, 'Farm created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getFarms(req, res, next) {
    try {
      const includeArchived = req.query.includeArchived === 'true';
      const farms = await FarmsService.getFarms(req.user.id, includeArchived);
      return apiSuccess(res, farms, 'Farms retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getFarmById(req, res, next) {
    try {
      const farm = await FarmsService.getFarmById(req.user.id, req.params.id);
      return apiSuccess(res, farm, 'Farm details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateFarm(req, res, next) {
    try {
      const updated = await FarmsService.updateFarm(req.user.id, req.params.id, req.body);
      return apiSuccess(res, updated, 'Farm updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteFarm(req, res, next) {
    try {
      const archived = await FarmsService.deleteFarm(req.user.id, req.params.id);
      return apiSuccess(res, archived, 'Farm archived successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getDashboard(req, res, next) {
    try {
      const dashboard = await FarmsService.getFarmerDashboard(req.user.id);
      return apiSuccess(res, dashboard, 'Farmer dashboard data retrieved');
    } catch (error) {
      next(error);
    }
  }
}
