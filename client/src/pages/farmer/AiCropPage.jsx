import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Sparkles, Sprout, ArrowRight, CheckCircle2, Info, RefreshCw, HelpCircle, Zap, Sliders, Leaf } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// ====================================================
// Soil-type based default NPK + pH values
// Source: ICAR - Indian Council of Agricultural Research
// ====================================================
const SOIL_DEFAULTS = {
  BLACK_COTTON: { nitrogen: 120, phosphorus: 50, potassium: 55, ph: 7.2, label: 'Black Cotton (काळी माती)' },
  ALLUVIAL:     { nitrogen: 140, phosphorus: 55, potassium: 60, ph: 7.0, label: 'Alluvial (गाळाची माती)' },
  RED:          { nitrogen: 90,  phosphorus: 35, potassium: 45, ph: 6.0, label: 'Red Soil (लाल माती)' },
  LATERITE:     { nitrogen: 80,  phosphorus: 30, potassium: 40, ph: 5.5, label: 'Laterite (जांभी माती)' },
  SANDY:        { nitrogen: 60,  phosphorus: 25, potassium: 35, ph: 6.5, label: 'Sandy (वाळूमिश्र)' },
  CLAYEY:       { nitrogen: 130, phosphorus: 48, potassium: 52, ph: 7.5, label: 'Clayey (चिकणमाती)' },
  LOAMY:        { nitrogen: 110, phosphorus: 45, potassium: 50, ph: 6.8, label: 'Loamy (मिश्र माती)' },
  SALINE:       { nitrogen: 70,  phosphorus: 20, potassium: 30, ph: 8.2, label: 'Saline (खारवट)' },
  PEATY:        { nitrogen: 150, phosphorus: 60, potassium: 65, ph: 5.0, label: 'Peaty (पीटयुक्त)' },
  OTHER:        { nitrogen: 100, phosphorus: 40, potassium: 45, ph: 6.8, label: 'Other (इतर)' },
};

// ====================================================
// District-based climate defaults (Maharashtra)
// ====================================================
const DISTRICT_CLIMATE = {
  'Pune':          { temperature: 27.0, humidity: 60, rainfall: 720 },
  'Nashik':        { temperature: 26.5, humidity: 55, rainfall: 650 },
  'Ahmednagar':    { temperature: 28.0, humidity: 52, rainfall: 550 },
  'Solapur':       { temperature: 30.0, humidity: 48, rainfall: 500 },
  'Satara':        { temperature: 25.5, humidity: 65, rainfall: 900 },
  'Sangli':        { temperature: 28.5, humidity: 55, rainfall: 600 },
  'Kolhapur':      { temperature: 26.0, humidity: 72, rainfall: 1200 },
  'Aurangabad':    { temperature: 29.5, humidity: 50, rainfall: 680 },
  'Jalgaon':       { temperature: 30.5, humidity: 45, rainfall: 520 },
  'Latur':         { temperature: 29.0, humidity: 55, rainfall: 750 },
  'Osmanabad':     { temperature: 28.5, humidity: 52, rainfall: 680 },
  'Beed':          { temperature: 29.5, humidity: 48, rainfall: 600 },
  'Nanded':        { temperature: 29.0, humidity: 55, rainfall: 850 },
  'Parbhani':      { temperature: 29.5, humidity: 52, rainfall: 780 },
  'Hingoli':       { temperature: 28.5, humidity: 55, rainfall: 820 },
  'Jalna':         { temperature: 29.0, humidity: 50, rainfall: 650 },
  'Nagpur':        { temperature: 28.5, humidity: 58, rainfall: 1050 },
  'Amravati':      { temperature: 28.0, humidity: 55, rainfall: 850 },
  'Wardha':        { temperature: 28.5, humidity: 56, rainfall: 950 },
  'Yavatmal':      { temperature: 28.0, humidity: 54, rainfall: 900 },
  'Akola':         { temperature: 29.0, humidity: 50, rainfall: 750 },
  'Buldhana':      { temperature: 28.5, humidity: 52, rainfall: 780 },
  'Washim':        { temperature: 28.0, humidity: 53, rainfall: 800 },
  'Ratnagiri':     { temperature: 27.0, humidity: 80, rainfall: 3000 },
  'Sindhudurg':    { temperature: 27.5, humidity: 82, rainfall: 3200 },
  'Thane':         { temperature: 28.0, humidity: 75, rainfall: 2500 },
  'Raigad':        { temperature: 27.5, humidity: 78, rainfall: 2800 },
  'Dhule':         { temperature: 29.5, humidity: 45, rainfall: 550 },
  'Nandurbar':     { temperature: 28.0, humidity: 50, rainfall: 700 },
  'Chandrapur':    { temperature: 28.5, humidity: 60, rainfall: 1200 },
  'Gadchiroli':    { temperature: 27.5, humidity: 65, rainfall: 1500 },
  'Gondia':        { temperature: 27.0, humidity: 62, rainfall: 1300 },
  'Bhandara':      { temperature: 27.5, humidity: 60, rainfall: 1150 },
  'default':       { temperature: 28.0, humidity: 58, rainfall: 750 },
};

