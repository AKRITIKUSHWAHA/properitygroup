import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

// Layouts
import { AppLayout } from './layouts/AppLayout';
import { PublicLayout } from './components/layout/PublicLayout';

// Core Landing Page - Statically loaded for instant First Contentful Paint
import { HomePage } from './pages/public/HomePage';

// Lazy loader helper for named exports
const lazyNamed = (fn, name) => lazy(() => fn().then(m => ({ default: m[name] })));

// Public Marketing Subpages (Lazy loaded on demand)
const HomebuyerSurveyPage = lazyNamed(() => import('./pages/public/HomebuyerSurveyPage'), 'HomebuyerSurveyPage');
const BuildingSurveyPage = lazyNamed(() => import('./pages/public/BuildingSurveyPage'), 'BuildingSurveyPage');
const SnaggingReportPage = lazyNamed(() => import('./pages/public/SnaggingReportPage'), 'SnaggingReportPage');
const ValuationReportPage = lazyNamed(() => import('./pages/public/ValuationReportPage'), 'ValuationReportPage');
const DampSurveyPage = lazyNamed(() => import('./pages/public/DampSurveyPage'), 'DampSurveyPage');
const ExpertWitnessPage = lazyNamed(() => import('./pages/public/ExpertWitnessPage'), 'ExpertWitnessPage');
const ContactPage = lazyNamed(() => import('./pages/public/ContactPage'), 'ContactPage');
const RedirectsPage = lazyNamed(() => import('./pages/public/RedirectsPage'), 'RedirectsPage');
const NotFoundPage = lazyNamed(() => import('./pages/public/NotFoundPage'), 'NotFoundPage');

// Auth Pages (Lazy loaded)
const LoginPage = lazyNamed(() => import('./pages/auth/LoginPage'), 'LoginPage');
const ForgotPasswordPage = lazyNamed(() => import('./pages/auth/ForgotPasswordPage'), 'ForgotPasswordPage');
const ResetPasswordPage = lazyNamed(() => import('./pages/auth/ResetPasswordPage'), 'ResetPasswordPage');
const RegisterPage = lazyNamed(() => import('./pages/auth/RegisterPage'), 'RegisterPage');

// Error Pages (Lazy loaded)
const Forbidden403Page = lazyNamed(() => import('./pages/error/Forbidden403Page'), 'Forbidden403Page');
const NotFound404Page = lazyNamed(() => import('./pages/error/NotFound404Page'), 'NotFound404Page');

// Common Pages (Lazy loaded)
const ProfilePage = lazyNamed(() => import('./pages/profile/ProfilePage'), 'ProfilePage');
const ChangePasswordPage = lazyNamed(() => import('./pages/profile/ChangePasswordPage'), 'ChangePasswordPage');

// Super Admin Pages (Lazy loaded)
const AdminDashboardPage = lazyNamed(() => import('./pages/admin/AdminDashboardPage'), 'AdminDashboardPage');
const AdminUsersPage = lazyNamed(() => import('./pages/admin/AdminUsersPage'), 'AdminUsersPage');
const AdminCompaniesPage = lazyNamed(() => import('./pages/admin/AdminCompaniesPage'), 'AdminCompaniesPage');
const AdminSurveyorsPage = lazyNamed(() => import('./pages/admin/AdminSurveyorsPage'), 'AdminSurveyorsPage');
const AdminLeadsPage = lazyNamed(() => import('./pages/admin/AdminLeadsPage'), 'AdminLeadsPage');
const AdminJobsPage = lazyNamed(() => import('./pages/admin/AdminJobsPage'), 'AdminJobsPage');
const JobDetailsPage = lazyNamed(() => import('./pages/jobs/JobDetailsPage'), 'JobDetailsPage');
const AdminQuotesPage = lazyNamed(() => import('./pages/admin/AdminQuotesPage'), 'AdminQuotesPage');
const AdminTermsPage = lazyNamed(() => import('./pages/admin/AdminTermsPage'), 'AdminTermsPage');
const AdminReportsPage = lazyNamed(() => import('./pages/admin/AdminReportsPage'), 'AdminReportsPage');
const AdminSettingsPage = lazyNamed(() => import('./pages/admin/AdminSettingsPage'), 'AdminSettingsPage');

