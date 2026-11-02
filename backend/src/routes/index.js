import { Router } from 'express';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import usersAndRolesRoutes from './usersAndRolesRoutes.js';
import companiesRoutes from './companiesRoutes.js';
import surveyorsRoutes from './surveyorsRoutes.js';
import crmAndLeadsRoutes from './crmAndLeadsRoutes.js';
import surveyJobsRoutes from './surveyJobsRoutes.js';
import messagesRoutes from './messagesRoutes.js';
import quotationsAndPaymentsRoutes from './quotationsAndPaymentsRoutes.js';
import termsAndDocumentsRoutes from './termsAndDocumentsRoutes.js';
import reportsAndAnalyticsRoutes from './reportsAndAnalyticsRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = Router();

// Master Health Check & Service Info
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'NJS Property Group API',
    database: 'MySQL (Prisma ORM)',
    menusCovered: [
      '1. Dashboard (/api/v1/dashboard)',
      '2. Users & Roles (/api/v1/users-and-roles)',
      '3. Companies (/api/v1/companies)',
      '4. Surveyors (/api/v1/surveyors)',
      '5. CRM & Leads (/api/v1/crm-and-leads)',
      '6. Survey Jobs (/api/v1/survey-jobs)',
      '7. Messages Inbox (/api/v1/messages)',
      '8. Quotations & Payments (/api/v1/quotations-and-payments)',
      '9. Terms & Documents (/api/v1/terms-and-documents)',
      '10. Reports & Analytics (/api/v1/reports-and-analytics)',
      '11. Settings (/api/v1/settings)',
    ],
  });
});

// Authentication Endpoint
router.use('/auth', authRoutes);

// Superadmin Menu 1: Dashboard
router.use('/dashboard', dashboardRoutes);

// Superadmin Menu 2: Users & Roles
router.use('/users-and-roles', usersAndRolesRoutes);

// Superadmin Menu 3: Companies
router.use('/companies', companiesRoutes);

// Superadmin Menu 4: Surveyors
router.use('/surveyors', surveyorsRoutes);

// Superadmin Menu 5: CRM & Leads
router.use('/crm-and-leads', crmAndLeadsRoutes);

// Superadmin Menu 6: Survey Jobs
router.use('/survey-jobs', surveyJobsRoutes);

// Superadmin Menu 7: Messages Inbox
router.use('/messages', messagesRoutes);

// Superadmin Menu 8: Quotations & Payments
router.use('/quotations-and-payments', quotationsAndPaymentsRoutes);

// Superadmin Menu 9: Terms & Documents
router.use('/terms-and-documents', termsAndDocumentsRoutes);

// Superadmin Menu 10: Reports & Analytics
router.use('/reports-and-analytics', reportsAndAnalyticsRoutes);

// Superadmin Menu 11: Settings
router.use('/settings', settingsRoutes);

export default router;
