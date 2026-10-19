import { MarketplaceService } from './marketplace.service.js';
import { apiSuccess } from '../../utils/response.js';

export class MarketplaceController {
  static async createListing(req, res, next) {
    try {
      const listing = await MarketplaceService.createListing(req.user.id, req.body);
      return apiSuccess(res, listing, 'Produce listing created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getListings(req, res, next) {
    try {
      const listings = await MarketplaceService.getListings(req.query);
      return apiSuccess(res, listings, 'Crop listings retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getListingById(req, res, next) {
    try {
      const listing = await MarketplaceService.getListingById(req.params.id);
      return apiSuccess(res, listing, 'Listing details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateListing(req, res, next) {
    try {
      const updated = await MarketplaceService.updateListing(req.user.id, req.params.id, req.body);
      return apiSuccess(res, updated, 'Listing updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async matchRequirements(req, res, next) {
    try {
      const matches = await MarketplaceService.matchBuyerRequirements(req.user.id, req.body);
      return apiSuccess(res, matches, 'Compatibility matched listings retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async sendInquiry(req, res, next) {
    try {
      const inquiry = await MarketplaceService.sendInquiry(req.user.id, req.params.id, req.body);
      return apiSuccess(res, inquiry, 'Inquiry sent to seller', 201);
    } catch (error) {
      next(error);
    }
  }
}
