import { Router } from 'express';
import {
  getMessageThreads,
  getMessagesMetrics,
  getThreadMessages,
  sendAdminMessage,
  markThreadRead,
} from '../controllers/messagesController.js';
import {
  getMessageContacts,
  getCustomerMessages,
  sendCustomerMessage,
} from '../controllers/customer/customerMessagesController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN', 'SUPER_ADMIN', 'SURVEYOR', 'CUSTOMER'));

// Real-Time 2-Way Chat Hub (Admin <-> Customer & Admin <-> Surveyor)
router.get('/contacts', getMessageContacts);
router.get('/', getCustomerMessages);
router.post('/', sendCustomerMessage);

// Legacy Menu 7 Endpoints for Admin CRM compatibility
router.get('/threads', getMessageThreads);
router.get('/metrics', getMessagesMetrics);
router.get('/threads/:conversationId', getThreadMessages);
router.patch('/read/:conversationId', markThreadRead);

export default router;

