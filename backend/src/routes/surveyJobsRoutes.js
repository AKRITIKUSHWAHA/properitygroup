import { Router } from 'express';
import {
  getSurveyJobs,
  getSurveyJobsMetrics,
  getSurveyJobById,
  createSurveyJob,
  updateJobStage,
  assignSurveyor,
} from '../controllers/surveyJobsController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 6: Survey Jobs Endpoints
router.get('/', getSurveyJobs);
router.get('/metrics', getSurveyJobsMetrics);
router.get('/:id', getSurveyJobById);
router.post('/', createSurveyJob);
router.patch('/:id/stage', updateJobStage);
router.patch('/:id/assign-surveyor', assignSurveyor);

export default router;
