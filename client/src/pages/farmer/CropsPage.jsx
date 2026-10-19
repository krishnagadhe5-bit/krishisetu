import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trees, Plus, Calendar, DollarSign, Sprout, ArrowRight, CheckCircle2, Layers } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const CropsPage = () => {
  const [cycles, setCycles] = useState([]);
  const [farms, setFarms] = useState([]);
  const [cropsCatalog, setCropsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddCycle, setShowAddCycle] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showRecordHarvest, setShowRecordHarvest] = useState(false);
  const [activeCycle, setActiveCycle] = useState(null);

  // Forms
  const [cycleForm, setCycleForm] = useState({
    fieldId: '',
    cropId: '',
    varietyName: '',
    areaAcres: 2.0,
    sowingDate: new Date().toISOString().split('T')[0],
    expectedHarvest: '',
    seedQuantityKg: 50,
    seedCost: 3500,
  });

  const [activityForm, setActivityForm] = useState({
    activityType: 'FERTILIZER',
    description: '',
    cost: 1500,
    quantity: 50,
    unit: 'kg',
  });

  const [harvestForm, setHarvestForm] = useState({
    quantityKg: 2000,
    pricePerKg: 30,
    qualityGrade: 'Grade A',
    buyerName: 'APMC Market Buyer',
    isFinalHarvest: true,
  });

  const fetchData = async () => {
    try {
      const [cycleRes, farmsRes, catalogRes] = await Promise.all([
        api.get('/crops/cycles'),
        api.get('/farms'),
        api.get('/crops/catalog'),
      ]);
      setCycles(cycleRes.data.data || []);
      setFarms(farmsRes.data.data || []);
      setCropsCatalog(catalogRes.data.data || []);

      // Default fieldId and cropId
      const allFields = farmsRes.data.data?.flatMap((f) => f.fields || []) || [];
      if (allFields.length > 0) {
        setCycleForm((prev) => ({ ...prev, fieldId: allFields[0].id }));
      }
      if (catalogRes.data.data?.length > 0) {
        setCycleForm((prev) => ({ ...prev, cropId: catalogRes.data.data[0].id }));
      }
    } catch (err) {
      toast.error('Failed to load crop cycle data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/crops/cycles', {
        ...cycleForm,
        areaAcres: Number(cycleForm.areaAcres),
        seedQuantityKg: Number(cycleForm.seedQuantityKg),
        seedCost: Number(cycleForm.seedCost),
      });
      toast.success('Crop cycle registered successfully!');
      setShowAddCycle(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create crop cycle');
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activeCycle) return;
    try {
      await api.post(`/crops/cycles/${activeCycle.id}/activities`, {
        ...activityForm,
        cost: Number(activityForm.cost),
        quantity: Number(activityForm.quantity),
      });
      toast.success('Crop activity logged & added to farm expenses!');
      setShowAddActivity(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log activity');
    }
  };

  const handleRecordHarvest = async (e) => {
    e.preventDefault();
    if (!activeCycle) return;
    try {
      await api.post(`/crops/cycles/${activeCycle.id}/harvests`, {
        ...harvestForm,
        quantityKg: Number(harvestForm.quantityKg),
        pricePerKg: Number(harvestForm.pricePerKg),
      });
      toast.success('Harvest recorded successfully and revenue updated!');
      setShowRecordHarvest(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record harvest');
    }
  };

  const allFields = farms.flatMap((f) => f.fields.map((fld) => ({ ...fld, farmName: f.name })));

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Crop Lifecycle & Harvest Operations
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track active sowings, schedule fertilizer/spraying events, and record final produce yields.
          </p>
        </div>

        <button
          onClick={() => setShowAddCycle(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Start New Crop Cycle
        </button>
      </div>

      {/* Crop Cycles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cycles.length > 0 ? (
          cycles.map((cycle) => (
            <div
              key={cycle.id}
              className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between hover:border-agri-200 transition"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800">
                    {cycle.growthStage}
                  </span>
                  <span className="text-xs font-bold text-gray-400 capitalize">{cycle.status}</span>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-bold text-gray-900">
                    {cycle.crop.name} {cycle.crop.nameMarathi && `(${cycle.crop.nameMarathi})`}
                  </h3>
                  <span className="text-xs text-gray-500 block mt-0.5">
                    Variety: {cycle.varietyName || 'Standard Hybrid'}
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-gray-50 text-xs space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span>Field Plot:</span>
                    <strong className="text-gray-900">{cycle.field?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cultivation Area:</span>
                    <strong className="text-gray-900">{cycle.areaAcres} Acres</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Sown On:</span>
                    <strong className="text-gray-900">
                      {cycle.sowingDate ? new Date(cycle.sowingDate).toLocaleDateString() : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => {
                    setActiveCycle(cycle);
                    setShowAddActivity(true);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition"
                >
                  Log Activity
                </button>
                <button
                  onClick={() => {
                    setActiveCycle(cycle);
                    setShowRecordHarvest(true);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs transition"
                >
                  Record Harvest
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-gray-100 p-8">
            <Trees className="w-12 h-12 text-agri-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No Crop Cycles Active</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Associate a field with a seasonal crop to begin tracking cultivation steps and input costs.
            </p>
            <button
              onClick={() => setShowAddCycle(true)}
              className="mt-4 px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl text-xs font-bold transition"
            >
              Start First Cycle
            </button>
          </div>
        )}
      </div>

      {/* Modal: New Crop Cycle */}
      {showAddCycle && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl animate-in fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-4">Start New Crop Cultivation Cycle</h3>
            <form onSubmit={handleCreateCycle} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Field Plot</label>
                <select
                  value={cycleForm.fieldId}
                  onChange={(e) => setCycleForm({ ...cycleForm, fieldId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                >
                  {allFields.map((fld) => (
                    <option key={fld.id} value={fld.id}>
                      {fld.name} ({fld.farmName} - {fld.areaAcres} Ac)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Crop Selection</label>
                <select
                  value={cycleForm.cropId}
                  onChange={(e) => setCycleForm({ ...cycleForm, cropId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                >
                  {cropsCatalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.nameMarathi && `(${c.nameMarathi})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Variety Name</label>
                  <input
                    type="text"
                    value={cycleForm.varietyName}
                    onChange={(e) => setCycleForm({ ...cycleForm, varietyName: e.target.value })}
                    placeholder="e.g. Co 86032"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Planted Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={cycleForm.areaAcres}
                    onChange={(e) => setCycleForm({ ...cycleForm, areaAcres: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Seed Quantity (kg)</label>
                  <input
                    type="number"
                    value={cycleForm.seedQuantityKg}
                    onChange={(e) => setCycleForm({ ...cycleForm, seedQuantityKg: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Seed Cost (₹)</label>
                  <input
                    type="number"
                    value={cycleForm.seedCost}
                    onChange={(e) => setCycleForm({ ...cycleForm, seedCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCycle(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-agri-700 text-white font-bold hover:bg-agri-800"
                >
                  Start Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Activity */}
      {showAddActivity && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl animate-in fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Log Activity on {activeCycle?.crop.name}
            </h3>
            <form onSubmit={handleAddActivity} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Activity Type</label>
                <select
                  value={activityForm.activityType}
                  onChange={(e) => setActivityForm({ ...activityForm, activityType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="FERTILIZER">Fertilizer Application (खत)</option>
                  <option value="PESTICIDE">Pest Spray (औषध फवारणी)</option>
                  <option value="WEEDING">Weeding / Interculture (खुरपणी)</option>
                  <option value="IRRIGATION">Special Irrigation Event</option>
                  <option value="OTHER">Other Operational Labor</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  placeholder="e.g. Applied 50kg 19:19:19 via Drip Venturi"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Incurred Cost (₹)</label>
                  <input
                    type="number"
                    value={activityForm.cost}
                    onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quantity Used</label>
                  <input
                    type="number"
                    value={activityForm.quantity}
                    onChange={(e) => setActivityForm({ ...activityForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddActivity(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-agri-700 text-white font-bold hover:bg-agri-800"
                >
                  Save Activity & Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Harvest */}
      {showRecordHarvest && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl animate-in fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Record Harvest for {activeCycle?.crop.name}
            </h3>
            <form onSubmit={handleRecordHarvest} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Harvested Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    value={harvestForm.quantityKg}
                    onChange={(e) => setHarvestForm({ ...harvestForm, quantityKg: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Selling Price (₹/kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={harvestForm.pricePerKg}
                    onChange={(e) => setHarvestForm({ ...harvestForm, pricePerKg: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quality Grade</label>
                <input
                  type="text"
                  value={harvestForm.qualityGrade}
                  onChange={(e) => setHarvestForm({ ...harvestForm, qualityGrade: e.target.value })}
                  placeholder="e.g. Grade A (Export Quality)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Buyer / APMC Mandi Name</label>
                <input
                  type="text"
                  value={harvestForm.buyerName}
                  onChange={(e) => setHarvestForm({ ...harvestForm, buyerName: e.target.value })}
                  placeholder="e.g. Sahyadri Traders / Lasalgaon APMC"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="p-3 rounded-2xl bg-harvest-50 text-harvest-900 font-bold">
                Total Projected Revenue: ₹{(Number(harvestForm.quantityKg) * Number(harvestForm.pricePerKg)).toLocaleString('en-IN')}
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRecordHarvest(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-agri-700 text-white font-bold hover:bg-agri-800"
                >
                  Record Harvest & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
