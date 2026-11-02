import { Router } from 'express';
import { getPreviousSurveys } from '../../controllers/customer/customerPreviousSurveysController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 14: Previous Surveys
router.get('/', getPreviousSurveys);

export default router;
