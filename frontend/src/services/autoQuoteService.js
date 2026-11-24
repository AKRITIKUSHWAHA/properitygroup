// SurveyBooker Trigger 1: New Enquiry Auto-Quotation Dispatch Service
// Dispatches automated formal quotation email within 30 seconds of enquiry arrival
// Supports Local Surveyors Direct (LSD), Website Calculator, and CRM Ingestion
// Fully aligned with NJS Property Group RICS branding and SurveyBooker workflows

import { renderEmailTemplate, DEFAULT_EMAIL_AUTOMATIONS } from '../mock/emailAutomations';
import { getStoredQuotes, saveStoredQuotes } from '../mock/quotes';
import { getStoredLeads, saveStoredLeads } from '../mock/leads';
import { normalizeToUKDate } from '../mock/jobs';
import { getApiBaseUrl, api } from '../api/apiClient';

const STANDARD_SURVEY_BASE_FEES = {
  'RICS Level 2 Home Survey (Homebuyer)': 550,
  'RICS Level 2 Home Survey': 650,
  'RICS Level 2 Homebuyer Survey': 650,
  'RICS Level 2 Home Survey (with Valuation)': 650,
  'RICS Level 3 Building Survey': 850,
  'Comprehensive Building Survey': 1100,
  'Residential Red Book Valuation (Matrimonial/Tax/Probate)': 450,
  'Residential Property Valuation': 550,
  'Specific Structural Defect Survey (Damp/Cracking)': 395,
  'Specialist Damp & Defect Survey': 920,
  'New Build Snagging Report': 350,
  'New Build Snagging Survey': 495,
  'Part 35 Civil Procedure Expert Witness Report': 950,
  'Expert Witness (CPR Part 35)': 2400,
};

/**
 * Calculate standard UK VAT fee breakdown
 */
export const calculateSurveyQuoteFee = (surveyType = '', explicitAmount = null) => {
  let baseFee = 650;
  if (explicitAmount && !isNaN(parseFloat(explicitAmount))) {
    baseFee = parseFloat(explicitAmount);
  } else {
    const raw = String(surveyType).toLowerCase();
    for (const [key, val] of Object.entries(STANDARD_SURVEY_BASE_FEES)) {
      if (raw.includes(key.toLowerCase()) || key.toLowerCase().includes(raw)) {
        baseFee = val;
        break;
      }
    }
  }

  const vatAmount = parseFloat((baseFee * 0.2).toFixed(2));
  const totalAmount = parseFloat((baseFee + vatAmount).toFixed(2));

  return {
    baseFee,
    vatAmount,
    totalAmount,
    vatRate: 20.0,
  };
};

/**
 * Dispatch Automated Quotation Email for a Lead (Trigger 1)
 */
