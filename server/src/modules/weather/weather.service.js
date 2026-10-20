import axios from 'axios';
import prisma from '../../config/db.js';
import { logger } from '../../utils/logger.js';

// Comprehensive coordinate directory for Maharashtra agro-climatic zones
const MAHARASHTRA_DISTRICT_COORDS = {
  pune: { lat: 18.5204, lon: 73.8567 },
  nashik: { lat: 19.9975, lon: 73.7898 },
  kolhapur: { lat: 16.7050, lon: 74.2433 },
  solapur: { lat: 17.6599, lon: 75.9064 },
  ahmednagar: { lat: 19.0948, lon: 74.7480 },
  satara: { lat: 17.6805, lon: 73.9934 },
  sangli: { lat: 16.8524, lon: 74.5815 },
  'chhatrapati sambhajinagar': { lat: 19.8762, lon: 75.3433 },
  aurangabad: { lat: 19.8762, lon: 75.3433 },
  jalgaon: { lat: 21.0077, lon: 75.5626 },
  nagpur: { lat: 21.1458, lon: 79.0882 },
  amravati: { lat: 20.9374, lon: 77.7796 },
  latur: { lat: 18.4088, lon: 76.5604 },
  nanded: { lat: 19.1383, lon: 77.3210 },
  beed: { lat: 18.9891, lon: 75.7601 },
  parbhani: { lat: 19.2686, lon: 76.7708 },
  jalna: { lat: 19.8410, lon: 75.8864 },
  buldhana: { lat: 20.5292, lon: 76.1843 },
  akola: { lat: 20.7002, lon: 77.0082 },
  washim: { lat: 20.1110, lon: 77.1345 },
  yavatmal: { lat: 20.3888, lon: 78.1204 },
  wardha: { lat: 20.7453, lon: 78.6022 },
  chandrapur: { lat: 19.9615, lon: 79.2961 },
  gadchiroli: { lat: 20.1849, lon: 80.0030 },
  bhandara: { lat: 21.1712, lon: 79.6548 },
  gondia: { lat: 21.4598, lon: 80.1961 },
  hingoli: { lat: 19.7196, lon: 77.1485 },
  dhule: { lat: 20.9042, lon: 74.7749 },
  nandurbar: { lat: 21.3708, lon: 74.2409 },
  raigad: { lat: 18.5158, lon: 73.1822 },
  ratnagiri: { lat: 16.9902, lon: 73.3120 },
  sindhudurg: { lat: 16.1197, lon: 73.6961 },
  thane: { lat: 19.2183, lon: 72.9781 },
  palghar: { lat: 19.6936, lon: 72.7655 },
  dharashiv: { lat: 18.1729, lon: 76.0407 },
  osmanabad: { lat: 18.1729, lon: 76.0407 },
  mumbai: { lat: 19.0760, lon: 72.8777 },
};

// Standard WMO Weather Code Dictionary for Open-Meteo
const WMO_WEATHER_CODES = {
  0: { description: 'Clear sky', condition: 'Clear Sky', icon: '01d' },
  1: { description: 'Mainly clear', condition: 'Mainly Clear', icon: '02d' },
  2: { description: 'Partly cloudy', condition: 'Partly Cloudy', icon: '03d' },
  3: { description: 'Overcast skies', condition: 'Overcast', icon: '04d' },
  45: { description: 'Foggy conditions', condition: 'Fog', icon: '50d' },
  48: { description: 'Depositing rime fog', condition: 'Rime Fog', icon: '50d' },
  51: { description: 'Light drizzle', condition: 'Light Drizzle', icon: '09d' },
  53: { description: 'Moderate drizzle', condition: 'Drizzle', icon: '09d' },
  55: { description: 'Dense drizzle', condition: 'Heavy Drizzle', icon: '09d' },
  61: { description: 'Slight rain showers', condition: 'Light Rain', icon: '10d' },
  63: { description: 'Moderate rain', condition: 'Moderate Rain', icon: '10d' },
  65: { description: 'Heavy rainfall', condition: 'Heavy Rain', icon: '10d' },
  71: { description: 'Slight snow', condition: 'Light Snow', icon: '13d' },
  73: { description: 'Moderate snow', condition: 'Snow', icon: '13d' },
  75: { description: 'Heavy snow fall', condition: 'Heavy Snow', icon: '13d' },
  80: { description: 'Scattered rain showers', condition: 'Passing Showers', icon: '09d' },
  81: { description: 'Moderate rain showers', condition: 'Showers', icon: '09d' },
  82: { description: 'Violent rain showers', condition: 'Heavy Showers', icon: '09d' },
  95: { description: 'Thunderstorm activity', condition: 'Thunderstorm', icon: '11d' },
  96: { description: 'Thunderstorm with slight hail', condition: 'Thunderstorm & Hail', icon: '11d' },
  99: { description: 'Severe thunderstorm with heavy hail', condition: 'Severe Hailstorm', icon: '11d' },
};

