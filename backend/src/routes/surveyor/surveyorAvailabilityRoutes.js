import { Router } from 'express';
import {
  getMyAvailability,
  updateMyAvailability,
} from '../../controllers/surveyor/surveyorAvailabilityController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('SURVEYOR'));

// Surveyor Menu 6: My Availability
router.get('/', getMyAvailability);
router.patch('/', updateMyAvailability);

export default router;
