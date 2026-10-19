import { AdminService } from './admin.service.js';
import { apiSuccess } from '../../utils/response.js';

export class AdminController {
  static async getAnalytics(req, res, next) {
    try {
      const analytics = await AdminService.getPlatformAnalytics();
      return apiSuccess(res, analytics, 'Platform analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const users = await AdminService.getUsers(req.query);
      return apiSuccess(res, users, 'Users retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req, res, next) {
    try {
      const updated = await AdminService.updateUserStatus(req.user.id, req.params.id, req.body.status);
      return apiSuccess(res, updated, 'User status updated');
    } catch (error) {
      next(error);
    }
  }

  static async verifyExpert(req, res, next) {
    try {
      const verified = await AdminService.verifyExpert(req.user.id, req.params.expertId, req.body.verified);
      return apiSuccess(res, verified, 'Expert verification status updated');
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req, res, next) {
    try {
      const logs = await AdminService.getAuditLogs(req.query.page, req.query.limit);
      return apiSuccess(res, logs, 'System audit logs retrieved');
    } catch (error) {
      next(error);
    }
  }
}
