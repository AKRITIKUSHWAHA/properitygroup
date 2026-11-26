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

// Trust reverse proxy (Railway / Netlify / Nginx) so rate limiting uses real client IP
app.set('trust proxy', 1);

// Security HTTP headers with cross-origin resource policy enabled for static assets
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Serve static uploaded files (PDF Reports, Site Photos, Documents)
app.use('/uploads', express.static(uploadsDir));

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (webhooks, curl, supertest, mobile/native)
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured CLIENT_URL origins (exact origin match)
      const normalizedOrigin = origin.replace(/\/+$/, '');
      const allowedFromEnv = env.CLIENT_URL.some((u) => u && normalizedOrigin === u.replace(/\/+$/, ''));
      if (allowedFromEnv) {
        return callback(null, true);
      }

      // Allow official NJS Property Group domains via strict hostname check
      try {
        const { hostname } = new URL(origin);
        if (
          hostname === 'njspropertygroup.com' ||
          hostname.endsWith('.njspropertygroup.com') ||
          (env.NODE_ENV !== 'production' && (hostname === 'localhost' || hostname === '127.0.0.1'))
        ) {
          return callback(null, true);
        }
      } catch {
        // Malformed origin URL falls through to rejection
      }

      if (env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
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

