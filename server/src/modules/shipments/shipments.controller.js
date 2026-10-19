import { ShipmentsService } from './shipments.service.js';
import { apiSuccess } from '../../utils/response.js';

export class ShipmentsController {
  static async getShipmentByOrder(req, res, next) {
    try {
      const shipment = await ShipmentsService.getShipmentByOrder(req.user.id, req.params.orderId);
      return apiSuccess(res, shipment, 'Shipment details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateShipment(req, res, next) {
    try {
      const updated = await ShipmentsService.updateShipment(req.user.id, req.params.id, req.body);
      return apiSuccess(res, updated, 'Shipment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async planRoute(req, res, next) {
    try {
      const { origin, destination, quantityKg } = req.body;
      const plan = await ShipmentsService.planRoute(origin, destination, quantityKg);
      return apiSuccess(res, plan, 'Logistics route planned');
    } catch (error) {
      next(error);
    }
  }
}
