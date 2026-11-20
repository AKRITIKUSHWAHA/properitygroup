import { Router } from 'express';
import { getConversations, sendMessage, markAsRead } from '../controllers/messageController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/conversations', getConversations);
router.post('/', sendMessage);
router.patch('/read/:conversationId', markAsRead);

export default router;

