import { Router } from 'express';
import {
  getMessageThreads,
  getMessagesMetrics,
  getThreadMessages,
  sendAdminMessage,
  markThreadRead,
} from '../controllers/messagesController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 7: Messages Inbox Endpoints
router.get('/threads', getMessageThreads);
router.get('/metrics', getMessagesMetrics);
router.get('/threads/:conversationId', getThreadMessages);
router.post('/', sendAdminMessage);
router.patch('/read/:conversationId', markThreadRead);

export default router;
