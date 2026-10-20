import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

async function runFullAudit() {
  console.log('🚀 ==========================================');
  console.log('🌾 STARTING COMPREHENSIVE KRISHISETU FEATURE AUDIT');
  console.log('🚀 ==========================================\n');

  let passed = 0;
  let failed = 0;
  const errors = [];

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      if (err.response?.data) {
        console.error('   Response:', JSON.stringify(err.response.data));
      }
      errors.push({ name, error: err.message, details: err.response?.data });
      failed++;
    }
  };

  // 1. System Health
  await test('1. Health Check Endpoint (/health)', async () => {
    const res = await axios.get(`${API_URL}/health`);
    if (res.status !== 200 || !res.data.data.services?.database) throw new Error('Health check failed');
  });

  // 2. Weather Engine
  await test('2. Current Weather (/weather/current)', async () => {
    const res = await axios.get(`${API_URL}/weather/current?district=Pune`);
    if (res.status !== 200 || !res.data.data.current?.temp) throw new Error('Weather report missing temp');
  });

  await test('3. Weather Forecast & Spray Window (/weather/forecast)', async () => {
    const res = await axios.get(`${API_URL}/weather/forecast?district=Pune`);
    if (res.status !== 200 || !Array.isArray(res.data.data.forecast)) throw new Error('Forecast missing data');
  });

  // 3. APMC Mandi Market Prices
  await test('4. APMC Mandi Prices (/markets/prices & /mandi/prices)', async () => {
    const res = await axios.get(`${API_URL}/markets/prices`);
    if (res.status !== 200 || !Array.isArray(res.data.data)) throw new Error('Markets prices invalid');
    const res2 = await axios.get(`${API_URL}/mandi/prices`);
    if (res2.status !== 200 || !Array.isArray(res2.data.data)) throw new Error('Mandi prices invalid');
  });

  // 4. Government Schemes
  await test('5. Government Schemes Directory (/schemes)', async () => {
    const res = await axios.get(`${API_URL}/schemes`);
    if (res.status !== 200 || !Array.isArray(res.data.data)) throw new Error('Schemes invalid');
  });

  // 5. Public Marketplace
  await test('6. Public Marketplace Listings (/marketplace & /marketplace/listings)', async () => {
    const res = await axios.get(`${API_URL}/marketplace`);
    if (res.status !== 200 || !Array.isArray(res.data.data)) throw new Error('Marketplace listings invalid');
    const res2 = await axios.get(`${API_URL}/marketplace/listings`);
    if (res2.status !== 200 || !Array.isArray(res2.data.data)) throw new Error('Marketplace /listings alias invalid');
  });

  // 6. User Authentication: Farmer Login
  let farmerToken = '';
  await test('7. Farmer Authentication & Token Issuance (/auth/login)', async () => {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: 'farmer@krishisetu.in',
      password: 'Farmer@123',
    });
    if (res.status !== 200 || !res.data.data.token) throw new Error('Farmer login failed');
    farmerToken = res.data.data.token;
  });

  // 7. Verify /auth/me for Farmer
  await test('8. Identity Verification (/auth/me)', async () => {
    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    if (res.status !== 200 || res.data.data.role !== 'FARMER') throw new Error('Farmer identity verification failed');
  });

  // 8. Farmer Farm Management
  await test('9. Farmer Farm Dashboard (/farms/dashboard)', async () => {
    const res = await axios.get(`${API_URL}/farms/dashboard`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    if (res.status !== 200 || !res.data.data) throw new Error('Farmer dashboard invalid');
  });

  await test('10. Farmer Farm List (/farms)', async () => {
    const res = await axios.get(`${API_URL}/farms`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    if (res.status !== 200 || !Array.isArray(res.data.data)) throw new Error('Farmer farms list invalid');
  });

  // 9. Buyer Authentication: Buyer Login
  let buyerToken = '';
  await test('11. Buyer Authentication & Token Issuance (/auth/login)', async () => {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: 'buyer@krishisetu.in',
      password: 'Buyer@123',
    });
    if (res.status !== 200 || !res.data.data.token) throw new Error('Buyer login failed');
    buyerToken = res.data.data.token;
  });

  // 10. Buyer Orders & Transactions
  await test('12. Buyer Orders List (/orders)', async () => {
    const res = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    if (res.status !== 200 || !Array.isArray(res.data.data)) throw new Error('Buyer orders invalid');
  });

  // 11. AI Assistant Chat
  await test('13. AI Agronomic Assistant Chat (/ai/chat)', async () => {
    const res = await axios.post(
      `${API_URL}/ai/chat`,
      { question: 'What is the recommended fertilizer split for Sugarcane in Maharashtra?' },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    if (res.status !== 200 || !res.data.data.answer) throw new Error('AI Assistant reply missing');
  });

  // 12. Dynamic New User Registration (Any Email)
  const dynamicEmail = `audit_user_${Date.now()}@krishisetu.test`;
  await test(`14. Dynamic Registration with Arbitrary Email (${dynamicEmail})`, async () => {
    const res = await axios.post(`${API_URL}/auth/register`, {
      email: dynamicEmail,
      password: 'StrongPassword@123',
      fullName: 'Audit Farmer Test',
      role: 'FARMER',
      phone: '+919876543299',
      state: 'Maharashtra',
      district: 'Kolhapur',
    });
    if (res.status !== 201 || !res.data.data.token) throw new Error('Dynamic registration failed');
  });

  // 13. Dynamic User Login
  await test(`15. Dynamic User Login with New Credentials`, async () => {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: dynamicEmail,
      password: 'StrongPassword@123',
    });
    if (res.status !== 200 || !res.data.data.token) throw new Error('Dynamic login failed');
  });

  console.log('\n==========================================');
  console.log(`📊 AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==========================================\n');

  if (failed > 0) {
    console.error('⚠️ Critical Issues Found:', errors);
    process.exit(1);
  } else {
    console.log('🎉 ALL KRISHISETU FEATURES AND FUNCTIONS ARE WORKING PROPERLY WITHOUT ERROR!');
    process.exit(0);
  }
}

runFullAudit().catch((e) => {
  console.error('Audit runtime error:', e);
  process.exit(1);
});
