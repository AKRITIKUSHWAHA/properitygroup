import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

// Layouts
import { AppLayout } from './layouts/AppLayout';
import { PublicLayout } from './components/layout/PublicLayout';

// Public Marketing Website Pages
import { HomePage } from './pages/public/HomePage';
import { HomebuyerSurveyPage } from './pages/public/HomebuyerSurveyPage';
import { BuildingSurveyPage } from './pages/public/BuildingSurveyPage';
import { SnaggingReportPage } from './pages/public/SnaggingReportPage';
import { ValuationReportPage } from './pages/public/ValuationReportPage';
import { DampSurveyPage } from './pages/public/DampSurveyPage';
import { ExpertWitnessPage } from './pages/public/ExpertWitnessPage';
import { ContactPage } from './pages/public/ContactPage';
import { RedirectsPage } from './pages/public/RedirectsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Error Pages
import { Forbidden403Page } from './pages/error/Forbidden403Page';
import { NotFound404Page } from './pages/error/NotFound404Page';

// Common Pages
import { ProfilePage } from './pages/profile/ProfilePage';
import { ChangePasswordPage } from './pages/profile/ChangePasswordPage';

// Super Admin Pages (10)
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminSurveyorsPage } from './pages/admin/AdminSurveyorsPage';
import { AdminLeadsPage } from './pages/admin/AdminLeadsPage';
import { AdminJobsPage } from './pages/admin/AdminJobsPage';
import { JobDetailsPage } from './pages/jobs/JobDetailsPage';
import { AdminQuotesPage } from './pages/admin/AdminQuotesPage';
import { AdminTermsPage } from './pages/admin/AdminTermsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Admin / Staff Pages (8)
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { StaffCalendarPage } from './pages/staff/StaffCalendarPage';
import {
  StaffCompaniesPage,
  StaffLeadsPage,
  StaffQuotesPage,
  StaffTermsPage,
  StaffReportsPage,
} from './pages/staff/StaffModules';

// Surveyor Pages (6)
import { SurveyorDashboardPage } from './pages/surveyor/SurveyorDashboardPage';
import {
  SurveyorCalendarPage,
  SurveyorJobsPage,
  SurveyorSiteVisitsPage,
  SurveyorUploadReportsPage,
  SurveyorAvailabilityPage,
} from './pages/surveyor/SurveyorModules';

// Customer Pages (8)
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import {
  CustomerBookingsPage,
  CustomerQuotationsPage,
  CustomerTermsPage,
  CustomerInvoicesPage,
  CustomerReportsPage,
  CustomerDetailsPage,
  CustomerSupportPage,
} from './pages/customer/CustomerModules';

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

      {/* 3. Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/backoffice" element={<LoginPage initialMode="backoffice" />} />
      <Route path="/admin-login" element={<Navigate to="/backoffice" replace />} />
      <Route path="/surveyor-login" element={<Navigate to="/backoffice" replace />} />
      <Route path="/staff-login" element={<Navigate to="/backoffice" replace />} />
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

        {/* Customer Routes (8 menus) */}
        <Route element={<ProtectedRoute allowedRoles={['customer', 'super_admin']} />}>
          <Route path="/customer/my-dashboard" element={<CustomerDashboardPage />} />
          <Route path="/customer/my-bookings" element={<CustomerBookingsPage />} />
          <Route path="/customer/quotations" element={<CustomerQuotationsPage />} />
          <Route path="/customer/terms-to-sign" element={<CustomerTermsPage />} />
          <Route path="/customer/invoices-and-payments" element={<CustomerInvoicesPage />} />
          <Route path="/customer/reports" element={<CustomerReportsPage />} />
          <Route path="/customer/my-details" element={<CustomerDetailsPage />} />
          <Route path="/customer/support" element={<CustomerSupportPage />} />
        </Route>
      </Route>

      {/* Fallback Catch-All */}
      <Route element={<PublicLayout />}><Route path="*" element={<NotFoundPage />} /></Route>
    </Routes>
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