export const dispatchAutoQuoteForLead = async (lead, customOverrides = {}) => {
  if (!lead || !lead.customerEmail) {
    console.warn('Cannot dispatch auto-quote: missing lead or email address.');
    return { success: false, reason: 'Missing lead or email address' };
  }

  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const formattedTime = `${formattedDate}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

  // 1. Calculate pricing breakdown
  const rawAmount = customOverrides.price || customOverrides.amount || lead.estimatedValue;
  const cleanNum = rawAmount ? parseFloat(String(rawAmount).replace(/[^0-9.]/g, '')) : null;
  const pricing = calculateSurveyQuoteFee(lead.enquiry || lead.serviceName, cleanNum);

  const quoteRef = lead.quoteReference || `QUO-2026-${Math.floor(100 + Math.random() * 900)}`;
  const propertyAddress = lead.property || lead.location || 'Subject Property, London';

  // 2. Fetch active email automation template for Trigger 1 (step-1: Quote)
  let automations = DEFAULT_EMAIL_AUTOMATIONS;
  try {
    const rawAutomations = localStorage.getItem('property_group_email_automations_v1');
    if (rawAutomations) {
      automations = JSON.parse(rawAutomations);
    }
  } catch (e) {
    console.warn('Error reading automations storage', e);
  }

  const quoteAutomation = automations.find((a) => a.id === 'step-1' || a.stepIndex === 0) || automations[0];

  if (quoteAutomation && quoteAutomation.active === false) {
    console.log('[AUTO-QUOTE PAUSED] Trigger 1 paused by admin in settings.');
    return {
      success: false,
      paused: true,
      reason: 'Auto-quote trigger paused in settings',
    };
  }

  // 3. Resolve dynamic tags in template with real enquiry data
  const templateData = {
    customer: lead.customerName || 'Valued Client',
    customerName: lead.customerName || 'Valued Client',
    clientName: lead.customerName || 'Valued Client',
    property: propertyAddress,
    propertyAddress: propertyAddress,
    location: lead.location || propertyAddress,
    surveyType: lead.enquiry || 'RICS Level 2 Home Survey',
    serviceName: lead.enquiry || 'RICS Level 2 Home Survey',
    quoteTotal: pricing.totalAmount.toFixed(2),
    totalAmount: pricing.totalAmount.toFixed(2),
    price: pricing.totalAmount.toFixed(2),
    jobNo: lead.id || quoteRef,
    reference: lead.id || quoteRef,
    date: formattedDate,
    actionLink: `${window.location.origin}/login?ref=${lead.id}&action=accept_quote`,
    portalLink: `${window.location.origin}/login?ref=${lead.id}`,
    companyName: 'NJS Property Group',
    companyPhone: '0333 305 2777',
    companyEmail: 'info@njspropertygroup.com',
  };

  const resolvedSubject = renderEmailTemplate(
    quoteAutomation?.subject || 'Your RICS Survey Quotation for {{property_address}} - Ref: {{job_no}}',
    templateData
  );

  const resolvedBody = renderEmailTemplate(
    quoteAutomation?.templateBody || '',
    templateData
  );

  // 4. Save/Append Quote Record to propertygroup_quotes
  const newQuoteRecord = {
    id: quoteRef,
    refNo: `QTE-${quoteRef.replace('QUO-', '')}`,
    invoiceNo: `INV-${quoteRef.replace('QUO-', '')}`,
    client: lead.customerName,
    clientEmail: lead.customerEmail,
    clientPhone: lead.customerPhone || '+44 7911 123456',
    property: propertyAddress,
    location: lead.location || propertyAddress,
    surveyType: lead.enquiry || 'RICS Level 2 Home Survey',
    baseFee: pricing.baseFee,
    extras: [],
    discount: 0.0,
    amountExVat: pricing.baseFee,
    vatAmount: pricing.vatAmount,
    totalAmount: pricing.totalAmount,
    status: 'Sent',
    type: 'quote',
    date: formattedDate,
    dueDate: formattedDate,
    leadId: lead.id,
    autoQuoteSent: true,
    autoQuoteDispatchedAt: formattedTime,
  };

  try {
    const existingQuotes = getStoredQuotes();
    const filteredQuotes = existingQuotes.filter((q) => q.id !== quoteRef && q.leadId !== lead.id);
    saveStoredQuotes([newQuoteRecord, ...filteredQuotes]);
  } catch (err) {
    console.error('Error saving auto-quote record', err);
  }

  // 5. Append to Sent Emails Log
  const emailLogRecord = {
    id: `EML-AQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    stepIndex: 0,
    stepName: 'Quote',
    stageLabel: 'Stage 1: Quotation Issued (LSD & Web)',
    subject: resolvedSubject,
    to: lead.customerEmail,
    recipientName: lead.customerName,
    date: formattedTime,
    status: 'Delivered',
    body: resolvedBody,
    preview: `Auto-dispatched quotation for £${pricing.totalAmount.toFixed(2)} inc. 20% VAT.`,
    jobNo: lead.id,
    quoteRef: quoteRef,
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem('property_group_sent_emails_v1') || '[]');
    localStorage.setItem(
      'property_group_sent_emails_v1',
      JSON.stringify([emailLogRecord, ...existingLogs.slice(0, 49)])
    );
    window.dispatchEvent(new Event('property_group_sent_emails_updated'));
  } catch (err) {
    console.warn('Error saving sent email log', err);
  }

  // 6. Update Lead with Green Auto-Quote Badge and Timestamp
  const updatedLead = {
    ...lead,
    status: 'Quoted',
    autoQuoteSent: true,
    autoQuoteDispatchedAt: formattedTime,
    autoQuoteBadge: 'Auto-Quote Sent',
    quotedAmount: `£${pricing.totalAmount.toFixed(2)}`,
    quoteReference: quoteRef,
    quoteDate: formattedDate,
    notes: lead.notes
      ? `${lead.notes} • [Auto-Quote: Dispatched £${pricing.totalAmount.toFixed(2)} at ${formattedTime}]`
      : `Auto-Quote: Dispatched £${pricing.totalAmount.toFixed(2)} at ${formattedTime}`,
  };

  try {
    const existingLeads = getStoredLeads();
    const updatedLeads = existingLeads.map((l) => (l.id === lead.id ? updatedLead : l));
    if (!existingLeads.some((l) => l.id === lead.id)) {
      updatedLeads.unshift(updatedLead);
    }
    saveStoredLeads(updatedLeads);
  } catch (err) {
    console.warn('Error updating lead with auto-quote', err);
  }

  // 7. Non-blocking Backend API Dispatch
  try {
    const token = localStorage.getItem('property_group_auth_token');
    fetch(`${getApiBaseUrl()}/quotations-and-payments/quotes/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        to: lead.customerEmail,
        clientName: lead.customerName,
        quoteAmount: pricing.totalAmount.toFixed(2),
        surveyType: lead.enquiry,
        propertyAddress: propertyAddress,
        leadId: lead.id,
        quoteRef: quoteRef,
      }),
    }).catch(() => {});
  } catch {}

  return {
    success: true,
    pricing,
    quoteRef,
    dispatchedAt: formattedTime,
    emailLogRecord,
    updatedLead,
  };
};

/**
 * SurveyBooker Trigger 2: Dispatch Quotation Acceptance Email and Advance Workflow to Accepted
 * Dispatches automated acceptance confirmation email with direct links to:
 * 1. Digitally Sign Terms of Engagement
 * 2. Select Preferred Inspection Date
 * Moves job stage to Accepted in CRM buckets
 */
export const dispatchQuoteAcceptance = async (quoteOrJob, customOverrides = {}) => {
  if (!quoteOrJob) return { success: false, reason: 'Missing quote or job data' };

  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const formattedTime = `${formattedDate}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

  const clientEmail = (quoteOrJob.clientEmail || quoteOrJob.customerEmail || 'customer@demo.com').toLowerCase().trim();
  const clientName = quoteOrJob.client || quoteOrJob.customerName || quoteOrJob.customer || 'Valued Client';
  const propertyAddress = quoteOrJob.property || quoteOrJob.propertyAddress || quoteOrJob.location || 'Subject Property, London';
  const surveyType = quoteOrJob.surveyType || quoteOrJob.enquiry || 'RICS Level 2 Home Survey';
  const quoteTotal = quoteOrJob.totalAmount ? quoteOrJob.totalAmount.toFixed(2) : (quoteOrJob.total || '650.00');
  const refNo = quoteOrJob.id || quoteOrJob.refNo || 'QUO-2026-080';

  // 1. Fetch active email automations to check Trigger 2 (step-quote-accepted)
  let automations = DEFAULT_EMAIL_AUTOMATIONS;
  try {
    const rawAutomations = localStorage.getItem('property_group_email_automations_v1');
    if (rawAutomations) {
      automations = JSON.parse(rawAutomations);
    }
  } catch (e) {
    console.warn('Error reading automations storage', e);
  }

  const acceptanceAutomation =
    automations.find((a) => a.id === 'step-quote-accepted' || a.stepIndex === 10) || automations[1];

  const templateData = {
    customer: clientName,
    customerName: clientName,
    clientName: clientName,
    property: propertyAddress,
    propertyAddress: propertyAddress,
    surveyType: surveyType,
    quoteTotal: String(quoteTotal).replace('£', ''),
    jobNo: refNo,
    reference: refNo,
    date: formattedDate,
    actionLink: `${window.location.origin}/customer/terms-to-sign`,
    bookingLink: `${window.location.origin}/customer/my-bookings`,
    portalLink: `${window.location.origin}/customer/my-dashboard`,
    companyName: 'NJS Property Group',
    companyPhone: '0333 305 2777',
    companyEmail: 'info@njspropertygroup.com',
  };

  const resolvedSubject = renderEmailTemplate(
    acceptanceAutomation?.subject || 'Quotation Accepted: Next Steps for {{property_address}} - Ref: {{job_no}}',
    templateData
  );

  const resolvedBody = renderEmailTemplate(
    acceptanceAutomation?.templateBody || '',
    templateData
  );

  // 2. Append Sent Email Log
  const emailLogRecord = {
    id: `EML-AC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    stepIndex: 10,
    stepName: 'Quotation Accepted',
    stageLabel: 'Stage 2: Quotation Accepted',
    subject: resolvedSubject,
    to: clientEmail,
    recipientName: clientName,
    date: formattedTime,
    status: 'Delivered',
    body: resolvedBody,
    preview: `Quotation accepted for ${propertyAddress}. Next steps: sign terms & select date.`,
    jobNo: refNo,
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem('property_group_sent_emails_v1') || '[]');
    localStorage.setItem(
      'property_group_sent_emails_v1',
      JSON.stringify([emailLogRecord, ...existingLogs.slice(0, 49)])
    );
    window.dispatchEvent(new Event('property_group_sent_emails_updated'));
  } catch (err) {
    console.warn('Error saving sent email log', err);
  }

  // 3. Update Quotes Storage: mark as Accepted
  try {
    localStorage.setItem(`propertygroup_quote_accepted_${clientEmail}`, 'true');
    localStorage.setItem('propertygroup_quote_accepted', 'true');
    const storedQuotes = JSON.parse(localStorage.getItem('propertygroup_quotes') || '[]');
    const updatedQuotes = storedQuotes.map((q) => {
      const match =
        q.id === quoteOrJob.id ||
        q.refNo === quoteOrJob.refNo ||
        (q.clientEmail && q.clientEmail.toLowerCase().trim() === clientEmail);
      if (match) {
        return {
          ...q,
          status: 'Accepted',
          acceptedAt: formattedTime,
          acceptanceEmailSent: true,
          acceptanceEmailDispatchedAt: formattedTime,
        };
      }
      return q;
    });
    localStorage.setItem('propertygroup_quotes', JSON.stringify(updatedQuotes));
    window.dispatchEvent(new Event('propertygroup_quotes_updated'));
  } catch (err) {
    console.warn('Error updating quotes storage on acceptance', err);
  }

  // 4. Update Jobs Storage: mark stage as Accepted / quoteStatus: Accepted
  try {
    const storedJobs = JSON.parse(localStorage.getItem('propertygroup_jobs') || '[]');
    const targetId = String(quoteOrJob.id || quoteOrJob.jobNo || quoteOrJob.refNo || '').toUpperCase().trim();
    const updatedJobs = storedJobs.map((j) => {
      const jId = String(j.id || j.jobNo || '').toUpperCase().trim();
      const match = targetId && jId && (jId === targetId || jId.replace('JOB-', '') === targetId.replace('JOB-', '').replace('QUO-', ''));
      if (match) {
        return {
          ...j,
          status: j.status === 'Completed' || j.status === 'Paid' ? j.status : 'Accepted',
          quoteStatus: 'Accepted',
          stage: 'accepted',
          acceptedAt: formattedTime,
          timelineStep: Math.max(j.timelineStep || 0, 3),
        };
      }
      return j;
    });
    localStorage.setItem('propertygroup_jobs', JSON.stringify(updatedJobs));
    setTimeout(() => {
      window.dispatchEvent(new Event('propertygroup_jobs_updated'));
    }, 0);
  } catch (err) {
    console.warn('Error updating jobs storage on acceptance', err);
  }

  // 5. Update Leads Storage: mark status as Converted / Accepted
  try {
    const storedLeads = JSON.parse(localStorage.getItem('propertygroup_crm_leads_v1') || '[]');
    const updatedLeads = storedLeads.map((l) => {
      const match =
        l.id === quoteOrJob.id ||
        (l.customerEmail && l.customerEmail.toLowerCase().trim() === clientEmail);
      if (match) {
        return {
          ...l,
          status: 'Converted',
          quoteAccepted: true,
          quoteAcceptedAt: formattedTime,
          notes: l.notes
            ? `${l.notes} • [Client accepted quote on ${formattedTime}]`
            : `Client accepted quote on ${formattedTime}`,
        };
      }
      return l;
    });
    localStorage.setItem('propertygroup_crm_leads_v1', JSON.stringify(updatedLeads));
    window.dispatchEvent(new Event('propertygroup_leads_updated'));
  } catch (err) {
    console.warn('Error updating leads storage on acceptance', err);
  }

  // 6. Non-blocking Backend API calls
  try {
    const token = localStorage.getItem('property_group_auth_token');
    const quoteId = parseInt(String(quoteOrJob.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(quoteId) && quoteId > 0) {
      fetch(`/api/v1/customer/quotations/${quoteId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-user-email': clientEmail,
        },
      }).catch(() => {});
      fetch(`${getApiBaseUrl()}/quotations-and-payments/quotes/${quoteId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-user-email': clientEmail,
        },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      }).catch(() => {});
    }
  } catch {}

  return {
    success: true,
    acceptedAt: formattedTime,
    resolvedSubject,
    emailLogRecord,
  };
};

/**
 * SurveyBooker Trigger 3: Dispatch Unbooked Follow-Up Reminder (Chase Engine)
 * Client Requirement:
 * "Booking reminders: If a client accepts a quotation but has not booked after a few days, an automated reminder email should be sent."
 * 
 * When a quote is accepted but inspection appointment is unconfirmed after 48-72 hours:
 * 1. Dispatches branded chase email:
 *    "Gentle Reminder: Secure your surveyor inspection slot for [Property Address]. Surveyor diaries for next week are filling up fast."
 *    Direct link: "Click Here to Select Your Date" -> /customer/my-bookings
 * 2. Logs email record to property_group_sent_emails_v1
 * 3. Updates job with bookingReminderSent: true, bookingReminderCount: (count + 1), bookingReminderSentAt
 * 4. Displays "Reminder Sent (1/2)" badge in admin "Jobs to Book" bucket and Jobs Table
 */
export const dispatchUnbookedBookingReminder = async (jobOrQuote, customOverrides = {}) => {
  if (!jobOrQuote) return { success: false, reason: 'Missing job or quote data' };

  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const formattedTime = `${formattedDate}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

  const clientEmail = (
    jobOrQuote.customerEmail ||
    jobOrQuote.clientEmail ||
    'customer@demo.com'
  ).toLowerCase().trim();
  const clientName =
    jobOrQuote.customer ||
    jobOrQuote.customerName ||
    jobOrQuote.client ||
    'Valued Client';
  const propertyAddress =
    jobOrQuote.property ||
    jobOrQuote.propertyAddress ||
    jobOrQuote.location ||
    'Subject Property, London';
  const surveyType =
    jobOrQuote.surveyType ||
    jobOrQuote.enquiry ||
    'RICS Level 2 Home Survey';
  const jobNo = jobOrQuote.jobNo || jobOrQuote.id || 'JOB-2026-080';
  const currentCount = jobOrQuote.bookingReminderCount || 0;
  const newCount = currentCount + 1;

  // 1. Fetch active email automations to check Trigger 3 (step-unbooked-reminder)
  let automations = DEFAULT_EMAIL_AUTOMATIONS;
  try {
    const rawAutomations = localStorage.getItem('property_group_email_automations_v1');
    if (rawAutomations) {
      automations = JSON.parse(rawAutomations);
    }
  } catch (e) {
    console.warn('Error reading automations storage', e);
  }

  const reminderAutomation =
    automations.find((a) => a.id === 'step-unbooked-reminder' || a.stepIndex === 11) ||
    automations[2] ||
    DEFAULT_EMAIL_AUTOMATIONS[2];

  const templateData = {
    customer: clientName,
    customerName: clientName,
    clientName: clientName,
    property: propertyAddress,
    propertyAddress: propertyAddress,
    surveyType: surveyType,
    quoteTotal: jobOrQuote.total ? String(jobOrQuote.total).replace('£', '') : 'Pending Estimation',
    jobNo: jobNo,
    reference: jobNo,
    date: formattedDate,
    actionLink: `${window.location.origin}/customer/my-bookings`,
    bookingLink: `${window.location.origin}/customer/my-bookings`,
    portalLink: `${window.location.origin}/customer/my-dashboard`,
    companyName: 'NJS Property Group',
    companyPhone: '0333 305 2777',
    companyEmail: 'info@njspropertygroup.com',
  };

  const defaultSubject = `Gentle Reminder: Secure your surveyor inspection slot for {{property_address}} - Ref: {{job_no}}`;
  const resolvedSubject = renderEmailTemplate(
    reminderAutomation?.subject || defaultSubject,
    templateData
  );

  const defaultBody = `Dear {{customer_name}},

Gentle Reminder: Secure your surveyor inspection slot for {{property_address}}. Surveyor diaries for next week are filling up fast.

We noticed you recently accepted your quotation for the {{survey_type}} at:
{{property_address}} (Ref: {{job_no}}).

However, your preferred inspection date has not yet been selected.

To avoid delays to your property transaction and secure your preferred date, please click the link below:

Click Here to Select Your Date:
{{action_link}}

If your purchase timeline has changed or you are waiting for the estate agent/vendor to grant access, simply reply to this email and our operations team will coordinate key collection on your behalf.

Warm regards,
Bookings & Logistics Desk | NJS Property Group
Phone: 0333 305 2777 • Email: info@njspropertygroup.com`;

  const resolvedBody = renderEmailTemplate(
    reminderAutomation?.templateBody || defaultBody,
    templateData
  );

  // 2. Append Sent Email Log
  const emailLogRecord = {
    id: `EML-REM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    stepIndex: 11,
    stepName: 'Unbooked Chase',
    stageLabel: 'Stage 3: Unbooked Follow-Up (2-3 Days)',
    subject: resolvedSubject,
    to: clientEmail,
    recipientName: clientName,
    date: formattedTime,
    status: 'Delivered',
    body: resolvedBody,
    preview: `Gentle reminder (${newCount}/2) prompting customer to book surveyor appointment window for ${propertyAddress}.`,
    jobNo: jobNo,
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem('property_group_sent_emails_v1') || '[]');
    localStorage.setItem(
      'property_group_sent_emails_v1',
      JSON.stringify([emailLogRecord, ...existingLogs.slice(0, 49)])
    );
    window.dispatchEvent(new Event('property_group_sent_emails_updated'));
  } catch (err) {
    console.warn('Error saving sent email log', err);
  }

  // 3. Update Jobs Storage: mark bookingReminderSent: true & count
  try {
    const storedJobs = JSON.parse(localStorage.getItem('propertygroup_jobs') || '[]');
    const updatedJobs = storedJobs.map((j) => {
      const match =
        j.id === jobOrQuote.id ||
        j.jobNo === jobOrQuote.jobNo ||
        j.jobNo === jobOrQuote.id ||
        (j.customerEmail && j.customerEmail.toLowerCase().trim() === clientEmail);
      if (match) {
        return {
          ...j,
          bookingReminderSent: true,
          bookingReminderCount: newCount,
          bookingReminderSentAt: formattedTime,
          lastFollowUpDate: formattedDate,
        };
      }
      return j;
    });
    localStorage.setItem('propertygroup_jobs', JSON.stringify(updatedJobs));
    window.dispatchEvent(new Event('propertygroup_jobs_updated'));
  } catch (err) {
    console.warn('Error updating jobs storage on booking reminder', err);
  }

  // 4. Update CRM Leads: append note if exists
  try {
    const storedLeads = JSON.parse(localStorage.getItem('propertygroup_crm_leads_v1') || '[]');
    const updatedLeads = storedLeads.map((l) => {
      const match =
        l.id === jobOrQuote.id ||
        (l.customerEmail && l.customerEmail.toLowerCase().trim() === clientEmail);
      if (match) {
        return {
          ...l,
          bookingReminderSent: true,
          bookingReminderCount: newCount,
          notes: l.notes
            ? `${l.notes} • [Unbooked chase reminder (${newCount}/2) sent on ${formattedTime}]`
            : `Unbooked chase reminder (${newCount}/2) sent on ${formattedTime}`,
        };
      }
      return l;
    });
    localStorage.setItem('propertygroup_crm_leads_v1', JSON.stringify(updatedLeads));
    window.dispatchEvent(new Event('propertygroup_leads_updated'));
  } catch (err) {
    console.warn('Error updating leads storage on booking reminder', err);
  }

  return {
    success: true,
    reminderCount: newCount,
    dispatchedAt: formattedTime,
    resolvedSubject,
    emailLogRecord,
  };
};

/**
 * Scan all active accepted instructions and auto-dispatch booking reminders
 * for jobs unbooked after 48-72 hours (SurveyBooker Trigger 3 Engine)
 */
export const scanAndDispatchUnbookedReminders = async (options = { maxReminders: 2, hoursThreshold: 48, forceAll: false }) => {
  let storedJobs = [];
  try {
    storedJobs = JSON.parse(localStorage.getItem('propertygroup_jobs') || '[]');
  } catch {
    return { scanned: 0, dispatched: 0, jobs: [] };
  }

  const now = Date.now();
  const dispatchedList = [];

  for (const job of storedJobs) {
    // Check if job is accepted or in "Jobs to Book" stage
    const isAccepted =
      job.status === 'Accepted' ||
      job.quoteStatus === 'Accepted' ||
      job.stage === 'accepted' ||
      job.termsStatus === 'Signed' ||
      (job.timelineStep && job.timelineStep >= 3);

    // Check if not yet booked/scheduled/done
    const isUnbooked =
      job.status !== 'Booked' &&
      job.status !== 'Scheduled' &&
      job.status !== 'Survey done' &&
      job.status !== 'Completed' &&
      job.status !== 'Closed' &&
      !job.bookedDate &&
      !job.appointmentDate;

    const reminderCount = job.bookingReminderCount || 0;
    const canSendMore = reminderCount < (options.maxReminders || 2);

    if (isAccepted && isUnbooked && canSendMore) {
      let shouldSend = options.forceAll === true;

      if (!shouldSend) {
        // Check time difference (default 48 hours = 48 * 3600 * 1000 ms)
        let acceptedTime = null;
        if (job.acceptedAt) {
          const parsed = Date.parse(job.acceptedAt);
          if (!isNaN(parsed)) acceptedTime = parsed;
        }
        if (!acceptedTime && job.date) {
          // If UK format DD/MM/YYYY
          const parts = String(job.date).split('/');
          if (parts.length === 3) {
            acceptedTime = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
          }
        }

        if (acceptedTime) {
          const elapsedHours = (now - acceptedTime) / (1000 * 60 * 60);
          if (elapsedHours >= (options.hoursThreshold || 48)) {
            shouldSend = true;
          }
        } else {
          // If no timestamp, eligible on 2nd day
          shouldSend = true;
        }
      }

      if (shouldSend) {
        const result = await dispatchUnbookedBookingReminder(job);
        if (result.success) {
          dispatchedList.push({
            jobNo: job.jobNo || job.id,
            property: job.property,
            reminderCount: result.reminderCount,
          });
        }
      }
    }
  }

  return {
    scanned: storedJobs.length,
    dispatched: dispatchedList.length,
    dispatchedJobs: dispatchedList,
  };
};

/**
 * SurveyBooker Trigger 4 (Part A): Dispatch Post-Inspection Update Email
 * Client Requirement:
 * "Inspection Complete Update: Jaise hi surveyor physical site inspection karke job ko 'Attended / Drafting' mark karta hai,
 * customer ko auto-update email: 'Site inspection attended today by your surveyor [Surveyor Name]. Findings and photos are currently being compiled into your formal RICS report.'"
 */
export const dispatchPostInspectionUpdate = async (jobOrRecord, customOverrides = {}) => {
  if (!jobOrRecord) return { success: false, reason: 'Missing job data' };

  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const formattedTime = `${formattedDate}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

  const clientEmail = (
    jobOrRecord.customerEmail ||
    jobOrRecord.clientEmail ||
    'customer@demo.com'
  ).toLowerCase().trim();
  const clientName =
    jobOrRecord.customer ||
    jobOrRecord.customerName ||
    jobOrRecord.client ||
    'Valued Client';
  const propertyAddress =
    jobOrRecord.property ||
    jobOrRecord.propertyAddress ||
    jobOrRecord.location ||
    'Subject Property, London';
  const surveyorName =
    jobOrRecord.surveyor ||
    jobOrRecord.surveyorName ||
    'Assigned Chartered Surveyor';
  const surveyType =
    jobOrRecord.surveyType ||
    jobOrRecord.enquiry ||
    'RICS Level 2 Home Survey';
  const jobNo = jobOrRecord.jobNo || jobOrRecord.id || 'JOB-2026-080';

  // 1. Fetch active email automations (step-5)
  let automations = DEFAULT_EMAIL_AUTOMATIONS;
  try {
    const rawAutomations = localStorage.getItem('property_group_email_automations_v1');
    if (rawAutomations) {
      automations = JSON.parse(rawAutomations);
    }
  } catch (e) {
    console.warn('Error reading automations storage', e);
  }

  const inspectionAutomation =
    automations.find((a) => a.id === 'step-5' || a.stepIndex === 4) ||
    DEFAULT_EMAIL_AUTOMATIONS.find((a) => a.id === 'step-5');

  const templateData = {
    customer: clientName,
    customerName: clientName,
    clientName: clientName,
    property: propertyAddress,
    propertyAddress: propertyAddress,
    surveyor: surveyorName,
    surveyorName: surveyorName,
    surveyType: surveyType,
    quoteTotal: jobOrRecord.total ? String(jobOrRecord.total).replace('£', '') : 'Pending Estimation',
    jobNo: jobNo,
    reference: jobNo,
    date: formattedDate,
    actionLink: `${window.location.origin}/customer/track-survey`,
    portalLink: `${window.location.origin}/customer/track-survey`,
    companyName: 'NJS Property Group',
    companyPhone: '0333 305 2777',
    companyEmail: 'info@njspropertygroup.com',
  };

  const defaultSubject = `Site Inspection Attended: Your RICS Report is in Preparation for {{property_address}} - Ref: {{job_no}}`;
  const resolvedSubject = renderEmailTemplate(
    inspectionAutomation?.subject || defaultSubject,
    templateData
  );

  const defaultBody = `Dear {{customer_name}},

Site inspection attended today by your surveyor, {{surveyor_name}}. Findings and photos are currently being compiled into your formal RICS report.

What happens next:
• Your surveyor is compiling detailed element observations, photographic defect evidence, and moisture readings.
• The report will undergo our mandatory peer-review RICS Quality Assurance (QA) check.
• Standard Delivery SLA: Your certified report will be released within 48 business hours.

Track your report status in real time:
{{action_link}}

Warm regards,
Operations & Survey Logistics Desk | NJS Property Group
Phone: 0333 305 2777 • Email: info@njspropertygroup.com`;

  const resolvedBody = renderEmailTemplate(
    inspectionAutomation?.templateBody || defaultBody,
    templateData
  );

  // 2. Append Sent Email Log
  const emailLogRecord = {
    id: `EML-INSP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    stepIndex: 4,
    stepName: 'Preparing report',
    stageLabel: 'Stage 7: Survey Attended (Post-Survey)',
    subject: resolvedSubject,
    to: clientEmail,
    recipientName: clientName,
    date: formattedTime,
    status: 'Delivered',
    body: resolvedBody,
    preview: `Site inspection attended today by ${surveyorName}. Report compiling (48h turnaround SLA).`,
    jobNo: jobNo,
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem('property_group_sent_emails_v1') || '[]');
    localStorage.setItem(
      'property_group_sent_emails_v1',
      JSON.stringify([emailLogRecord, ...existingLogs.slice(0, 49)])
    );
    window.dispatchEvent(new Event('property_group_sent_emails_updated'));
  } catch (err) {
    console.warn('Error saving sent email log', err);
  }

  // 3. Update Jobs Storage: set inspectionEmailSent: true & timelineStep: 8 (Drafting)
  try {
    const storedJobs = JSON.parse(localStorage.getItem('propertygroup_jobs') || '[]');
    const updatedJobs = storedJobs.map((j) => {
      const match =
        j.id === jobOrRecord.id ||
        j.jobNo === jobOrRecord.jobNo ||
        j.jobNo === jobOrRecord.id ||
        (j.customerEmail && j.customerEmail.toLowerCase().trim() === clientEmail);
      if (match) {
        return {
          ...j,
          status: j.status === 'Completed' ? 'Completed' : 'Drafting',
          stage: 'PREPARING_REPORT',
          timelineStep: Math.max(j.timelineStep || 0, 8),
          inspectionEmailSent: true,
          inspectionEmailSentAt: formattedTime,
        };
      }
      return j;
    });
    localStorage.setItem('propertygroup_jobs', JSON.stringify(updatedJobs));
    window.dispatchEvent(new Event('propertygroup_jobs_updated'));
  } catch (err) {
    console.warn('Error updating jobs storage on post-inspection', err);
  }

  return {
    success: true,
    dispatchedAt: formattedTime,
    resolvedSubject,
    emailLogRecord,
  };
};

/**
 * SurveyBooker Trigger 4 (Part B): Dispatch Final Report Ready & Trustpilot Review Email
 * Client Requirement:
 * "Final Report Ready Email: Jab admin QA pass karke PDF report upload karta hai:
 * Customer ko final delivery email with 'Download Your RICS Report' button.
 * Sath me Trustpilot review link: 'Share your experience with NJS Property Group'."
 */
export const dispatchFinalReportReadyEmail = async (jobOrRecord, customOverrides = {}) => {
  if (!jobOrRecord) return { success: false, reason: 'Missing job data' };

  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const formattedTime = `${formattedDate}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

  const clientEmail = (
    jobOrRecord.customerEmail ||
    jobOrRecord.clientEmail ||
    'customer@demo.com'
  ).toLowerCase().trim();
  const clientName =
    jobOrRecord.customer ||
    jobOrRecord.customerName ||
    jobOrRecord.client ||
    'Valued Client';
  const propertyAddress =
    jobOrRecord.property ||
    jobOrRecord.propertyAddress ||
    jobOrRecord.location ||
    'Subject Property, London';
  const surveyorName =
    jobOrRecord.surveyor ||
    jobOrRecord.surveyorName ||
    'Assigned Chartered Surveyor';
  const surveyType =
    jobOrRecord.surveyType ||
    jobOrRecord.enquiry ||
    'RICS Level 2 Home Survey';
  const jobNo = jobOrRecord.jobNo || jobOrRecord.id || 'JOB-2026-080';

  // 1. Fetch active email automations (step-6)
  let automations = DEFAULT_EMAIL_AUTOMATIONS;
  try {
    const rawAutomations = localStorage.getItem('property_group_email_automations_v1');
    if (rawAutomations) {
      automations = JSON.parse(rawAutomations);
    }
  } catch (e) {
    console.warn('Error reading automations storage', e);
  }

  const reportReadyAutomation =
    automations.find((a) => a.id === 'step-6' || a.stepIndex === 5) ||
    DEFAULT_EMAIL_AUTOMATIONS.find((a) => a.id === 'step-6');

  const templateData = {
    customer: clientName,
    customerName: clientName,
    clientName: clientName,
    property: propertyAddress,
    propertyAddress: propertyAddress,
    surveyor: surveyorName,
    surveyorName: surveyorName,
    surveyType: surveyType,
    jobNo: jobNo,
    reference: jobNo,
    date: formattedDate,
    actionLink: `${window.location.origin}/customer/reports`,
    downloadLink: `${window.location.origin}/customer/reports`,
    reviewLink: `${window.location.origin}/customer/leave-review`,
    trustpilotUrl: 'https://www.trustpilot.com/review/njspropertygroup.com',
    companyName: 'NJS Property Group',
    companyPhone: '0333 305 2777',
    companyEmail: 'info@njspropertygroup.com',
  };

  const defaultSubject = `Your Official RICS Survey Report is Ready: {{property_address}} - Ref: {{job_no}}`;
  const resolvedSubject = renderEmailTemplate(
    reportReadyAutomation?.subject || defaultSubject,
    templateData
  );

  const defaultBody = `Dear {{customer_name}},

Your formal RICS {{survey_type}} report for {{property_address}} (Ref: {{job_no}}) has passed Quality Assurance and is now certified and available for immediate download.

Download Your Official RICS Report:
{{action_link}}

Post-Inspection Advice:
If you would like to discuss any findings or urgent Condition 3 items with your surveyor {{surveyor_name}}, please call our team or book a consultation via your portal.

Share Your Experience with NJS Property Group:
As an independent RICS practice, we value your feedback. Please take 30 seconds to review your experience on Trustpilot:
https://www.trustpilot.com/review/njspropertygroup.com

Thank you for choosing NJS Property Group.

Warm regards,
{{surveyor_name}} & The NJS Property Group Team
Phone: 0333 305 2777 • Email: info@njspropertygroup.com`;

  const resolvedBody = renderEmailTemplate(
    reportReadyAutomation?.templateBody || defaultBody,
    templateData
  );

  // 2. Append Sent Email Log
  const emailLogRecord = {
    id: `EML-REP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    stepIndex: 5,
    stepName: 'Complete',
    stageLabel: 'Stage 8: Report Released & Trustpilot Trigger',
    subject: resolvedSubject,
    to: clientEmail,
    recipientName: clientName,
    date: formattedTime,
    status: 'Delivered',
    body: resolvedBody,
    preview: `Certified RICS report released with download button and verified Trustpilot review invite.`,
    jobNo: jobNo,
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem('property_group_sent_emails_v1') || '[]');
    localStorage.setItem(
      'property_group_sent_emails_v1',
      JSON.stringify([emailLogRecord, ...existingLogs.slice(0, 49)])
    );
    window.dispatchEvent(new Event('property_group_sent_emails_updated'));
  } catch (err) {
    console.warn('Error saving sent email log', err);
  }

  // 3. Mark delivery in localStorage flags
  localStorage.setItem('propertygroup_delivered', 'true');
  localStorage.setItem(`propertygroup_delivered_${clientEmail}`, 'true');

  // 4. Update Jobs Storage: set status: 'Completed', timelineStep: 10
  try {
    const storedJobs = JSON.parse(localStorage.getItem('propertygroup_jobs') || '[]');
    const updatedJobs = storedJobs.map((j) => {
      const match =
        j.id === jobOrRecord.id ||
        j.jobNo === jobOrRecord.jobNo ||
        j.jobNo === jobOrRecord.id ||
        (j.customerEmail && j.customerEmail.toLowerCase().trim() === clientEmail);
      if (match) {
        return {
          ...j,
          status: 'Completed',
          stage: 'COMPLETE',
          timelineStep: 10,
          reportReadyEmailSent: true,
          reportReadyEmailSentAt: formattedTime,
          deliveredAt: formattedTime,
        };
      }
      return j;
    });
    localStorage.setItem('propertygroup_jobs', JSON.stringify(updatedJobs));
    window.dispatchEvent(new Event('propertygroup_jobs_updated'));
  } catch (err) {
    console.warn('Error updating jobs storage on report release', err);
  }

  return {
    success: true,
    dispatchedAt: formattedTime,
    resolvedSubject,
    emailLogRecord,
  };
};

/**
 * Dispatch Automated Booking Confirmation Email (Trigger / Step 4 - Inspection Booked)
 * Sends official booking confirmation with appointment date, arrival time, assigned surveyor,
 * and property key access details to client and surveyor rota inbox, updating email logs.
 */
export const dispatchBookingConfirmationEmail = async (jobOrBooking, customOverrides = {}) => {
  if (!jobOrBooking) return { success: false, reason: 'Missing booking data' };

  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const formattedTime = `${formattedDate}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

  const clientEmail = (
    jobOrBooking.customerEmail ||
    jobOrBooking.clientEmail ||
    'customer@demo.com'
  ).toLowerCase().trim();
  const clientName =
    jobOrBooking.customer ||
    jobOrBooking.customerName ||
    jobOrBooking.client ||
    'Valued Client';
  const propertyAddress =
    jobOrBooking.property ||
    jobOrBooking.propertyAddress ||
    jobOrBooking.location ||
    'Subject Property, London';
  const surveyorName =
    jobOrBooking.surveyor ||
    jobOrBooking.surveyorName ||
    'test surveyor';
  const inspectionDate =
    normalizeToUKDate(jobOrBooking.date || jobOrBooking.inspectionDate) ||
    formattedDate;
  const timeSlot =
    jobOrBooking.timeSlot ||
    jobOrBooking.inspectionTime ||
    '10:00 - 13:00 (Mid-Morning)';
  const surveyType =
    jobOrBooking.surveyType ||
    jobOrBooking.serviceType ||
    'RICS Level 2 Home Survey';
  const jobNo = jobOrBooking.jobNo || jobOrBooking.id || 'JOB-2026-080';

  // 1. Fetch active email automations (step-4: Booked)
  let automations = DEFAULT_EMAIL_AUTOMATIONS;
  try {
    const rawAutomations = localStorage.getItem('property_group_email_automations_v1');
    if (rawAutomations) {
      automations = JSON.parse(rawAutomations);
    }
  } catch (e) {
    console.warn('Error reading automations storage', e);
  }

  const bookingAutomation =
    automations.find((a) => a.id === 'step-4' || a.stepIndex === 3) ||
    DEFAULT_EMAIL_AUTOMATIONS.find((a) => a.id === 'step-4');

  const templateData = {
    customer: clientName,
    customer_name: clientName,
    customerName: clientName,
    clientName: clientName,
    property: propertyAddress,
    property_address: propertyAddress,
    propertyAddress: propertyAddress,
    inspection_date: inspectionDate,
    inspectionDate: inspectionDate,
    date: inspectionDate,
    time_slot: timeSlot,
    timeSlot: timeSlot,
    surveyor: surveyorName,
    surveyor_name: surveyorName,
    surveyorName: surveyorName,
    surveyType: surveyType,
    jobNo: jobNo,
    job_no: jobNo,
    reference: jobNo,
    actionLink: `${window.location.origin}/customer/appointment-details`,
    action_link: `${window.location.origin}/customer/appointment-details`,
    portalLink: `${window.location.origin}/customer/my-dashboard`,
    companyName: 'NJS Property Group',
    companyPhone: '0333 305 2777',
    companyEmail: 'info@njspropertygroup.com',
  };

  const defaultSubject = `Site Inspection Confirmed: {{inspection_date}} with {{surveyor_name}}`;
  const resolvedSubject = renderEmailTemplate(
    bookingAutomation?.subject || defaultSubject,
    templateData
  );

  const defaultBody = `Dear {{customer_name}},

Your property inspection appointment has been locked in the calendar with chartered surveyor {{surveyor_name}}.

Appointment Details:
• Property: {{property_address}}
• Confirmed Date: {{inspection_date}}
• Surveyor Arrival Window: {{time_slot}}
• Assigned Surveyor: {{surveyor_name}} (RICS Chartered)
• Key Access: Coordinated with local estate agent

Your surveyor will carry verified RICS photo identification. If there are specific property defects or questions you would like investigated, you can add notes directly to your portal:
{{action_link}}

Warm regards,
Head of Residential Surveying | NJS Property Group`;

  const resolvedBody = renderEmailTemplate(
    bookingAutomation?.templateBody || defaultBody,
    templateData
  );

  // 2. Append Sent Email Log for Customer
  const emailLogRecord = {
    id: `EML-BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    stepIndex: 3,
    stepName: 'Booked',
    stageLabel: 'Stage 6: Inspection Booked',
    subject: resolvedSubject,
    to: clientEmail,
    recipientName: clientName,
    date: formattedTime,
    status: 'Delivered',
    body: resolvedBody,
    preview: `Site inspection confirmed for ${propertyAddress} on ${inspectionDate} (${timeSlot}) with ${surveyorName}.`,
    jobNo: jobNo,
  };

  // Also create Surveyor Allocation Email notification log
  const surveyorEmail = (
    jobOrBooking.surveyorEmail ||
    'surveyor@njspropertygroup.com'
  ).toLowerCase().trim();
  const surveyorEmailLog = {
    id: `EML-SRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    stepIndex: 3,
    stepName: 'Surveyor Allocated',
    stageLabel: 'Stage 6: Surveyor Allocation Notice',
    subject: `[INSPECTION ALLOCATED] ${jobNo}: ${propertyAddress} (${inspectionDate})`,
    to: surveyorEmail,
    recipientName: surveyorName,
    date: formattedTime,
    status: 'Delivered',
    body: `Hello ${surveyorName},\n\nYou have been allocated an on-site physical inspection:\n• Property: ${propertyAddress}\n• Date: ${inspectionDate}\n• Time Slot: ${timeSlot}\n• Client: ${clientName} (${jobOrBooking.customerPhone || 'Contact details in portal'})\n• Job Ref: ${jobNo}\n\nPlease check your diary in the Surveyor Field Portal.`,
    preview: `Surveyor rota notice: ${jobNo} allocated on ${inspectionDate} (${timeSlot}).`,
    jobNo: jobNo,
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem('property_group_sent_emails_v1') || '[]');
    localStorage.setItem(
      'property_group_sent_emails_v1',
      JSON.stringify([emailLogRecord, surveyorEmailLog, ...existingLogs.slice(0, 48)])
    );
    window.dispatchEvent(new Event('property_group_sent_emails_updated'));
  } catch (err) {
    console.warn('Error saving sent email log', err);
  }

  // 3. Persist flags in localStorage
  try {
    localStorage.setItem('propertygroup_booking_confirmed', 'true');
    if (clientEmail) {
      localStorage.setItem(`propertygroup_booking_confirmed_${clientEmail}`, 'true');
    }
  } catch {}

  // 4. Also call backend API to assign surveyor / send backend email if backend job id is known
  try {
    const backendId = jobOrBooking.backendId || (jobOrBooking.id && !String(jobOrBooking.id).startsWith('JOB-') ? jobOrBooking.id : null);
    if (backendId) {
      api.patch(`/survey-jobs/${backendId}/assign-surveyor`, {
        surveyorId: parseInt(String(jobOrBooking.surveyorId).replace(/^srv-/, '') || '1', 10),
        inspectionDate: jobOrBooking.date || jobOrBooking.inspectionDate,
        inspectionTime: timeSlot,
        keyCollectionDetails: jobOrBooking.propertyDetails?.accessDetails || 'Keys with estate agent',
      }).catch(() => {});
    }
  } catch {}

  return { success: true, emailLogRecord, surveyorEmailLog };
};
