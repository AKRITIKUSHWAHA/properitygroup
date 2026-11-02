import { Router } from 'express';
import {
  getReportsAndAnalytics,
  getReportsMetrics,
  approveQaReport,
  uploadReportUrl,
} from '../controllers/reportsAndAnalyticsController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 10: Reports & Analytics Endpoints
router.get('/', getReportsAndAnalytics);
router.get('/metrics', getReportsMetrics);
router.patch('/:id/qa-approve', approveQaReport);
router.post('/:id/upload', uploadReportUrl);

export default router;
