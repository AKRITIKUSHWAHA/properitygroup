import { Router } from 'express';
import { getSettings, updateSettings, purgeTestData } from '../controllers/settingsController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 11: Settings Endpoints
router.get('/', getSettings);
router.patch('/', updateSettings);
router.post('/purge-test-data', purgeTestData);

export default router;

