import { api } from './apiClient';

/**
 * Customer Portal API Client — All 14 Menus
 * With Strict Customer Isolation
 */

// Menu 1: Dashboard
export const customerDashboardApi = {
  getDashboard: () => api.get('/customer/my-dashboard'),
};

// Menu 2: My Quotations
export const customerQuotationsApi = {
  getQuotations: () => api.get('/customer/quotations'),
  acceptQuotation: (id) => api.post(`/customer/quotations/${id}/accept`),
};

// Menu 3: My Bookings
export const customerBookingsApi = {
  getBookings: () => api.get('/customer/my-bookings'),
};

// Menu 4: Track My Survey
export const customerTrackSurveyApi = {
  getTracking: () => api.get('/customer/track-survey'),
};

// Menu 5: Appointment Details
export const customerAppointmentDetailsApi = {
  getDetails: () => api.get('/customer/appointment-details'),
  getAppointment: () => api.get('/customer/appointment-details'),
};

// Menu 6: Assigned Surveyor
export const customerAssignedSurveyorApi = {
  getSurveyor: () => api.get('/customer/assigned-surveyor'),
  getAssignedSurveyor: () => api.get('/customer/assigned-surveyor'),
};

// Menu 7: Terms to Sign
export const customerTermsToSignApi = {
  getTerms: () => api.get('/customer/terms-to-sign'),
  signTerms: (id, signatureData) => api.post(`/customer/terms-to-sign/${id}/sign`, { signatureData }),
};

// Menu 8: Invoices & Payments
export const customerInvoicesAndPaymentsApi = {
  getInvoices: () => api.get('/customer/invoices-and-payments'),
  payInvoice: (id, paymentData = {}) => api.post(`/customer/invoices-and-payments/${id}/pay`, paymentData),
};

// Menu 9: My Reports
export const customerReportsApi = {
  getReports: () => api.get('/customer/reports'),
};

// Menu 10: Messages
export const customerMessagesApi = {
  getContacts: () => api.get('/customer/messages/contacts'),
  getMessages: (params = {}) => api.get('/customer/messages', { params }),
  sendMessage: (payload) =>
    api.post('/customer/messages', typeof payload === 'string' ? { content: payload } : payload),
};

// Menu 11: Leave a Review
export const customerReviewApi = {
  getReviews: () => api.get('/customer/leave-review'),
  getReview: () => api.get('/customer/leave-review'),
  submitReview: (reviewData) => api.post('/customer/leave-review', reviewData),
};

// Menu 12: Support
export const customerSupportApi = {
  getTickets: () => api.get('/customer/support/tickets'),
  getSupport: () => api.get('/customer/support/tickets'),
  createTicket: (ticketData) => api.post('/customer/support/tickets', ticketData),
};

// Menu 13: My Details
export const customerDetailsApi = {
  getDetails: () => api.get('/customer/my-details'),
  updateDetails: (detailsData) => api.patch('/customer/my-details', detailsData),
};

// Menu 14: Previous Surveys
export const customerPreviousSurveysApi = {
  getSurveys: () => api.get('/customer/previous-surveys'),
  getPreviousSurveys: () => api.get('/customer/previous-surveys'),
};

