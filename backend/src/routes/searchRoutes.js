import { Router } from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = Router();

// Protect with verifyJWT
router.use(verifyJWT);

// GET /api/v1/search?q=...
router.get('/', globalSearch);

export default router;
