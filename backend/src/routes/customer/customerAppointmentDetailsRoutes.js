import { Router } from 'express';
import { getAppointmentDetails } from '../../controllers/customer/customerAppointmentDetailsController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 5: Appointment Details
router.get('/', getAppointmentDetails);

export default router;
