import { Router } from 'express';
import { getLeads, createLead, addCallLog, addComplaint } from '../controllers/leadController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', authorizeRoles('ADMIN', 'STAFF'), getLeads);
router.post('/', authorizeRoles('ADMIN', 'STAFF'), createLead);
router.post('/call-log', authorizeRoles('ADMIN', 'STAFF'), addCallLog);
router.post('/complaint', authorizeRoles('ADMIN', 'STAFF'), addComplaint);

export default router;

