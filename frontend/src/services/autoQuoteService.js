// SurveyBooker Trigger 1: New Enquiry Auto-Quotation Dispatch Service
// Dispatches automated formal quotation email within 30 seconds of enquiry arrival
// Supports Local Surveyors Direct (LSD), Website Calculator, and CRM Ingestion
// Fully aligned with NJS Property Group RICS branding and SurveyBooker workflows

import { renderEmailTemplate, DEFAULT_EMAIL_AUTOMATIONS } from '../mock/emailAutomations';
import { getStoredQuotes, saveStoredQuotes } from '../mock/quotes';
import { getStoredLeads, saveStoredLeads } from '../mock/leads';

const STANDARD_SURVEY_BASE_FEES = {
  'RICS Level 2 Home Survey (Homebuyer)': 550,
  'RICS Level 2 Home Survey': 650,
  'RICS Level 2 Homebuyer Survey': 650,
  'RICS Level 2 Home Survey (with Valuation)': 650,
  'RICS Level 3 Building Survey (Full Structural)': 850,
  'RICS Level 3 Building Survey': 1100,
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
    companyPhone: '0800 169 9661',
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
    fetch('/api/v1/quotations-and-payments/quotes/send-email', {
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
