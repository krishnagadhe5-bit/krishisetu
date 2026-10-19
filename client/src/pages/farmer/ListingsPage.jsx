import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Store, Plus, Tag, MapPin, Truck, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddListing, setShowAddListing] = useState(false);

  const [form, setForm] = useState({
    cropId: '',
    title: '',
    description: '',
    quantityKg: 2000,
    pricePerKg: 35,
    qualityGrade: 'Grade A (Export Quality)',
    pickupAddress: 'Farm Yard, Maharashtra',
    canDeliver: true,
    deliveryRadius: 100,
  });

  const fetchData = async () => {
    try {
      const [listRes, cropRes] = await Promise.all([
        api.get('/marketplace'),
        api.get('/crops/catalog'),
      ]);
      setListings(listRes.data.data || []);
      setCrops(cropRes.data.data || []);
      if (cropRes.data.data?.length > 0) {
        setForm((prev) => ({ ...prev, cropId: cropRes.data.data[0].id }));
      }
    } catch (err) {
      toast.error('Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      await api.post('/marketplace', {
        ...form,
        quantityKg: Number(form.quantityKg),
        pricePerKg: Number(form.pricePerKg),
        deliveryRadius: Number(form.deliveryRadius),
      });
      toast.success('Crop produce listed on marketplace!');
      setShowAddListing(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Produce Marketplace & Buyer Inquiries
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            List harvested agricultural produce directly for wholesale food processors, traders, and retail buyers.
          </p>
        </div>

        <button
          onClick={() => setShowAddListing(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          List Harvested Produce
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.length > 0 ? (
          listings.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-agri-200 transition"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-agri-100 text-agri-800">
                    {item.status}
                  </span>
                  <span className="text-xs font-bold text-agri-800">₹{item.pricePerKg}/kg</span>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-gray-50 text-xs space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span>Available Stock:</span>
                    <strong className="text-gray-900">{item.availableQtyKg} kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality Grade:</span>
                    <strong className="text-gray-900">{item.qualityGrade || 'Standard'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <strong className="text-gray-900">
                      {item.canDeliver ? `Within ${item.deliveryRadius} km` : 'Farm Pickup Only'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{item.inquiries?.length || 0} Buyer Inquiries</span>
                <span className="text-[10px] text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-gray-100 p-8">
            <Store className="w-12 h-12 text-agri-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No Active Listings Yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Create a listing to advertise your available harvest to verified commercial buyers across Maharashtra.
            </p>
          </div>
        )}
      </div>

      {/* Modal: Create Listing */}
      {showAddListing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl animate-in fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-4">Create Produce Marketplace Listing</h3>
            <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Crop Type</label>
                <select
                  value={form.cropId}
                  onChange={(e) => setForm({ ...form, cropId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.nameMarathi && `(${c.nameMarathi})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Listing Headline / Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Export Grade Fresh Red Onion (Lasalgaon Type)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    value={form.quantityKg}
                    onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Price (₹/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form.pricePerKg}
                    onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quality Grade</label>
                <input
                  type="text"
                  value={form.qualityGrade}
                  onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
                  placeholder="Grade A, Grade B, Organic Certified"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Pickup Yard Address</label>
                <input
                  type="text"
                  value={form.pickupAddress}
                  onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddListing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-agri-700 text-white font-bold hover:bg-agri-800"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
