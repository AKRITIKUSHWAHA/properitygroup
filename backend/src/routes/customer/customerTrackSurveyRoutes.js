import { Router } from 'express';
import { getSurveyTracking } from '../../controllers/customer/customerTrackSurveyController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 4: Track My Survey
router.get('/', getSurveyTracking);

export default router;
