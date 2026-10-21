import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Store, ShoppingBag, Search, Filter, MapPin, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const BuyerDashboardPage = () => {
  const [listings, setListings] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCrop, setSelectedCrop] = useState('');
  const [district, setDistrict] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Order modal state
  const [selectedListing, setSelectedListing] = useState(null);
  const [orderQty, setOrderQty] = useState(500);
  const [deliveryAddress, setDeliveryAddress] = useState('Central Warehouse, Pune APMC');
  const [orderLoading, setOrderLoading] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCrop) params.append('cropId', selectedCrop);
      if (district) params.append('district', district);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const [listRes, cropRes] = await Promise.all([
        api.get(`/marketplace?${params.toString()}`),
        api.get('/crops/catalog'),
      ]);
      setListings(listRes.data.data || []);
      setCrops(cropRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCrop, district, maxPrice]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedListing) return;

    setOrderLoading(true);
    try {
      const res = await api.post('/orders', {
        listingId: selectedListing.id,
        quantityKg: Number(orderQty),
        deliveryAddress,
        paymentMethod: 'CASH_ON_DELIVERY',
      });
      toast.success('Order placed successfully! Inventory reserved atomically.');
      setSelectedListing(null);
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          Commercial Produce Procurement & Sourcing
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Source wholesale agricultural produce directly from verified Maharashtra farmers with guaranteed quality grades.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Crop Type</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white font-medium"
          >
            <option value="">All Crops</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.nameMarathi && `(${c.nameMarathi})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">District</label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="e.g. Pune, Nashik, Solapur..."
            className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Max Price (₹/kg)</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g. 40"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium"
          />
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.length > 0 ? (
          listings.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-agri-300 transition"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {item.qualityGrade || 'Grade A'}
                  </span>
                  <span className="text-base font-black text-agri-800">₹{item.pricePerKg}/kg</span>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                  <span className="text-xs text-gray-500 block mt-0.5">
                    Farmer: <strong>{item.user?.profile?.fullName || 'Verified Farmer'}</strong>
                  </span>
                </div>

                <div className="mt-4 p-3.5 rounded-2xl bg-gray-50 text-xs space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span>Available Stock:</span>
                    <strong className="text-gray-900">{item.availableQtyKg} kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <strong className="text-gray-900">{item.user?.profile?.district || 'Maharashtra'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Logistics:</span>
                    <strong className="text-gray-900">
                      {item.canDeliver ? `Delivery available (${item.deliveryRadius}km)` : 'Buyer Pickup'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedListing(item);
                    setOrderQty(Math.min(500, Number(item.availableQtyKg)));
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Place Purchase Order
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-100 p-8">
            <Store className="w-12 h-12 text-agri-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No Produce Listings Match Your Criteria</h3>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or price cap above.</p>
          </div>
        )}
      </div>

      {/* Order Placement Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 !m-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl animate-in fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Order {selectedListing.title}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Rate: ₹{selectedListing.pricePerKg}/kg • Available: {selectedListing.availableQtyKg} kg
            </p>

            <form onSubmit={handlePlaceOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quantity Required (kg)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={Number(selectedListing.availableQtyKg)}
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Delivery / Destination Address</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. Pune Central Warehouse Yard"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-agri-50 border border-agri-200 text-xs text-agri-950 font-bold flex justify-between items-center">
                <span>Total Order Payable:</span>
                <span className="text-base text-agri-800">
                  ₹{(Number(orderQty) * Number(selectedListing.pricePerKg)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderLoading}
                  className="flex-1 py-2.5 rounded-xl bg-agri-700 text-white font-bold hover:bg-agri-800 disabled:opacity-50"
                >
                  {orderLoading ? 'Reserving...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
