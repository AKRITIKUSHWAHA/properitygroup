import { api } from './apiClient';

/**
 * Superadmin API Client — All 11 Menus
 */

// Menu 1: Dashboard
export const adminDashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getActionBuckets: () => api.get('/dashboard/action-buckets'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
};

// Menu 2: Users & Roles
export const adminUsersAndRolesApi = {
  getUsers: (params = '') => api.get(`/users-and-roles${params ? `?${params}` : ''}`),
  getMetrics: () => api.get('/users-and-roles/metrics'),
  createUser: (userData) => api.post('/users-and-roles', userData),
  updateUser: (id, data) => api.patch(`/users-and-roles/${id}`, data),
  deleteUser: (id) => api.delete(`/users-and-roles/${id}`),
};

// Menu 3: Companies
export const adminCompaniesApi = {
  getCompanies: (params = '') => api.get(`/companies${params ? `?${params}` : ''}`),
  getMetrics: () => api.get('/companies/metrics'),
  createCompany: (companyData) => api.post('/companies', companyData),
  updateCompany: (id, data) => api.patch(`/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/companies/${id}`),
};

// Menu 4: Surveyors
export const adminSurveyorsApi = {
  getSurveyors: (params = '') => api.get(`/surveyors${params ? `?${params}` : ''}`),
  getMetrics: () => api.get('/surveyors/metrics'),
  onboardSurveyor: (surveyorData) => api.post('/surveyors', surveyorData),
  updateSurveyor: (id, data) => api.patch(`/surveyors/${id}`, data),
};

// Menu 5: CRM & Leads
export const adminCrmAndLeadsApi = {
  getLeads: (params = '') => api.get(`/crm-and-leads${params ? `?${params}` : ''}`),
  getMetrics: () => api.get('/crm-and-leads/metrics'),
  createLead: (leadData) => api.post('/crm-and-leads', leadData),
  updateStatus: (id, status) => api.patch(`/crm-and-leads/${id}/status`, { status }),
  addCallLog: (callData) => api.post('/crm-and-leads/call-logs', callData),
  addComplaint: (complaintData) => api.post('/crm-and-leads/complaints', complaintData),
  resolveComplaint: (id, notes) => api.patch(`/crm-and-leads/complaints/${id}/resolve`, { resolutionNotes: notes }),
};

// Menu 6: Survey Jobs
export const adminSurveyJobsApi = {
  getJobs: (params = '') => api.get(`/survey-jobs${params ? `?${params}` : ''}`),
  getMetrics: () => api.get('/survey-jobs/metrics'),
  getJobById: (id) => api.get(`/survey-jobs/${id}`),
  createJob: (jobData) => api.post('/survey-jobs', jobData),
  updateStage: (id, newStage, reason = '') => api.patch(`/survey-jobs/${id}/stage`, { newStage, reason }),
  assignSurveyor: (id, assignmentData) => api.patch(`/survey-jobs/${id}/assign-surveyor`, assignmentData),
};

// Menu 7: Messages Inbox
export const adminMessagesApi = {
  getThreads: (params = '') => api.get(`/messages/threads${params ? `?${params}` : ''}`),
  getMetrics: () => api.get('/messages/metrics'),
  getThreadMessages: (convId) => api.get(`/messages/threads/${convId}`),
  sendMessage: (msgData) => api.post('/messages', msgData),
  markRead: (convId) => api.patch(`/messages/read/${convId}`),
};

// Menu 8: Quotations & Payments
export const adminQuotationsAndPaymentsApi = {
  getQuotes: (params = '') => api.get(`/quotations-and-payments/quotes${params ? `?${params}` : ''}`),
  getInvoices: (params = '') => api.get(`/quotations-and-payments/invoices${params ? `?${params}` : ''}`),
  getMetrics: () => api.get('/quotations-and-payments/metrics'),
  createQuote: (quoteData) => api.post('/quotations-and-payments/quotes', quoteData),
  settleBacs: (id, bacsData) => api.post(`/quotations-and-payments/invoices/${id}/settle-bacs`, bacsData),
};

// Menu 9: Terms & Documents
export const adminTermsAndDocumentsApi = {
  getTerms: (params = '') => api.get(`/terms-and-documents${params ? `?${params}` : ''}`),
  getMetrics: () => api.get('/terms-and-documents/metrics'),
  issueTerms: (termsData) => api.post('/terms-and-documents', termsData),
  getAuditCertificate: (id) => api.get(`/terms-and-documents/${id}/audit-certificate`),
};

// Menu 10: Reports & Analytics
export const adminReportsAndAnalyticsApi = {
  getReports: (params = '') => api.get(`/reports-and-analytics${params ? `?${params}` : ''}`),
  getMetrics: () => api.get('/reports-and-analytics/metrics'),
  approveQa: (id) => api.patch(`/reports-and-analytics/${id}/qa-approve`),
  uploadReport: (id, pdfUrl) => api.post(`/reports-and-analytics/${id}/upload`, { reportPdfUrl: pdfUrl }),
};

// Menu 11: Settings
export const adminSettingsApi = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settingsData) => api.patch('/settings', settingsData),
};

