import prisma from '../../config/db.js';

export class MarketplaceService {
  static async createListing(userId, data) {
    const { cropId, title, description, quantityKg, pricePerKg, qualityGrade, harvestDate, expiresAt, pickupAddress, canDeliver, deliveryRadius, imageUrls } = data;

    const listing = await prisma.cropListing.create({
      data: {
        userId,
        cropId,
        title,
        description,
        quantityKg,
        availableQtyKg: quantityKg,
        pricePerKg,
        qualityGrade,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        pickupAddress,
        canDeliver: Boolean(canDeliver),
        deliveryRadius: deliveryRadius ? Number(deliveryRadius) : null,
        imageUrls: imageUrls || [],
        status: 'ACTIVE',
      },
      include: {
        crop: true,
        user: { select: { profile: true } },
      },
    });

    return listing;
  }

  static async getListings(query = {}) {
    const { cropId, district, minPrice, maxPrice, qualityGrade, status = 'ACTIVE' } = query;

    return prisma.cropListing.findMany({
      where: {
        status,
        ...(cropId && { cropId }),
        ...(qualityGrade && { qualityGrade }),
        ...(minPrice || maxPrice
          ? {
              pricePerKg: {
                ...(minPrice && { gte: Number(minPrice) }),
                ...(maxPrice && { lte: Number(maxPrice) }),
              },
            }
          : {}),
        ...(district && {
          user: {
            profile: {
              district: { contains: district, mode: 'insensitive' },
            },
          },
        }),
      },
      include: {
        crop: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getListingById(id) {
    const listing = await prisma.cropListing.findUnique({
      where: { id },
      include: {
        crop: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        inquiries: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!listing) {
      const err = new Error('Listing not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    return listing;
  }

  static async updateListing(userId, listingId, data) {
    const listing = await prisma.cropListing.findUnique({ where: { id: listingId } });
    if (!listing) {
      const err = new Error('Listing not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
    if (listing.userId !== userId) {
      const err = new Error('Access denied. You do not own this listing.');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    return prisma.cropListing.update({
      where: { id: listingId },
      data,
    });
  }

  static async matchBuyerRequirements(userId, requirement) {
    const { cropName, quantityKg, maxPricePerKg, qualityGrade, district } = requirement;

    // Find active listings for matching crop
    const listings = await prisma.cropListing.findMany({
      where: {
        status: 'ACTIVE',
        availableQtyKg: { gt: 0 },
        crop: {
          name: { contains: cropName, mode: 'insensitive' },
        },
      },
      include: {
        crop: true,
        user: { select: { profile: true } },
      },
    });

    // Score each listing based on transparent weighted criteria
    const scoredListings = listings.map((item) => {
      let score = 0;
      const breakdown = {};

      // 1. Quantity match (up to 30 pts)
      const qtyRatio = Math.min(Number(item.availableQtyKg) / Number(quantityKg), 1.0);
      const qtyScore = Math.round(qtyRatio * 30);
      score += qtyScore;
      breakdown.quantityScore = `${qtyScore}/30 (${item.availableQtyKg} kg available)`;

      // 2. Price match (up to 35 pts)
      if (maxPricePerKg) {
        if (Number(item.pricePerKg) <= Number(maxPricePerKg)) {
          const discount = (Number(maxPricePerKg) - Number(item.pricePerKg)) / Number(maxPricePerKg);
          const pScore = Math.min(35, Math.round(25 + discount * 20));
          score += pScore;
          breakdown.priceScore = `${pScore}/35 (Listed at ₹${item.pricePerKg}/kg vs budget ₹${maxPricePerKg}/kg)`;
        } else {
          score += 10;
          breakdown.priceScore = `10/35 (₹${item.pricePerKg}/kg slightly above target ₹${maxPricePerKg}/kg)`;
        }
      } else {
        score += 25;
        breakdown.priceScore = '25/35 (No price cap specified)';
      }

      // 3. Location / District match (up to 20 pts)
      const sellerDistrict = item.user.profile?.district || '';
      if (district && sellerDistrict.toLowerCase() === district.toLowerCase()) {
        score += 20;
        breakdown.locationScore = '20/20 (Same District - low transit cost)';
      } else if (item.canDeliver) {
        score += 15;
        breakdown.locationScore = '15/20 (Seller offers delivery)';
      } else {
        score += 8;
        breakdown.locationScore = '8/20 (Inter-district pickup)';
      }

      // 4. Quality grade match (up to 15 pts)
      if (qualityGrade && item.qualityGrade === qualityGrade) {
        score += 15;
        breakdown.qualityScore = `15/15 (Matches desired grade: ${qualityGrade})`;
      } else {
        score += 10;
        breakdown.qualityScore = '10/15 (Standard agricultural grade)';
      }

      return {
        listing: item,
        matchScore: Math.min(100, score),
        breakdown,
      };
    });

    return scoredListings.sort((a, b) => b.matchScore - a.matchScore);
  }

  static async sendInquiry(buyerId, listingId, data) {
    const listing = await prisma.cropListing.findUnique({
      where: { id: listingId },
      include: { user: true },
    });

    if (!listing) {
      const err = new Error('Listing not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        listingId,
        buyerId,
        message: data.message,
        quantityKg: data.quantityKg,
        offeredPrice: data.offeredPrice,
      },
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: listing.userId,
        type: 'BUYER_INQUIRY',
        title: 'New Buyer Purchase Inquiry',
        message: `A buyer expressed interest in "${listing.title}". Message: "${data.message}"`,
        data: { inquiryId: inquiry.id, listingId },
      },
    });

    return inquiry;
  }
}
