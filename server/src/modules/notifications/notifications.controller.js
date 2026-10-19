import { NotificationsService } from './notifications.service.js';
import { apiSuccess } from '../../utils/response.js';

export class NotificationsController {
  static async getNotifications(req, res, next) {
    try {
      const notifications = await NotificationsService.getUserNotifications(req.user.id);
      return apiSuccess(res, notifications, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      await NotificationsService.markAsRead(req.user.id, req.params.id);
      return apiSuccess(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await NotificationsService.markAllAsRead(req.user.id);
      return apiSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}
