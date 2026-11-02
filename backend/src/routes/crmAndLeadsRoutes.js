import { Router } from 'express';
import {
  getCrmAndLeads,
  getCrmMetrics,
  createLead,
  updateLeadStatus,
  addCallLog,
  addComplaint,
  resolveComplaint,
} from '../controllers/crmAndLeadsController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 5: CRM & Leads Endpoints
router.get('/', getCrmAndLeads);
router.get('/metrics', getCrmMetrics);
router.post('/', createLead);
router.patch('/:id/status', updateLeadStatus);
router.post('/call-logs', addCallLog);
router.post('/complaints', addComplaint);
router.patch('/complaints/:id/resolve', resolveComplaint);

export default router;
