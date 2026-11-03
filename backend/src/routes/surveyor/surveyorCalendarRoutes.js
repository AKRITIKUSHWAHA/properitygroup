import { Router } from 'express';
import { getSurveyorCalendar } from '../../controllers/surveyor/surveyorCalendarController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('SURVEYOR'));

// Surveyor Menu 2: My Calendar
router.get('/', getSurveyorCalendar);

export default router;

