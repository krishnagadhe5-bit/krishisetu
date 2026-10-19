import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShoppingBag, Truck, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          Sales Orders & Fulfillment
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review incoming purchase orders from verified wholesale buyers and coordinate shipment dispatch.
        </p>
      </div>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => {
            const firstItem = order.items?.[0];
            return (
              <div
                key={order.id}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      Buyer: {order.buyer?.profile?.fullName || order.buyer?.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm font-black text-gray-900">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {firstItem && (
                  <div className="p-3 rounded-2xl bg-gray-50 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-900 block">{firstItem.listing?.crop?.name}</span>
                      <span className="text-[11px] text-gray-500">
                        {firstItem.quantityKg} kg @ ₹{firstItem.pricePerKg}/kg
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-700">₹{firstItem.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Status Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-[10px] text-gray-400">
                    Payment Method: {order.payment?.method?.replace('_', ' ')} • Status: {order.payment?.status}
                  </span>

                  <div className="flex items-center gap-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                          className="px-3 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold transition"
                        >
                          Accept Order
                        </button>
                      </>
                    )}

                    {order.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                        className="px-3 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold transition"
                      >
                        Confirm Stock Ready
                      </button>
                    )}

                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                        className="px-3 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold transition"
                      >
                        Start Packing / Processing
                      </button>
                    )}

                    {order.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                        className="px-3 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold transition"
                      >
                        Mark as Shipped / Dispatched
                      </button>
                    )}

                    {order.status === 'SHIPPED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition"
                      >
                        Confirm Delivery
                      </button>
                    )}

                    {order.status === 'DELIVERED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold transition"
                      >
                        Complete Order & Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center bg-white rounded-3xl border border-gray-100 p-8">
            <ShoppingBag className="w-12 h-12 text-agri-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No Sales Orders Received Yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Ensure your crop listings have competitive prices and accurate harvest dates to attract buyers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
