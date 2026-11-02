import { api } from './apiClient';

/**
 * Surveyor Portal API Client — All 6 Menus
 * With Strict Assignment Isolation
 */

// Menu 1: Dashboard
export const surveyorDashboardApi = {
  getDashboard: () => api.get('/surveyor/dashboard'),
};

// Menu 2: My Calendar
export const surveyorCalendarApi = {
  getCalendar: (params = '') => api.get(`/surveyor/my-calendar${params ? `?${params}` : ''}`),
};

// Menu 3: My Jobs
export const surveyorJobsApi = {
  getJobs: (params = '') => api.get(`/surveyor/my-jobs${params ? `?${params}` : ''}`),
  getJobById: (id) => api.get(`/surveyor/my-jobs/${id}`),
};

// Menu 4: Site Visits
export const surveyorSiteVisitsApi = {
  getVisits: () => api.get('/surveyor/site-visits'),
  checkIn: (id) => api.post(`/surveyor/site-visits/${id}/check-in`),
  completeVisit: (id) => api.post(`/surveyor/site-visits/${id}/complete`),
};

// Menu 5: Upload Reports
export const surveyorUploadReportsApi = {
  getPendingReports: () => api.get('/surveyor/upload-reports'),
  submitDraft: (id, reportData) => api.post(`/surveyor/upload-reports/${id}`, reportData),
};

// Menu 6: My Availability
export const surveyorAvailabilityApi = {
  getAvailability: () => api.get('/surveyor/my-availability'),
  updateAvailability: (data) => api.patch('/surveyor/my-availability', data),
};

