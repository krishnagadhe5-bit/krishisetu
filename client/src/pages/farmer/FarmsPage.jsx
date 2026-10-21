import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Tractor, Plus, MapPin, Layers, Droplets, Trash2, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const FarmsPage = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [showAddField, setShowAddField] = useState(false);

  // Form states
  const [farmForm, setFarmForm] = useState({
    name: '',
    district: 'Pune',
    taluka: '',
    village: '',
    areaAcres: 5.0,
    soilType: 'BLACK_COTTON',
    irrigationType: 'DRIP',
    waterSource: 'Borewell & Canal',
  });

  const [fieldForm, setFieldForm] = useState({
    name: '',
    areaAcres: 2.5,
    soilType: 'BLACK_COTTON',
    irrigationType: 'DRIP',
  });

  const fetchFarms = async () => {
    try {
      const res = await api.get('/farms');
      setFarms(res.data.data || []);
      if (res.data.data?.length > 0 && !selectedFarm) {
        setSelectedFarm(res.data.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/farms', {
        ...farmForm,
        areaAcres: Number(farmForm.areaAcres),
      });
      toast.success('Farm registered successfully!');
      setShowAddFarm(false);
      fetchFarms();
      setSelectedFarm(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create farm');
    }
  };

  const handleCreateField = async (e) => {
    e.preventDefault();
    if (!selectedFarm) return;
    try {
      await api.post('/fields', {
        farmId: selectedFarm.id,
        ...fieldForm,
        areaAcres: Number(fieldForm.areaAcres),
      });
      toast.success('Plot / Field added to farm!');
      setShowAddField(false);
      fetchFarms();
      // Reload details
      const updated = await api.get(`/farms/${selectedFarm.id}`);
      setSelectedFarm(updated.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add field');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Farms & Field Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Register your land parcels, manage individual cultivation plots, and monitor soil profiles.
          </p>
        </div>

        <button
          onClick={() => setShowAddFarm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Register New Farm
        </button>
      </div>

      {/* Farms List Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {farms.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFarm(f)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition ${
              selectedFarm?.id === f.id
                ? 'bg-agri-700 text-white border-agri-700 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            🌾 {f.name} ({f.areaAcres || '0'} Ac)
          </button>
        ))}
      </div>

      {/* Selected Farm Detail & Fields */}
      {selectedFarm ? (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-agri-700">Primary Farm Estate</span>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">{selectedFarm.name}</h2>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {selectedFarm.village ? `${selectedFarm.village}, ` : ''}
                  {selectedFarm.taluka ? `${selectedFarm.taluka}, ` : ''}
                  {selectedFarm.district}, {selectedFarm.state}
                </p>
              </div>

              <button
                onClick={() => setShowAddField(true)}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-agri-50 text-agri-700 font-bold text-xs border border-agri-200 hover:bg-agri-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Plot / Field
              </button>
            </div>

            {/* Farm attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Land Area</span>
                <span className="text-sm font-bold text-gray-900 mt-0.5 block">{selectedFarm.areaAcres || 0} Acres</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Soil Type</span>
                <span className="text-sm font-bold text-gray-900 mt-0.5 block">{selectedFarm.soilType || 'Black Cotton'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Irrigation Method</span>
                <span className="text-sm font-bold text-gray-900 mt-0.5 block">{selectedFarm.irrigationType || 'Drip'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Water Source</span>
                <span className="text-sm font-bold text-gray-900 mt-0.5 block truncate">{selectedFarm.waterSource || 'Borewell'}</span>
              </div>
            </div>
          </div>

          {/* Fields list */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-agri-700" />
              Registered Fields & Cultivation Plots
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedFarm.fields && selectedFarm.fields.length > 0 ? (
                selectedFarm.fields.map((fld) => (
                  <div key={fld.id} className="p-4 rounded-2xl border border-gray-100 bg-[#fafcf9] hover:border-agri-200 transition">
                    <span className="text-xs font-bold text-gray-900 block">{fld.name}</span>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold">{fld.areaAcres} Acres</span>
                      <span className="px-2 py-0.5 rounded-md bg-agri-100 text-agri-800 font-semibold">{fld.soilType || 'Loamy'}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-sky-500" />
                      {fld.irrigationType || 'Drip Irrigation'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-xs text-gray-400">
                  No individual field plots registered for this farm yet. Click "Add Plot / Field" above.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 p-8">
          <Tractor className="w-12 h-12 text-agri-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-800">No Farms Registered Yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Get started by registering your agricultural property to enable crop cycles, soil recommendations, and market listings.
          </p>
          <button
            onClick={() => setShowAddFarm(true)}
            className="mt-4 px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl text-xs font-bold transition"
          >
            Register Farm
          </button>
        </div>
      )}
      </div>

      {/* Modal: Add Farm */}
      {showAddFarm && (
        <div className="fixed inset-0 z-50 !m-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-gray-900 mb-4">Register New Agricultural Farm</h3>
            <form onSubmit={handleCreateFarm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  required
                  value={farmForm.name}
                  onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                  placeholder="e.g. Shivaji Agro Estate"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">District (MH)</label>
                  <input
                    type="text"
                    required
                    value={farmForm.district}
                    onChange={(e) => setFarmForm({ ...farmForm, district: e.target.value })}
                    placeholder="Pune"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={farmForm.areaAcres}
                    onChange={(e) => setFarmForm({ ...farmForm, areaAcres: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Soil Type</label>
                  <select
                    value={farmForm.soilType}
                    onChange={(e) => setFarmForm({ ...farmForm, soilType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="BLACK_COTTON">Black Cotton (काळी माती)</option>
                    <option value="ALLUVIAL">Alluvial (गाळाची माती)</option>
                    <option value="RED">Red Soil (तांबडी माती)</option>
                    <option value="LATERITE">Laterite (जांभा)</option>
                    <option value="LOAMY">Loamy (पोयट्याची)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Irrigation Method</label>
                  <select
                    value={farmForm.irrigationType}
                    onChange={(e) => setFarmForm({ ...farmForm, irrigationType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="DRIP">Drip Irrigation (ठिबक)</option>
                    <option value="SPRINKLER">Sprinkler (तुषार)</option>
                    <option value="FLOOD">Flood / Furrow</option>
                    <option value="RAINFED">Rainfed (जिरायती)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Water Source</label>
                <input
                  type="text"
                  value={farmForm.waterSource}
                  onChange={(e) => setFarmForm({ ...farmForm, waterSource: e.target.value })}
                  placeholder="e.g. Nira Canal & 450ft Borewell"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFarm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-agri-700 text-white font-bold hover:bg-agri-800"
                >
                  Save Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Field */}
      {showAddField && (
        <div className="fixed inset-0 z-50 !m-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-gray-900 mb-4">Add Field Plot to {selectedFarm.name}</h3>
            <form onSubmit={handleCreateField} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Field Name / Plot ID</label>
                <input
                  type="text"
                  required
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                  placeholder="e.g. Plot B - North Slope"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={fieldForm.areaAcres}
                  onChange={(e) => setFieldForm({ ...fieldForm, areaAcres: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddField(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-agri-700 text-white font-bold hover:bg-agri-800"
                >
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
