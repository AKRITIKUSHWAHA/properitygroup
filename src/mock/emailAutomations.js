// Customer Email Automation Store & Lifecycle Workflows
// Provides automated customer email notifications triggered across all 6 SurveyBooker stages

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'property_group_email_automations_v1';
const SENT_LOG_KEY = 'property_group_sent_emails_v1';

export const DEFAULT_EMAIL_AUTOMATIONS = [
  {
    id: 'step-1',
    stepIndex: 0,
    stepName: 'Quote',
    stageLabel: 'Stage 1: Quotation Issued',
    title: 'Quotation Proposal & Inclusions Scope',
    triggerEvent: 'When quotation is created or sent to customer',
    active: true,
    subject: 'Your RICS Survey Quotation for {{property_address}} - Ref: {{job_no}}',
    preview: 'Formal fixed-fee proposal with 8-point inspection checklist, terms, and booking deposit option.',
    templateBody: `Dear {{customer_name}},

Thank you for instructing UK Property Surveying Practice. Please find your formal fixed-fee quotation for the {{survey_type}} at:

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
Client Services Team | UK Property Surveying Practice`,
    tags: ['Quote Proposal', 'Fixed Fee', 'RICS Standards'],
  },
  {
    id: 'step-2',
    stepIndex: 1,
    stepName: 'Paid',
    stageLabel: 'Stage 2: Payment Cleared',
    title: 'Payment Receipt & Client Onboarding Welcome Pack',
    triggerEvent: 'When client payment settles via Stripe or bank transfer',
    active: true,
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
Finance & Accounts Department`,
    tags: ['VAT Receipt', 'Payment Cleared', 'Stripe'],
  },
  {
    id: 'step-3',
    stepIndex: 2,
    stepName: 'Accepted',
    stageLabel: 'Stage 3: Terms Executed',
    title: 'Terms of Engagement Signed Confirmation',
    triggerEvent: 'When client digitally signs RICS contract mandate',
    active: true,
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
Operations Coordination Desk`,
    tags: ['RICS Terms', 'Digital Signature', 'Legal Mandate'],
  },
  {
    id: 'step-4',
    stepIndex: 3,
    stepName: 'Booked',
    stageLabel: 'Stage 4: Inspection Booked',
    title: 'Site Inspection Confirmed & Access Logistics',
    triggerEvent: 'When surveyor slot and arrival window are locked in calendar',
    active: true,
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
Head of Residential Surveying`,
    tags: ['Appointment Confirmed', 'Key Logistics', 'Surveyor Allocated'],
  },
  {
    id: 'step-5',
    stepIndex: 4,
    stepName: 'Preparing report',
    stageLabel: 'Stage 5: Survey Attended',
    title: 'Site Inspection Completed & Report Drafting',
    triggerEvent: 'When surveyor finishes physical site survey and drafts findings',
    active: true,
    subject: 'Site Inspection Completed at {{property_address}}',
    preview: 'On-site survey completed; surveyor drafting report and conducting quality review.',
    templateBody: `Dear {{customer_name}},

We are pleased to inform you that {{surveyor_name}} has completed the physical on-site inspection of {{property_address}} today.

Next Steps:
• Surveyor is compiling photo defect evidence, moisture readings, and structural notes.
• The draft document will pass through our mandatory peer-review Quality Assurance protocol.
• Target Release SLA: Within 48 business hours.

Track live preparation progress anytime in your Client Portal:
{{action_link}}

Kind regards,
Surveyor Reporting Unit`,
    tags: ['Inspection Done', 'Drafting Report', 'QA Protocol'],
  },
  {
    id: 'step-6',
    stepIndex: 5,
    stepName: 'Complete',
    stageLabel: 'Stage 6: Report Released',
    title: 'Final RICS Survey Report Ready for Download',
    triggerEvent: 'When signed RICS PDF survey report is uploaded and released',
    active: true,
    subject: 'Your Official RICS Survey Report is Ready: {{property_address}}',
    preview: 'Secure 1-click download link for official RICS PDF report and surveyor debrief hotline.',
    templateBody: `Dear {{customer_name}},

Your finalized, peer-reviewed RICS Survey Report for {{property_address}} is complete and ready for immediate download.

Download Report:
Please log in to your secure client portal below to download your full signed PDF report:
{{action_link}}

Post-Inspection Surveyor Consultation:
Your surveyor {{surveyor_name}} is available to discuss any urgent Condition 3 defects or valuation notes with you over the phone.

Thank you for choosing UK Property Surveying Practice.

Best regards,
Director of Professional Services`,
    tags: ['Final Report', 'PDF Download', 'Surveyor Debrief'],
  },
];

export const useEmailAutomations = () => {
  const [automations, setAutomations] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
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

  // Helper to resolve template variables with actual job data
  const renderTemplate = (text, data = {}) => {
    if (!text) return '';
    return text
      .replace(/\{\{customer_name\}\}/g, data.customer || 'Valued Client')
      .replace(/\{\{property_address\}\}/g, data.property || data.location || '14 Mayfair Gate, London')
      .replace(/\{\{survey_type\}\}/g, data.surveyType || 'RICS Level 2 Home Survey')
      .replace(/\{\{quote_total\}\}/g, data.quoteTotal || '650.00')
      .replace(/\{\{job_no\}\}/g, data.jobNo || 'JOB-2026-080')
      .replace(/\{\{surveyor_name\}\}/g, data.surveyor || 'David Thorne MRICS')
      .replace(/\{\{inspection_date\}\}/g, data.date || 'Tomorrow, 10:00 AM')
      .replace(/\{\{time_slot\}\}/g, data.timeSlot || '09:30 AM - 12:00 PM')
      .replace(/\{\{action_link\}\}/g, 'https://propertygroup.co.uk/customer/portal');
  };

  // Dispatch an automated step email
  const dispatchStepEmail = (stepIndex, jobData = {}) => {
    const automation = automations.find((a) => a.stepIndex === stepIndex);
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
      stepIndex,
      stepName: automation.stepName,
      stageLabel: automation.stageLabel,
      subject: resolvedSubject,
      to: recipientEmail,
      recipientName: jobData.customer || 'Customer',
      date: formattedDate,
      status: 'Delivered',
      body: resolvedBody,
      preview: automation.preview,
      jobNo: jobData.jobNo || 'JOB-2026-080',
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

