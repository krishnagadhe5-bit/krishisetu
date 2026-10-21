import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ShieldAlert, Upload, Image as ImageIcon, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Bot } from 'lucide-react';
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
              {/* Header Status Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Diagnostic Result
                </span>
                {result.isPlant === false || result.status === 'NON_PLANT' ? (
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Non-Crop Image Detected ({Math.round(result.confidence * 100)}% Confidence)
                  </span>
                ) : result.isHealthy ? (
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Healthy Foliage ({Math.round(result.confidence * 100)}% Match)
                  </span>
                ) : (
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                    result.urgency === 'HIGH'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {Math.round(result.confidence * 100)}% Match ({result.urgency || 'MODERATE'} Urgency)
                  </span>
                )}
              </div>

              {/* Title & Model */}
              <div>
                <h3 className={`text-base sm:text-lg font-bold ${
                  result.isPlant === false || result.status === 'NON_PLANT'
                    ? 'text-amber-900'
                    : result.isHealthy
                    ? 'text-emerald-900'
                    : 'text-gray-900'
                }`}>
                  {result.predictedDisease}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400">Model: {result.modelVersion}</span>
                  {result.cropName && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-semibold">
                      Crop: {result.cropName}
                    </span>
                  )}
                </div>
              </div>

              {/* Non-Plant Notice vs Symptoms */}
              {result.isPlant === false || result.status === 'NON_PLANT' ? (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Non-Crop Image Analysis</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">{result.symptoms}</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#fafcf9] border border-gray-100">
                  <span className="text-xs font-bold text-gray-900 block mb-1">Identified Botanical Symptoms</span>
                  <p className="text-xs text-gray-600 leading-relaxed">{result.symptoms}</p>
                </div>
              )}

              {/* Recommendations & Action Plan */}
              <div className={`p-4 rounded-2xl border ${
                result.isPlant === false || result.status === 'NON_PLANT'
                  ? 'bg-gray-50 border-gray-200'
                  : result.isHealthy
                  ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900'
                  : 'bg-agri-50/70 border-agri-100 text-agri-950'
              }`}>
                <span className="text-xs font-bold block mb-1">
                  {result.isPlant === false || result.status === 'NON_PLANT'
                    ? 'Suggested Action'
                    : result.isHealthy
                    ? 'Agronomic Maintenance & Prevention'
                    : 'Verified Next Steps & Treatment'}
                </span>
                <p className={`text-xs leading-relaxed ${
                  result.isPlant === false || result.status === 'NON_PLANT'
                    ? 'text-gray-700'
                    : result.isHealthy
                    ? 'text-emerald-800'
                    : 'text-agri-900'
                }`}>
                  {result.recommendations}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[10px] text-gray-400">Need customized treatment advice for your soil and climate?</p>
                <Link
                  to="/portal/farmer/assistant"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-agri-50 text-agri-700 font-bold text-xs border border-agri-200 hover:bg-agri-100 transition"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Ask AI Agronomist
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
