import { Router } from 'express';
import { getLeads, createLead, addCallLog, addComplaint } from '../controllers/leadController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', authorizeRoles('ADMIN'), getLeads);
router.post('/', authorizeRoles('ADMIN'), createLead);
router.post('/call-log', authorizeRoles('ADMIN'), addCallLog);
router.post('/complaint', authorizeRoles('ADMIN'), addComplaint);

export default router;