// ====================================================
// NPK level mappings (Simple → Numeric)
// ====================================================
const NPK_LEVELS = {
  nitrogen: {
    'Very Low':  40,  'Low':  70,  'Medium': 110, 'High': 150, 'Very High': 200,
  },
  phosphorus: {
    'Very Low':  10,  'Low':  25,  'Medium':  45, 'High':  65, 'Very High':  90,
  },
  potassium: {
    'Very Low':  15,  'Low':  30,  'Medium':  50, 'High':  70, 'Very High': 100,
  },
};

const NPK_LEVEL_LABELS = [
  { value: 'Very Low', label: 'Very Low (खूप कमी)', color: 'text-red-600' },
  { value: 'Low',      label: 'Low (कमी)',          color: 'text-orange-600' },
  { value: 'Medium',   label: 'Medium (मध्यम)',     color: 'text-yellow-600' },
  { value: 'High',     label: 'High (जास्त)',       color: 'text-green-600' },
  { value: 'Very High',label: 'Very High (खूप जास्त)', color: 'text-emerald-700' },
];

// Reverse lookup: find closest level from a numeric value
function getClosestLevel(nutrient, value) {
  const levels = NPK_LEVELS[nutrient];
  let closest = 'Medium';
  let minDiff = Infinity;
  for (const [level, num] of Object.entries(levels)) {
    const diff = Math.abs(num - value);
    if (diff < minDiff) { minDiff = diff; closest = level; }
  }
  return closest;
}

