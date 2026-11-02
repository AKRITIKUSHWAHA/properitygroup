import { Router } from 'express';
import { getCustomerBookings } from '../../controllers/customer/customerBookingsController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 3: My Bookings
router.get('/', getCustomerBookings);

export default router;

