import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { touchUserPresence } from '../services/userPresenceService.js';

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication required. Missing Bearer token.');
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
      throw ApiError.unauthorized('Authentication required. Security token is empty.');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (tokenErr) {
      if (tokenErr.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Token expired. Please login again.');
      }
      throw ApiError.unauthorized('Invalid security token.');
    }

    if (!decoded || !decoded.id) {
      throw ApiError.unauthorized('Invalid security token payload.');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found or account no longer exists.');
    }

    if (user.status !== 'ACTIVE') {
      throw ApiError.forbidden('Your account has been deactivated or blocked by management.');
    }

    if (user.role === 'CUSTOMER' && !env.ENABLE_CLIENT_PORTAL_LOGIN && !req.originalUrl?.includes('/messages')) {
      throw ApiError.forbidden('Client portal access is currently deactivated');
    }

    touchUserPresence(user.id, user.email);

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${req.user?.role || 'Guest'}' is not authorized to access this resource.`
        )
      );
    }
    next();
  };
};

