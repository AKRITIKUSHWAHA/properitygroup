import { Router } from 'express';
import {
  getCustomerMessages,
  sendCustomerMessage,
} from '../../controllers/customer/customerMessagesController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 10: Messages
router.get('/', getCustomerMessages);
router.post('/', sendCustomerMessage);

export default router;
