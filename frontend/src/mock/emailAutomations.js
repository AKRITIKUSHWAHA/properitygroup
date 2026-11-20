// Customer Email Automation Store & Lifecycle Workflows
// Provides automated customer email notifications triggered across all SurveyBooker stages
// Aligned with NJS Property Group RICS standards & SurveyBooker email replication

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'property_group_email_automations_v1';
const SENT_LOG_KEY = 'property_group_sent_emails_v1';

export const DEFAULT_EMAIL_AUTOMATIONS = [
  {
    id: 'step-1',
    stepIndex: 0,
    stepName: 'Quote',
    stageLabel: 'Stage 1: Quotation Issued (LSD & Web)',
    title: 'Quotation Proposal & Inclusions Scope (New Enquiry Auto-Quote)',
    triggerEvent: 'When quotation enquiry arrives from Local Surveyors Direct (LSD) or website calculator',
    active: true,
    category: 'Pre-Inspection',
    subject: 'Your RICS Survey Quotation for {{property_address}} - Ref: {{job_no}}',
    preview: 'Formal fixed-fee proposal with 8-point inspection checklist, terms, and booking deposit option.',
    templateBody: `Dear {{customer_name}},

Thank you for instructing NJS Property Group. Please find your formal fixed-fee quotation for the {{survey_type}} at:

{{property_address}}

Total Fixed Fee: £{{quote_total}} (inc. 20% UK VAT).

Standard RICS Inclusions:
• Full physical inspection of internal & external structure
• RICS Traffic-Light Condition Ratings (Conditions 1, 2, and 3)
• Damp meter moisture profiling and thermal check
• Direct post-survey consultation with your chartered surveyor

To accept this quotation and secure your priority inspection slot:
{{action_link}}

Warm regards,
Client Services Team | NJS Property Group
Direct Helpline: 0333 305 2777`,
    tags: ['Auto-Quote', 'LSD Integration', 'Fixed Fee', 'RICS Standards'],
  },
  {
    id: 'step-quote-accepted',
    stepIndex: 10,
    stepName: 'Quotation Accepted',
    stageLabel: 'Stage 2: Quotation Accepted',
    title: 'Quotation Acceptance & Next Steps Instruction',
    triggerEvent: 'When client accepts quotation in portal or email link',
    active: true,
    category: 'Pre-Inspection',
    subject: 'Quotation Accepted: Next Steps for {{property_address}} - Ref: {{job_no}}',
    preview: 'Confirmation of quotation acceptance with links to sign terms and book appointment date.',
    templateBody: `Dear {{customer_name}},

Thank you for accepting your formal quotation for the {{survey_type}} at:
{{property_address}}

Your instruction (Ref: {{job_no}}) is now progressing through our operations desk.

Next Steps to Finalize Your Inspection:
1. Review & Digitally Sign your RICS Terms of Engagement:
   {{action_link}}
2. Confirm property access details and choose your preferred inspection window.

If there are specific defect concerns or questions for your chartered surveyor, please reply directly to this email or leave a note on your client portal.

Warm regards,
Client Services Coordination Team | NJS Property Group
Direct Helpline: 0333 305 2777 • Email: info@njspropertygroup.com`,
    tags: ['Quote Accepted', 'SurveyBooker', 'Terms Signing', 'Booking Next Steps'],
  },
  {
    id: 'step-unbooked-reminder',
    stepIndex: 11,
    stepName: 'Unbooked Chase',
    stageLabel: 'Stage 3: Unbooked Follow-Up (2-3 Days)',
    title: 'Unbooked Follow-Up Reminder (Chase Engine)',
    triggerEvent: 'When quotation is accepted but inspection date remains unbooked after 48-72 hours',
    active: true,
    category: 'Pre-Inspection',
    subject: 'Gentle Reminder: Secure your surveyor inspection slot for {{property_address}} - Ref: {{job_no}}',
    preview: 'Automated follow-up prompting customer to book their preferred surveyor appointment window.',
    templateBody: `Dear {{customer_name}},

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
Phone: 0333 305 2777 • Email: info@njspropertygroup.com`,
    tags: ['Chase Reminder', 'SurveyBooker', 'Calendar Booking', 'Unbooked Follow-Up'],
  },
  {
    id: 'step-2',
    stepIndex: 1,
    stepName: 'Paid',
    stageLabel: 'Stage 4: Payment Cleared',
    title: 'Payment Receipt & Client Onboarding Welcome Pack',
    triggerEvent: 'When client payment settles via Stripe or bank transfer',
    active: true,
    category: 'Pre-Inspection',
    subject: 'Payment Confirmed & Welcome Pack: {{property_address}}',
    preview: 'Official UK VAT invoice receipt (£{{quote_total}} inc. 20% VAT) and terms instruction.',
    templateBody: `Dear {{customer_name}},

We are pleased to confirm that your advance survey payment for {{job_no}} has been received and cleared in full.

Payment Breakdown:
• Inspected Property: {{property_address}}
• Service: {{survey_type}}
• Amount Settled: £{{quote_total}}
• Payment Method: Online Secure Gateway (Stripe)
• VAT Registration: GB 892 4192 10

Your official VAT receipt is available in your Client Portal. Please proceed to digitally review and execute your RICS Terms of Engagement:
{{action_link}}

Kind regards,
Finance & Accounts Department | NJS Property Group`,
    tags: ['VAT Receipt', 'Payment Cleared', 'Stripe', 'HMRC 20%'],
  },
  {
    id: 'step-3',
    stepIndex: 2,
    stepName: 'Accepted',
    stageLabel: 'Stage 5: Terms Executed',
    title: 'Terms of Engagement Signed Confirmation',
    triggerEvent: 'When client digitally signs RICS contract mandate',
    active: true,
    category: 'Pre-Inspection',
    subject: 'RICS Terms of Engagement Signed: {{property_address}}',
    preview: 'Digital contract execution confirmation and surveyor dispatch authorization.',
    templateBody: `Dear {{customer_name}},

Thank you for digitally executing your RICS Terms of Engagement for survey instruction {{job_no}}.

Status Update:
• Mandatory legal contract requirements are now 100% satisfied.
• Your instruction has been passed to our Logistics Coordinator to finalize surveyor key access with the vendor / estate agent.

We will notify you immediately once your surveyor's inspection window is confirmed:
{{action_link}}

Best regards,
Operations Coordination Desk | NJS Property Group`,
    tags: ['RICS Terms', 'Digital Signature', 'Legal Mandate'],
  },
  {
    id: 'step-4',
    stepIndex: 3,
    stepName: 'Booked',
    stageLabel: 'Stage 6: Inspection Booked',
    title: 'Site Inspection Confirmed & Access Logistics',
    triggerEvent: 'When surveyor slot and arrival window are locked in calendar',
    active: true,
    category: 'Logistics',
    subject: 'Site Inspection Confirmed: {{inspection_date}} with {{surveyor_name}}',
    preview: 'Confirmed inspection date, arrival window, surveyor credentials, and agent key access.',
    templateBody: `Dear {{customer_name}},

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
Head of Residential Surveying | NJS Property Group`,
    tags: ['Appointment Confirmed', 'Key Logistics', 'Surveyor Allocated'],
  },
  {
    id: 'step-5',
    stepIndex: 4,
    stepName: 'Preparing report',
    stageLabel: 'Stage 7: Survey Attended (Post-Survey)',
    title: 'Site Inspection Completed & Report Drafting (Post-Survey)',
    triggerEvent: 'When surveyor finishes physical site survey and drafts findings',
    active: true,
    category: 'Post-Inspection',
    subject: 'Site Inspection Attended: Your RICS Report is in Preparation for {{property_address}} - Ref: {{job_no}}',
    preview: 'On-site survey completed; surveyor drafting report and conducting quality review.',
    templateBody: `Dear {{customer_name}},

Site inspection attended today by your surveyor, {{surveyor_name}}. Findings and photos are currently being compiled into your formal RICS report.

What happens next:
• Your surveyor is compiling detailed element observations, photographic defect evidence, and moisture readings.
• The report will undergo our mandatory peer-review RICS Quality Assurance (QA) check.
• Standard Delivery SLA: Your certified report will be released within 48 business hours.

Track your report status in real time:
{{action_link}}

If you have urgent queries regarding immediate transaction deadlines, please reply to this message.

Warm regards,
Operations & Survey Logistics Desk | NJS Property Group
Phone: 0333 305 2777 • Email: info@njspropertygroup.com`,
    tags: ['Inspection Done', 'Drafting Report', 'QA Protocol', '48h SLA'],
  },
  {
    id: 'step-6',
    stepIndex: 5,
    stepName: 'Complete',
    stageLabel: 'Stage 8: Report Released & Trustpilot Trigger',
    title: 'Final RICS Survey Report Ready & Trustpilot Review Request',
    triggerEvent: 'When signed RICS PDF survey report is uploaded and released',
    active: true,
    category: 'Post-Inspection',
    subject: 'Your Official RICS Survey Report is Ready: {{property_address}} - Ref: {{job_no}}',
    preview: 'Download your official RICS survey report and share your feedback on Trustpilot.',
    templateBody: `Dear {{customer_name}},

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
Phone: 0333 305 2777 • Email: info@njspropertygroup.com`,
    tags: ['Final Report', 'PDF Download', 'Trustpilot Invite', 'Surveyor Debrief'],
  },
];

