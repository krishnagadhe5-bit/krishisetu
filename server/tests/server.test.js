import request from 'supertest';
import app from '../src/app.js';

describe('KrishiSetu Express Server API Tests', () => {
  it('GET /api/v1/health returns platform status and service descriptors', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.platform).toBe('KrishiSetu');
    expect(res.body.data.region).toBe('Maharashtra, India');
    expect(res.body.data.services).toHaveProperty('api');
  });

  it('GET /api/v1/unknown-endpoint returns standard 404 error envelope', async () => {
    const res = await request(app).get('/api/v1/non-existent-route-404');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Route not found');
  });

  it('POST /api/v1/auth/register rejects empty body with validation errors', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/farms requires authentication token', async () => {
    const res = await request(app).get('/api/v1/farms');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/weather/current returns weather report with regional fallback and forecast', async () => {
    const res = await request(app)
      .get('/api/v1/weather/current')
      .query({ district: 'Pune', state: 'Maharashtra' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('current');
    expect(res.body.data.current).toHaveProperty('temp');
    expect(res.body.data.current).toHaveProperty('humidity');
    expect(res.body.data).toHaveProperty('agriculturalAdvisory');
    expect(res.body.data).toHaveProperty('forecast');
  });

  it('POST /api/v1/ai/recommend-crop requires authentication token', async () => {
    const res = await request(app)
      .post('/api/v1/ai/recommend-crop')
      .send({ nitrogen: 100, phosphorus: 50, potassium: 50, ph: 6.5 });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
