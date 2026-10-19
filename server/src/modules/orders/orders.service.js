import prisma from '../../config/db.js';

export class OrdersService {
  static async createOrder(buyerId, data) {
    const { listingId, quantityKg, notes, paymentMethod = 'CASH_ON_DELIVERY', deliveryAddress } = data;

    // Use Prisma transaction to ensure atomic inventory reservation and prevent overselling
    return prisma.$transaction(async (tx) => {
      // 1. Fetch listing with row check
      const listing = await tx.cropListing.findUnique({
        where: { id: listingId },
        include: { user: true, crop: true },
      });

      if (!listing) {
        const err = new Error('Produce listing not found');
        err.statusCode = 404;
        err.isOperational = true;
        throw err;
      }

      if (listing.status !== 'ACTIVE') {
        const err = new Error(`Listing is currently ${listing.status.toLowerCase()} and cannot accept new orders`);
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }

      if (listing.userId === buyerId) {
        const err = new Error('You cannot place an order on your own listing');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }

      const reqQty = Number(quantityKg);
      const availQty = Number(listing.availableQtyKg);

      if (reqQty <= 0) {
        const err = new Error('Requested quantity must be greater than zero');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }

      if (availQty < reqQty) {
        const err = new Error(`Insufficient inventory. Available: ${availQty} kg, Requested: ${reqQty} kg`);
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }

      const totalPrice = Number(listing.pricePerKg) * reqQty;

      // 2. Decrement available quantity atomically
      const remainingQty = availQty - reqQty;
      await tx.cropListing.update({
        where: { id: listingId },
        data: {
          availableQtyKg: remainingQty,
          status: remainingQty === 0 ? 'SOLD' : 'ACTIVE',
        },
      });

      // 3. Create Order and OrderItem
      const order = await tx.order.create({
        data: {
          buyerId,
          sellerId: listing.userId,
          status: 'PENDING',
          totalAmount: totalPrice,
          notes,
          items: {
            create: {
              listingId,
              quantityKg: reqQty,
              pricePerKg: listing.pricePerKg,
              totalPrice,
            },
          },
          payment: {
            create: {
              amount: totalPrice,
              method: paymentMethod,
              status: 'PENDING',
            },
          },
          shipment: {
            create: {
              pickupAddress: listing.pickupAddress || 'Farm pickup',
              deliveryAddress: deliveryAddress || 'Buyer designated address',
              quantityKg: reqQty,
              status: 'PENDING',
            },
          },
        },
        include: {
          items: { include: { listing: { include: { crop: true } } } },
          payment: true,
          shipment: true,
        },
      });

      // 4. Notify farmer
      await tx.notification.create({
        data: {
          userId: listing.userId,
          type: 'ORDER_UPDATE',
          title: 'New Order Received',
          message: `New order #${order.id.slice(0, 8)} for ${reqQty} kg of ${listing.crop.name} (₹${totalPrice.toLocaleString('en-IN')})`,
          data: { orderId: order.id },
        },
      });

      return order;
    });
  }

  static async getOrders(userId, role) {
    const isSeller = role === 'FARMER';
    const where = isSeller ? { sellerId: userId } : { buyerId: userId };

    return prisma.order.findMany({
      where,
      include: {
        buyer: { select: { email: true, profile: true } },
        items: { include: { listing: { include: { crop: true } } } },
        payment: true,
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getOrderById(userId, orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { email: true, profile: true } },
        items: { include: { listing: { include: { crop: true } } } },
        payment: true,
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
      const err = new Error('Access denied to this order');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    return order;
  }

  static async updateOrderStatus(userId, orderId, newStatus, reason = null) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        err.isOperational = true;
        throw err;
      }

      // Authorization: Seller or Buyer depending on status
      const isSeller = order.sellerId === userId;
      const isBuyer = order.buyerId === userId;

      if (!isSeller && !isBuyer) {
        const err = new Error('Access denied');
        err.statusCode = 403;
        err.isOperational = true;
        throw err;
      }

      // Valid state transitions
      const validTransitions = {
        PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
        ACCEPTED: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['PROCESSING', 'CANCELLED'],
        PROCESSING: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED'],
        DELIVERED: ['COMPLETED'],
        COMPLETED: [],
        REJECTED: [],
        CANCELLED: [],
      };

      if (!validTransitions[order.status]?.includes(newStatus)) {
        const err = new Error(`Cannot transition order from ${order.status} to ${newStatus}`);
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }

      // If order is CANCELLED or REJECTED, restore reserved inventory
      if (['CANCELLED', 'REJECTED'].includes(newStatus)) {
        for (const item of order.items) {
          await tx.cropListing.update({
            where: { id: item.listingId },
            data: {
              availableQtyKg: { increment: item.quantityKg },
              status: 'ACTIVE',
            },
          });
        }
      }

      // If order is completed, mark payment as VERIFIED if cash on delivery
      if (newStatus === 'COMPLETED') {
        await tx.paymentRecord.updateMany({
          where: { orderId: order.id },
          data: { status: 'VERIFIED', paidAt: new Date() },
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          cancellationReason: reason,
        },
        include: {
          items: true,
          payment: true,
          shipment: true,
        },
      });

      // Send notification to the other party
      const notifyUserId = isSeller ? order.buyerId : order.sellerId;
      await tx.notification.create({
        data: {
          userId: notifyUserId,
          type: 'ORDER_UPDATE',
          title: `Order Status Updated: ${newStatus}`,
          message: `Order #${order.id.slice(0, 8)} status is now ${newStatus}.`,
          data: { orderId: order.id, newStatus },
        },
      });

      return updatedOrder;
    });
  }
}
