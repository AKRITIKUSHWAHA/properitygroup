import { Router } from 'express';
import { getTerms, signTerms } from '../controllers/termController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', getTerms);
router.post('/:id/sign', signTerms);

export default router;

