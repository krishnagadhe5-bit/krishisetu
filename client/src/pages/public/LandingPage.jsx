import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import {
  Sprout,
  ShieldCheck,
  TrendingUp,
  CloudSun,
  Sparkles,
  BotMessageSquare,
  Truck,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  HelpCircle,
  Phone,
  Layers,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#f8faf7] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.agri.100),theme(colors.transparent))] opacity-60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-agri-100/80 border border-agri-300 text-agri-900 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-agri-600 animate-pulse" />
            Empowering Indian Agriculture with Real Data & Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Smart Farming. Better Decisions.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-agri-700 via-agri-600 to-harvest-600">
              Stronger Markets.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            KrishiSetu is Maharashtra's comprehensive agricultural intelligence platform. Unify farm planning, soil nutrient AI, computer vision disease diagnostics, market prices, and B2B buyer supply chains in one place.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-semibold text-sm shadow-md shadow-agri-700/25 transition"
            >
              Start Free Farm Setup
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/marketplace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm border border-gray-200 shadow-sm transition"
            >
              Browse Agricultural Produce
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur border border-gray-100 shadow-sm">
            <div className="p-3 text-center">
              <span className="text-2xl font-bold text-agri-800">10+</span>
              <p className="text-xs text-gray-500 mt-0.5">Maharashtra Crops</p>
            </div>
            <div className="p-3 text-center">
              <span className="text-2xl font-bold text-agri-800">5+</span>
              <p className="text-xs text-gray-500 mt-0.5">APMC Mandis Linked</p>
            </div>
            <div className="p-3 text-center">
              <span className="text-2xl font-bold text-agri-800">92%+</span>
              <p className="text-xs text-gray-500 mt-0.5">ML Recommendation Accuracy</p>
            </div>
            <div className="p-3 text-center">
              <span className="text-2xl font-bold text-agri-800">100%</span>
              <p className="text-xs text-gray-500 mt-0.5">Transparent Agronomy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Problems & Solution */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-agri-700 uppercase tracking-widest">End-to-End Farming Lifecycle</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              Everything a Farmer Needs From Sowing to Sale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#f8faf7] border border-agri-100/80 hover:border-agri-300 transition">
              <div className="w-12 h-12 rounded-xl bg-agri-600 text-white flex items-center justify-center mb-5 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">1. AI Soil & Crop Suitability</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Feed your soil NPK, pH, and local weather into our trained Random Forest model to receive calibrated crop suggestions with confidence rationales.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8faf7] border border-agri-100/80 hover:border-agri-300 transition">
              <div className="w-12 h-12 rounded-xl bg-harvest-600 text-white flex items-center justify-center mb-5 shadow-sm">
                <CloudSun className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">2. Smart Weather & Irrigation</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Hyperlocal precipitation forecasting and evapotranspiration models tell you exactly when and how much to irrigate, saving water and pumping electricity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8faf7] border border-agri-100/80 hover:border-agri-300 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-5 shadow-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">3. Direct B2B Marketplace</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Sell produce directly to verified commercial buyers. Manage orders with transaction-safe inventory reservations, shipment dispatch, and automated profit analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Twin Feature Highlight */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-agri-950 via-agri-900 to-agri-950 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-agri-300 uppercase tracking-widest block mb-2">Advanced Feature</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Farm Digital Twin & What-If Scenario Simulator
              </h3>
              <p className="mt-4 text-xs sm:text-sm text-agri-100/90 leading-relaxed">
                Uncertain about the upcoming monsoon? Model your farm under 20% deficit rainfall, simulate input cost increases, or compare Sugarcane vs. Cotton profitability before buying seeds.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/portal/farmer/analytics"
                  className="px-5 py-2.5 rounded-xl bg-agri-500 hover:bg-agri-400 text-agri-950 font-bold text-xs shadow-md transition"
                >
                  Explore Scenario Simulator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-agri-700" />
            <span className="font-semibold text-gray-800">KrishiSetu Platform</span>
            <span>— Maharashtra, India</span>
          </div>
          <p>© 2026 KrishiSetu. Full-Stack B.Tech AI/ML Engineering Project.</p>
        </div>
      </footer>
    </div>
  );
};
