import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Tractor,
  Trees,
  TrendingUp,
  Receipt,
  Store,
  CloudSun,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FarmerDashboardPage = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, weatherRes] = await Promise.all([
          api.get('/farms/dashboard'),
          api.get('/weather/current?district=Pune'),
        ]);
        setDashboard(dashRes.data.data);
        setWeather(weatherRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        toast.error('Unable to load live dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = dashboard?.metrics || {
    totalFarms: 0,
    totalFields: 0,
    activeCropCyclesCount: 0,
    totalExpenses: 0,
    totalHarvestRevenue: 0,
    activeListingsCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-agri-800 via-agri-700 to-agri-800 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-agri-900/50 text-agri-200 inline-block mb-2">
            📍 Maharashtra Agro-Intelligence Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Namaste, {user?.profile?.fullName || 'Farmer'}!
          </h1>
          <p className="text-xs text-agri-100/90 mt-1 max-w-xl">
            Overview of your active fields, input expenses, harvest revenue, and AI crop health advisories.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/portal/farmer/farms"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-agri-900 font-bold text-xs shadow-sm hover:bg-agri-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Field
          </Link>
          <Link
            to="/portal/farmer/ai-crop"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-agri-900/60 hover:bg-agri-900 text-white font-semibold text-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Crop AI
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Registered Farms</span>
            <div className="p-2 rounded-xl bg-agri-50 text-agri-700">
              <Tractor className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{metrics.totalFarms}</p>
          <span className="text-[11px] text-gray-400 mt-0.5 block">{metrics.totalFields} Managed Plots</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Crop Cycles</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Trees className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-900 mt-2">{metrics.activeCropCyclesCount}</p>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Under Cultivation</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Recorded Expenses</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            ₹{metrics.totalExpenses.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-gray-400 mt-0.5 block">Seeds, Labor, Inputs</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Harvest Revenue</span>
            <div className="p-2 rounded-xl bg-harvest-50 text-harvest-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-harvest-900 mt-2">
            ₹{metrics.totalHarvestRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-harvest-700 font-medium mt-0.5 block">
            Net: ₹{(metrics.totalHarvestRevenue - metrics.totalExpenses).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Weather & Advisory Row */}
      {weather && (
        <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <CloudSun className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{weather.location}</span>
                {weather.isMock && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Regional Model
                  </span>
                )}
              </div>
              <p className="text-2xl font-black text-gray-900 mt-0.5">
                {weather.current.temp}°C
                <span className="text-xs font-normal text-gray-500 ml-2">
                  Humidity: {weather.current.humidity}% | Wind: {weather.current.windSpeed} km/h
                </span>
              </p>
            </div>
          </div>

          <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 max-w-md">
            <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block">
              Agro-Weather Advisory
            </span>
            <p className="text-xs text-sky-800 mt-0.5">
              {weather.agriculturalAdvisory?.irrigationSuggestion || 'Normal weather conditions.'}
            </p>
          </div>
        </div>
      )}

      {/* Active Crops and Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Crop Cycles */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Trees className="w-4 h-4 text-agri-700" />
              Active Crop Cycles
            </h2>
            <Link to="/portal/farmer/crops" className="text-xs font-semibold text-agri-700 hover:text-agri-800">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {dashboard?.activeCropCycles && dashboard.activeCropCycles.length > 0 ? (
              dashboard.activeCropCycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="p-3.5 rounded-2xl bg-agri-50/40 border border-agri-100/60 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      {cycle.crop.name} {cycle.crop.nameMarathi && `(${cycle.crop.nameMarathi})`}
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {cycle.field.name} • {cycle.areaAcres} Acres
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-agri-100 text-agri-800">
                      {cycle.growthStage}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-1">Status: {cycle.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-gray-400">No active crop cycles currently registered.</p>
                <Link
                  to="/portal/farmer/crops"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-agri-700 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Start Crop Cycle
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Farm Expenses */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-red-600" />
              Recent Farm Expenses
            </h2>
            <Link to="/portal/farmer/analytics" className="text-xs font-semibold text-agri-700 hover:text-agri-800">
              Financial Breakdown
            </Link>
          </div>

          <div className="space-y-2.5">
            {dashboard?.recentExpenses && dashboard.recentExpenses.length > 0 ? (
              dashboard.recentExpenses.map((exp) => (
                <div key={exp.id} className="p-3 rounded-2xl bg-gray-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block truncate max-w-[200px]">
                      {exp.description}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {exp.category} • {new Date(exp.expenseDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-red-600">
                    -₹{Number(exp.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">No expenses recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
