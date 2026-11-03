import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 11: Settings Endpoints
router.get('/', getSettings);
router.patch('/', updateSettings);

export default router;

