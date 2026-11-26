import { Router } from 'express';
import { register, login, getMe, logout, changePassword, activatePortal } from '../controllers/authController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);
router.post('/activate', authRateLimiter, activatePortal);
router.get('/me', verifyJWT, getMe);
router.post('/change-password', verifyJWT, changePassword);

export default router;
