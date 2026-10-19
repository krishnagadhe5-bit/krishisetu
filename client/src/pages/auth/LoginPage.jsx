import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.profile?.fullName || user.email}!`);
      // Navigate to respective role portal
      if (user.role === 'FARMER') navigate('/portal/farmer');
      else if (user.role === 'BUYER') navigate('/portal/buyer');
      else if (user.role === 'ADMIN') navigate('/portal/admin');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-agri-700 flex items-center justify-center text-white shadow-md">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-agri-950">KrishiSetu</span>
        </Link>
        <h2 className="mt-4 text-xl sm:text-2xl font-extrabold text-gray-900">Sign in to your account</h2>
        <p className="mt-1 text-xs text-gray-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-agri-700 hover:text-agri-800">
            register for a new farmer, buyer, or expert profile
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-100 rounded-3xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Email Address</label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@krishisetu.in"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-agri-500 focus:border-agri-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Password</label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-agri-500 focus:border-agri-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-xs sm:text-sm font-semibold text-white bg-agri-700 hover:bg-agri-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agri-500 disabled:opacity-50 transition"
            >
              {loading ? 'Authenticating...' : 'Sign In to KrishiSetu'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center mb-3">
              One-Click Demo Accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('farmer@krishisetu.in', 'Farmer@123')}
                className="p-2.5 text-left border border-agri-100 hover:border-agri-300 rounded-xl bg-agri-50/50 hover:bg-agri-50 transition"
              >
                <span className="text-xs font-bold text-agri-900 block">🌾 Farmer</span>
                <span className="text-[10px] text-gray-500 block truncate">Tukaram Shinde</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('buyer@krishisetu.in', 'Buyer@123')}
                className="p-2.5 text-left border border-harvest-100 hover:border-harvest-300 rounded-xl bg-harvest-50/50 hover:bg-harvest-50 transition"
              >
                <span className="text-xs font-bold text-harvest-900 block">🏢 Buyer</span>
                <span className="text-[10px] text-gray-500 block truncate">Sahyadri Traders</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@krishisetu.in', 'Admin@123')}
                className="p-2.5 text-left border border-purple-100 hover:border-purple-300 rounded-xl bg-purple-50/50 hover:bg-purple-50 transition"
              >
                <span className="text-xs font-bold text-purple-900 block">⚙️ Admin</span>
                <span className="text-[10px] text-gray-500 block truncate">System Officer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
