// Role-to-menu navigation configuration for NJS Property Group
// Roles: Admin (11), Admin/Staff (8), Surveyor (6), Customer (14), Partner (4)

const adminNavConfig = {
  defaultPath: '/admin/dashboard',
  label: 'Admin',
  items: [
    { id: 'dashboard', name: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard', badge: null },
    { id: 'users-roles', name: 'Users & Roles', path: '/admin/users-and-roles', icon: 'Users', badge: null },
    { id: 'companies', name: 'Companies', path: '/admin/companies', icon: 'Building2', badge: null },
    { id: 'partner-portal', name: 'Partner Portal', path: '/admin/partner-portal', icon: 'Handshake', badge: 'Point 29' },
    { id: 'surveyors', name: 'Surveyors', path: '/admin/surveyors', icon: 'UserCheck', badge: null },
    { id: 'crm-leads', name: 'CRM & Leads', path: '/admin/crm-and-leads', icon: 'Target', badge: '14' },
    { id: 'survey-jobs', name: 'Survey Jobs', path: '/admin/survey-jobs', icon: 'ClipboardCheck', badge: '84' },
    { id: 'quotations-payments', name: 'Quotations & Payments', path: '/admin/quotations-and-payments', icon: 'CreditCard', badge: null },
    { id: 'terms-documents', name: 'Terms & Documents', path: '/admin/terms-and-documents', icon: 'FileSignature', badge: null },
    { id: 'reports-analytics', name: 'Reports & Analytics', path: '/admin/reports-and-analytics', icon: 'BarChart3', badge: null },
    { id: 'settings', name: 'Settings', path: '/admin/settings', icon: 'Settings', badge: null },
  ],
};

export const ROLE_NAVIGATION = {
  super_admin: adminNavConfig,
  admin: adminNavConfig,
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
      { id: 'my-dashboard', name: 'Dashboard', path: '/customer/my-dashboard', icon: 'LayoutDashboard', badge: null },
      { id: 'quotations', name: 'My Quotations', path: '/customer/quotations', icon: 'Receipt', badge: 'New (£770)' },
      { id: 'my-bookings', name: 'My Bookings', path: '/customer/my-bookings', icon: 'CalendarCheck', badge: '1 Confirmed' },
      { id: 'track-survey', name: 'Track My Survey', path: '/customer/track-my-survey', icon: 'Compass', badge: 'Live (7/10)' },
      { id: 'appointment-details', name: 'Appointment Details', path: '/customer/appointment-details', icon: 'CalendarDays', badge: null },
      { id: 'assigned-surveyor', name: 'Assigned Surveyor', path: '/customer/assigned-surveyor', icon: 'UserCheck', badge: 'MRICS' },
      { id: 'terms-to-sign', name: 'Terms to Sign', path: '/customer/terms-to-sign', icon: 'PenTool', badge: 'Signed' },
      { id: 'invoices-payments', name: 'Invoices & Payments', path: '/customer/invoices-and-payments', icon: 'CreditCard', badge: 'Paid' },
      { id: 'reports', name: 'My Reports', path: '/customer/reports', icon: 'FileSpreadsheet', badge: '1 Finalized' },
      { id: 'messages', name: 'Messages', path: '/customer/messages', icon: 'MessageSquare', badge: '1 New' },
      { id: 'leave-review', name: 'Leave a Review', path: '/customer/leave-review', icon: 'Star', badge: 'Trustpilot' },
      { id: 'support', name: 'Support', path: '/customer/support', icon: 'HelpCircle', badge: null },
      { id: 'my-details', name: 'My Details', path: '/customer/my-details', icon: 'User', badge: null },
      { id: 'previous-surveys', name: 'Previous Surveys', path: '/customer/previous-surveys', icon: 'History', badge: null },
    ],
  },
  partner: {
    defaultPath: '/partners',
    label: 'Estate Agent / Partner',
    items: [
      { id: 'partner-portal', name: 'Referral & Commission Ledger', path: '/partners', icon: 'Handshake', badge: 'Active' },
      { id: 'submit-referral', name: 'Submit Survey Referral', path: '/partners?action=submit', icon: 'Send', badge: '1-Click' },
      { id: 'property-intel', name: 'Property Intelligence (EPC & Land Reg)', path: '/partners?tab=intel', icon: 'Search', badge: 'Point 26' },
      { id: 'specimen-report', name: 'Buyer Specimen Report', path: '/partners?action=specimen', icon: 'FileDown', badge: 'PDF' },
    ],
  },
};
