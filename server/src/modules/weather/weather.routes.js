import { Router } from 'express';
import { WeatherController } from './weather.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/current', WeatherController.getGeneralWeather);
router.get('/farm/:farmId', authenticate, WeatherController.getFarmWeather);

export default router;
