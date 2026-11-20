import { Router } from 'express';
import { getInvoices, recordPayment } from '../controllers/invoiceController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', getInvoices);
router.post('/:id/pay', recordPayment);

export default router;

