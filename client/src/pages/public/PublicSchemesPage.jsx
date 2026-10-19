import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import api from '../../services/api';
import { FileText, ExternalLink, ShieldCheck, Search, Filter, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const PublicSchemesPage = () => {
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
    const term = search.toLowerCase();
    const matchesSearch =
      s.name?.toLowerCase().includes(term) ||
      s.eligibility?.toLowerCase().includes(term) ||
      s.issuingAuthority?.toLowerCase().includes(term);
    const matchesState =
      filterState === 'All' ||
      s.applicability === filterState ||
      s.state === filterState;
    return matchesSearch && matchesState;
  });

  return (
    <div className="min-h-screen bg-[#f8faf7] flex flex-col">
      <Navbar />
      <Toaster position="top-right" />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-white to-[#f4f8f3] border-b border-gray-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 text-agri-900 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-agri-700" />
            Verified Central & Maharashtra Government Portals
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Government Schemes & Financial Subsidies
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-2xl">
            Official repository of agricultural subsidies, crop insurance programs, machinery grants, and seed initiatives from the Ministry of Agriculture and Govt of Maharashtra.
          </p>
        </div>
      </section>

      {/* Search and Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scheme name, eligibility, or issuing authority..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-agri-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-agri-500"
            >
              <option value="All">All Jurisdictions</option>
              <option value="Maharashtra">Maharashtra State Only</option>
              <option value="National">National / Central Only</option>
            </select>
          </div>
        </div>

        {/* Schemes Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-agri-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 mt-3 font-medium">Fetching verified government scheme databases...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto shadow-sm">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No Schemes Matched</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try searching with broader terms or toggle to 'All Jurisdictions'.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((scheme) => (
              <div
                key={scheme.id}
                className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between hover:border-agri-300 hover:shadow-md transition"
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
                    <div className="p-3.5 rounded-2xl bg-[#fbfdfa] border border-gray-100 text-gray-700">
                      <span className="font-bold text-gray-900 block mb-0.5 text-[11px]">Eligibility Criteria:</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{scheme.eligibility}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 text-gray-700">
                      <span className="font-bold text-gray-900 block mb-0.5 text-[11px]">Required Documents:</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{scheme.requiredDocuments}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    Application: {scheme.applicationProcess?.slice(0, 35)}...
                  </span>
                  {scheme.sourceUrl && (
                    <a
                      href={scheme.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs transition shadow-sm"
                    >
                      Official Portal
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
