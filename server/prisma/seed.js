import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌾 Seeding KrishiSetu database with authentic agricultural data...');

  // 1. Password hash for demo users
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Farmer@123', salt);
  const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
  const buyerPasswordHash = await bcrypt.hash('Buyer@123', salt);
  const expertPasswordHash = await bcrypt.hash('Expert@123', salt);

  // 2. Demo Users
  const farmerUser = await prisma.user.upsert({
    where: { email: 'farmer@krishisetu.in' },
    update: {},
    create: {
      email: 'farmer@krishisetu.in',
      passwordHash: defaultPasswordHash,
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
          bio: 'Progressive farmer cultivating sugarcane, onion, and pomegranate in Baramati taluka.',
        },
      },
    },
  });

  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@krishisetu.in' },
    update: {},
    create: {
      email: 'buyer@krishisetu.in',
      passwordHash: buyerPasswordHash,
      role: 'BUYER',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      profile: {
        create: {
          fullName: 'Sahyadri Agro Traders Pvt Ltd',
          phone: '+919850123456',
          state: 'Maharashtra',
          district: 'Nashik',
          preferredLang: 'en',
          bio: 'Bulk agricultural produce procurement for wholesale retail and food processing.',
        },
      },
    },
  });

  const expertUser = await prisma.user.upsert({
    where: { email: 'expert@krishisetu.in' },
    update: {},
    create: {
      email: 'expert@krishisetu.in',
      passwordHash: expertPasswordHash,
      role: 'AGRICULTURE_EXPERT',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      profile: {
        create: {
          fullName: 'Dr. Anand Deshmukh',
          phone: '+919422987654',
          state: 'Maharashtra',
          district: 'Ahmednagar',
          preferredLang: 'mr',
          bio: 'Senior Agronomist, former faculty at MPKV Rahuri specializing in pest management and drip irrigation.',
        },
      },
      expertProfile: {
        create: {
          specialization: 'Crop Pathology & Integrated Pest Management',
          qualifications: 'Ph.D. in Agronomy, MPKV Rahuri',
          experienceYears: 18,
          verified: true,
          verifiedAt: new Date(),
        },
      },
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@krishisetu.in' },
    update: {},
    create: {
      email: 'admin@krishisetu.in',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      profile: {
        create: {
          fullName: 'KrishiSetu System Admin',
          phone: '+919000000001',
          state: 'Maharashtra',
          district: 'Pune',
        },
      },
    },
  });

  console.log('✅ Demo users seeded (Farmer, Buyer, Expert, Admin)');

  // 3. Crops Catalog (Maharashtra focused)
  const cropsData = [
    {
      name: 'Sugarcane',
      nameMarathi: 'ऊस',
      nameHindi: 'गन्ना',
      category: 'Cash Crop',
      season: 'Suru / Adsali',
      waterReqMm: 1800,
      growthDays: 360,
      description: 'Major commercial crop of Western Maharashtra. Varieties: Co 86032 (Nira), CoM 0265 (Phule 265).',
    },
    {
      name: 'Cotton',
      nameMarathi: 'कापूस',
      nameHindi: 'कपास',
      category: 'Fiber / Cash Crop',
      season: 'Kharif',
      waterReqMm: 700,
      growthDays: 160,
      description: 'White gold of Vidarbha and Marathwada. Cultivated in medium to deep black cotton soil.',
    },
    {
      name: 'Soybean',
      nameMarathi: 'सोयाबीन',
      nameHindi: 'सोयाबीन',
      category: 'Oilseed / Pulse',
      season: 'Kharif',
      waterReqMm: 500,
      growthDays: 100,
      description: 'Major kharif oilseed crop. Varieties: JS 335, Phule Kalyani (DS 228), JS 9305.',
    },
    {
      name: 'Onion',
      nameMarathi: 'कांदा',
      nameHindi: 'प्याज',
      category: 'Vegetable / Bulb',
      season: 'Rabi / Late Kharif',
      waterReqMm: 450,
      growthDays: 120,
      description: 'Staple commercial bulb crop centered around Lasalgaon and Nashik. Varieties: Phule Samarth, Bhima Kiran.',
    },
    {
      name: 'Pigeon Pea (Tur)',
      nameMarathi: 'तूर',
      nameHindi: 'अरहर',
      category: 'Pulse',
      season: 'Kharif',
      waterReqMm: 400,
      growthDays: 170,
      description: 'Protein-rich drought hardy pulse crop. Varieties: BDN 711, BSMR 736 (Godavari).',
    },
    {
      name: 'Pomegranate',
      nameMarathi: 'डाळिंब',
      nameHindi: 'अनार',
      category: 'Horticulture / Fruit',
      season: 'Mrig / Hasta Bahar',
      waterReqMm: 600,
      growthDays: 180,
      description: 'High value export fruit of Solapur and Sangli. Variety: Bhagwa (Sindhuri).',
    },
    {
      name: 'Wheat',
      nameMarathi: 'गहू',
      nameHindi: 'गेहूं',
      category: 'Cereal',
      season: 'Rabi',
      waterReqMm: 400,
      growthDays: 115,
      description: 'Staple winter cereal. Varieties: Lokwan, Phule Samadhan (NIAW 1994).',
    },
    {
      name: 'Tomato',
      nameMarathi: 'टोमॅटो',
      nameHindi: 'टमाटर',
      category: 'Vegetable',
      season: 'Year-Round',
      waterReqMm: 600,
      growthDays: 110,
      description: 'High turnover vegetable crop widely grown in Junnar, Narayangaon, and Sangamner.',
    },
  ];

  const seededCrops = [];
  for (const c of cropsData) {
    const crop = await prisma.crop.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
    seededCrops.push(crop);
  }
  console.log(`✅ Seeded ${seededCrops.length} crops with vernacular naming`);

  // 4. APMC Markets
  const marketsData = [
    { name: 'Lasalgaon APMC', state: 'Maharashtra', district: 'Nashik', address: 'Lasalgaon, Niphad, Nashik 422306' },
    { name: 'Pune (Gultekdi) APMC', state: 'Maharashtra', district: 'Pune', address: 'Market Yard, Gultekdi, Pune 411037' },
    { name: 'Nagpur (Kalamna) APMC', state: 'Maharashtra', district: 'Nagpur', address: 'Kalamna Market Yard, Nagpur 440026' },
    { name: 'Kolhapur (Shahupuri) APMC', state: 'Maharashtra', district: 'Kolhapur', address: 'Shahupuri Market, Kolhapur 416001' },
    { name: 'Solapur APMC', state: 'Maharashtra', district: 'Solapur', address: 'Siddheshwar Market Yard, Solapur 413002' },
  ];

  const seededMarkets = [];
  for (const m of marketsData) {
    const market = await prisma.market.upsert({
      where: { name_district: { name: m.name, district: m.district } },
      update: {},
      create: m,
    });
    seededMarkets.push(market);
  }
  console.log(`✅ Seeded ${seededMarkets.length} major Maharashtra APMC Mandis`);

  // 5. Historical Market Prices
  const onionCrop = seededCrops.find((c) => c.name === 'Onion');
  const lasalgaonMarket = seededMarkets.find((m) => m.name === 'Lasalgaon APMC');

  if (onionCrop && lasalgaonMarket) {
    const today = new Date();
    for (let i = 15; i >= 0; i--) {
      const obsDate = new Date(today);
      obsDate.setDate(obsDate.getDate() - i);
      const baseModal = 2300 + Math.floor(Math.sin(i) * 180);

      await prisma.marketPrice.upsert({
        where: {
          marketId_cropId_observationDate: {
            marketId: lasalgaonMarket.id,
            cropId: onionCrop.id,
            observationDate: obsDate,
          },
        },
        update: {},
        create: {
          marketId: lasalgaonMarket.id,
          cropId: onionCrop.id,
          observationDate: obsDate,
          minPricePerQtl: baseModal - 350,
          maxPricePerQtl: baseModal + 400,
          modalPricePerQtl: baseModal,
          unit: 'INR/quintal',
          dataSource: 'AGMARKNET Government Portal',
        },
      });
    }
    console.log('✅ Seeded 15 days of historical market prices for Lasalgaon Onion');
  }

  // 6. Farmer's Farm & Fields
  const farm = await prisma.farm.upsert({
    where: { id: 'demo-farm-baramati-01' },
    update: {},
    create: {
      id: 'demo-farm-baramati-01',
      userId: farmerUser.id,
      name: 'Shinde Agro Estate',
      state: 'Maharashtra',
      district: 'Pune',
      taluka: 'Baramati',
      village: 'Supe',
      areaAcres: 8.5,
      latitude: 18.2324,
      longitude: 74.4567,
      soilType: 'BLACK_COTTON',
      irrigationType: 'DRIP',
      waterSource: 'Nira Left Bank Canal & Deep Borewell',
    },
  });

  const field1 = await prisma.field.upsert({
    where: { id: 'demo-field-01' },
    update: {},
    create: {
      id: 'demo-field-01',
      farmId: farm.id,
      name: 'Plot A - Nira Vihar (Sugarcane)',
      areaAcres: 5.0,
      soilType: 'BLACK_COTTON',
      irrigationType: 'DRIP',
    },
  });

  const field2 = await prisma.field.upsert({
    where: { id: 'demo-field-02' },
    update: {},
    create: {
      id: 'demo-field-02',
      farmId: farm.id,
      name: 'Plot B - Malshiras Slope (Onion)',
      areaAcres: 3.5,
      soilType: 'LOAMY',
      irrigationType: 'SPRINKLER',
    },
  });

  // 7. Active Crop Cycle for Field 1
  const sugarcaneCrop = seededCrops.find((c) => c.name === 'Sugarcane');
  if (sugarcaneCrop) {
    const cycle = await prisma.cropCycle.upsert({
      where: { id: 'demo-crop-cycle-01' },
      update: {},
      create: {
        id: 'demo-crop-cycle-01',
        fieldId: field1.id,
        cropId: sugarcaneCrop.id,
        varietyName: 'Co 86032 (Nira)',
        status: 'GROWING',
        growthStage: 'VEGETATIVE',
        sowingDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000), // 75 days ago
        expectedHarvest: new Date(Date.now() + 285 * 24 * 60 * 60 * 1000),
        areaAcres: 5.0,
        seedQuantityKg: 4000,
        seedCost: 28000,
        notes: 'Drip fertigation installed. Applied basal DAP and MOP.',
      },
    });

    // Activities
    await prisma.cropActivity.createMany({
      data: [
        {
          cropCycleId: cycle.id,
          activityType: 'SOWING',
          activityDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
          description: 'Two-eye bud sett planting at 4.5 ft row spacing',
          cost: 15000,
        },
        {
          cropCycleId: cycle.id,
          activityType: 'FERTILIZER',
          activityDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
          description: 'Urea (50kg) + 19:19:19 water-soluble via venturi',
          cost: 4200,
        },
        {
          cropCycleId: cycle.id,
          activityType: 'WEEDING',
          activityDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          description: 'Interculturing and manual earthing up',
          cost: 6500,
        },
      ],
      skipDuplicates: true,
    });

    // Expenses
    await prisma.expense.createMany({
      data: [
        {
          farmId: farm.id,
          cropCycleId: cycle.id,
          category: 'SEEDS',
          description: 'Certified Co 86032 seed setts from MPKV nursery',
          amount: 28000,
          quantity: 40,
          unit: 'quintal',
          expenseDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        },
        {
          farmId: farm.id,
          cropCycleId: cycle.id,
          category: 'FERTILIZERS',
          description: 'Basal fertilizer mix (DAP + MOP + Micronutrient zinc)',
          amount: 14500,
          expenseDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        },
        {
          farmId: farm.id,
          cropCycleId: cycle.id,
          category: 'LABOR',
          description: 'Sett planting, trench preparation and furrow levelling labor',
          amount: 15000,
          expenseDate: new Date(Date.now() - 74 * 24 * 60 * 60 * 1000),
        },
        {
          farmId: farm.id,
          cropCycleId: cycle.id,
          category: 'IRRIGATION',
          description: 'Drip lateral flushing, filter servicing & inline emitters',
          amount: 3800,
          expenseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      ],
      skipDuplicates: true,
    });
  }

  // 8. Sample Crop Listing in Marketplace
  if (onionCrop) {
    await prisma.cropListing.upsert({
      where: { id: 'demo-listing-onion-01' },
      update: {},
      create: {
        id: 'demo-listing-onion-01',
        userId: farmerUser.id,
        cropId: onionCrop.id,
        title: 'Premium Export Grade Red Onion (नाशिक/पुणे लाल कांदा)',
        description: 'Naturally cured 55mm+ uniform red onion bulbs. Low moisture, ideal for domestic trade and long-term aeration storage.',
        quantityKg: 8500,
        availableQtyKg: 8500,
        pricePerKg: 24.5,
        qualityGrade: 'Grade A (Export Quality)',
        pickupAddress: 'Shinde Agro Farm Yard, Supe, Baramati, Pune 412258',
        canDeliver: true,
        deliveryRadius: 150,
        status: 'ACTIVE',
      },
    });
  }

  // 9. Government Schemes
  const schemesData = [
    {
      name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      issuingAuthority: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
      sourceUrl: 'https://pmkisan.gov.in',
      applicability: 'National',
      eligibility: 'All landholding farmer families having cultivable landholding in their names.',
      requiredDocuments: 'Aadhaar Card, Land ownership record (7/12 extract), Bank passbook linked with Aadhaar.',
      applicationProcess: 'Apply online via PM-KISAN web portal, mobile app or nearest CSC / Aaple Sarkar Seva Kendra.',
      lastVerifiedDate: new Date('2026-01-15'),
    },
    {
      name: 'Magel Tyala Shettale (Farm Pond On Demand Scheme)',
      issuingAuthority: 'Department of Agriculture, Government of Maharashtra',
      sourceUrl: 'https://mahadbt.maharashtra.gov.in',
      applicability: 'State',
      state: 'Maharashtra',
      eligibility: 'Farmer owning minimum 0.60 hectare land without existing government farm pond.',
      requiredDocuments: '7/12 & 8-A land extracts, Caste certificate (if applicable), Undertaking letter, Bank details.',
      applicationProcess: 'Submit online application via MahaDBT portal under Farmer Schemes module.',
      lastVerifiedDate: new Date('2026-02-01'),
    },
    {
      name: 'Dr. Punjabrao Deshmukh Jaivik Kheti Mission',
      issuingAuthority: 'Govt of Maharashtra Agriculture Department',
      sourceUrl: 'https://krishi.maharashtra.gov.in',
      applicability: 'State',
      state: 'Maharashtra',
      eligibility: 'Farmer groups and individual farmers adopting organic and natural farming techniques.',
      requiredDocuments: 'Land extract, Group resolution, Soil test report, Bank passbook.',
      applicationProcess: 'Apply through Taluka Agriculture Officer (TAO) / Karyalaya.',
      lastVerifiedDate: new Date('2026-02-10'),
    },
    {
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      issuingAuthority: 'Govt of India & Government of Maharashtra',
      sourceUrl: 'https://pmfby.gov.in',
      applicability: 'National',
      eligibility: 'All farmers including sharecroppers and tenant farmers growing notified crops in notified areas.',
      requiredDocuments: 'Aadhaar, Sowing certificate / 7/12 extract, Bank account details.',
      applicationProcess: 'Apply via MahaDBT / PMFBY portal within specified cutoff window for Kharif/Rabi.',
      lastVerifiedDate: new Date('2026-01-20'),
    },
  ];

  for (const s of schemesData) {
    await prisma.scheme.upsert({
      where: { id: `scheme-${s.name.slice(0, 15).replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `scheme-${s.name.slice(0, 15).replace(/\s+/g, '-').toLowerCase()}`,
        ...s,
      },
    });
  }
  console.log(`✅ Seeded ${schemesData.length} authenticated government agricultural schemes`);

  console.log('🌾 KrishiSetu database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