// Admin / Staff Pages (Lazy loaded)
const StaffDashboardPage = lazyNamed(() => import('./pages/staff/StaffDashboardPage'), 'StaffDashboardPage');
const StaffCalendarPage = lazyNamed(() => import('./pages/staff/StaffCalendarPage'), 'StaffCalendarPage');
const StaffCompaniesPage = lazyNamed(() => import('./pages/staff/StaffModules'), 'StaffCompaniesPage');
const StaffLeadsPage = lazyNamed(() => import('./pages/staff/StaffModules'), 'StaffLeadsPage');
const StaffQuotesPage = lazyNamed(() => import('./pages/staff/StaffModules'), 'StaffQuotesPage');
const StaffTermsPage = lazyNamed(() => import('./pages/staff/StaffModules'), 'StaffTermsPage');
const StaffReportsPage = lazyNamed(() => import('./pages/staff/StaffModules'), 'StaffReportsPage');

// Surveyor Pages (Lazy loaded)
const SurveyorDashboardPage = lazyNamed(() => import('./pages/surveyor/SurveyorDashboardPage'), 'SurveyorDashboardPage');
const SurveyorCalendarPage = lazyNamed(() => import('./pages/surveyor/SurveyorModules'), 'SurveyorCalendarPage');
const SurveyorJobsPage = lazyNamed(() => import('./pages/surveyor/SurveyorModules'), 'SurveyorJobsPage');
const SurveyorSiteVisitsPage = lazyNamed(() => import('./pages/surveyor/SurveyorModules'), 'SurveyorSiteVisitsPage');
const SurveyorUploadReportsPage = lazyNamed(() => import('./pages/surveyor/SurveyorModules'), 'SurveyorUploadReportsPage');
const SurveyorAvailabilityPage = lazyNamed(() => import('./pages/surveyor/SurveyorModules'), 'SurveyorAvailabilityPage');

// Customer Pages (Lazy loaded)
const CustomerDashboardPage = lazyNamed(() => import('./pages/customer/CustomerDashboardPage'), 'CustomerDashboardPage');
const CustomerBookingsPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerBookingsPage');
const CustomerQuotationsPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerQuotationsPage');
const CustomerTermsPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerTermsPage');
const CustomerInvoicesPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerInvoicesPage');
const CustomerReportsPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerReportsPage');
const CustomerDetailsPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerDetailsPage');
const CustomerSupportPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerSupportPage');
const CustomerTrackSurveyPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerTrackSurveyPage');
const CustomerAppointmentDetailsPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerAppointmentDetailsPage');
const CustomerAssignedSurveyorPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerAssignedSurveyorPage');
const CustomerMessagesPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerMessagesPage');
const CustomerReviewPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerReviewPage');
const CustomerPreviousSurveysPage = lazyNamed(() => import('./pages/customer/CustomerModules'), 'CustomerPreviousSurveysPage');

