import { Router } from 'express';
import { getQuotes, createQuote, acceptQuote } from '../controllers/quoteController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', getQuotes);
router.post('/', authorizeRoles('ADMIN'), createQuote);
router.patch('/:id/accept', acceptQuote);

export default router;

