import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import app from './app.js';
import prisma from './config/db.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function startServer() {
  try {
    // Verify database connection with clear logging
    try {
      await prisma.$connect();
      logger.info('Database connection established successfully with PostgreSQL');
    } catch (dbErr) {
      logger.warn('Notice: PostgreSQL database connection failed or is not running yet.');
      logger.warn('Please start PostgreSQL (e.g. docker-compose up db) with DATABASE_URL.');
      logger.warn(`Connection note: ${dbErr.message}`);
      logger.info('KrishiSetu Express server is running in resilient mode.');
    }

    const server = app.listen(PORT, () => {
      logger.info(`🌾 KrishiSetu Express Server running at http://localhost:${PORT}`);
      logger.info(`📚 Swagger API Docs available at http://localhost:${PORT}/api/docs`);
      logger.info(`⚡ API Base URL: http://localhost:${PORT}/api/v1`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database disconnected. Process exited.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
