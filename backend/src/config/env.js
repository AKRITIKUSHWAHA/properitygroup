import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'njs_secret_default_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: (process.env.CLIENT_URL || 'http://localhost:5175,http://localhost:5173')
    .split(',')
    .map((url) => url.trim()),
  ENABLE_CLIENT_PORTAL_LOGIN: process.env.ENABLE_CLIENT_PORTAL_LOGIN === 'true',
  ENQUIRY_NOTIFICATION_EMAIL: process.env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com',
};

