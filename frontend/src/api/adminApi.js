import { api } from './apiClient';

/**
 * Superadmin API Client — All 11 Menus
 */

// In-flight deduplication and short in-memory cache to prevent redundant UI fetch storms
const createCache = (fetcher, ttlMs = 20000) => {
  let cachedPromise = null;
  let cachedTime = 0;
  return {
    get: (params = '') => {
      const now = Date.now();
      if (!params && cachedPromise && now - cachedTime < ttlMs) {
        return cachedPromise;
      }
      const p = fetcher(params).catch((err) => {
        cachedPromise = null;
        throw err;
      });
      if (!params) {
        cachedPromise = p;
        cachedTime = now;
      }
      return p;
    },
    invalidate: () => {
      cachedPromise = null;
      cachedTime = 0;
    },
  };
};

const statsCache = createCache(() => api.get('/dashboard/stats'));
const bucketsCache = createCache(() => api.get('/dashboard/action-buckets'));
const jobsCache = createCache((params = '') => api.get(`/survey-jobs${params ? `?${params}` : ''}`));
const leadsCache = createCache((params = '') => api.get(`/crm-and-leads${params ? `?${params}` : ''}`));

// Menu 1: Dashboard
export const adminDashboardApi = {
  getStats: () => statsCache.get(),
  getActionBuckets: () => bucketsCache.get(),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  invalidateCache: () => {
    statsCache.invalidate();
    bucketsCache.invalidate();
  },
};

// Menu 2: Users & Roles
export const adminUsersAndRolesApi = {
  getUsers: (params = '') => api.get(`/users-and-roles${params ? `?${params}` : ''}`),
  getMetrics: () => api.get('/users-and-roles/metrics'),
  createUser: (userData) => api.post('/users-and-roles', userData),
  updateUser: (id, data) => api.patch(`/users-and-roles/${id}`, data),
  deleteUser: (id) => api.delete(`/users-and-roles/${id}`),
  getPermissions: () => api.get('/users-and-roles/permissions'),
  updatePermissions: (permissions) => api.put('/users-and-roles/permissions', { permissions }),
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
let cachedSurveyorsPromise = null;
let cachedSurveyorsTime = 0;

export const adminSurveyorsApi = {
  getSurveyors: (params = '') => {
    const now = Date.now();
    if (!params && cachedSurveyorsPromise && now - cachedSurveyorsTime < 30000) {
      return cachedSurveyorsPromise;
    }
    const p = api.get(`/surveyors${params ? `?${params}` : ''}`).catch((err) => {
      cachedSurveyorsPromise = null;
      throw err;
    });
    if (!params) {
      cachedSurveyorsPromise = p;
      cachedSurveyorsTime = now;
    }
    return p;
  },
  getMetrics: () => api.get('/surveyors/metrics'),
  onboardSurveyor: (surveyorData) => {
    cachedSurveyorsPromise = null;
    return api.post('/surveyors', surveyorData);
  },
  updateSurveyor: (id, data) => {
    cachedSurveyorsPromise = null;
    return api.patch(`/surveyors/${id}`, data);
  },
};

// Menu 5: CRM & Leads
export const adminCrmAndLeadsApi = {
  getLeads: (params = '') => leadsCache.get(params),
  getMetrics: () => api.get('/crm-and-leads/metrics'),
  createLead: (leadData) => {
    leadsCache.invalidate();
    bucketsCache.invalidate();
    statsCache.invalidate();
    return api.post('/crm-and-leads', leadData);
  },
  deleteLead: (id) => {
    leadsCache.invalidate();
    bucketsCache.invalidate();
    statsCache.invalidate();
    return api.delete(`/crm-and-leads/${encodeURIComponent(id)}`);
  },
  updateStatus: (id, status) => {
    leadsCache.invalidate();
    bucketsCache.invalidate();
    statsCache.invalidate();
    return api.patch(`/crm-and-leads/${id}/status`, { status });
  },
  addCallLog: (callData) => {
    leadsCache.invalidate();
    return api.post('/crm-and-leads/call-logs', callData);
  },
  addComplaint: (complaintData) => {
    leadsCache.invalidate();
    return api.post('/crm-and-leads/complaints', complaintData);
  },
  resolveComplaint: (id, notes) => {
    leadsCache.invalidate();
    return api.patch(`/crm-and-leads/complaints/${id}/resolve`, { resolutionNotes: notes });
  },
};

// Menu 6: Survey Jobs
export const adminSurveyJobsApi = {
  getJobs: (params = '') => jobsCache.get(params),
  getMetrics: () => api.get('/survey-jobs/metrics'),
  getJobById: (id) => api.get(`/survey-jobs/${id}`),
  createJob: (jobData) => {
    jobsCache.invalidate();
    bucketsCache.invalidate();
    statsCache.invalidate();
    return api.post('/survey-jobs', jobData);
  },
  updateStage: (id, newStage, reason = '') => {
    jobsCache.invalidate();
    bucketsCache.invalidate();
    statsCache.invalidate();
    return api.patch(`/survey-jobs/${id}/stage`, { newStage, reason });
  },
  assignSurveyor: (id, assignmentData) => {
    jobsCache.invalidate();
    bucketsCache.invalidate();
    statsCache.invalidate();
    return api.patch(`/survey-jobs/${id}/assign-surveyor`, assignmentData);
  },
  rescheduleJob: (id, rescheduleData) => {
    jobsCache.invalidate();
    bucketsCache.invalidate();
    statsCache.invalidate();
    return api.patch(`/survey-jobs/${id}/reschedule`, rescheduleData);
  },
  deleteJob: (id) => {
    jobsCache.invalidate();
    bucketsCache.invalidate();
    statsCache.invalidate();
    return api.delete(`/survey-jobs/${encodeURIComponent(id)}`);
  },
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
  updateQuote: (id, quoteData) => api.put(`/quotations-and-payments/quotes/${id}`, quoteData),
  updateQuoteStatus: (id, status) => api.patch(`/quotations-and-payments/quotes/${id}/status`, { status }),
  settleBacs: (id, bacsData) => api.post(`/quotations-and-payments/invoices/${id}/settle-bacs`, bacsData),
};

// Menu 9: Terms & Documents
export const adminTermsAndDocumentsApi = {
  getTerms: (params = '') => api.get(`/terms-and-documents${params ? `?${params}` : ''}`),
  getMetrics: () => api.get('/terms-and-documents/metrics'),
  issueTerms: (termsData) => api.post('/terms-and-documents', termsData),
  markSigned: (id, signData = {}) => api.patch(`/terms-and-documents/${id}/sign`, signData),
  getAuditCertificate: (id) => api.get(`/terms-and-documents/${id}/audit-certificate`),
};

// Menu 10: Reports & Analytics
export const adminReportsAndAnalyticsApi = {
  getReports: (params = '') => api.get(`/reports-and-analytics${params ? `?${params}` : ''}`),
  getMetrics: () => api.get('/reports-and-analytics/metrics'),
  approveQa: (id) => api.patch(`/reports-and-analytics/${id}/qa-approve`),
  rejectQa: (id, notes) => api.patch(`/reports-and-analytics/${id}/qa-reject`, { notes }),
  uploadReport: (id, pdfUrl) => api.post(`/reports-and-analytics/${id}/upload`, { reportPdfUrl: pdfUrl }),
};

// Menu 11: Settings
export const adminSettingsApi = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settingsData) => api.patch('/settings', settingsData),
};

