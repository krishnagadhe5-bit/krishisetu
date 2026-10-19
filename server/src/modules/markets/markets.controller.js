import { MarketsService } from './markets.service.js';
import { apiSuccess } from '../../utils/response.js';

export class MarketsController {
  static async getMarkets(req, res, next) {
    try {
      const markets = await MarketsService.getMarkets(req.query);
      return apiSuccess(res, markets, 'Markets retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getMarketPrices(req, res, next) {
    try {
      const prices = await MarketsService.getMarketPrices(req.query);
      return apiSuccess(res, prices, 'Market prices retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getPriceHistory(req, res, next) {
    try {
      const history = await MarketsService.getPriceHistory(req.params.cropId, req.query.days);
      return apiSuccess(res, history, 'Price history retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getForecast(req, res, next) {
    try {
      const cropName = req.query.crop || 'Onion';
      const forecast = await MarketsService.getMarketPriceForecast(cropName);
      return apiSuccess(res, forecast, 'Price forecast generated');
    } catch (error) {
      next(error);
    }
  }

  static async importPrices(req, res, next) {
    try {
      const result = await MarketsService.importPrices(req.body.prices || []);
      return apiSuccess(res, result, 'Market prices imported successfully');
    } catch (error) {
      next(error);
    }
  }
}
