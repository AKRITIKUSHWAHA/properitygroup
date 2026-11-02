import { Router } from 'express';
import {
  getPendingReportJobs,
  submitDraftReport,
} from '../../controllers/surveyor/surveyorUploadReportsController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('SURVEYOR'));

// Surveyor Menu 5: Upload Reports
router.get('/', getPendingReportJobs);
router.post('/:id', submitDraftReport);

export default router;

