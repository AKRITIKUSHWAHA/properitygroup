import { Router } from 'express';
import {
  getMessageThreads,
  getMessagesMetrics,
  getThreadMessages,
  sendAdminMessage,
  markThreadRead,
} from '../controllers/messagesController.js';
import { getMessageContacts } from '../controllers/customer/customerMessagesController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN', 'SUPER_ADMIN'));

// Menu 7: Messages Inbox Endpoints
router.get('/contacts', getMessageContacts);
router.get('/threads', getMessageThreads);
router.get('/metrics', getMessagesMetrics);
router.get('/threads/:conversationId', getThreadMessages);
router.post('/', sendAdminMessage);
router.patch('/read/:conversationId', markThreadRead);

export default router;

