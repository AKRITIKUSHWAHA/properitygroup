import { Router } from 'express';
import {
  getCustomerDetails,
  updateCustomerDetails,
} from '../../controllers/customer/customerDetailsController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 13: My Details
router.get('/', getCustomerDetails);
router.patch('/', updateCustomerDetails);

export default router;

