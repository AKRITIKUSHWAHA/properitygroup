import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const jwtSecret = process.env.JWT_SECRET?.trim();
if (!jwtSecret || jwtSecret === 'njs_secret_default_key') {
  console.error('[FATAL] JWT_SECRET environment variable is missing or insecure. Server cannot start.');
  process.exit(1);
}

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: (process.env.CLIENT_URL || 'http://localhost:5175,http://localhost:5173')
    .split(',')
    .map((url) => url.trim()),
  ENABLE_CLIENT_PORTAL_LOGIN: process.env.ENABLE_CLIENT_PORTAL_LOGIN !== 'false',
  ENABLE_BOOKING_REMINDER_JOB: process.env.ENABLE_BOOKING_REMINDER_JOB !== 'false',
  BOOKING_REMINDER_INTERVAL_MS: parseInt(process.env.BOOKING_REMINDER_INTERVAL_MS || String(6 * 60 * 60 * 1000), 10),
  BOOKING_REMINDER_MIN_AGE_HOURS: parseInt(process.env.BOOKING_REMINDER_MIN_AGE_HOURS || '48', 10),
  ENQUIRY_NOTIFICATION_EMAIL: process.env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com',
};

