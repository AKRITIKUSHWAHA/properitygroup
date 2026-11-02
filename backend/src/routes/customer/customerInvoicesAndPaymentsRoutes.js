import { Router } from 'express';
import {
  getCustomerInvoices,
  payInvoiceWithCard,
} from '../../controllers/customer/customerInvoicesAndPaymentsController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 8: Invoices & Payments
router.get('/', getCustomerInvoices);
router.post('/:id/pay', payInvoiceWithCard);

export default router;