// Helper to auto-capitalize names (Title Case for first name and surname)
export const capitalizeName = (str) => {
  if (!str || typeof str !== 'string') return 'Valued Client';
  const trimmed = str.trim();
  if (!trimmed) return 'Valued Client';
  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (word.includes('-')) {
        return word
          .split('-')
          .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
          .join('-');
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

// Helper to resolve template variables with actual job or quotation data
export const renderEmailTemplate = (text, data = {}) => {
  if (!text) return '';
  const rawCustomer = data.customer || data.customerName || data.clientName || 'Valued Client';
  const customerName = capitalizeName(rawCustomer);
  const propertyAddress = data.property || data.propertyAddress || data.location || '14 Mayfair Gate, Mayfair, London W1K 2PB';
  const surveyType = data.surveyType || data.serviceName || 'RICS Level 2 Home Survey';
  const quoteTotal = data.quoteTotal || data.totalAmount || data.price || '650.00';
  const jobNo = data.jobNo || data.reference || data.lead_ref || data.jobRef || 'JOB-2026-080';
  const rawSurveyor = data.surveyor || data.surveyorName || 'Assigned Chartered Surveyor';
  const surveyorName = capitalizeName(rawSurveyor);
  const inspectionDate = data.date || data.inspectionDate || 'Wednesday, 28 October 2026';
  const timeSlot = data.timeSlot || data.arrivalWindow || '09:30 AM - 12:00 PM';
  const actionLink = data.actionLink || data.bookingLink || data.portalLink || 'https://njspropertygroup.com/customer/portal';
  const companyName = 'NJS Property Group';
  const companyPhone = '0333 305 2777';
  const companyEmail = 'info@njspropertygroup.com';

  return text
    .replace(/\{{1,2}(customer_name|client_name|name)\}{1,2}/gi, customerName)
    .replace(/\{{1,2}(property_address|property|address|location)\}{1,2}/gi, propertyAddress)
    .replace(/\{{1,2}(survey_type|service|service_name)\}{1,2}/gi, surveyType)
    .replace(/\{{1,2}(quote_total|total_fee|quote_price|fee|price|amount)\}{1,2}/gi, quoteTotal)
    .replace(/\{{1,2}(job_no|reference|lead_ref|job_ref)\}{1,2}/gi, jobNo)
    .replace(/\{{1,2}(surveyor_name|surveyor)\}{1,2}/gi, surveyorName)
    .replace(/\{{1,2}(inspection_date|appointment_date|date)\}{1,2}/gi, inspectionDate)
    .replace(/\{{1,2}(time_slot|arrival_window|slot)\}{1,2}/gi, timeSlot)
    .replace(/\{{1,2}(action_link|booking_link|portal_link|review_link)\}{1,2}/gi, actionLink)
    .replace(/\{{1,2}(company_name)\}{1,2}/gi, companyName)
    .replace(/\{{1,2}(company_phone|phone)\}{1,2}/gi, companyPhone)
    .replace(/\{{1,2}(company_email|email)\}{1,2}/gi, companyEmail);
};

export const useEmailAutomations = () => {
  const [automations, setAutomations] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all default steps are present
        const merged = DEFAULT_EMAIL_AUTOMATIONS.map((def) => {
          const match = parsed.find((p) => p.id === def.id);
          return match ? { ...def, ...match } : def;
        });
        // Preserve any custom templates added by admin
        const extraCustom = parsed.filter(
          (p) => !DEFAULT_EMAIL_AUTOMATIONS.some((def) => def.id === p.id)
        );
        return [...merged, ...extraCustom];
      }
    } catch (e) {
      console.warn('Failed to parse email automations from storage', e);
    }
    return DEFAULT_EMAIL_AUTOMATIONS;
  });

  const [sentLogs, setSentLogs] = useState(() => {
    try {
      const stored = localStorage.getItem(SENT_LOG_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse sent email logs', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(automations));
    } catch (e) {
      console.error(e);
    }
  }, [automations]);

  useEffect(() => {
    try {
      localStorage.setItem(SENT_LOG_KEY, JSON.stringify(sentLogs));
    } catch (e) {
      console.error(e);
    }
  }, [sentLogs]);

  const toggleAutomation = (id) => {
    setAutomations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const updateAutomation = (id, fields) => {
    setAutomations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...fields } : item))
    );
  };

  const resetAutomations = () => {
    setAutomations(DEFAULT_EMAIL_AUTOMATIONS);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Helper alias to resolve template variables with actual job data
  const renderTemplate = (text, data = {}) => renderEmailTemplate(text, data);

  // Dispatch an automated step email
  const dispatchStepEmail = (stepIdentifier, jobData = {}) => {
    const automation = automations.find((a) =>
      typeof stepIdentifier === 'number'
        ? a.stepIndex === stepIdentifier
        : a.id === stepIdentifier || a.stepName === stepIdentifier
    );
    if (!automation) return null;

    if (!automation.active) {
      return {
        wasSent: false,
        reason: 'Automation currently paused by Admin',
        automation,
      };
    }

    const resolvedSubject = renderTemplate(automation.subject, jobData);
    const resolvedBody = renderTemplate(automation.templateBody, jobData);
    const recipientEmail = jobData.customerEmail || 'customer@demo.com';
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-GB')}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const emailRecord = {
      id: `EML-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stepIndex: automation.stepIndex,
      stepName: automation.stepName,
      stageLabel: automation.stageLabel,
      subject: resolvedSubject,
      to: recipientEmail,
      recipientName: capitalizeName(jobData.customer || jobData.customerName || 'Customer'),
      date: formattedDate,
      status: 'Delivered',
      body: resolvedBody,
      preview: automation.preview,
      jobNo: jobData.jobNo || jobData.reference || 'JOB-2026-080',
    };

    setSentLogs((prev) => [emailRecord, ...prev.slice(0, 49)]);

    return {
      wasSent: true,
      emailRecord,
      automation,
    };
  };

  return {
    automations,
    sentLogs,
    toggleAutomation,
    updateAutomation,
    resetAutomations,
    renderTemplate,
    dispatchStepEmail,
  };
};
