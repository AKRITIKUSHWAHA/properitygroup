import { Router } from 'express';
import surveyorDashboardRoutes from './surveyorDashboardRoutes.js';
import surveyorCalendarRoutes from './surveyorCalendarRoutes.js';
import surveyorJobsRoutes from './surveyorJobsRoutes.js';
import surveyorSiteVisitsRoutes from './surveyorSiteVisitsRoutes.js';
import surveyorUploadReportsRoutes from './surveyorUploadReportsRoutes.js';
import surveyorAvailabilityRoutes from './surveyorAvailabilityRoutes.js';

const router = Router();

// 1. Dashboard
router.use('/dashboard', surveyorDashboardRoutes);

// 2. My Calendar
router.use('/my-calendar', surveyorCalendarRoutes);

// 3. My Jobs
router.use('/my-jobs', surveyorJobsRoutes);

// 4. Site Visits
router.use('/site-visits', surveyorSiteVisitsRoutes);

// 5. Upload Reports
router.use('/upload-reports', surveyorUploadReportsRoutes);

// 6. My Availability
router.use('/my-availability', surveyorAvailabilityRoutes);

export default router;
