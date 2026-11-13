import { api, ApiError } from './apiClient';

function encodeFormBody(payload) {
  const params = new URLSearchParams();
  params.append('form-name', 'survey-quote-enquiry');
  Object.entries(payload).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      params.append(key, String(val));
    }
  });
  return params.toString();
}

function isHostedNonLocalhost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host !== 'localhost' && host !== '127.0.0.1';
}

/**
 * Public Website API Endpoints (no authentication required)
 * Primary: POST /api/v1/public/enquiries (Express backend locally, or Netlify Function in production).
 * Fallback on static Netlify deploys without Functions: Netlify Forms (POST /).
 */
export const publicApi = {
  submitQuoteEnquiry: async (enquiryData) => {
    try {
      return await api.post('/public/enquiries', enquiryData);
    } catch (err) {
      const canFallbackToNetlifyForms =
        isHostedNonLocalhost() &&
        err instanceof ApiError &&
        (err.status === 404 || err.status === 405 || err.status === 502 || err.status === 503 || err.status === 0);

      if (!canFallbackToNetlifyForms) {
        throw err;
      }

      const referenceId = `ENQ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeFormBody({
          referenceId,
          enquiryCategory: enquiryData.enquiryCategory || 'SURVEY_QUOTE',
          serviceName: enquiryData.serviceName || enquiryData.serviceId || '',
          propertyType: enquiryData.propertyType || '',
          approxBedrooms: enquiryData.approxBedrooms || '',
          propertyAddress: enquiryData.propertyAddress || enquiryData.propertyLocation || '',
          propertyPostcode: enquiryData.propertyPostcode || '',
          timescale: enquiryData.timescale || enquiryData.courtDeadline || '',
          customerName: enquiryData.customerName || enquiryData.contactName || '',
          customerEmail: enquiryData.customerEmail || enquiryData.contactEmail || '',
          customerPhone: enquiryData.customerPhone || enquiryData.contactPhone || '',
          additionalNotes: enquiryData.additionalNotes || enquiryData.caseSummary || '',
          instructingRole: enquiryData.instructingRole || '',
          lawFirmName: enquiryData.lawFirmName || '',
          disputeType: enquiryData.disputeType || '',
          isSingleJointExpert: enquiryData.isSingleJointExpert || '',
          caseSummary: enquiryData.caseSummary || '',
          courtDeadline: enquiryData.courtDeadline || '',
          propertyLocation: enquiryData.propertyLocation || '',
          sourcePage: enquiryData.sourcePage || window.location.pathname,
        }),
      });

      if (!res.ok) {
        throw err;
      }

      return {
        referenceId,
        timestamp: new Date().toISOString(),
        dbSaved: false,
        emailNotification: {
          recipient: 'info@njspropertygroup.com',
          emailSent: false,
          provider: 'netlify_forms',
        },
      };
    }
  },
};

export default publicApi;


