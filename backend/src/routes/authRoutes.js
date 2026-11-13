import { Router } from 'express';
import { register, login, getMe, logout, changePassword } from '../controllers/authController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyJWT, getMe);
router.post('/change-password', verifyJWT, changePassword);

export default router;
