import { Router } from 'express';
import { MarketplaceController } from './marketplace.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/roles.js';

const router = Router();

// Public browse
router.get('/', MarketplaceController.getListings);
router.get('/listings', MarketplaceController.getListings);
router.get('/:id', MarketplaceController.getListingById);

// Protected routes
router.use(authenticate);

router.post('/', authorizeRoles('FARMER', 'ADMIN'), MarketplaceController.createListing);
router.patch('/:id', authorizeRoles('FARMER', 'ADMIN'), MarketplaceController.updateListing);
router.post('/match', authorizeRoles('BUYER', 'ADMIN'), MarketplaceController.matchRequirements);
router.post('/:id/inquiries', authorizeRoles('BUYER', 'ADMIN'), MarketplaceController.sendInquiry);

export default router;
