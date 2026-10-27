// Role-to-menu navigation configuration for UK Property Surveying Practice
// 4 roles: Super Admin (10), Admin/Staff (8), Surveyor (6), Customer (8)

export const ROLE_NAVIGATION = {
  super_admin: {
    defaultPath: '/superadmin/dashboard',
    label: 'Super Admin',
    items: [
      { id: 'dashboard', name: 'Dashboard', path: '/superadmin/dashboard', icon: 'LayoutDashboard', badge: null },
      { id: 'users-roles', name: 'Users & Roles', path: '/superadmin/users-and-roles', icon: 'Users', badge: null },
      { id: 'companies', name: 'Companies', path: '/superadmin/companies', icon: 'Building2', badge: null },
      { id: 'surveyors', name: 'Surveyors', path: '/superadmin/surveyors', icon: 'UserCheck', badge: null },
      { id: 'crm-leads', name: 'CRM & Leads', path: '/superadmin/crm-and-leads', icon: 'Target', badge: '14' },
      { id: 'survey-jobs', name: 'Survey Jobs', path: '/superadmin/survey-jobs', icon: 'ClipboardCheck', badge: '84' },
      { id: 'quotations-payments', name: 'Quotations & Payments', path: '/superadmin/quotations-and-payments', icon: 'CreditCard', badge: null },
      { id: 'terms-documents', name: 'Terms & Documents', path: '/superadmin/terms-and-documents', icon: 'FileSignature', badge: null },
      { id: 'reports-analytics', name: 'Reports & Analytics', path: '/superadmin/reports-and-analytics', icon: 'BarChart3', badge: null },
      { id: 'settings', name: 'Settings', path: '/superadmin/settings', icon: 'Settings', badge: null },
    ],
  },
  admin_staff: {
    defaultPath: '/staff/dashboard',
    label: 'Admin / Staff',
    items: [
      { id: 'dashboard', name: 'Dashboard', path: '/staff/dashboard', icon: 'LayoutDashboard', badge: null },
      { id: 'companies', name: 'Companies', path: '/staff/companies', icon: 'Building2', badge: null },
      { id: 'crm-leads', name: 'CRM & Leads', path: '/staff/crm-and-leads', icon: 'Target', badge: '14' },
      { id: 'booking-calendar', name: 'Booking Calendar', path: '/staff/booking-calendar', icon: 'CalendarDays', badge: 'Today' },
      { id: 'survey-jobs', name: 'Survey Jobs', path: '/staff/survey-jobs', icon: 'ClipboardCheck', badge: '36' },
      { id: 'quotations-payments', name: 'Quotations & Payments', path: '/staff/quotations-and-payments', icon: 'CreditCard', badge: null },
      { id: 'terms-documents', name: 'Terms & Documents', path: '/staff/terms-and-documents', icon: 'FileSignature', badge: null },
      { id: 'reports', name: 'Reports', path: '/staff/reports', icon: 'FileText', badge: null },
    ],
  },
  surveyor: {
    defaultPath: '/surveyor/dashboard',
    label: 'Surveyor',
    items: [
      { id: 'dashboard', name: 'Dashboard', path: '/surveyor/dashboard', icon: 'LayoutDashboard', badge: null },
      { id: 'my-calendar', name: 'My Calendar', path: '/surveyor/my-calendar', icon: 'Calendar', badge: '3 Today' },
      { id: 'my-jobs', name: 'My Jobs', path: '/surveyor/my-jobs', icon: 'Briefcase', badge: '9 Active' },
      { id: 'site-visits', name: 'Site Visits', path: '/surveyor/site-visits', icon: 'MapPin', badge: null },
      { id: 'upload-reports', name: 'Upload Reports', path: '/surveyor/upload-reports', icon: 'UploadCloud', badge: '2 Pending' },
      { id: 'my-availability', name: 'My Availability', path: '/surveyor/my-availability', icon: 'Clock', badge: null },
    ],
  },
  customer: {
    defaultPath: '/customer/my-dashboard',
    label: 'Customer',
    items: [
      { id: 'my-dashboard', name: 'My Dashboard', path: '/customer/my-dashboard', icon: 'LayoutDashboard', badge: null },
      { id: 'my-bookings', name: 'My Bookings', path: '/customer/my-bookings', icon: 'CalendarCheck', badge: '1 Upcoming' },
      { id: 'quotations', name: 'Quotations', path: '/customer/quotations', icon: 'Receipt', badge: 'New (£650)' },
      { id: 'terms-to-sign', name: 'Terms to Sign', path: '/customer/terms-to-sign', icon: 'PenTool', badge: 'Action Req' },
      { id: 'invoices-payments', name: 'Invoices & Payments', path: '/customer/invoices-and-payments', icon: 'CreditCard', badge: null },
      { id: 'reports', name: 'Reports', path: '/customer/reports', icon: 'FileSpreadsheet', badge: '1 Finalized' },
      { id: 'my-details', name: 'My Details', path: '/customer/my-details', icon: 'User', badge: null },
      { id: 'support', name: 'Support', path: '/customer/support', icon: 'HelpCircle', badge: null },
    ],
  },
};
