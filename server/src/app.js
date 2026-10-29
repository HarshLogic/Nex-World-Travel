import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

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
import availabilityRoutes from './routes/availabilityRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';

import { notFound, errorHandler } from './middleware/errorHandler.js';
import { getDBStatus } from './config/db.js';
import { store } from './services/storeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and utility middleware (allowing cross-origin media embedding)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Clean and normalize incoming URLs (handles double-slashes '//' and accidental duplicated prefixes)
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  if (req.url.startsWith('/api/v1/api/v1')) {
    req.url = req.url.replace('/api/v1/api/v1', '/api/v1');
  }
  next();
});

// Robust CORS supporting production Vercel domains, custom domains, and localhost
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health and Welcome endpoint (handles root '/', '/api', '/api/v1', and health routes)
app.get(['/', '/health', '/api', '/api/v1', '/api/health', '/api/v1/health'], (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Nex World Travel REST API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      members: '/api/v1/members',
      employees: '/api/v1/employees',
      destinations: '/api/v1/destinations',
      packages: '/api/v1/packages',
      bookings: '/api/v1/bookings',
    },
    database: getDBStatus(),
  });
});

// Static files serving for uploaded media with Railway Volume & persistent storage support
const primaryUploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : (process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.resolve(process.env.RAILWAY_VOLUME_MOUNT_PATH)
    : path.resolve(__dirname, '../public/uploads'));

const serverUploadsDir = path.resolve(__dirname, '../public/uploads');
const clientUploadsDir = path.resolve(__dirname, '../../client/public/uploads');

app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
app.use('/uploads', express.static(primaryUploadsDir));
if (primaryUploadsDir !== serverUploadsDir) {
  app.use('/uploads', express.static(serverUploadsDir));
}
app.use('/uploads', express.static(clientUploadsDir));

// Resilient Fallback for /uploads/:filename to serve from MongoDB if missing from ephemeral container disk
app.get('/uploads/:filename', async (req, res, next) => {
  try {
    const { filename } = req.params;
    const fallbackImage = await store.getUploadedImageFallback(filename);
    if (fallbackImage && fallbackImage.buffer) {
      const hash = crypto.createHash('md5').update(fallbackImage.buffer).digest('hex');
      const etag = `"${hash}"`;

      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }

      res.setHeader('Content-Type', fallbackImage.contentType || 'image/jpeg');
      res.setHeader('Content-Length', fallbackImage.buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      res.setHeader('ETag', etag);

      // Best effort cache to primary uploads directory so future hits are static
      try {
        if (!fs.existsSync(primaryUploadsDir)) {
          fs.mkdirSync(primaryUploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(primaryUploadsDir, path.basename(filename)), fallbackImage.buffer);
      } catch (e) {}

      return res.end(fallbackImage.buffer);
    }
    next();
  } catch (e) {
    next(e);
  }
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
  app.use(`${prefix}/availability`, availabilityRoutes);
  app.use(`${prefix}/media`, mediaRoutes);
  app.use(`${prefix}/upload`, mediaRoutes);
};

mountRoutes('/api/v1');
mountRoutes('/api');

// Catch-all and centralized error handling
app.use(notFound);
app.use(errorHandler);

export default app;
