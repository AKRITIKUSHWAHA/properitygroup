import { Router } from 'express';
import {
  getSurveyorCalendar,
  getSurveyorIcalFeed,
  downloadJobIcs,
} from '../../controllers/surveyor/surveyorCalendarController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

// ========================================================
// PUBLIC / SUBSCRIPTION CALENDAR FEED (RFC 5545 iCalendar)
// Apple Calendar (iPhone/Mac), Google Calendar, and Outlook fetch this without Bearer headers.
// Token query parameter: ?surveyorId=22&token=njs-cal-srv-22
// ========================================================
router.get('/feed.ics', getSurveyorIcalFeed);
router.get('/job/:id/ics', downloadJobIcs);

// ========================================================
// AUTHENTICATED SURVEYOR CALENDAR ROUTES
// ========================================================
router.use(verifyJWT);
router.use(authorizeRoles('SURVEYOR', 'ADMIN', 'SUPER_ADMIN'));

// Surveyor Menu 2: My Calendar JSON
router.get('/', getSurveyorCalendar);

// Authenticated ICS Export
router.get('/export.ics', getSurveyorIcalFeed);

export default router;

