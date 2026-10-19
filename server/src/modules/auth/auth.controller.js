import { AuthService } from './auth.service.js';
import { apiSuccess } from '../../utils/response.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return apiSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return apiSuccess(res, result, 'Logged in successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const result = await AuthService.getMe(req.user.id);
      return apiSuccess(res, result, 'Current user profile retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      return apiSuccess(res, result, 'Password reset initiated', 200);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const result = await AuthService.resetPassword(req.body.token, req.body.newPassword);
      return apiSuccess(res, result, 'Password reset successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      return apiSuccess(res, null, 'Logged out successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
