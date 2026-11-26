import { Router } from 'express';
import {
  getSurveyorCalendar,
  getSurveyorFeedToken,
  getSurveyorIcalFeed,
  downloadJobIcs,
} from '../../controllers/surveyor/surveyorCalendarController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

// ========================================================
// PUBLIC / SUBSCRIPTION CALENDAR FEED (RFC 5545 iCalendar)
// Apple Calendar (iPhone/Mac), Google Calendar, and Outlook fetch this with per-surveyor secret token.
// ========================================================
router.get('/feed.ics', getSurveyorIcalFeed);

// ========================================================
// AUTHENTICATED SURVEYOR CALENDAR ROUTES
// ========================================================
router.use(verifyJWT);
router.use(authorizeRoles('SURVEYOR', 'ADMIN', 'SUPER_ADMIN'));

// Surveyor Menu 2: My Calendar JSON & Feed Token
router.get('/', getSurveyorCalendar);
router.get('/feed-token', getSurveyorFeedToken);
router.get('/job/:id/ics', downloadJobIcs);

// Authenticated ICS Export
router.get('/export.ics', getSurveyorIcalFeed);

export default router;

