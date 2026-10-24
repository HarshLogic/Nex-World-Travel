import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import destinationRoutes from './routes/destinationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { getDBStatus } from './config/db.js';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Nex World Travel REST API',
    version: '1.0.0',
    database: getDBStatus(),
  });
});

// Mount modular API routes
app.use('/api/destinations', destinationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);

// Catch-all and centralized error handling
app.use(notFound);
app.use(errorHandler);

export default app;

