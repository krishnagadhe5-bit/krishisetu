import { OrdersService } from './orders.service.js';
import { apiSuccess } from '../../utils/response.js';

export class OrdersController {
  static async createOrder(req, res, next) {
    try {
      const order = await OrdersService.createOrder(req.user.id, req.body);
      return apiSuccess(res, order, 'Order placed successfully and inventory reserved', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getOrders(req, res, next) {
    try {
      const orders = await OrdersService.getOrders(req.user.id, req.user.role);
      return apiSuccess(res, orders, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req, res, next) {
    try {
      const order = await OrdersService.getOrderById(req.user.id, req.params.id);
      return apiSuccess(res, order, 'Order details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status, reason } = req.body;
      const order = await OrdersService.updateOrderStatus(req.user.id, req.params.id, status, reason);
      return apiSuccess(res, order, 'Order status updated');
    } catch (error) {
      next(error);
    }
  }
}
