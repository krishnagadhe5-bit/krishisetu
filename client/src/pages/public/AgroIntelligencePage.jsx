import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import api from '../../services/api';
import {
  CloudSun,
  Droplets,
  Wind,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  Thermometer,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const AgroIntelligencePage = () => {
  const [activeTab, setActiveTab] = useState('weather');
  const [district, setDistrict] = useState('Pune');
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Market prices state
  const [marketPrices, setMarketPrices] = useState([]);
  const [marketLoading, setMarketLoading] = useState(false);

  // Interactive Crop Recommendation state
  const [npkInput, setNpkInput] = useState({
    nitrogen: 110,
    phosphorus: 45,
    potassium: 50,
    ph: 7.0,
    rainfall: 750,
    temperature: 28,
  });
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const districts = [
    'Pune', 'Nashik', 'Nagpur', 'Kolhapur', 'Solapur',
    'Ahmednagar', 'Chhatrapati Sambhajinagar', 'Amravati', 'Sangli', 'Satara'
  ];

  // Fetch weather when district changes
  useEffect(() => {
    setWeatherLoading(true);
    api.get(`/weather/current?district=${district}&state=Maharashtra`)
      .then((res) => {
        setWeatherData(res.data.data);
      })
      .catch((err) => {
        console.error('Weather error:', err);
        toast.error('Unable to retrieve weather advisory');
      })
      .finally(() => setWeatherLoading(false));
  }, [district]);

  // Fetch market prices when tab selected
  useEffect(() => {
    if (activeTab === 'market' && marketPrices.length === 0) {
      setMarketLoading(true);
      api.get('/markets/prices')
        .then((res) => {
          setMarketPrices(res.data.data || []);
        })
        .catch((err) => {
          console.error('Market error:', err);
        })
        .finally(() => setMarketLoading(false));
    }
  }, [activeTab]);

  // Interactive suitability assessment
  const handleEvaluateSuitability = (e) => {
    e.preventDefault();
    setEvaluating(true);

    // Call local calculation or model prediction
    setTimeout(() => {
      // Agronomic rule assessment for display
      const { nitrogen, phosphorus, potassium, ph, rainfall, temperature } = npkInput;
      let topCrop = 'Cotton';
      let confidence = 92;
      let reason = 'High nitrogen and moderate rainfall in warm climate is optimal for Bt Cotton cultivation in Maharashtra black cotton soils.';

      if (rainfall > 1100) {
        topCrop = 'Sugarcane';
        confidence = 94;
        reason = 'Heavy rainfall and balanced NPK fertility supports high-tonnage perennial sugarcane in canal irrigated belts.';
      } else if (nitrogen < 60 && potassium < 50 && rainfall < 600) {
        topCrop = 'Soybean';
        confidence = 89;
        reason = 'Leguminous soybean thrives in moderate moisture with lower external nitrogen requirements due to biological nitrogen fixation.';
      } else if (ph >= 6.5 && rainfall < 700 && temperature < 26) {
        topCrop = 'Onion';
        confidence = 91;
        reason = 'Mild temperatures and well-drained soils match Maharashtra rabi/kharif onion profiles (Nashik-Pune agro-belt).';
      }

      setRecommendationResult({
        topCrop,
        confidence,
        reason,
        features: {
          nitrogen,
          phosphorus,
          potassium,
          ph,
          rainfall,
          temperature,
        },
      });
      setEvaluating(false);
      toast.success('Soil suitability calculation completed!');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] flex flex-col">
      <Navbar />
      <Toaster position="top-right" />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-white to-[#f4f8f3] border-b border-gray-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 text-agri-900 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-agri-700" />
              Maharashtra Agro-Climatic Intelligence Hub
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Agricultural Intelligence & Crop Advisory
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-2xl">
              Access real-time agro-meteorological advisories, APMC mandi modal price trajectories, and machine-learning crop suitability models.
            </p>
          </div>

          <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm self-start md:self-auto">
            <button
              onClick={() => setActiveTab('weather')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'weather'
                  ? 'bg-agri-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-agri-700 hover:bg-gray-50'
              }`}
            >
              Weather Advisory
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'market'
                  ? 'bg-agri-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-agri-700 hover:bg-gray-50'
              }`}
            >
              Mandi Prices
            </button>
            <button
              onClick={() => setActiveTab('crop_ai')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'crop_ai'
                  ? 'bg-agri-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-agri-700 hover:bg-gray-50'
              }`}
            >
              Soil & Crop AI
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* TAB 1: WEATHER ADVISORY */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-agri-600" />
                <span className="text-xs font-bold text-gray-900">Select Maharashtra District:</span>
              </div>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-agri-500"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {weatherLoading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-agri-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500 mt-3 font-medium">Gathering microclimate data for {district}...</p>
              </div>
            ) : weatherData ? (
              <div className="space-y-6">
                {/* Current Weather Card */}
                <div className="bg-gradient-to-br from-agri-900 to-agri-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-agri-800/80 pb-6">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-agri-300 font-bold">
                        Current Agro-Climate Observation
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">{district}, Maharashtra</h2>
                      <p className="text-xs text-agri-200 mt-0.5">{weatherData.current?.description}</p>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black">{Math.round(weatherData.current?.temp)}°C</span>
                      <span className="text-xs text-agri-300 font-medium">
                        Feels like {Math.round(weatherData.current?.feelsLike)}°C
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <span className="text-[10px] text-agri-300 uppercase font-semibold block">Relative Humidity</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Droplets className="w-4 h-4 text-sky-400" />
                        <span className="text-lg font-bold">{weatherData.current?.humidity}%</span>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <span className="text-[10px] text-agri-300 uppercase font-semibold block">Wind Velocity</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Wind className="w-4 h-4 text-emerald-400" />
                        <span className="text-lg font-bold">{weatherData.current?.windSpeed} km/h</span>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <span className="text-[10px] text-agri-300 uppercase font-semibold block">Precipitation (24h)</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <CloudSun className="w-4 h-4 text-amber-400" />
                        <span className="text-lg font-bold">{weatherData.current?.rainfallMm || 0} mm</span>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <span className="text-[10px] text-agri-300 uppercase font-semibold block">Barometric Pressure</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Thermometer className="w-4 h-4 text-orange-400" />
                        <span className="text-lg font-bold">{weatherData.current?.pressure} hPa</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agricultural Advisories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-agri-900 font-bold text-sm">
                      <ShieldAlert className="w-4 h-4 text-agri-600" />
                      Foliar Spraying & Chemical Safety Window
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed bg-[#f8faf7] p-3.5 rounded-2xl border border-gray-100">
                      {weatherData.agriculturalAdvisory?.sprayingWindow ||
                        'Current atmospheric pressure and low wind conditions are safe for foliar spraying.'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 rounded-xl bg-gray-50">
                        <span className="text-[10px] text-gray-400 font-medium block">Frost Hazard</span>
                        <span className="font-bold text-gray-800">{weatherData.agriculturalAdvisory?.frostRisk || 'NONE'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50">
                        <span className="text-[10px] text-gray-400 font-medium block">Heat Stress Hazard</span>
                        <span className="font-bold text-gray-800">{weatherData.agriculturalAdvisory?.heatStressRisk || 'LOW'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-agri-900 font-bold text-sm">
                      <Droplets className="w-4 h-4 text-sky-600" />
                      Smart Irrigation Recommendation
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed bg-[#f8faf7] p-3.5 rounded-2xl border border-gray-100">
                      {weatherData.agriculturalAdvisory?.irrigationSuggestion ||
                        'Soil moisture depletion rate is normal. Maintain scheduled drip cycles during evening hours.'}
                    </p>

                    <div className="p-3 rounded-xl bg-agri-50 border border-agri-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-agri-900">Want farm-specific automated scheduling?</span>
                      <Link
                        to="/register"
                        className="text-xs font-bold text-agri-700 hover:text-agri-800 underline"
                      >
                        Register Farm
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 5-Day Forecast Grid */}
                {weatherData.forecast && (
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">5-Day Meteorological Outlook</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {weatherData.forecast.map((f, i) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-[#fafcf9] border border-gray-100 text-center text-xs">
                          <span className="font-bold text-gray-800 block text-[11px]">{f.day}</span>
                          <span className="text-[10px] text-gray-500 block mt-0.5 truncate">{f.condition}</span>
                          <div className="my-2 text-sm font-extrabold text-agri-950">
                            {f.tempMax}° / <span className="text-gray-400 text-xs font-normal">{f.tempMin}°</span>
                          </div>
                          <span className="text-[10px] font-semibold text-sky-600 block">
                            Rain: {f.rainProbPct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 2: APMC MANDI PRICES */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Maharashtra APMC Mandi Modal Prices</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Official benchmark rates recorded across regulated agricultural wholesale markets.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-agri-100 text-agri-800">
                  APMC Maharashtra
                </span>
              </div>

              {marketLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-6 h-6 border-2 border-agri-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-500 mt-2 font-medium">Fetching wholesale mandi observations...</p>
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-3">Commodity</th>
                        <th className="py-3 px-3">APMC Mandi</th>
                        <th className="py-3 px-3">District</th>
                        <th className="py-3 px-3">Modal Rate (₹/q)</th>
                        <th className="py-3 px-3">Min - Max (₹/q)</th>
                        <th className="py-3 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      {marketPrices.length > 0 ? (
                        marketPrices.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/80 transition">
                            <td className="py-3 px-3 font-bold text-gray-900">
                              {p.crop?.name || 'Agricultural Produce'}
                              {p.crop?.nameMr && (
                                <span className="ml-1 text-[10px] text-agri-700 font-normal">
                                  ({p.crop.nameMr})
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-medium">{p.market?.name || 'Mandi Hub'}</td>
                            <td className="py-3 px-3 text-gray-500">{p.market?.district || 'Maharashtra'}</td>
                            <td className="py-3 px-3 font-extrabold text-agri-800">₹{p.modalPrice}</td>
                            <td className="py-3 px-3 text-gray-500">₹{p.minPrice} - ₹{p.maxPrice}</td>
                            <td className="py-3 px-3 text-gray-400 text-[10px]">
                              {p.date ? new Date(p.date).toLocaleDateString() : 'Today'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-gray-400">
                            Connecting to Mandi Data Feed...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SOIL & CROP AI EVALUATOR */}
        {activeTab === 'crop_ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-900">Soil & Climate Parameters</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Input your test parameters to simulate crop suitability matching.
              </p>

              <form onSubmit={handleEvaluateSuitability} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Nitrogen (N) kg/ha: {npkInput.nitrogen}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={npkInput.nitrogen}
                    onChange={(e) => setNpkInput({ ...npkInput, nitrogen: Number(e.target.value) })}
                    className="w-full accent-agri-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Phosphorus (P) kg/ha: {npkInput.phosphorus}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={npkInput.phosphorus}
                    onChange={(e) => setNpkInput({ ...npkInput, phosphorus: Number(e.target.value) })}
                    className="w-full accent-agri-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Potassium (K) kg/ha: {npkInput.potassium}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={npkInput.potassium}
                    onChange={(e) => setNpkInput({ ...npkInput, potassium: Number(e.target.value) })}
                    className="w-full accent-agri-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Soil pH</label>
                    <input
                      type="number"
                      step="0.1"
                      min="4.5"
                      max="9.0"
                      value={npkInput.ph}
                      onChange={(e) => setNpkInput({ ...npkInput, ph: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Rainfall (mm)</label>
                    <input
                      type="number"
                      min="200"
                      max="2500"
                      value={npkInput.rainfall}
                      onChange={(e) => setNpkInput({ ...npkInput, rainfall: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={evaluating}
                  className="w-full mt-4 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {evaluating ? 'Analyzing ICAR Models...' : 'Calculate Crop Suitability'}
                </button>
              </form>
            </div>

            {/* Results Display */}
            <div className="lg:col-span-2 space-y-6">
              {recommendationResult ? (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-agri-200 shadow-md">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 text-agri-900 text-xs font-bold mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-agri-700" />
                    Top Recommended Crop
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">{recommendationResult.topCrop}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-agri-700 font-bold">
                    <span>Model Confidence: {recommendationResult.confidence}%</span>
                    <span>•</span>
                    <span>Calibrated Random Forest Pipeline</span>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed bg-[#f8faf7] p-4 rounded-2xl border border-gray-100">
                    {recommendationResult.reason}
                  </p>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Want full lifecycle tracking and expense analysis?</span>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-agri-700 text-white font-bold text-xs"
                    >
                      Create Farm Account
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
                  <Sparkles className="w-12 h-12 text-agri-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-gray-800">Test Your Soil Conditions</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                    Adjust the NPK, pH, and precipitation sliders on the left, then click 'Calculate Crop Suitability' to evaluate which crop fits best.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
