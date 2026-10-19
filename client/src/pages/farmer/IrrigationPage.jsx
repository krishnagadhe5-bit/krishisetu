import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Droplets, Clock, AlertCircle, CheckCircle2, Waves, ArrowRight, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const IrrigationPage = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [formData, setFormData] = useState({
    cropName: 'Sugarcane',
    growthStage: 'VEGETATIVE',
    soilType: 'BLACK_COTTON',
    tempCelsius: 31,
    recentRainfallMm: 0,
    forecastRainfallMm: 2,
    soilMoisturePct: 45,
  });

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    api.get('/farms')
      .then((res) => {
        const list = res.data.data || [];
        setFarms(list);
        if (list.length > 0) setSelectedFarmId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!selectedFarmId) {
      toast.error('Please select or register a farm first');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/ai/irrigation/${selectedFarmId}`, formData);
      setRecommendation(res.data.data);
      toast.success('Irrigation schedule calculated!');
    } catch (err) {
      toast.error('Calculation failed. Please verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-semibold mb-2">
          <Droplets className="w-3.5 h-3.5 text-sky-700" />
          FAO-56 Penman-Monteith Evapotranspiration Engine
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          Smart Irrigation & Water Intelligence
        </h1>
        <p className="text-xs text-gray-500 mt-1 max-w-2xl">
          Optimize drip pump operation and volume delivery according to stage-wise crop coefficients and local weather forecasts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Waves className="w-4 h-4 text-sky-600" />
            Field Water Balance Parameters
          </h2>

          <form onSubmit={handleCalculate} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Target Farm</label>
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.district})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Crop</label>
                <select
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="Sugarcane">Sugarcane (ऊस)</option>
                  <option value="Cotton">Cotton (कापूस)</option>
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Onion">Onion (कांदा)</option>
                  <option value="Pomegranate">Pomegranate (डाळिंब)</option>
                  <option value="Tomato">Tomato (टोमॅटो)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Crop Growth Stage</label>
                <select
                  value={formData.growthStage}
                  onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="SEEDLING">Seedling (रोपे)</option>
                  <option value="VEGETATIVE">Vegetative (वाढ)</option>
                  <option value="FLOWERING">Flowering (फुलधारणा)</option>
                  <option value="FRUIT_DEVELOPMENT">Fruit / Pod Development</option>
                  <option value="MATURITY">Maturity / Pre-Harvest</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Ambient Temp (°C)</label>
                <input
                  type="number"
                  value={formData.tempCelsius}
                  onChange={(e) => setFormData({ ...formData, tempCelsius: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Soil Moisture (%)</label>
                <input
                  type="number"
                  value={formData.soilMoisturePct}
                  onChange={(e) => setFormData({ ...formData, soilMoisturePct: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  placeholder="Optional sensor"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Recent Rain (mm)</label>
                <input
                  type="number"
                  value={formData.recentRainfallMm}
                  onChange={(e) => setFormData({ ...formData, recentRainfallMm: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Forecast Rain (mm)</label>
                <input
                  type="number"
                  value={formData.forecastRainfallMm}
                  onChange={(e) => setFormData({ ...formData, forecastRainfallMm: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              Calculate Irrigation Schedule
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          {recommendation ? (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Recommended Action
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                  {recommendation.recommendation.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
                  <span className="text-[10px] font-bold text-sky-900 uppercase block">Drip Runtime</span>
                  <span className="text-2xl font-black text-sky-950 mt-1 block">
                    {recommendation.suggestedHours} Hours
                  </span>
                  <span className="text-[10px] text-sky-700">Per acre irrigation cycle</span>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
                  <span className="text-[10px] font-bold text-sky-900 uppercase block">Water Volume</span>
                  <span className="text-2xl font-black text-sky-950 mt-1 block">
                    {recommendation.waterLitersPerAcre.toLocaleString()} L
                  </span>
                  <span className="text-[10px] text-sky-700">Calculated soil deficit</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#fafcf9] border border-gray-100">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-agri-700" />
                  Suggested Irrigation Window
                </span>
                <p className="text-xs text-gray-700">{recommendation.suggestedWindow}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-900 block">Supporting Agronomic Factors</span>
                {recommendation.factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-100 flex items-center justify-between">
                <span>Confidence: {recommendation.confidenceLevel}</span>
                <span>Updated: {new Date(recommendation.dataFreshness).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center h-full flex flex-col items-center justify-center">
              <Droplets className="w-10 h-10 text-sky-200 mb-3" />
              <h3 className="text-sm font-bold text-gray-800">Awaiting Farm Water Parameters</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Submit field conditions to compute exact drip pump duration and liters per acre.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
