import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import termsRoutes from './routes/termsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

import { notFound, errorHandler } from './middleware/errorHandler.js';
import { getDBStatus } from './config/db.js';
import { store } from './services/storeService.js';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get(['/api/health', '/api/v1/health'], (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Nex World Travel REST API',
    version: '2.0.0',
    database: getDBStatus(),
  });
});

// Seed data initialization hook
store.initializeSeedAccounts().catch((err) => {
  console.warn('[Server] Seed initialization background notice:', err.message);
});

// Dual mounting: supports both /api/v1/... and legacy /api/...
const mountRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/members`, memberRoutes);
  app.use(`${prefix}`, requestRoutes);
  app.use(`${prefix}/employees`, employeeRoutes);
  app.use(`${prefix}/destinations`, destinationRoutes);
  app.use(`${prefix}/activities`, activityRoutes);
  app.use(`${prefix}/packages`, packageRoutes);
  app.use(`${prefix}/bookings`, bookingRoutes);
  app.use(`${prefix}/contact`, contactRoutes);
  app.use(`${prefix}/terms`, termsRoutes);
  app.use(`${prefix}/dashboard`, dashboardRoutes);
};

mountRoutes('/api/v1');
mountRoutes('/api');

// Catch-all and centralized error handling
app.use(notFound);
app.use(errorHandler);

export default app;
