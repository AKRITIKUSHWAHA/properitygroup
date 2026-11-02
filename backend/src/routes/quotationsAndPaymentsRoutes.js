import { Router } from 'express';
import {
  getQuotesList,
  getInvoicesList,
  getQuotationsAndPaymentsMetrics,
  createQuote,
  settleBacsPayment,
} from '../controllers/quotationsAndPaymentsController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 8: Quotations & Payments Endpoints
router.get('/quotes', getQuotesList);
router.get('/invoices', getInvoicesList);
router.get('/metrics', getQuotationsAndPaymentsMetrics);
router.post('/quotes', createQuote);
router.post('/invoices/:id/settle-bacs', settleBacsPayment);

export default router;
