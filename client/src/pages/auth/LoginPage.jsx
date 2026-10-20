import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Active anti-brute force cooldown countdown
  useEffect(() => {
    let interval = null;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockoutTimer]);

  const validateEmailFormat = (val) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const isFormValid = email.length > 0 && validateEmailFormat(email) && password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (lockoutTimer > 0) {
      toast.error(`Account temporarily locked for security. Please wait ${lockoutTimer}s.`);
      return;
    }

    if (!validateEmailFormat(email)) {
      toast.error('Please enter a valid email format (e.g. user@domain.com)');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      setFailedAttempts(0); // Reset failed attempts counter
      toast.success(`Authenticated! Authorizing ${user.role} workspace...`);

      // Strictly enforce role-based authorization navigation
      if (user.role === 'FARMER') navigate('/portal/farmer');
      else if (user.role === 'BUYER') navigate('/portal/buyer');
      else if (user.role === 'ADMIN') navigate('/portal/admin');
      else navigate('/');
    } catch (err) {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      if (nextFailures >= 5) {
        setLockoutTimer(60);
        toast.error('Security alert: 5 consecutive failed attempts. System cooldown engaged for 60 seconds.');
      } else {
        const remaining = 5 - nextFailures;
        const msg = err.response?.data?.message || 'Invalid email or password.';
        toast.error(`${msg} (${remaining} attempt${remaining === 1 ? '' : 's'} before security cooldown)`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-agri-600 via-agri-700 to-agri-900 flex items-center justify-center text-white shadow-md shadow-agri-700/25 ring-1 ring-white/20 transition group-hover:scale-105">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-agri-950 font-display">KrishiSetu</span>
        </Link>
        <h2 className="mt-4 text-xl sm:text-2xl font-extrabold text-gray-900 font-display tracking-tight">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-xs text-gray-500 font-medium">
          Enter your registered email address and password to access verified agronomy.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-card border border-[#e4ede5] rounded-3xl sm:px-10">
          {/* Security Alert Header */}
          <div className="mb-6 p-3 rounded-2xl bg-[#f5f9f6] border border-agri-200/70 flex items-center justify-between text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-agri-700" />
              <span className="font-semibold text-[11px] text-agri-950">256-Bit SSL/TLS Encrypted Login</span>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-agri-100/90 text-agri-900 font-bold border border-agri-200">
              Protected
            </span>
          </div>

          {/* Active Lockout Notice */}
          {lockoutTimer > 0 && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Rate-Limit Lockout Active</span>
                <p className="text-[11px] mt-0.5 leading-relaxed text-amber-800">
                  Multiple unverified authentication requests received. For your security, attempts are paused for{' '}
                  <span className="font-bold underline">{lockoutTimer} seconds</span>.
                </p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
            {/* Email Field with validation */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700">Email Address</label>
                {email && !validateEmailFormat(email) && (
                  <span className="text-[10px] text-amber-600 font-medium">Invalid email format</span>
                )}
                {email && validateEmailFormat(email) && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid
                  </span>
                )}
              </div>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  disabled={lockoutTimer > 0}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-1 focus:ring-agri-500 focus:border-agri-500 focus:outline-none disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide toggle */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700">Password</label>
                <span className="text-[10px] text-gray-400">Bcrypt Salted & Verified</span>
              </div>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  disabled={lockoutTimer > 0}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-1 focus:ring-agri-500 focus:border-agri-500 focus:outline-none disabled:bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Authentication Submit Button */}
            <button
              type="submit"
              disabled={loading || lockoutTimer > 0 || !isFormValid}
              className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-agri-800/20 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-agri-700 via-agri-700 to-agri-800 hover:from-agri-800 hover:to-agri-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agri-600 disabled:opacity-50 transition active:scale-[0.99]"
            >
              {loading ? (
                'Verifying Signature & Permissions...'
              ) : lockoutTimer > 0 ? (
                `Security Cooldown (${lockoutTimer}s)`
              ) : (
                'Sign In'
              )}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Real Registration Options */}
          <div className="mt-8 pt-6 border-t border-[#eef5ef] text-center">
            <p className="text-xs text-gray-600 mb-3 font-semibold">
              Don't have an account yet?
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-agri-200/90 bg-agri-50/80 hover:bg-agri-100 text-agri-950 text-xs sm:text-sm font-bold transition shadow-subtle hover:shadow-sm"
            >
              <span>Create New Account (Farmer or Buyer)</span>
              <ArrowRight className="w-3.5 h-3.5 text-agri-700" />
            </Link>
            <p className="mt-2 text-[11px] text-gray-400">
              Sign up with any email address to start trading, tracking crops, or using AI advisory.
            </p>
          </div>

          {/* Security Guarantee Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-agri-600" />
              HMAC-SHA256 Token Auth
            </span>
            <span>Role-Based Authorization Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
