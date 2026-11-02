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
// Allow ADMIN, SURVEYOR, and CUSTOMER with automatic role-based scoping
router.use(authorizeRoles('ADMIN', 'SURVEYOR', 'CUSTOMER'));

// Menu 6: Survey Jobs Endpoints
router.get('/', getSurveyJobs);
router.get('/metrics', getSurveyJobsMetrics);
router.get('/:id', getSurveyJobById);
router.post('/', authorizeRoles('ADMIN'), createSurveyJob);
router.patch('/:id/stage', updateJobStage);
router.patch('/:id/assign-surveyor', authorizeRoles('ADMIN'), assignSurveyor);

export default router;
