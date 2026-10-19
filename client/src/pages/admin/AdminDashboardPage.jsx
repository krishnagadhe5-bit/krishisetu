import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Store,
  ShoppingBag,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
      ]);
      setAnalytics(analyticsRes.data.data);
      setUsers(usersRes.data.data.users || []);
      setAuditLogs(logsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load administrative analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });
      toast.success(`User marked as ${nextStatus}`);
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
          Master Administrative Command Console
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          Platform Governance & System Operations
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Monitor multi-tenant platform metrics, manage user role permissions, and review security audit logs.
        </p>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Total Registered Users</span>
            <span className="text-3xl font-black text-gray-900 mt-1 block">{analytics.users.total}</span>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {analytics.users.farmers} Farmers • {analytics.users.buyers} Buyers
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Active Produce Listings</span>
            <span className="text-3xl font-black text-agri-800 mt-1 block">
              {analytics.operations.activeListings}
            </span>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Across {analytics.operations.totalFarms} Farms
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Completed Transactions</span>
            <span className="text-3xl font-black text-emerald-700 mt-1 block">
              ₹{analytics.operations.grossVolumeInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {analytics.operations.totalOrders} total orders executed
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">AI Models Operating</span>
            <span className="text-3xl font-black text-purple-700 mt-1 block">3 Active</span>
            <span className="text-[11px] text-purple-600 mt-1 block font-semibold">FastAPI Service Operational</span>
          </div>
        </div>
      )}

      {/* Users Management Table */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-agri-700" />
          Registered Users & Role Governance
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                <th className="pb-3">User / Name</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">District</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="py-3 font-semibold text-gray-900">
                    {u.profile?.fullName || 'User'}
                    <span className="text-[10px] text-gray-400 block font-normal">{u.email}</span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 font-bold text-[10px] text-gray-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{u.profile?.district || 'Maharashtra'}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.accountStatus === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {u.accountStatus}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleUpdateStatus(u.id, u.accountStatus)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition ${
                        u.accountStatus === 'ACTIVE'
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {u.accountStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Logs */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-purple-700" />
          Security Audit Trail & Sensitive Action Logs
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-2xl bg-gray-50 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900">{log.action}</span>
                <span className="text-[10px] text-gray-500 block">
                  Resource: {log.resource} #{log.resourceId?.slice(0, 8)}
                </span>
              </div>
              <span className="text-[10px] text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
