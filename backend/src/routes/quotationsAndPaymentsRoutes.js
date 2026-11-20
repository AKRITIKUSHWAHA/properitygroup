import { Router } from 'express';
import {
  getQuotesList,
  getInvoicesList,
  getQuotationsAndPaymentsMetrics,
  createQuote,
  updateQuote,
  updateQuoteStatus,
  settleBacsPayment,
} from '../controllers/quotationsAndPaymentsController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);

// Customer or Admin can update quote status (e.g. ACCEPTED when customer signs or accepts)
router.patch('/quotes/:id/status', authorizeRoles('ADMIN', 'SUPER_ADMIN', 'CUSTOMER'), updateQuoteStatus);

// All other Quotations & Payments Endpoints restricted to ADMIN and SUPER_ADMIN
router.use(authorizeRoles('ADMIN', 'SUPER_ADMIN'));

// Menu 8: Quotations & Payments Endpoints
router.get('/quotes', getQuotesList);
router.get('/invoices', getInvoicesList);
router.get('/metrics', getQuotationsAndPaymentsMetrics);
router.post('/quotes', createQuote);
router.post('/quote', createQuote);
router.put('/quotes/:id', updateQuote);
router.patch('/quotes/:id', updateQuote);
router.post('/invoices/:id/settle-bacs', settleBacsPayment);

export default router;

