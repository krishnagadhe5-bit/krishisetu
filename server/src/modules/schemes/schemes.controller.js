import { SchemesService } from './schemes.service.js';
import { apiSuccess } from '../../utils/response.js';

export class SchemesController {
  static async getSchemes(req, res, next) {
    try {
      const schemes = await SchemesService.getSchemes(req.query);
      return apiSuccess(res, schemes, 'Government schemes retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getSchemeById(req, res, next) {
    try {
      const scheme = await SchemesService.getSchemeById(req.params.id);
      return apiSuccess(res, scheme, 'Scheme details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createScheme(req, res, next) {
    try {
      const scheme = await SchemesService.createScheme(req.body);
      return apiSuccess(res, scheme, 'Scheme created', 201);
    } catch (error) {
      next(error);
    }
  }
}
