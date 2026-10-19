import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Tractor,
  Trees,
  Sparkles,
  ShieldAlert,
  CloudSun,
  Droplets,
  Store,
  ShoppingBag,
  Truck,
  TrendingUp,
  BotMessageSquare,
  FileText,
  UserCheck,
  ClipboardList,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const role = user?.role;

  const farmerNav = [
    { label: t('farmDashboard', 'Farm Dashboard'), to: '/portal/farmer', icon: LayoutDashboard },
    { label: t('farmsFields', 'Farms & Fields'), to: '/portal/farmer/farms', icon: Tractor },
    { label: t('cropLifecycle', 'Crop Lifecycle'), to: '/portal/farmer/crops', icon: Trees },
    { label: t('aiCropRecommendation', 'AI Crop Recommendation'), to: '/portal/farmer/ai-crop', icon: Sparkles },
    { label: t('diseaseDiagnostics', 'Disease Diagnostics'), to: '/portal/farmer/disease', icon: ShieldAlert },
    { label: t('weatherIntelligence', 'Weather Intelligence'), to: '/portal/farmer/weather', icon: CloudSun },
    { label: t('smartIrrigation', 'Smart Irrigation'), to: '/portal/farmer/irrigation', icon: Droplets },
    { label: t('myListings', 'My Crop Listings'), to: '/portal/farmer/listings', icon: Store },
    { label: t('ordersSales', 'Orders & Sales'), to: '/portal/farmer/orders', icon: ShoppingBag },
    { label: t('expensesTwin', 'Expenses & Digital Twin'), to: '/portal/farmer/analytics', icon: TrendingUp },
    { label: t('aiAssistant', 'AI Farm Assistant'), to: '/portal/farmer/assistant', icon: BotMessageSquare },
    { label: t('schemesNav', 'Govt Schemes'), to: '/portal/farmer/schemes', icon: FileText },
  ];

  const buyerNav = [
    { label: t('buyerDashboard', 'Buyer Dashboard'), to: '/portal/buyer', icon: LayoutDashboard },
    { label: t('browseMarketplace', 'Browse Marketplace'), to: '/portal/buyer/marketplace', icon: Store },
    { label: t('requirementsMatching', 'Requirements Matching'), to: '/portal/buyer/match', icon: Sparkles },
    { label: t('purchaseOrders', 'Purchase Orders'), to: '/portal/buyer/orders', icon: ShoppingBag },
    { label: t('shipmentsLogistics', 'Shipments & Logistics'), to: '/portal/buyer/shipments', icon: Truck },
  ];

  const adminNav = [
    { label: t('systemAnalytics', 'System Analytics'), to: '/portal/admin', icon: LayoutDashboard },
    { label: t('userManagement', 'User Management'), to: '/portal/admin/users', icon: UserCheck },
    { label: t('auditLogs', 'Audit Logs'), to: '/portal/admin/audit-logs', icon: ClipboardList },
  ];

  let navItems = farmerNav;
  if (role === 'BUYER') navItems = buyerNav;
  if (role === 'ADMIN') navItems = adminNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Workspace Portal
            </span>
            <p className="text-xs font-semibold text-agri-900 capitalize">
              {role ? role.replace('_', ' ').toLowerCase() : 'Portal'}
            </p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Connected" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/portal/farmer' || item.to === '/portal/buyer' || item.to === '/portal/admin'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-agri-50 text-agri-800 font-semibold border border-agri-200/60 shadow-sm'
                      : 'text-gray-600 hover:text-agri-700 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-gray-100 bg-[#fafcf9]">
          <div className="bg-agri-100/60 rounded-xl p-2.5 text-center">
            <span className="text-[10px] font-bold text-agri-900 block">KrishiSetu Maharashtra</span>
            <span className="text-[9px] text-agri-700 block mt-0.5">Agro-Intelligence Engine v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
