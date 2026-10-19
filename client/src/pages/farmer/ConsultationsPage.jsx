import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UsersRound, Plus, MessageSquare, Send, CheckCircle2, Clock, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const ConsultationsPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewCase, setShowNewCase] = useState(false);
  const [newMsg, setNewMsg] = useState('');

  const [caseForm, setCaseForm] = useState({
    cropName: 'Pomegranate',
    subject: '',
    description: '',
  });

  const fetchConsultations = async () => {
    try {
      const res = await api.get('/consultations');
      const list = res.data.data || [];
      setConsultations(list);
      if (list.length > 0 && !activeCase) {
        setActiveCase(list[0]);
      }
    } catch (err) {
      toast.error('Failed to load expert consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/consultations', caseForm);
      toast.success('Consultation case submitted to panel of verified agronomists!');
      setShowNewCase(false);
      fetchConsultations();
      setActiveCase(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit case');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeCase) return;

    try {
      await api.post(`/consultations/${activeCase.id}/messages`, { message: newMsg });
      setNewMsg('');
      toast.success('Reply submitted');
      // Refresh case details
      const updated = await api.get(`/consultations/${activeCase.id}`);
      setActiveCase(updated.data.data);
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Agricultural Expert Consultations
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Connect with verified agronomists, plant pathologists, and soil scientists from Maharashtra state universities.
          </p>
        </div>

        <button
          onClick={() => setShowNewCase(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Raise Consultation Case
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Cases List */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-2 overflow-y-auto max-h-[600px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-2 mb-2">
            My Submitted Cases
          </span>

          {consultations.length > 0 ? (
            consultations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCase(c)}
                className={`w-full text-left p-3.5 rounded-2xl border transition ${
                  activeCase?.id === c.id
                    ? 'bg-agri-50 border-agri-300'
                    : 'bg-gray-50/60 border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">
                    {c.cropName || 'Crop Case'}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase ${
                      c.status === 'RESOLVED' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 mt-2 line-clamp-1">{c.subject}</h4>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{c.description}</p>
              </button>
            ))
          ) : (
            <p className="text-xs text-gray-400 text-center py-12">No consultation cases opened yet.</p>
          )}
        </div>

        {/* Active Consultation Thread */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {activeCase ? (
            <>
              {/* Case Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-agri-800">{activeCase.cropName} Case</span>
                  <span className="text-[10px] text-gray-400">{new Date(activeCase.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-1">{activeCase.subject}</h3>
                <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-3 rounded-xl">{activeCase.description}</p>

                {activeCase.expert && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Assigned Verified Agronomist: {activeCase.expert.user?.profile?.fullName || 'Dr. Deshmukh'} (
                    {activeCase.expert.specialization})
                  </div>
                )}
              </div>

              {/* Messages Thread */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3 min-h-[250px]">
                {activeCase.messages && activeCase.messages.length > 0 ? (
                  activeCase.messages.map((m) => (
                    <div key={m.id} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900">
                          {m.senderId === activeCase.farmerId ? 'You (Farmer)' : 'Verified Agronomist'}
                        </span>
                        <span className="text-[10px] text-gray-400">{new Date(m.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{m.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-gray-400">
                    Case submitted. A certified university expert will review your case notes and respond here shortly.
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex gap-2 bg-[#fafcf9]">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type follow-up observation or reply..."
                  className="flex-1 px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-agri-500 bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Reply
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 text-xs">
              <UsersRound className="w-10 h-10 text-gray-300 mb-2" />
              Select a case on the left or raise a new agricultural consultation.
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Consultation Case */}
      {showNewCase && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl animate-in fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-4">Raise Agricultural Consultation</h3>
            <form onSubmit={handleCreateCase} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Affected Crop</label>
                <input
                  type="text"
                  required
                  value={caseForm.cropName}
                  onChange={(e) => setCaseForm({ ...caseForm, cropName: e.target.value })}
                  placeholder="e.g. Pomegranate / Onion / Cotton"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subject / Issue Summary</label>
                <input
                  type="text"
                  required
                  value={caseForm.subject}
                  onChange={(e) => setCaseForm({ ...caseForm, subject: e.target.value })}
                  placeholder="e.g. Oily bacterial spots and fruit cracking in Bhagwa Pomegranate"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Detailed Field Symptoms</label>
                <textarea
                  rows={4}
                  required
                  value={caseForm.description}
                  onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                  placeholder="Describe observations: leaf yellowing, branch dieback, unseasonal rains, applied fertilizers..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewCase(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-agri-700 text-white font-bold hover:bg-agri-800"
                >
                  Submit to Expert Panel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
