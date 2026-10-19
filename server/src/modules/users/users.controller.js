import { UsersService } from './users.service.js';
import { apiSuccess } from '../../utils/response.js';

export class UsersController {
  static async getProfile(req, res, next) {
    try {
      const profile = await UsersService.getProfile(req.user.id);
      return apiSuccess(res, profile, 'User profile fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const updated = await UsersService.updateProfile(req.user.id, req.body);
      return apiSuccess(res, updated, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
