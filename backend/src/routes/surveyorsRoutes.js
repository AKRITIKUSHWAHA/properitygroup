import { Router } from 'express';
import {
  getSurveyors,
  getSurveyorsMetrics,
  onboardSurveyor,
  updateSurveyorProfile,
} from '../controllers/surveyorsController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 4: Surveyors Endpoints
router.get('/', getSurveyors);
router.get('/metrics', getSurveyorsMetrics);
router.post('/', onboardSurveyor);
router.patch('/:id', updateSurveyorProfile);

export default router;
