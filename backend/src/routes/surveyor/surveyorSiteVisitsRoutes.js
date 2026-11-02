import { Router } from 'express';
import {
  getSiteVisits,
  checkInSiteVisit,
  completeSiteVisit,
} from '../../controllers/surveyor/surveyorSiteVisitsController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('SURVEYOR'));

// Surveyor Menu 4: Site Visits
router.get('/', getSiteVisits);
router.post('/:id/check-in', checkInSiteVisit);
router.post('/:id/complete', completeSiteVisit);

export default router;
