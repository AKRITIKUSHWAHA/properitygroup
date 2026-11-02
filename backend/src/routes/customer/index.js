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

const router = Router();

// 1. Dashboard
router.use('/my-dashboard', customerDashboardRoutes);

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

// 10. Messages
router.use('/messages', customerMessagesRoutes);

// 11. Leave a Review
router.use('/leave-review', customerReviewRoutes);

// 12. Support
router.use('/support', customerSupportRoutes);

// 13. My Details
router.use('/my-details', customerDetailsRoutes);

// 14. Previous Surveys
router.use('/previous-surveys', customerPreviousSurveysRoutes);

export default router;

