import prisma from '../src/config/db.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding core demo and benchmark accounts in Supabase...');

  const salt = await bcrypt.genSalt(10);
  const farmerHash = await bcrypt.hash('Farmer@123', salt);
  const buyerHash = await bcrypt.hash('Buyer@123', salt);
  const adminHash = await bcrypt.hash('Admin@123', salt);

  // 1. Farmer
  const farmer = await prisma.user.upsert({
    where: { email: 'farmer@krishisetu.in' },
    update: { passwordHash: farmerHash, accountStatus: 'ACTIVE' },
    create: {
      email: 'farmer@krishisetu.in',
      passwordHash: farmerHash,
      role: 'FARMER',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      profile: {
        create: {
          fullName: 'Tukaram Shinde',
          phone: '+919822012345',
          state: 'Maharashtra',
          district: 'Pune',
          preferredLang: 'mr',
          bio: 'Progressive farmer cultivating sugarcane and onion in Baramati.',
        },
      },
    },
  });

  // Ensure farm exists for farmer
  let farm = await prisma.farm.findFirst({ where: { userId: farmer.id } });
  if (!farm) {
    farm = await prisma.farm.create({
      data: {
        userId: farmer.id,
        name: 'Shinde Agro Farm',
        areaAcres: 8.5,
        latitude: 18.1517,
        longitude: 74.5772,
        village: 'Malegaon',
        taluka: 'Baramati',
        district: 'Pune',
        soilType: 'BLACK_COTTON',
        waterSource: 'Canal Irrigation',
      },
    });
  }

  // 2. Buyer
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@krishisetu.in' },
    update: { passwordHash: buyerHash, accountStatus: 'ACTIVE' },
    create: {
      email: 'buyer@krishisetu.in',
      passwordHash: buyerHash,
      role: 'BUYER',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      profile: {
        create: {
          fullName: 'Sahyadri Agro Traders',
          phone: '+919822998877',
          state: 'Maharashtra',
          district: 'Nashik',
          preferredLang: 'en',
          bio: 'Bulk procurement and export of Nashik Onions and Grapes.',
        },
      },
    },
  });

  // 3. Admin
  await prisma.user.upsert({
    where: { email: 'admin@krishisetu.in' },
    update: { passwordHash: adminHash, accountStatus: 'ACTIVE' },
    create: {
      email: 'admin@krishisetu.in',
      passwordHash: adminHash,
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      profile: {
        create: {
          fullName: 'System Administrator',
          phone: '+919800000001',
          state: 'Maharashtra',
          district: 'Pune',
          preferredLang: 'en',
        },
      },
    },
  });

  // Ensure reference crop exists
  let crop = await prisma.crop.findFirst({ where: { name: 'Onion' } });
  if (!crop) {
    crop = await prisma.crop.create({
      data: {
        name: 'Onion',
        vernacularName: 'कांदा (Kanda)',
        category: 'VEGETABLES',
        season: 'RABI',
        durationDays: 130,
        expectedYieldPerAcre: 10000,
        optimalN: 100,
        optimalP: 50,
        optimalK: 50,
        minPh: 6.0,
        maxPh: 7.5,
      },
    });
  }

  // Ensure at least one active marketplace listing exists
  const listing = await prisma.cropListing.findFirst({ where: { userId: farmer.id } });
  if (!listing) {
    await prisma.cropListing.create({
      data: {
        userId: farmer.id,
        cropId: crop.id,
        title: 'Fresh Grade-A Red Onion (Gavran Kanda)',
        description: 'Well-cured, thin-necked Red Nashik Onion suitable for storage and export.',
        quantityKg: 5000,
        availableQtyKg: 5000,
        pricePerKg: 28.5,
        qualityGrade: 'GRADE_A',
        harvestDate: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        pickupAddress: 'Baramati APMC Yard, Pune',
        canDeliver: true,
        deliveryRadius: 150,
        status: 'ACTIVE',
      },
    });
  }

  console.log('✅ Accounts, Farm, Crop, and Marketplace listing verified in Supabase!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