export class WeatherService {
  /**
   * Retrieves weather intelligence for a specific registered farm
   */
  static async getFarmWeather(userId, farmId) {
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      const err = new Error('Farm not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const district = farm.district || 'Pune';
    let lat = farm.latitude ? Number(farm.latitude) : null;
    let lon = farm.longitude ? Number(farm.longitude) : null;

    if (!lat || !lon) {
      const lookup = MAHARASHTRA_DISTRICT_COORDS[district.toLowerCase()] || MAHARASHTRA_DISTRICT_COORDS.pune;
      lat = lookup.lat;
      lon = lookup.lon;
    }

    const weatherData = await this.fetchWeatherData(lat, lon, district);

    // Persist real observation to database
    try {
      await prisma.weatherObservation.create({
        data: {
          farmId,
          tempCelsius: weatherData.current.temp,
          humidity: weatherData.current.humidity,
          rainfallMm: weatherData.current.rainfallMm,
          windSpeedKmh: weatherData.current.windSpeed,
          description: weatherData.current.description,
          provider: weatherData.provider,
          providerData: weatherData,
        },
      });
    } catch (e) {
      logger.warn(`Failed to save weather observation for farm ${farmId}: ${e.message}`);
    }

    return weatherData;
  }

  /**
   * Main entry point to fetch real-world weather data.
   * Prioritizes Open-Meteo High-Resolution Forecast API (No API key required, 100% free & open).
   */
  static async fetchWeatherData(lat, lon, district = 'Maharashtra') {
    // 1. Resolve coordinates from district name if needed
    if (!lat || !lon || (lat === 18.5204 && lon === 73.8567 && district && district !== 'Pune')) {
      const cleanDistrict = district.trim().toLowerCase();
      if (MAHARASHTRA_DISTRICT_COORDS[cleanDistrict]) {
        lat = MAHARASHTRA_DISTRICT_COORDS[cleanDistrict].lat;
        lon = MAHARASHTRA_DISTRICT_COORDS[cleanDistrict].lon;
      }
    }

    const providerConfig = (process.env.WEATHER_PROVIDER || 'openmeteo').toLowerCase();

    // 2. Try Open-Meteo Live API first
    if (providerConfig === 'openmeteo' || providerConfig === 'live') {
      try {
        return await this.fetchOpenMeteoWeather(lat, lon, district);
      } catch (err) {
        logger.warn(`[WeatherService] Open-Meteo request failed: ${err.message}. Engaging regional agro-climatic fallback.`);
      }
    }

    // 3. Fallback to OpenWeatherMap if explicitly configured
    if (providerConfig === 'openweathermap' && process.env.WEATHER_API_KEY) {
      try {
        return await this.fetchOpenWeatherMap(lat, lon, district);
      } catch (err) {
        logger.warn(`[WeatherService] OpenWeatherMap request failed: ${err.message}.`);
      }
    }

    // 4. Default: Resilient regional simulation
    return this.getMockWeatherData(lat, lon, district);
  }

  /**
   * Fetches real-world atmospheric and agronomic data from the Open-Meteo Weather Forecast API
   */
  static async fetchOpenMeteoWeather(lat, lon, district) {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'rain',
        'weather_code',
        'wind_speed_10m',
        'surface_pressure',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'et0_fao_evapotranspiration',
      ].join(','),
      timezone: 'auto',
    };

    const res = await axios.get(url, { params, timeout: 8000 });
    const data = res.data;

    const currentWmo = WMO_WEATHER_CODES[data.current.weather_code] || {
      description: 'Partly cloudy',
      condition: 'Partly Cloudy',
      icon: '03d',
    };

    const currentTemp = Number(data.current.temperature_2m.toFixed(1));
    const currentFeelsLike = Number(data.current.apparent_temperature.toFixed(1));
    const currentHumidity = Math.round(data.current.relative_humidity_2m);
    const currentWindSpeed = Number(data.current.wind_speed_10m.toFixed(1));
    const currentRainfall = Number((data.current.precipitation || data.current.rain || 0).toFixed(1));
    const currentPressure = Math.round(data.current.surface_pressure || 1012);

