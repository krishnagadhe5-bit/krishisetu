import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiSuccess, apiError } from './utils/response.js';
import prisma from './config/db.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import farmsRoutes from './modules/farms/farms.routes.js';
import fieldsRoutes from './modules/fields/fields.routes.js';
import cropsRoutes from './modules/crops/crops.routes.js';
import weatherRoutes from './modules/weather/weather.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import marketsRoutes from './modules/markets/markets.routes.js';
import marketplaceRoutes from './modules/marketplace/marketplace.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import shipmentsRoutes from './modules/shipments/shipments.routes.js';
import expensesRoutes from './modules/expenses/expenses.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import consultationsRoutes from './modules/consultations/consultations.routes.js';
import schemesRoutes from './modules/schemes/schemes.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev flexible
      }
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static uploads directory
app.use('/uploads', express.static('uploads'));

// General rate limiter
app.use(generalLimiter);

// Health check endpoint
app.get('/api/v1/health', async (req, res) => {
  let dbStatus = 'healthy';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'degraded';
  }

  return apiSuccess(res, {
    status: dbStatus === 'healthy' ? 'operational' : 'degraded',
    version: '1.0.0',
    platform: 'KrishiSetu',
    region: 'Maharashtra, India',
    services: {
      api: 'operational',
      database: dbStatus,
      aiService: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    },
    uptime: process.uptime(),
  }, 'KrishiSetu API is healthy');
});

// Swagger documentation definition
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'KrishiSetu REST API',
    version: '1.0.0',
    description: 'AI-Powered Agricultural Intelligence, Farm Management & Supply Chain Platform API',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount REST API Modules
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/farms', farmsRoutes);
app.use('/api/v1/fields', fieldsRoutes);
app.use('/api/v1/crops', cropsRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/markets', marketsRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/shipments', shipmentsRoutes);
app.use('/api/v1/expenses', expensesRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/consultations', consultationsRoutes);
app.use('/api/v1/schemes', schemesRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  return apiError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Centralized error handler
app.use(errorHandler);

export default app;
