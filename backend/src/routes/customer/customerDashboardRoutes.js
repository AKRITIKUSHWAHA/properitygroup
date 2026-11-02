import { Router } from 'express';
import { getCustomerDashboard } from '../../controllers/customer/customerDashboardController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 1: Dashboard
router.get('/', getCustomerDashboard);

export default router;
