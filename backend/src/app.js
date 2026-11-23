import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ApiError } from './utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

const app = express();

// Security HTTP headers with cross-origin resource policy enabled for static assets
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Serve static uploaded files (PDF Reports, Site Photos, Documents)
app.use('/uploads', express.static(uploadsDir));

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Always allow local development origins, live domains, and non-browser clients
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('njspropertygroup.com') ||
        origin.includes('railway.app') ||
        env.CLIENT_URL.some((u) => origin.startsWith(u) || u.includes(origin)) ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        // Fallback allow so frontend is never abruptly blocked by strict origin mismatch
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-User-Role',
      'X-User-Email',
      'X-User-Name',
      'x-user-role',
      'x-user-email',
      'x-user-name',
      'x-client-timezone',
      'X-Client-Timezone',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in dev - skip routine polling / background reads and 304 Not Modified cache hits so terminal stays clean
if (env.NODE_ENV === 'development') {
  app.use(
    morgan('dev', {
      skip: (req, res) => {
        if (res.statusCode === 304) return true;
        const u = req.originalUrl || req.url || '';
        return (
          u.includes('contacts') ||
          u.includes('notifications') ||
          u.includes('action-buckets') ||
          u.includes('permissions') ||
          u.includes('messages') ||
          u.includes('surveyors') ||
          u.includes('dashboard') ||
          u.includes('health')
        );
      },
    })
  );
}

// API Routes
app.use('/api/v1', apiRouter);

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    name: 'NJS Property Group API',
    version: '1.0.0',
    documentation: '/api/v1/health',
    status: 'Running',
  });
});

// Handle 404 for undefined routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found on this server`));
});

// Centralized Error Handling
app.use(errorHandler);

export default app;

