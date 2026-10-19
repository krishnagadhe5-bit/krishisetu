import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  TrendingUp,
  Receipt,
  DollarSign,
  PieChart as PieIcon,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

export const AnalyticsPage = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scenario Simulator state
  const [simForm, setSimForm] = useState({
    cropChoice: 'Sugarcane (ऊस)',
    rainfallScenario: 'deficient_20',
    costInflationPct: 10,
    marketPriceShockPct: -5,
  });
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    api.get('/farms')
      .then((res) => {
        const list = res.data.data || [];
        setFarms(list);
        if (list.length > 0) {
          setSelectedFarmId(list[0].id);
          fetchFinancials(list[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchFinancials = async (farmId) => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/farm/${farmId}`);
      setFinancials(res.data.data);
    } catch (err) {
      toast.error('Failed to load farm financials');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    if (!selectedFarmId) return;

    setSimLoading(true);
    try {
      const res = await api.post('/analytics/simulate', {
        farmId: selectedFarmId,
        ...simForm,
        costInflationPct: Number(simForm.costInflationPct),
        marketPriceShockPct: Number(simForm.marketPriceShockPct),
      });
      setSimResult(res.data.data);
      toast.success('Digital Twin scenario projection generated!');
    } catch (err) {
      toast.error('Simulation execution failed');
    } finally {
      setSimLoading(false);
    }
  };

  const COLORS = ['#16a34a', '#d97706', '#2563eb', '#9333ea', '#dc2626', '#0d9488'];

  const exportCSV = () => {
    if (!financials) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Farm Expenses (INR)', financials.summary.totalExpense],
      ['Total Harvest Revenue (INR)', financials.summary.totalRevenue],
      ['Net Profit / Loss (INR)', financials.summary.netProfit],
      ['Cost Per Acre (INR)', financials.summary.costPerAcre],
      ['Cost Per Kg (INR)', financials.summary.costPerKg],
      ['Total Harvest (kg)', financials.summary.totalHarvestKg],
      [],
      ['Expense Category', 'Amount (INR)', 'Percentage'],
      ...financials.expensesByCategory.map((c) => [c.category, c.amount, `${c.percentage}%`]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `farm_financial_statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Financial report exported to CSV!');
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 text-agri-900 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-agri-700" />
            Financial P&L Statement & Digital Twin Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Farm Profitability & Scenario Simulation
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time accounting of cultivation investments, harvested returns, and predictive what-if modeling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {farms.length > 0 && (
            <select
              value={selectedFarmId}
              onChange={(e) => {
                setSelectedFarmId(e.target.value);
                fetchFinancials(e.target.value);
              }}
              className="px-3 py-2 text-xs font-bold border border-gray-200 rounded-xl bg-white shadow-sm"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.district})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {financials && (
        <div className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Total Cultivation Cost</span>
              <span className="text-2xl font-black text-red-600 mt-1 block">
                ₹{financials.summary.totalExpense.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-gray-500 mt-1 block">
                ₹{financials.summary.costPerAcre.toLocaleString('en-IN')} / acre
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Harvest Revenue</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                ₹{financials.summary.totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-gray-500 mt-1 block">
                {financials.summary.totalHarvestKg.toLocaleString('en-IN')} kg sold
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Net Farm Profit / Margin</span>
              <span
                className={`text-2xl font-black mt-1 block ${
                  financials.summary.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                ₹{financials.summary.netProfit.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-gray-500 mt-1 block">
                Margin: {financials.summary.profitMarginPct}%
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Production Unit Cost</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">
                ₹{financials.summary.costPerKg}
              </span>
              <span className="text-[11px] text-gray-500 mt-1 block">Cost per kg harvested</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Expense Breakdown Chart */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-agri-700" />
                Expenditure by Input Category
              </h3>

              {financials.expensesByCategory.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financials.expensesByCategory}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {financials.expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-gray-400">
                  No expense records logged for this farm yet.
                </div>
              )}
            </div>

            {/* Crop Performance List */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-agri-700" />
                Plot-Wise Cultivation Yields
              </h3>

              <div className="space-y-3">
                {financials.cropPerformance && financials.cropPerformance.length > 0 ? (
                  financials.cropPerformance.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900 block">{item.cropName}</span>
                        <span className="text-[11px] text-gray-500">
                          {item.fieldName} • {item.areaAcres} Acres • Status: {item.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-800 block">₹{item.revenueInr.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-gray-400">{item.harvestKg} kg total</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-12 text-center">No harvest returns recorded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* ADVANCED FEATURE: Farm Digital Twin & Scenario Simulator */}
          <div className="bg-gradient-to-br from-[#122e1e] to-agri-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-agri-300 uppercase tracking-widest block mb-1">
                Advanced Digital Twin Engine
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Farm Scenario Simulation & Climate Resilience Testing
              </h3>
              <p className="text-xs text-agri-100/90 mt-1 leading-relaxed">
                Test how shifts in rainfall patterns, input inflation, or crop selection would affect your bottom-line profitability before committing capital.
              </p>
            </div>

            <form onSubmit={handleRunSimulation} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-agri-200 font-semibold mb-1">Crop Choice</label>
                <select
                  value={simForm.cropChoice}
                  onChange={(e) => setSimForm({ ...simForm, cropChoice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none"
                >
                  <option value="Sugarcane (ऊस)" className="text-gray-900">Sugarcane (ऊस)</option>
                  <option value="Cotton (कापूस)" className="text-gray-900">Cotton (कापूस)</option>
                  <option value="Soybean (सोयाबीन)" className="text-gray-900">Soybean (सोयाबीन)</option>
                  <option value="Onion (कांदा)" className="text-gray-900">Onion (कांदा)</option>
                  <option value="Pigeon Pea / Tur (तूर)" className="text-gray-900">Pigeon Pea / Tur (तूर)</option>
                  <option value="Wheat (गहू)" className="text-gray-900">Wheat (गहू)</option>
                </select>
              </div>

              <div>
                <label className="block text-agri-200 font-semibold mb-1">Rainfall Scenario</label>
                <select
                  value={simForm.rainfallScenario}
                  onChange={(e) => setSimForm({ ...simForm, rainfallScenario: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none"
                >
                  <option value="normal" className="text-gray-900">Normal Monsoon (100%)</option>
                  <option value="deficient_20" className="text-gray-900">Deficient (-20% Rain)</option>
                  <option value="drought" className="text-gray-900">Severe Drought (-45%)</option>
                  <option value="excess_20" className="text-gray-900">Excess / Unseasonal (+20%)</option>
                </select>
              </div>

              <div>
                <label className="block text-agri-200 font-semibold mb-1">Input Inflation (%)</label>
                <input
                  type="number"
                  value={simForm.costInflationPct}
                  onChange={(e) => setSimForm({ ...simForm, costInflationPct: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none"
                  placeholder="+10%"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={simLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-agri-500 hover:bg-agri-400 text-agri-950 font-bold text-xs shadow-md transition"
                >
                  {simLoading ? 'Simulating...' : 'Run Digital Twin'}
                </button>
              </div>
            </form>

            {/* Simulation Comparison Output */}
            {simResult && (
              <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-bold text-agri-300">
                    Simulation: {simResult.cropChoice} ({simResult.farmAreaAcres} Acres)
                  </span>
                  <span
                    className={`text-xs font-extrabold px-3 py-0.5 rounded-full ${
                      simResult.scenarioComparison.deltas.profitDifference >= 0
                        ? 'bg-emerald-400/20 text-emerald-300'
                        : 'bg-red-400/20 text-red-300'
                    }`}
                  >
                    Profit Delta: ₹{simResult.scenarioComparison.deltas.profitDifference.toLocaleString('en-IN')} (
                    {simResult.scenarioComparison.deltas.profitChangePct}%)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-300 block">Baseline (Normal Climate)</span>
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <strong>₹{simResult.scenarioComparison.baseline.cost.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Yield:</span>
                      <strong>{simResult.scenarioComparison.baseline.yieldKg.toLocaleString('en-IN')} kg</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Profit:</span>
                      <strong className="text-emerald-300">
                        ₹{simResult.scenarioComparison.baseline.netProfit.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-agri-500/10 border border-agri-400/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-agri-200 block">Simulated Climate Shock</span>
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <strong>₹{simResult.scenarioComparison.simulated.cost.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Yield:</span>
                      <strong>{simResult.scenarioComparison.simulated.yieldKg.toLocaleString('en-IN')} kg</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Profit:</span>
                      <strong
                        className={
                          simResult.scenarioComparison.simulated.netProfit >= 0
                            ? 'text-emerald-300'
                            : 'text-red-300'
                        }
                      >
                        ₹{simResult.scenarioComparison.simulated.netProfit.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-agri-200/70">{simResult.notice}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
