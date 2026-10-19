import { FieldsService } from './fields.service.js';
import { apiSuccess } from '../../utils/response.js';

export class FieldsController {
  static async createField(req, res, next) {
    try {
      const field = await FieldsService.createField(req.user.id, req.body.farmId, req.body);
      return apiSuccess(res, field, 'Field created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getFieldsByFarm(req, res, next) {
    try {
      const fields = await FieldsService.getFieldsByFarm(req.user.id, req.params.farmId);
      return apiSuccess(res, fields, 'Farm fields retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getFieldById(req, res, next) {
    try {
      const field = await FieldsService.getFieldById(req.user.id, req.params.id);
      return apiSuccess(res, field, 'Field details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async addSoilTest(req, res, next) {
    try {
      const soilTest = await FieldsService.addSoilTest(req.user.id, req.params.id, req.body);
      return apiSuccess(res, soilTest, 'Soil test record added', 201);
    } catch (error) {
      next(error);
    }
  }
}
