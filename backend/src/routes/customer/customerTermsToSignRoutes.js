import { Router } from 'express';
import {
  getTermsToSign,
  executeDigitalSignature,
} from '../../controllers/customer/customerTermsToSignController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 7: Terms to Sign
router.get('/', getTermsToSign);
router.post('/:id/sign', executeDigitalSignature);

export default router;
