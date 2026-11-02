import { Router } from 'express';
import { getSurveyorDashboard } from '../../controllers/surveyor/surveyorDashboardController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('SURVEYOR'));

// Surveyor Menu 1: Dashboard
router.get('/', getSurveyorDashboard);

export default router;