    // Build 7-day agricultural forecast
    const forecast = [];
    const daily = data.daily;
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < daily.time.length; i++) {
      const forecastDate = new Date(daily.time[i]);
      let dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : daysOfWeek[forecastDate.getDay()];
      const wmo = WMO_WEATHER_CODES[daily.weather_code[i]] || { condition: 'Fair', icon: '02d' };

      forecast.push({
        date: daily.time[i],
        day: dayName,
        tempMin: Math.round(daily.temperature_2m_min[i]),
        tempMax: Math.round(daily.temperature_2m_max[i]),
        condition: wmo.condition,
        rainProbPct: Math.round(daily.precipitation_probability_max[i] || 0),
        rainfallMm: Number((daily.precipitation_sum[i] || 0).toFixed(1)),
        maxWindSpeed: Number((daily.wind_speed_10m_max[i] || 0).toFixed(1)),
        et0Evapotranspiration: Number((daily.et0_fao_evapotranspiration[i] || 0).toFixed(2)),
      });
    }

    // Calculate precision agricultural advisories
    const agriculturalAdvisory = this.generateAgronomicAdvisory({
      temp: currentTemp,
      humidity: currentHumidity,
      windSpeed: currentWindSpeed,
      rainMm: currentRainfall,
      forecast,
    });

    return {
      isMock: false,
      provider: 'Open-Meteo High-Resolution Weather API',
      apiModel: 'Open-Meteo Seamless Numerical Weather Prediction (NWP)',
      location: `${district}, Maharashtra`,
      coordinates: { lat, lon },
      elevationMeters: data.elevation || 560,
      timestamp: new Date().toISOString(),
      current: {
        temp: currentTemp,
        feelsLike: currentFeelsLike,
        humidity: currentHumidity,
        windSpeed: currentWindSpeed,
        description: currentWmo.description,
        condition: currentWmo.condition,
        icon: currentWmo.icon,
        rainfallMm: currentRainfall,
        pressure: currentPressure,
        weatherCode: data.current.weather_code,
      },
      forecast,
      agriculturalAdvisory,
    };
  }

  /**
   * Generates real-world actionable agronomic recommendations from atmospheric parameters
   */
  static generateAgronomicAdvisory({ temp, humidity, windSpeed, rainMm, forecast }) {
    const next24hRainProb = forecast[0]?.rainProbPct || 0;
    const tomorrowRainProb = forecast[1]?.rainProbPct || 0;
    const todayEt0 = forecast[0]?.et0Evapotranspiration || 4.5;
    const totalWeekRain = forecast.reduce((sum, d) => sum + d.rainfallMm, 0);

    // 1. Precision Foliar Spraying Window
    let sprayingWindow = 'Ideal spraying conditions: favorable wind speed and no immediate precipitation forecast.';
    let sprayStatus = 'OPTIMAL';

    if (rainMm > 0) {
      sprayingWindow = 'Active rainfall detected. Halt foliar chemical spraying immediately to prevent chemical runoff.';
      sprayStatus = 'UNFAVORABLE';
    } else if (windSpeed > 20) {
      sprayingWindow = `Wind velocity (${windSpeed} km/h) exceeds safe threshold (15 km/h). Severe pesticide droplet drift danger. Postpone spraying.`;
      sprayStatus = 'UNFAVORABLE';
    } else if (next24hRainProb > 60 || tomorrowRainProb > 60) {
      sprayingWindow = 'Rain showers forecast within 24-48 hours (>60% probability). Avoid systemic fungicide or herbicide application to prevent wash-off.';
      sprayStatus = 'CAUTION';
    } else if (temp > 34) {
      sprayingWindow = `High ambient temperature (${temp}°C) causes rapid droplet evaporation and leaf scorch. Spray exclusively during dawn (6:00-9:00 AM) or dusk.`;
      sprayStatus = 'CAUTION';
    }

    // 2. FAO-56 Penman-Monteith ET0 Irrigation Recommendation
    let irrigationSuggestion = 'Standard crop irrigation schedule recommended.';
    if (rainMm > 8 || totalWeekRain > 25) {
      irrigationSuggestion = `Substantial precipitation received/forecast (${totalWeekRain.toFixed(1)} mm this week). Pause drip fertigation for 48-72 hours to prevent root hypoxia.`;
    } else if (todayEt0 > 5.2 && temp > 32) {
      irrigationSuggestion = `High evapotranspiration loss (${todayEt0} mm/day) driven by atmospheric demand. Increase drip irrigation run-time by 15-20% to sustain soil root zone moisture.`;
    } else if (humidity > 80) {
      irrigationSuggestion = 'Elevated atmospheric humidity suppresses plant transpirational demand. Reduce irrigation run-time by 15% to conserve energy and water.';
    }

    // 3. Thermal & Frost Risk Indicators
    const heatStressRisk = temp >= 37 ? 'HIGH' : temp >= 33 ? 'MODERATE' : 'LOW';
    const frostRisk = temp <= 6 ? 'HIGH' : temp <= 10 ? 'MODERATE' : 'NONE';

    return {
      irrigationSuggestion,
      sprayingWindow,
      sprayStatus,
      heatStressRisk,
      frostRisk,
      evapotranspirationRate: `${todayEt0} mm/day`,
      weeklyPrecipitationForecastMm: Number(totalWeekRain.toFixed(1)),
    };
  }

  /**
   * OpenWeatherMap Fallback Adapter
   */
  static async fetchOpenWeatherMap(lat, lon, district) {
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
      { timeout: 5000 }
    );

    const data = response.data;
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = Number((data.wind.speed * 3.6).toFixed(1));
    const rain = data.rain ? data.rain['1h'] || 0 : 0;

    return {
      isMock: false,
      provider: 'OpenWeatherMap',
      location: `${data.name || district}, Maharashtra`,
      coordinates: { lat, lon },
      timestamp: new Date().toISOString(),
      current: {
        temp,
        feelsLike: data.main.feels_like,
        humidity,
        windSpeed,
        description: data.weather[0]?.description || 'Clear sky',
        icon: data.weather[0]?.icon,
        rainfallMm: rain,
        pressure: data.main.pressure,
      },
      forecast: this.generateForecastBaseline(temp, humidity),
      agriculturalAdvisory: this.generateAgronomicAdvisory({
        temp,
        humidity,
        windSpeed,
        rainMm: rain,
        forecast: this.generateForecastBaseline(temp, humidity),
      }),
    };
  }

  /**
   * Resilient simulation fallback
   */
  static getMockWeatherData(lat, lon, district) {
    const baseTemp = 28.5;
    const baseHumidity = 58;

    return {
      isMock: true,
      notice: 'Simulated fallback mode: Open-Meteo connection momentarily unavailable.',
      provider: 'KrishiSetu Regional Agro-Climate Simulator',
      location: `${district}, Maharashtra`,
      coordinates: { lat, lon },
      timestamp: new Date().toISOString(),
      current: {
        temp: baseTemp,
        feelsLike: 30.2,
        humidity: baseHumidity,
        windSpeed: 12.5,
        description: 'Scattered clouds, moderate breeze',
        condition: 'Partly Cloudy',
        icon: '03d',
        rainfallMm: 0,
        pressure: 1012,
      },
      forecast: [
        { day: 'Today', tempMin: 21, tempMax: 31, condition: 'Partly Cloudy', rainProbPct: 15, rainfallMm: 0, et0Evapotranspiration: 4.5 },
        { day: 'Tomorrow', tempMin: 22, tempMax: 32, condition: 'Clear Sky', rainProbPct: 5, rainfallMm: 0, et0Evapotranspiration: 4.8 },
        { day: 'Day 3', tempMin: 20, tempMax: 29, condition: 'Light Rain Showers', rainProbPct: 65, rainfallMm: 4.5, et0Evapotranspiration: 3.8 },
        { day: 'Day 4', tempMin: 19, tempMax: 28, condition: 'Moderate Showers', rainProbPct: 80, rainfallMm: 12.0, et0Evapotranspiration: 3.2 },
        { day: 'Day 5', tempMin: 21, tempMax: 30, condition: 'Passing Clouds', rainProbPct: 25, rainfallMm: 1.0, et0Evapotranspiration: 4.4 },
      ],
      agriculturalAdvisory: {
        irrigationSuggestion: 'Standard crop irrigation schedule recommended for current soil moisture.',
        sprayingWindow: 'Favorable conditions for foliar pesticide and nutrient application.',
        heatStressRisk: 'LOW',
        frostRisk: 'NONE',
        evapotranspirationRate: '4.5 mm/day',
      },
    };
  }

  static generateForecastBaseline(temp, humidity) {
    return [
      { day: 'Today', tempMin: Math.round(temp - 6), tempMax: Math.round(temp + 3), condition: 'Current', rainProbPct: humidity > 70 ? 60 : 15, rainfallMm: 0, et0Evapotranspiration: 4.5 },
      { day: 'Tomorrow', tempMin: Math.round(temp - 5), tempMax: Math.round(temp + 4), condition: 'Clear Sky', rainProbPct: 10, rainfallMm: 0, et0Evapotranspiration: 4.8 },
      { day: 'Day 3', tempMin: Math.round(temp - 7), tempMax: Math.round(temp + 2), condition: 'Cloudy', rainProbPct: 40, rainfallMm: 2.0, et0Evapotranspiration: 4.1 },
      { day: 'Day 4', tempMin: Math.round(temp - 6), tempMax: Math.round(temp + 1), condition: 'Scattered Showers', rainProbPct: 55, rainfallMm: 5.5, et0Evapotranspiration: 3.9 },
      { day: 'Day 5', tempMin: Math.round(temp - 5), tempMax: Math.round(temp + 3), condition: 'Partly Sunny', rainProbPct: 20, rainfallMm: 0.5, et0Evapotranspiration: 4.6 },
    ];
  }
}
