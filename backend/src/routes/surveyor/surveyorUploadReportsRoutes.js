import { Router } from 'express';
import {
  getPendingReportJobs,
  submitDraftReport,
} from '../../controllers/surveyor/surveyorUploadReportsController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';
import { uploadReport } from '../../middlewares/uploadMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('SURVEYOR'));

// Surveyor Menu 5: Upload Reports (Supports both multipart file upload and JSON body)
router.get('/', getPendingReportJobs);
router.post('/:id', uploadReport.single('reportFile'), submitDraftReport);

export default router;

