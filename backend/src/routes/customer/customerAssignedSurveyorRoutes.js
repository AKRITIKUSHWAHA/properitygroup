import { Router } from 'express';
import { getAssignedSurveyor } from '../../controllers/customer/customerAssignedSurveyorController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 6: Assigned Surveyor
router.get('/', getAssignedSurveyor);

export default router;

