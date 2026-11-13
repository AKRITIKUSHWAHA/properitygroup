import { Router } from 'express';
import customerDashboardRoutes from './customerDashboardRoutes.js';
import customerQuotationsRoutes from './customerQuotationsRoutes.js';
import customerBookingsRoutes from './customerBookingsRoutes.js';
import customerTrackSurveyRoutes from './customerTrackSurveyRoutes.js';
import customerAppointmentDetailsRoutes from './customerAppointmentDetailsRoutes.js';
import customerAssignedSurveyorRoutes from './customerAssignedSurveyorRoutes.js';
import customerTermsToSignRoutes from './customerTermsToSignRoutes.js';
import customerInvoicesAndPaymentsRoutes from './customerInvoicesAndPaymentsRoutes.js';
import customerReportsRoutes from './customerReportsRoutes.js';
import customerMessagesRoutes from './customerMessagesRoutes.js';
import customerReviewRoutes from './customerReviewRoutes.js';
import customerSupportRoutes from './customerSupportRoutes.js';
import customerDetailsRoutes from './customerDetailsRoutes.js';
import customerPreviousSurveysRoutes from './customerPreviousSurveysRoutes.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();

// Gate all customer portal endpoints behind ENABLE_CLIENT_PORTAL_LOGIN toggle
router.use((req, res, next) => {
  if (!env.ENABLE_CLIENT_PORTAL_LOGIN) {
    return next(ApiError.forbidden('Client portal endpoints are currently deactivated.'));
  }
  next();
});

// 1. Dashboard (both /my-dashboard and /dashboard supported)
router.use('/my-dashboard', customerDashboardRoutes);
router.use('/dashboard', customerDashboardRoutes);

// 2. My Quotations
router.use('/quotations', customerQuotationsRoutes);

// 3. My Bookings
router.use('/my-bookings', customerBookingsRoutes);

// 4. Track My Survey
router.use('/track-survey', customerTrackSurveyRoutes);

// 5. Appointment Details
router.use('/appointment-details', customerAppointmentDetailsRoutes);

// 6. Assigned Surveyor
router.use('/assigned-surveyor', customerAssignedSurveyorRoutes);

// 7. Terms to Sign
router.use('/terms-to-sign', customerTermsToSignRoutes);

// 8. Invoices & Payments
router.use('/invoices-and-payments', customerInvoicesAndPaymentsRoutes);

// 9. My Reports
router.use('/reports', customerReportsRoutes);
router.use('/survey-reports', customerReportsRoutes);

// 10. Messages
router.use('/messages', customerMessagesRoutes);

// 11. Leave a Review
router.use('/leave-review', customerReviewRoutes);
router.use('/feedback-review', customerReviewRoutes);
router.use('/reviews', customerReviewRoutes);

// 12. Support
router.use('/support', customerSupportRoutes);
router.use('/support-tickets', customerSupportRoutes);

// 13. My Details
router.use('/my-details', customerDetailsRoutes);

// 14. Previous Surveys
router.use('/previous-surveys', customerPreviousSurveysRoutes);

export default router;
