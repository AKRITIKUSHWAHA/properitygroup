import { Router } from 'express';
import { getCustomerReports } from '../../controllers/customer/customerReportsController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 9: My Reports
router.get('/', getCustomerReports);

export default router;

