import React, { useState } from 'react';
import api from '../../services/api';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, MapPin, Store } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const BuyerMatchPage = () => {
  const [form, setForm] = useState({
    cropName: 'Onion',
    quantityKg: 5000,
    maxPricePerKg: 30,
    qualityGrade: 'Grade A (Export Quality)',
    district: 'Pune',
  });

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/marketplace/match', {
        ...form,
        quantityKg: Number(form.quantityKg),
        maxPricePerKg: Number(form.maxPricePerKg),
      });
      setMatches(res.data.data || []);
      toast.success('Matching listings calculated!');
    } catch (err) {
      toast.error('Matchmaking query failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 text-agri-900 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-agri-700" />
          Multi-Factor Explainable Matching Algorithm
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          Procurement Compatibility Matchmaker
        </h1>
        <p className="text-xs text-gray-500 mt-1 max-w-2xl">
          Match your commercial purchase specifications against available farmer inventories weighted by quantity volume, price threshold, transport radius, and quality grade.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Procurement Requirements</h2>

          <form onSubmit={handleMatch} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Target Crop</label>
              <input
                type="text"
                required
                value={form.cropName}
                onChange={(e) => setForm({ ...form, cropName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                placeholder="e.g. Onion / Cotton / Soybean"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Required Lot Volume (kg)</label>
              <input
                type="number"
                required
                value={form.quantityKg}
                onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Max Ceiling Price (₹/kg)</label>
              <input
                type="number"
                step="0.5"
                value={form.maxPricePerKg}
                onChange={(e) => setForm({ ...form, maxPricePerKg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Target Destination District</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                placeholder="e.g. Pune / Nashik"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              {loading ? 'Calculating...' : 'Find Compatible Sellers'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-4">
          {matches.length > 0 ? (
            matches.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-agri-200 transition space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-agri-100 text-agri-800 font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{item.listing.title}</h3>
                      <span className="text-[11px] text-gray-500">
                        Farmer: {item.listing.user?.profile?.fullName || 'Verified Farmer'} (
                        {item.listing.user?.profile?.district})
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-agri-800">{item.matchScore}%</span>
                    <span className="text-[10px] text-gray-400 block -mt-1">Compatibility</span>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-gray-50 p-3 rounded-2xl">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Quantity</span>
                    <span className="font-semibold text-gray-800">{item.breakdown.quantityScore}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Price</span>
                    <span className="font-semibold text-gray-800">{item.breakdown.priceScore}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Location</span>
                    <span className="font-semibold text-gray-800">{item.breakdown.locationScore}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Quality</span>
                    <span className="font-semibold text-gray-800">{item.breakdown.qualityScore}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-xs text-gray-400">
              <Store className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              Specify procurement criteria on the left to calculate weighted compatibility across active agricultural lots.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
