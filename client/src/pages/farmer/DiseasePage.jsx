import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ShieldAlert, Upload, Image as ImageIcon, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, UsersRound } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const DiseasePage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPG, WebP)');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/ai/analyze-disease', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
      toast.success('Leaf image analyzed successfully!');
    } catch (err) {
      toast.error('Disease analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
          Plant Pathology Computer Vision Engine
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          Crop Disease & Pathogen Diagnostic
        </h1>
        <p className="text-xs text-gray-500 mt-1 max-w-2xl">
          Upload a clear photograph of affected leaves or stems to identify fungal, bacterial, or physiological disorders with recommended mitigation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-gray-900">Upload Crop Leaf Photograph</label>

          <div className="border-2 border-dashed border-gray-200 hover:border-agri-400 rounded-2xl p-6 text-center transition cursor-pointer relative bg-[#fafcf9]">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {preview ? (
              <div className="space-y-3">
                <img
                  src={preview}
                  alt="Crop preview"
                  className="w-full h-48 object-cover rounded-xl mx-auto shadow-sm"
                />
                <span className="text-xs text-agri-700 font-bold block">Click to select a different photo</span>
              </div>
            ) : (
              <div className="py-4">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-gray-700 block">Click or Drag Image Here</span>
                <span className="text-[10px] text-gray-400 block mt-1">JPEG, PNG or WebP up to 10MB</span>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="w-full py-3 px-4 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Running Computer Vision Model...
              </>
            ) : (
              <>
                Analyze Leaf for Pathogens
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Diagnosis Results Column */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Diagnostic Result
                </span>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {Math.round(result.confidence * 100)}% Match
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">{result.predictedDisease}</h3>
                <span className="text-[10px] text-gray-400 block mt-0.5">Model: {result.modelVersion}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#fafcf9] border border-gray-100">
                <span className="text-xs font-bold text-gray-900 block mb-1">Identified Symptoms</span>
                <p className="text-xs text-gray-600 leading-relaxed">{result.symptoms}</p>
              </div>

              <div className="p-4 rounded-2xl bg-agri-50/70 border border-agri-100">
                <span className="text-xs font-bold text-agri-950 block mb-1">Verified Next Steps & Treatment</span>
                <p className="text-xs text-agri-900 leading-relaxed">{result.recommendations}</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[10px] text-gray-400">Need confirmation from a human agronomist?</p>
                <Link
                  to="/portal/farmer/consultations"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 hover:bg-blue-100 transition"
                >
                  <UsersRound className="w-3.5 h-3.5" />
                  Refer Case to Expert
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center h-full flex flex-col items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-300 mb-3" />
              <h3 className="text-sm font-bold text-gray-800">No Image Analyzed Yet</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Capture or upload an image on the left to receive immediate pathogen classification and management advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
