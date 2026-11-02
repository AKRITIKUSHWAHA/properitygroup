import { Router } from 'express';
import {
  getCustomerQuotations,
  acceptCustomerQuotation,
} from '../../controllers/customer/customerQuotationsController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 2: My Quotations
router.get('/', getCustomerQuotations);
router.post('/:id/accept', acceptCustomerQuotation);

export default router;