export const AiCropPage = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [isExpertMode, setIsExpertMode] = useState(false);

  // Simple mode levels
  const [nLevel, setNLevel] = useState('Medium');
  const [pLevel, setPLevel] = useState('Medium');
  const [kLevel, setKLevel] = useState('Medium');

  const [formData, setFormData] = useState({
    nitrogen: 110,
    phosphorus: 45,
    potassium: 50,
    temperature: 28.5,
    humidity: 65,
    ph: 6.8,
    rainfall: 750,
    season: 'Kharif',
    soilType: 'BLACK_COTTON',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Fetch farms with fields on mount
  useEffect(() => {
    const loadFarms = async () => {
      try {
        const res = await api.get('/farms');
        setFarms(res.data.data || []);
      } catch {
        // silently ignore
      }
    };
    loadFarms();
  }, []);

  const allFields = farms.flatMap((f) =>
    (f.fields || []).map((fld) => ({
      ...fld,
      farmName: f.name,
      farmDistrict: f.district,
      farmSoilType: f.soilType || fld.soilType,
    }))
  );

  // When a field is selected → auto-fill everything
  const handleFieldSelect = (fieldId) => {
    setSelectedFieldId(fieldId);
    if (!fieldId) return;

    const field = allFields.find((f) => f.id === fieldId);
    if (!field) return;

    const soilKey = field.farmSoilType || 'OTHER';
    const soilDef = SOIL_DEFAULTS[soilKey] || SOIL_DEFAULTS['OTHER'];
    const climateDef = DISTRICT_CLIMATE[field.farmDistrict] || DISTRICT_CLIMATE['default'];

    const newData = {
      ...formData,
      nitrogen: soilDef.nitrogen,
      phosphorus: soilDef.phosphorus,
      potassium: soilDef.potassium,
      ph: soilDef.ph,
      temperature: climateDef.temperature,
      humidity: climateDef.humidity,
      rainfall: climateDef.rainfall,
      soilType: soilKey,
    };

    setFormData(newData);
    setNLevel(getClosestLevel('nitrogen', soilDef.nitrogen));
    setPLevel(getClosestLevel('phosphorus', soilDef.phosphorus));
    setKLevel(getClosestLevel('potassium', soilDef.potassium));

    toast.success(`Auto-filled from "${field.name}" — ${SOIL_DEFAULTS[soilKey]?.label || soilKey} soil, ${field.farmDistrict} climate`);
  };

  // When NPK levels change in simple mode
  const handleLevelChange = (nutrient, level) => {
    const value = NPK_LEVELS[nutrient][level];
    if (nutrient === 'nitrogen')   { setNLevel(level); setFormData(p => ({ ...p, nitrogen: value })); }
    if (nutrient === 'phosphorus') { setPLevel(level); setFormData(p => ({ ...p, phosphorus: value })); }
    if (nutrient === 'potassium')  { setKLevel(level); setFormData(p => ({ ...p, potassium: value })); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ai/recommend-crop', formData);
      setResult(res.data.data);
      toast.success('Crop recommendations generated by AI Model!');
    } catch (err) {
      toast.error('AI inference failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 text-agri-900 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-agri-700" />
          AI-Powered Crop Advisor
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          🌾 Which Crop is Best for My Field?
        </h1>
        <p className="text-xs text-gray-500 mt-1 max-w-2xl">
          Select your field and we'll automatically estimate soil nutrients & climate. Or use the simple dropdowns — no lab report needed!
        </p>
      </div>

      {/* Step 1: Pick Your Field */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-agri-700 text-white text-xs font-black flex items-center justify-center">1</span>
          Select Your Field (माझे शेत निवडा)
        </h2>
        <select
          value={selectedFieldId}
          onChange={(e) => handleFieldSelect(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm"
        >
          <option value="">— Choose a field to auto-fill data —</option>
          {allFields.length > 0 ? (
            allFields.map((fld) => (
              <option key={fld.id} value={fld.id}>
                {fld.name} ({fld.farmName} — {fld.areaAcres} Ac, {SOIL_DEFAULTS[fld.farmSoilType]?.label || fld.farmSoilType})
              </option>
            ))
          ) : (
            <option disabled>No fields found — add fields in My Farms first</option>
          )}
        </select>
        {allFields.length === 0 && (
          <p className="mt-1.5 text-[11px] text-amber-600 font-medium">
            💡 Tip: Go to <strong>My Farms</strong> → Add a farm → Add field plots. Then come back here to auto-fill!
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-agri-700 text-white text-xs font-black flex items-center justify-center">2</span>
              Soil & Climate Data
            </h2>
            <button
              type="button"
              onClick={() => setIsExpertMode(!isExpertMode)}
              className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl border transition ${
                isExpertMode
                  ? 'bg-agri-50 border-agri-300 text-agri-800'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {isExpertMode ? <Sliders className="w-3.5 h-3.5" /> : <Leaf className="w-3.5 h-3.5" />}
              {isExpertMode ? 'Expert Mode' : 'Simple Mode'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">

            {/* === SIMPLE MODE === */}
            {!isExpertMode ? (
              <>
                {/* NPK Simple Dropdowns */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Sprout className="w-4 h-4 text-green-700" />
                    <span className="font-bold text-green-900 text-xs">Soil Fertility Level (माती सुपीकता)</span>
                  </div>
                  <p className="text-[11px] text-green-700 mb-3">
                    If you have a <strong>Soil Health Card</strong>, check the NPK levels printed on it. Otherwise, just estimate based on your crop yields.
                  </p>

                  <div className="space-y-3">
                    {/* Nitrogen */}
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Nitrogen (नायट्रोजन - N)
                        <span className="ml-1 text-[10px] text-gray-400 font-normal">→ {formData.nitrogen} kg/ha</span>
                      </label>
                      <select
                        value={nLevel}
                        onChange={(e) => handleLevelChange('nitrogen', e.target.value)}
                        className="w-full px-3 py-2 border border-green-200 rounded-xl bg-white"
                      >
                        {NPK_LEVEL_LABELS.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Phosphorus */}
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Phosphorus (स्फुरद - P)
                        <span className="ml-1 text-[10px] text-gray-400 font-normal">→ {formData.phosphorus} kg/ha</span>
                      </label>
                      <select
                        value={pLevel}
                        onChange={(e) => handleLevelChange('phosphorus', e.target.value)}
                        className="w-full px-3 py-2 border border-green-200 rounded-xl bg-white"
                      >
                        {NPK_LEVEL_LABELS.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Potassium */}
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Potassium (पालाश - K)
                        <span className="ml-1 text-[10px] text-gray-400 font-normal">→ {formData.potassium} kg/ha</span>
                      </label>
                      <select
                        value={kLevel}
                        onChange={(e) => handleLevelChange('potassium', e.target.value)}
                        className="w-full px-3 py-2 border border-green-200 rounded-xl bg-white"
                      >
                        {NPK_LEVEL_LABELS.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Soil pH - Simple */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Soil pH (मातीचा सामू)
                    <span className="ml-1 text-[10px] text-gray-400 font-normal">→ {formData.ph}</span>
                  </label>
                  <select
                    value={
                      formData.ph <= 5.5 ? 'acidic' :
                      formData.ph <= 7.0 ? 'neutral' :
                      formData.ph <= 8.0 ? 'slightly_alkaline' : 'alkaline'
                    }
                    onChange={(e) => {
                      const phMap = { acidic: 5.0, neutral: 6.5, slightly_alkaline: 7.5, alkaline: 8.5 };
                      setFormData({ ...formData, ph: phMap[e.target.value] });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="acidic">Acidic (अम्लीय) — pH 5.0</option>
                    <option value="neutral">Neutral (सामान्य) — pH 6.5</option>
                    <option value="slightly_alkaline">Slightly Alkaline (सौम्य क्षारीय) — pH 7.5</option>
                    <option value="alkaline">Alkaline (क्षारीय) — pH 8.5</option>
                  </select>
                </div>

                {/* Climate - auto filled with info */}
                <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-blue-900 text-[11px]">Climate (हवामान) — Auto-estimated</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="text-center p-2 bg-white rounded-xl">
                      <div className="text-gray-500">Temp</div>
                      <div className="font-bold text-gray-900">{formData.temperature}°C</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded-xl">
                      <div className="text-gray-500">Humidity</div>
                      <div className="font-bold text-gray-900">{formData.humidity}%</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded-xl">
                      <div className="text-gray-500">Rainfall</div>
                      <div className="font-bold text-gray-900">{formData.rainfall}mm</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-600 mt-2">
                    Based on your farm's district. Switch to Expert Mode to edit manually.
                  </p>
                </div>

                {/* Season */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Season (हंगाम)</label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Kharif">Kharif (खरीप) — Jun to Oct</option>
                    <option value="Rabi">Rabi (रब्बी) — Oct to Mar</option>
                    <option value="Zaid">Zaid (उन्हाळी) — Mar to Jun</option>
                    <option value="Suru / Adsali">Suru / Adsali (सुरू / आडसाली)</option>
                  </select>
                </div>
              </>
            ) : (
              /* === EXPERT MODE (Lab Values) === */
              <>
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-800 flex items-start gap-2 mb-1">
                  <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>Enter exact values from your <strong>Soil Health Card</strong> or lab test report. If you don't have these values, switch to Simple Mode.</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Nitrogen (N)</label>
                    <input
                      type="number"
                      required
                      value={formData.nitrogen}
                      onChange={(e) => setFormData({ ...formData, nitrogen: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                      placeholder="kg/ha"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Phosphorus (P)</label>
                    <input
                      type="number"
                      required
                      value={formData.phosphorus}
                      onChange={(e) => setFormData({ ...formData, phosphorus: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                      placeholder="kg/ha"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Potassium (K)</label>
                    <input
                      type="number"
                      required
                      value={formData.potassium}
                      onChange={(e) => setFormData({ ...formData, potassium: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                      placeholder="kg/ha"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Soil pH (0-14)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.ph}
                      onChange={(e) => setFormData({ ...formData, ph: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Avg Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Humidity (%)</label>
                    <input
                      type="number"
                      required
                      value={formData.humidity}
                      onChange={(e) => setFormData({ ...formData, humidity: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Annual Rainfall (mm)</label>
                    <input
                      type="number"
                      required
                      value={formData.rainfall}
                      onChange={(e) => setFormData({ ...formData, rainfall: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Season</label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Kharif">Kharif (Jun - Oct)</option>
                    <option value="Rabi">Rabi (Oct - Mar)</option>
                    <option value="Zaid">Zaid / Summer (Mar - Jun)</option>
                    <option value="Suru / Adsali">Suru / Adsali</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Your Soil...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Find Best Crops for My Field
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Soil Health Card Info */}
          <div className="mt-4 p-3 rounded-2xl bg-gray-50 border border-gray-100 text-[11px] text-gray-600">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-800">Don't know your soil values?</strong>
                <p className="mt-0.5 leading-relaxed">
                  Visit your nearest <strong>Krishi Vigyan Kendra (KVK)</strong> or <strong>Agricultural Office</strong> to get a free <strong>Soil Health Card</strong>. 
                  You can also check online at <strong>soilhealth.dac.gov.in</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-agri-700 uppercase tracking-wider block">AI Analysis Complete</span>
                  <span className="text-xs font-bold text-gray-800">{result.modelVersion}</span>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-agri-200 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-agri-100 text-agri-800 text-xs font-black flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900">{rec.crop}</h3>
                      </div>
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-agri-50 text-agri-700 border border-agri-200">
                        {Math.round(rec.confidence * 100)}% Match
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-2.5 leading-relaxed bg-[#fafcf9] p-3 rounded-xl border border-gray-50">
                      {rec.matchRationale}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500">
                      <span>Season: <strong className="text-gray-800">{rec.season || formData.season}</strong></span>
                      <span>•</span>
                      <span>Soil compatibility: <strong className="text-emerald-700">Prime</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {result.notice && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">{result.notice}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
              <Sparkles className="w-10 h-10 text-agri-200 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-800">Ready to Recommend Crops</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Select your field above or fill in the soil details, then click <strong>"Find Best Crops"</strong> to get AI-powered recommendations.
              </p>

              {/* Quick guide for farmers */}
              <div className="mt-6 text-left max-w-sm mx-auto space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-agri-600 flex-shrink-0" />
                  <span><strong>Step 1:</strong> Select your farm field (auto-fills soil data)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-agri-600 flex-shrink-0" />
                  <span><strong>Step 2:</strong> Adjust soil levels if you know them (optional)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-agri-600 flex-shrink-0" />
                  <span><strong>Step 3:</strong> Click "Find Best Crops" — done!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
