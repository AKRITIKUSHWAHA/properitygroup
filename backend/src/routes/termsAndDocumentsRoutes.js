import { Router } from 'express';
import {
  getTermsAndDocuments,
  getTermsMetrics,
  issueTermsAgreement,
  getAuditCertificate,
} from '../controllers/termsAndDocumentsController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 9: Terms & Documents Endpoints
router.get('/', getTermsAndDocuments);
router.get('/metrics', getTermsMetrics);
router.post('/', issueTermsAgreement);
router.get('/:id/audit-certificate', getAuditCertificate);

export default router;
