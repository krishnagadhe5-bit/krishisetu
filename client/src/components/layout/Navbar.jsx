import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, Bell, User, LogOut, Menu, X, ShieldCheck, Globe, ChevronDown, Check } from 'lucide-react';
import api from '../../services/api';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t, availableLanguages, currentLanguage } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications')
        .then((res) => setNotifications(res.data.data || []))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getPortalHome = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'FARMER':
        return '/portal/farmer';
      case 'BUYER':
        return '/portal/buyer';
      default:
        return '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-header shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-agri-800 hover:bg-agri-50 focus:outline-none transition"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-agri-600 via-agri-700 to-agri-900 flex items-center justify-center text-white shadow-md shadow-agri-700/25 ring-1 ring-white/20 transition group-hover:scale-105">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-agri-950 flex items-center gap-1.5 font-display">
                {t('platformName', 'KrishiSetu')}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-agri-100/90 text-agri-900 font-semibold border border-agri-200/60">
                  {t('platformBadge', 'कृषीसेतू')}
                </span>
              </span>
              <p className="text-[10px] text-gray-500 font-medium -mt-1 hidden sm:block">
                {t('subtitle', 'Smart Farming & Supply Chain')}
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Main Working Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-semibold text-gray-600">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-xl hover:text-agri-800 hover:bg-agri-50/70 transition"
          >
            {t('home', 'Home')}
          </Link>
          <Link
            to="/marketplace"
            className="px-3 py-1.5 rounded-xl hover:text-agri-800 hover:bg-agri-50/70 transition"
          >
            {t('marketplace', 'Marketplace')}
          </Link>
          <Link
            to="/schemes"
            className="px-3 py-1.5 rounded-xl hover:text-agri-800 hover:bg-agri-50/70 transition"
          >
            {t('govtSchemes', 'Govt Schemes')}
          </Link>
          <Link
            to="/advisory"
            className="px-3 py-1.5 rounded-xl hover:text-agri-800 hover:bg-agri-50/70 transition"
          >
            {t('agroIntelligence', 'Agro Intelligence')}
          </Link>
        </nav>

        {/* Right: Language Selector + User Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangDropdown(!showLangDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-xs transition"
              title={t('selectLanguage', 'Select Language')}
              aria-label={t('selectLanguage', 'Select Language')}
            >
              <Globe className="w-3.5 h-3.5 text-agri-600" />
              <span>{currentLanguage?.flag}</span>
              <span className="hidden sm:inline-block font-medium">{currentLanguage?.native}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {t('selectLanguage', 'Select Language')}
                </div>
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-agri-50 transition ${
                      language === lang.code ? 'bg-agri-50/80 text-agri-900 font-bold' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-gray-400 font-normal">({lang.label})</span>
                    </div>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-agri-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              {/* Role badge */}
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-agri-50 text-agri-700 border border-agri-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                {user.role}
              </span>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    setShowLangDropdown(false);
                  }}
                  className="p-2 rounded-xl text-gray-500 hover:text-agri-700 hover:bg-agri-50 transition relative"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {t('notifications', 'Notifications')}
                      </span>
                      <span className="text-xs text-agri-700 font-medium">{unreadCount} {t('unread', 'unread')}</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-6">{t('noNotifications', 'No new notifications')}</p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div key={n.id} className="p-3 hover:bg-gray-50 text-left">
                            <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                            <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[9px] text-gray-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Portal link / User profile */}
              <Link
                to={getPortalHome()}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-agri-50 text-gray-700 hover:text-agri-800 transition"
              >
                <div className="w-8 h-8 rounded-full bg-agri-100 text-agri-700 font-bold flex items-center justify-center text-xs">
                  {user.profile?.fullName ? user.profile.fullName.charAt(0) : 'U'}
                </div>
                <span className="text-xs font-semibold hidden md:inline-block max-w-[120px] truncate">
                  {user.profile?.fullName || user.email}
                </span>
              </Link>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                title={t('logout', 'Log Out')}
                aria-label={t('logout', 'Log Out')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-agri-700 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-agri-50 transition"
              >
                {t('signIn', 'Sign In')}
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-semibold text-white bg-agri-700 hover:bg-agri-800 px-3 sm:px-4 py-2 rounded-xl shadow-sm shadow-agri-700/20 transition"
              >
                {t('getStarted', 'Get Started')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
