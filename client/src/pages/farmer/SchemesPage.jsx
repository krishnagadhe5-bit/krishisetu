import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, ExternalLink, ShieldCheck, CheckCircle2, Search, Filter } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const SchemesPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('All');

  useEffect(() => {
    api.get('/schemes')
      .then((res) => setSchemes(res.data.data || []))
      .catch(() => toast.error('Failed to load government schemes'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = schemes.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.eligibility && s.eligibility.toLowerCase().includes(search.toLowerCase()));
    const matchesState = filterState === 'All' || s.applicability === filterState || s.state === filterState;
    return matchesSearch && matchesState;
  });

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 text-agri-900 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-agri-700" />
          Verified Central & Maharashtra Government Portals
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          Government Schemes & Financial Subsidies
        </h1>
        <p className="text-xs text-gray-500 mt-1 max-w-2xl">
          Directory of official state and national agricultural initiatives with verified eligibility guidelines and application documents.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scheme name or eligibility..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-agri-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white font-medium"
          >
            <option value="All">All Jurisdictions</option>
            <option value="Maharashtra">Maharashtra State Only</option>
            <option value="National">National / Central Only</option>
          </select>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((scheme) => (
          <div
            key={scheme.id}
            className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between hover:border-agri-200 transition"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800">
                  {scheme.applicability} {scheme.state ? `• ${scheme.state}` : ''}
                </span>
                <span className="text-[10px] text-gray-400">
                  Verified: {scheme.lastVerifiedDate ? new Date(scheme.lastVerifiedDate).toLocaleDateString() : 'Active'}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 mt-3">{scheme.name}</h3>
              <span className="text-[11px] text-gray-500 block mt-0.5 font-medium">{scheme.issuingAuthority}</span>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-gray-50 text-gray-700">
                  <span className="font-bold text-gray-900 block mb-0.5">Eligibility Criteria:</span>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{scheme.eligibility}</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#fafcf9] border border-gray-100 text-gray-700">
                  <span className="font-bold text-gray-900 block mb-0.5">Required Documents:</span>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{scheme.requiredDocuments}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Process: {scheme.applicationProcess?.slice(0, 40)}...</span>
              {scheme.sourceUrl && (
                <a
                  href={scheme.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs transition shadow-sm"
                >
                  Official Portal
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