// Minimal Page Transition Loader
const PageLoader = () => (
  <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{
      width: '26px',
      height: '26px',
      border: '2.5px solid rgba(255, 255, 255, 0.15)',
      borderTopColor: '#FFFFFF',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
  </div>
);

// Helper component for logged in user redirect to their portal role dashboard
const PortalRedirect = () => {
  const { user, isAuthenticated, isLoading, getRoleDashboard } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated && user) {
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }
  return <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 1. Public Marketing Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<HomePage />} />
          <Route path="/services/homebuyer-survey-level-2" element={<HomebuyerSurveyPage />} />
          <Route path="/services/building-survey-level-3" element={<BuildingSurveyPage />} />
          <Route path="/services/snagging-report" element={<SnaggingReportPage />} />
          <Route path="/services/valuation-report" element={<ValuationReportPage />} />
          <Route path="/services/damp-survey" element={<DampSurveyPage />} />
          <Route path="/expert-witness" element={<ExpertWitnessPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/redirects" element={<RedirectsPage />} />
          <Route path="/REDIRECTS.md" element={<RedirectsPage />} />
          <Route path="/redirects.md" element={<RedirectsPage />} />
          {/* Legacy Retired Services Redirects (Master Spec Part 4 & 9) */}
          <Route path="/construction" element={<Navigate to="/services/building-survey-level-3" replace />} />
          <Route path="/construction/*" element={<Navigate to="/services/building-survey-level-3" replace />} />
          <Route path="/real-estate" element={<Navigate to="/services/valuation-report" replace />} />
          <Route path="/real-estate/*" element={<Navigate to="/services/valuation-report" replace />} />
          {/* Public 404 with Header & Footer */}
          <Route path="/404" element={<NotFoundPage />} />
        </Route>

        {/* 2. Portal Shortcut for Dashboard Navigation */}
        <Route path="/portal" element={<PortalRedirect />} />
        <Route path="/superadmin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/surveyor" element={<Navigate to="/surveyor/dashboard" replace />} />
        <Route path="/customer" element={<Navigate to="/customer/my-dashboard" replace />} />

        {/* 3. Public Auth Routes - Dedicated role-based entrances */}
        <Route path="/login" element={<LoginPage roleProp="customer" />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/admin/login" element={<LoginPage roleProp="super_admin" />} />
        <Route path="/surveyor/login" element={<LoginPage roleProp="surveyor" />} />
        <Route path="/customer/login" element={<LoginPage roleProp="customer" />} />
        <Route path="/backoffice" element={<Navigate to="/login/admin" replace />} />
        <Route path="/admin-login" element={<Navigate to="/login/admin" replace />} />
        <Route path="/surveyor-login" element={<Navigate to="/login/surveyor" replace />} />
        <Route path="/staff-login" element={<Navigate to="/login/admin" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 4. Error Routes */}
        <Route path="/403" element={<Forbidden403Page />} />
        <Route path="/404" element={<NotFound404Page />} />

        {/* 5. Authenticated Application Shell */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          {/* Common Authenticated Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          {/* Admin Routes (10 primary menus) under /admin/* */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

            {/* CRM & Leads + Friendly Aliases */}
            <Route path="/admin/leads" element={<AdminLeadsPage />} />
            <Route path="/admin/lead" element={<AdminLeadsPage />} />
            <Route path="/admin/crm-and-leads" element={<AdminLeadsPage />} />

            {/* Survey Jobs + Friendly Aliases */}
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/job" element={<AdminJobsPage />} />
            <Route path="/admin/survey-jobs" element={<AdminJobsPage />} />
            <Route path="/admin/jobs/:jobId" element={<JobDetailsPage />} />
            <Route path="/admin/job/:jobId" element={<JobDetailsPage />} />
            <Route path="/admin/survey-jobs/:jobId" element={<JobDetailsPage />} />

            {/* Booking Calendar + Friendly Aliases */}
            <Route path="/admin/calendar" element={<StaffCalendarPage />} />
            <Route path="/admin/booking-calendar" element={<StaffCalendarPage />} />

            {/* Quotations & Payments + Friendly Aliases */}
            <Route path="/admin/quotes" element={<AdminQuotesPage />} />
            <Route path="/admin/quote" element={<AdminQuotesPage />} />
            <Route path="/admin/quotations-and-payments" element={<AdminQuotesPage />} />

            {/* Terms & Documents + Friendly Aliases */}
            <Route path="/admin/terms" element={<AdminTermsPage />} />
            <Route path="/admin/term" element={<AdminTermsPage />} />
            <Route path="/admin/terms-and-documents" element={<AdminTermsPage />} />

            {/* Reports & Analytics + Friendly Aliases */}
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/report" element={<AdminReportsPage />} />
            <Route path="/admin/reports-and-analytics" element={<AdminReportsPage />} />

            {/* Users & Roles + Friendly Aliases */}
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/user" element={<AdminUsersPage />} />
            <Route path="/admin/users-and-roles" element={<AdminUsersPage />} />

            {/* Companies & Surveyors & Settings */}
            <Route path="/admin/companies" element={<AdminCompaniesPage />} />
            <Route path="/admin/company" element={<AdminCompaniesPage />} />
            <Route path="/admin/surveyors" element={<AdminSurveyorsPage />} />
            <Route path="/admin/surveyor" element={<AdminSurveyorsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/setting" element={<AdminSettingsPage />} />

            {/* Seamless /superadmin/* backwards-compatibility redirects */}
            <Route path="/superadmin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/superadmin/leads" element={<Navigate to="/admin/leads" replace />} />
            <Route path="/superadmin/lead" element={<Navigate to="/admin/leads" replace />} />
            <Route path="/superadmin/crm-and-leads" element={<Navigate to="/admin/leads" replace />} />
            <Route path="/superadmin/jobs" element={<Navigate to="/admin/jobs" replace />} />
            <Route path="/superadmin/job" element={<Navigate to="/admin/jobs" replace />} />
            <Route path="/superadmin/survey-jobs" element={<Navigate to="/admin/jobs" replace />} />
            <Route path="/superadmin/jobs/:jobId" element={<JobDetailsPage />} />
            <Route path="/superadmin/job/:jobId" element={<JobDetailsPage />} />
            <Route path="/superadmin/survey-jobs/:jobId" element={<JobDetailsPage />} />
            <Route path="/superadmin/calendar" element={<Navigate to="/admin/calendar" replace />} />
            <Route path="/superadmin/booking-calendar" element={<Navigate to="/admin/calendar" replace />} />
            <Route path="/superadmin/quotes" element={<Navigate to="/admin/quotes" replace />} />
            <Route path="/superadmin/quote" element={<Navigate to="/admin/quotes" replace />} />
            <Route path="/superadmin/quotations-and-payments" element={<Navigate to="/admin/quotes" replace />} />
            <Route path="/superadmin/terms" element={<Navigate to="/admin/terms" replace />} />
            <Route path="/superadmin/term" element={<Navigate to="/admin/terms" replace />} />
            <Route path="/superadmin/terms-and-documents" element={<Navigate to="/admin/terms" replace />} />
            <Route path="/superadmin/reports" element={<Navigate to="/admin/reports" replace />} />
            <Route path="/superadmin/report" element={<Navigate to="/admin/reports" replace />} />
            <Route path="/superadmin/reports-and-analytics" element={<Navigate to="/admin/reports" replace />} />
            <Route path="/superadmin/users" element={<Navigate to="/admin/users" replace />} />
            <Route path="/superadmin/user" element={<Navigate to="/admin/users" replace />} />
            <Route path="/superadmin/users-and-roles" element={<Navigate to="/admin/users" replace />} />
            <Route path="/superadmin/companies" element={<Navigate to="/admin/companies" replace />} />
            <Route path="/superadmin/surveyors" element={<Navigate to="/admin/surveyors" replace />} />
            <Route path="/superadmin/settings" element={<Navigate to="/admin/settings" replace />} />
          </Route>

          {/* Admin / Staff Routes (8 menus) */}
          <Route element={<ProtectedRoute allowedRoles={['admin_staff', 'super_admin']} />}>
            <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
            <Route path="/staff/companies" element={<StaffCompaniesPage />} />
            <Route path="/staff/crm-and-leads" element={<StaffLeadsPage />} />
            <Route path="/staff/booking-calendar" element={<StaffCalendarPage />} />
            <Route path="/staff/survey-jobs" element={<AdminJobsPage />} />
            <Route path="/staff/survey-jobs/:jobId" element={<JobDetailsPage />} />
            <Route path="/staff/quotations-and-payments" element={<StaffQuotesPage />} />
            <Route path="/staff/terms-and-documents" element={<StaffTermsPage />} />
            <Route path="/staff/reports" element={<StaffReportsPage />} />
          </Route>

          {/* Direct Job Route accessible by authenticated users */}
          <Route path="/jobs/:jobId" element={<JobDetailsPage />} />

          {/* Surveyor Routes (6 menus) */}
          <Route element={<ProtectedRoute allowedRoles={['surveyor', 'super_admin']} />}>
            <Route path="/surveyor/dashboard" element={<SurveyorDashboardPage />} />
            <Route path="/surveyor/my-calendar" element={<SurveyorCalendarPage />} />
            <Route path="/surveyor/my-jobs" element={<SurveyorJobsPage />} />
            <Route path="/surveyor/site-visits" element={<SurveyorSiteVisitsPage />} />
            <Route path="/surveyor/upload-reports" element={<SurveyorUploadReportsPage />} />
            <Route path="/surveyor/my-availability" element={<SurveyorAvailabilityPage />} />
          </Route>

          {/* Customer Routes (14 menus per Client Requirement Point 12) */}
          <Route element={<ProtectedRoute allowedRoles={['customer', 'super_admin']} />}>
            <Route path="/customer/my-dashboard" element={<CustomerDashboardPage />} />
            <Route path="/customer/quotations" element={<CustomerQuotationsPage />} />
            <Route path="/customer/my-bookings" element={<CustomerBookingsPage />} />
            <Route path="/customer/track-my-survey" element={<CustomerTrackSurveyPage />} />
            <Route path="/customer/appointment-details" element={<CustomerAppointmentDetailsPage />} />
            <Route path="/customer/assigned-surveyor" element={<CustomerAssignedSurveyorPage />} />
            <Route path="/customer/terms-to-sign" element={<CustomerTermsPage />} />
            <Route path="/customer/invoices-and-payments" element={<CustomerInvoicesPage />} />
            <Route path="/customer/reports" element={<CustomerReportsPage />} />
            <Route path="/customer/messages" element={<CustomerMessagesPage />} />
            <Route path="/customer/leave-review" element={<CustomerReviewPage />} />
            <Route path="/customer/support" element={<CustomerSupportPage />} />
            <Route path="/customer/my-details" element={<CustomerDetailsPage />} />
            <Route path="/customer/previous-surveys" element={<CustomerPreviousSurveysPage />} />
          </Route>
        </Route>

        {/* Fallback Catch-All */}
        <Route element={<PublicLayout />}><Route path="*" element={<NotFoundPage />} /></Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
