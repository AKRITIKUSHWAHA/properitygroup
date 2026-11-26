import rateLimit from 'express-rate-limit';

const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: {
      success: false,
      statusCode: 429,
      message,
      errors: [],
    },
  });

/**
 * Auth brute-force protection (login, register, activate): 20 requests per 15 minutes
 */
export const authRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please wait 15 minutes and try again.',
});

/**
 * Public enquiry / quote calculator spam protection: 15 requests per 15 minutes
 */
export const publicEnquiryRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many enquiry submissions from this IP. Please wait 15 minutes before submitting again.',
});

/**
 * External webhook (LSD) rate limit: 60 requests per 15 minutes
 */
export const webhookRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Webhook rate limit exceeded. Please try again later.',
});
