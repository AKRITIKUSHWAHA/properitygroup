import { Router } from 'express';
import {
  getSupportTickets,
  createSupportTicket,
} from '../../controllers/customer/customerSupportController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 12: Support
router.get('/tickets', getSupportTickets);
router.post('/tickets', createSupportTicket);

export default router;
