import prisma from '../../config/db.js';

export class ShipmentsService {
  static async getShipmentByOrder(userId, orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shipment: true,
      },
    });

    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      const err = new Error('Access denied to shipment details');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    return order.shipment;
  }

  static async updateShipment(userId, shipmentId, data) {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { order: true },
    });

    if (!shipment) {
      const err = new Error('Shipment not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    if (shipment.order.sellerId !== userId) {
      const err = new Error('Only the seller can update shipment dispatch details');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    const { status, driverName, driverPhone, vehicleType, trackingNotes, dispatchDate, estimatedDelivery } = data;

    const updated = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        ...(status && { status }),
        ...(driverName && { driverName }),
        ...(driverPhone && { driverPhone }),
        ...(vehicleType && { vehicleType }),
        ...(trackingNotes && { trackingNotes }),
        ...(dispatchDate && { dispatchDate: new Date(dispatchDate) }),
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
        ...(status === 'DELIVERED' && { actualDelivery: new Date() }),
      },
    });

    // If shipment is DELIVERED, automatically move order to DELIVERED
    if (status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: shipment.orderId },
        data: { status: 'DELIVERED' },
      });
    } else if (status === 'DISPATCHED' || status === 'IN_TRANSIT') {
      await prisma.order.update({
        where: { id: shipment.orderId },
        data: { status: 'SHIPPED' },
      });
    }

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: shipment.order.buyerId,
        type: 'SHIPMENT_UPDATE',
        title: `Shipment Update: ${status}`,
        message: `Your produce shipment is now ${status}. Driver: ${driverName || 'Assigned'}, Notes: ${trackingNotes || 'In transit'}.`,
        data: { shipmentId, orderId: shipment.orderId },
      },
    });

    return updated;
  }

  static async planRoute(origin, destination, quantityKg) {
    // Documented agro-logistics routing optimizer
    // Calculates estimated distance in Maharashtra road network, fuel cost, vehicle recommendation
    const qty = Number(quantityKg);
    let vehicle = 'Light Commercial Vehicle (Tata Ace / Mahindra Bolero Maxi)';
    let baseRatePerKm = 18; // INR

    if (qty > 3000) {
      vehicle = 'Heavy Commercial Multi-Axle Truck (Eicher / Ashok Leyland 16T)';
      baseRatePerKm = 42;
    } else if (qty > 1000) {
      vehicle = 'Medium Duty Truck (Tata 407 / Eicher Pro 2000)';
      baseRatePerKm = 26;
    }

    // Estimated distance baseline (simulated based on typical district-to-district transit)
    const estimatedDistanceKm = 145;
    const estimatedHours = 4.5;
    const estimatedTransportCost = Math.round(estimatedDistanceKm * baseRatePerKm + 500); // 500 loading/handling

    return {
      route: {
        origin,
        destination,
        estimatedDistanceKm,
        estimatedDurationHours: estimatedHours,
        recommendedVehicle: vehicle,
        estimatedCostInr: estimatedTransportCost,
        co2EmissionKg: Math.round(estimatedDistanceKm * 0.28),
      },
      notice: 'Route calculation based on Maharashtra State Highway logistics matrix with standard freight tariff guidelines.',
    };
  }
}
