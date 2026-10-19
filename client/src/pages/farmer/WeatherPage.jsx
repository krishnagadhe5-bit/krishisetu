import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CloudSun, Droplets, Wind, Compass, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const WeatherPage = () => {
  const [district, setDistrict] = useState('Pune');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async (targetDistrict) => {
    setLoading(true);
    try {
      const res = await api.get(`/weather/current?district=${targetDistrict}`);
      setWeather(res.data.data);
    } catch (err) {
      toast.error('Failed to load weather intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(district);
  }, []);

  const maharashtraDistricts = ['Pune', 'Nashik', 'Nagpur', 'Kolhapur', 'Solapur', 'Ahmednagar', 'Chhatrapati Sambhajinagar'];

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-semibold mb-2">
            <CloudSun className="w-3.5 h-3.5 text-sky-700" />
            Agro-Meteorological Forecast Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Weather Intelligence & Field Advisory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time atmospheric monitoring, precipitation radar, and crop spray windows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-600">District:</label>
          <select
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              fetchWeather(e.target.value);
            }}
            className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-white shadow-sm"
          >
            {maharashtraDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {weather && (
        <div className="space-y-6">
          {/* Main Weather Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-600 to-sky-800 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-semibold text-sky-200 block uppercase tracking-wider">
                  {weather.location}
                </span>
                <div className="flex items-baseline gap-4 mt-2">
                  <span className="text-5xl font-black">{weather.current.temp}°C</span>
                  <span className="text-sm font-medium text-sky-100">Feels like {weather.current.feelsLike}°C</span>
                </div>
                <p className="text-sm font-semibold text-sky-100 mt-1 capitalize">{weather.current.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center bg-white/10 backdrop-blur rounded-2xl p-4">
                <div>
                  <Droplets className="w-5 h-5 mx-auto text-sky-200 mb-1" />
                  <span className="text-[10px] text-sky-200 block uppercase">Humidity</span>
                  <span className="text-sm font-bold">{weather.current.humidity}%</span>
                </div>
                <div>
                  <Wind className="w-5 h-5 mx-auto text-sky-200 mb-1" />
                  <span className="text-[10px] text-sky-200 block uppercase">Wind Speed</span>
                  <span className="text-sm font-bold">{weather.current.windSpeed} km/h</span>
                </div>
                <div>
                  <Compass className="w-5 h-5 mx-auto text-sky-200 mb-1" />
                  <span className="text-[10px] text-sky-200 block uppercase">Precipitation</span>
                  <span className="text-sm font-bold">{weather.current.rainfallMm} mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast Grid */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-agri-700" />
              5-Day Agro-Weather Forecast & Rain Probability
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {weather.forecast.map((f, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                  <span className="text-xs font-bold text-gray-900 block">{f.day}</span>
                  <CloudSun className="w-6 h-6 text-sky-600 mx-auto my-2" />
                  <span className="text-xs font-extrabold text-gray-800 block">
                    {f.tempMax}° / {f.tempMin}°
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-1">{f.condition}</span>
                  <span className="text-[10px] font-bold text-sky-700 mt-2 inline-block px-2 py-0.5 rounded-full bg-sky-50">
                    {f.rainProbPct}% Rain
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Advisory */}
          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-agri-700" />
              Agronomic Decision Advisory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-agri-50/60 border border-agri-100">
                <span className="font-bold text-agri-900 block mb-1">💧 Irrigation Recommendation</span>
                <p className="text-agri-800 leading-relaxed">{weather.agriculturalAdvisory.irrigationSuggestion}</p>
              </div>

              <div className="p-4 rounded-2xl bg-harvest-50/60 border border-harvest-100">
                <span className="font-bold text-harvest-900 block mb-1">🌿 Foliar Spraying Window</span>
                <p className="text-harvest-800 leading-relaxed">{weather.agriculturalAdvisory.sprayingWindow}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
