import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UsersRound, CheckCircle2, MessageSquare, Send, Clock, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const ExpertDashboardPage = () => {
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');

  const fetchCases = async () => {
    try {
      const res = await api.get('/consultations');
      const list = res.data.data || [];
      setCases(list);
      if (list.length > 0 && !activeCase) {
        setActiveCase(list[0]);
      }
    } catch (err) {
      toast.error('Failed to load consultation inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSendGuidance = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeCase) return;

    try {
      await api.post(`/consultations/${activeCase.id}/messages`, { message: reply });
      setReply('');
      toast.success('Agricultural advisory guidance submitted to farmer!');
      const updated = await api.get(`/consultations/${activeCase.id}`);
      setActiveCase(updated.data.data);
      fetchCases();
    } catch (err) {
      toast.error('Failed to submit advice');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          Certified Agronomy Advisory Console
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          Field Inquiries & Crop Pathology Cases
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review field cases submitted by local Maharashtra farmers, diagnose plant health anomalies, and prescribe approved IPM remedies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Cases Column */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-2 overflow-y-auto max-h-[600px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-2 mb-2">
            Incoming Farmer Consultations
          </span>

          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCase(c)}
              className={`w-full text-left p-3.5 rounded-2xl border transition ${
                activeCase?.id === c.id
                  ? 'bg-blue-50/60 border-blue-300'
                  : 'bg-gray-50/50 border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-800">
                  {c.cropName}
                </span>
                <span className="text-[9px] font-extrabold uppercase text-blue-700">{c.status}</span>
              </div>
              <h4 className="text-xs font-bold text-gray-900 mt-2 line-clamp-1">{c.subject}</h4>
              <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{c.description}</p>
              <span className="text-[9px] text-gray-400 block mt-2">
                Farmer: {c.farmer?.profile?.fullName || c.farmer?.email}
              </span>
            </button>
          ))}
        </div>

        {/* Selected Case & Chat Thread */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {activeCase ? (
            <>
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800">Crop: {activeCase.cropName}</span>
                  <span className="text-[10px] text-gray-400">{new Date(activeCase.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-1">{activeCase.subject}</h3>
                <div className="mt-3 p-3.5 rounded-2xl bg-gray-50 text-xs text-gray-700 leading-relaxed border border-gray-100">
                  <span className="font-bold text-gray-900 block mb-1">Farmer's Observation Notes:</span>
                  {activeCase.description}
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3 min-h-[220px]">
                {activeCase.messages && activeCase.messages.length > 0 ? (
                  activeCase.messages.map((m) => (
                    <div key={m.id} className="p-3.5 rounded-2xl bg-[#fafcf9] border border-gray-100 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900">
                          {m.senderId === activeCase.farmerId ? 'Farmer Observation' : 'Your Professional Advice'}
                        </span>
                        <span className="text-[10px] text-gray-400">{new Date(m.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{m.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">
                    No guidance submitted yet. Provide agronomic advisory below.
                  </p>
                )}
              </div>

              {/* Response input */}
              <form onSubmit={handleSendGuidance} className="p-4 border-t border-gray-100 flex gap-2 bg-[#fafcf9]">
                <textarea
                  rows={2}
                  required
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Provide clinical diagnosis, dosage (e.g. Copper Oxychloride @ 2.5g/L), and water management guidelines..."
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-end"
                >
                  <Send className="w-3.5 h-3.5" />
                  Prescribe Advice
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-xs text-gray-400">
              <UsersRound className="w-10 h-10 text-gray-300 mb-2" />
              Select a farmer's crop case to review field observations and prescribe advisory.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
