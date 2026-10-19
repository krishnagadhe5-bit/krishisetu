import { Router } from 'express';
import { MarketsController } from './markets.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/roles.js';

const router = Router();

router.get('/', MarketsController.getMarkets);
router.get('/prices', MarketsController.getMarketPrices);
router.get('/prices/history/:cropId', MarketsController.getPriceHistory);
router.get('/forecast', MarketsController.getForecast);
router.post('/import', authenticate, authorizeRoles('ADMIN'), MarketsController.importPrices);

export default router;
