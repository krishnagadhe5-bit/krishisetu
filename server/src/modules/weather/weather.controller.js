import { WeatherService } from './weather.service.js';
import { apiSuccess } from '../../utils/response.js';

export class WeatherController {
  static async getFarmWeather(req, res, next) {
    try {
      const weather = await WeatherService.getFarmWeather(req.user.id, req.params.farmId);
      return apiSuccess(res, weather, 'Weather intelligence retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getGeneralWeather(req, res, next) {
    try {
      const lat = parseFloat(req.query.lat) || 18.5204;
      const lon = parseFloat(req.query.lon) || 73.8567;
      const district = req.query.district || 'Pune';
      const weather = await WeatherService.fetchWeatherData(lat, lon, district);
      return apiSuccess(res, weather, 'Regional weather data retrieved');
    } catch (error) {
      next(error);
    }
  }
}
