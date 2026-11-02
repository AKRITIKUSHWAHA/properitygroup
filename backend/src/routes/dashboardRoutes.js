import { Router } from 'express';
import {
  getDashboardStats,
  getActionBuckets,
  getRecentActivity,
} from '../controllers/dashboardController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 1: Dashboard Endpoints
router.get('/stats', getDashboardStats);
router.get('/action-buckets', getActionBuckets);
router.get('/recent-activity', getRecentActivity);

export default router;

