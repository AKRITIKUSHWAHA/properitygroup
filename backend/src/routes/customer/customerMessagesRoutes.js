import { Router } from 'express';
import {
  getCustomerMessages,
  sendCustomerMessage,
  getMessageContacts,
} from '../../controllers/customer/customerMessagesController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'SURVEYOR'));

// Customer Menu 10: Messages
router.get('/contacts', getMessageContacts);
router.get('/', getCustomerMessages);
router.post('/', sendCustomerMessage);

export default router;
