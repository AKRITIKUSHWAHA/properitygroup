import { Router } from 'express';
import {
  getCrmAndLeads,
  getCrmMetrics,
  createLead,
  updateLeadStatus,
  deleteLead,
  addCallLog,
  addComplaint,
  resolveComplaint,
  ingestLsdLead,
} from '../controllers/crmAndLeadsController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';
import { webhookRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Public / External Webhook for Local Surveyors Direct (LSD) Ingestion
router.post('/lsd', webhookRateLimiter, ingestLsdLead);

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 5: CRM & Leads Endpoints
router.get('/', getCrmAndLeads);
router.get('/metrics', getCrmMetrics);
router.post('/', createLead);
router.delete('/:id', deleteLead);
router.patch('/:id/status', updateLeadStatus);
router.post('/call-logs', addCallLog);
router.post('/complaints', addComplaint);
router.patch('/complaints/:id/resolve', resolveComplaint);

export default router;

