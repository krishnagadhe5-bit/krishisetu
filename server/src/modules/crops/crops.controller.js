import { CropsService } from './crops.service.js';
import { apiSuccess } from '../../utils/response.js';

export class CropsController {
  static async getCatalog(req, res, next) {
    try {
      const crops = await CropsService.getCropCatalog();
      return apiSuccess(res, crops, 'Crop catalog retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getCropById(req, res, next) {
    try {
      const crop = await CropsService.getCropById(req.params.id);
      return apiSuccess(res, crop, 'Crop details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createCropCycle(req, res, next) {
    try {
      const cycle = await CropsService.createCropCycle(req.user.id, req.body);
      return apiSuccess(res, cycle, 'Crop cycle created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getFarmerCycles(req, res, next) {
    try {
      const cycles = await CropsService.getCropCyclesByFarmer(req.user.id);
      return apiSuccess(res, cycles, 'Farmer crop cycles retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getCropCycleById(req, res, next) {
    try {
      const cycle = await CropsService.getCropCycleById(req.user.id, req.params.id);
      return apiSuccess(res, cycle, 'Crop cycle details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async addActivity(req, res, next) {
    try {
      const activity = await CropsService.addActivity(req.user.id, req.params.id, req.body);
      return apiSuccess(res, activity, 'Crop activity logged', 201);
    } catch (error) {
      next(error);
    }
  }

  static async recordHarvest(req, res, next) {
    try {
      const harvest = await CropsService.recordHarvest(req.user.id, req.params.id, req.body);
      return apiSuccess(res, harvest, 'Harvest recorded successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}
