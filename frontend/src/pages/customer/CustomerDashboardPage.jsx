import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  FileText,
  CalendarCheck,
  Building2,
  PenTool,
  CheckCircle2,
  Clock,
  MapPin,
  Download,
  Plus,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Phone,
  ArrowRight,
  Sparkles,
  Receipt,
  FileSpreadsheet,
  Mail,
  Eye,
  Star,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/ToastContext';
import { Modal } from '../../components/common/Modal';
import { useJobs, getStoredJobs, saveStoredJobs } from '../../mock/jobs';
import { getStoredLeads, saveStoredLeads } from '../../mock/leads';
import { getStoredQuotes } from '../../mock/quotes';
import { SurveyProgressTracker, computeRICSStage } from '../../components/customer/SurveyProgressTracker';
import {
  JOB_STAGES,
  JOB_STAGE_STEPS,
  JOB_STAGE_LABELS,
  normalizeJobStage,
  getStageStep,
  getStageLabel,
} from '../../utils/jobStages';
import { customerDashboardApi, customerTrackSurveyApi } from '../../api/customerApi';
import { publicApi } from '../../api/publicApi';
import { emitNotification } from '../../utils/notificationService';
import { useEffect } from 'react';
import { downloadReportPDF } from '../../utils/pdfGenerator';

// Strict customer isolation matcher
const isJobForCustomer = (job, user) => {
  if (!job || !user) return false;
  const uEmail = (user.email || '').toLowerCase().trim();
  const uName = (user.name || '').toLowerCase().trim();
  const jEmail = (job.customerEmail || job.clientEmail || '').toLowerCase().trim();
  const jAlt = (job.customerAltEmail || '').toLowerCase().trim();
  const jDemo = (job.customerDemoEmail || '').toLowerCase().trim();
  const jName = (job.customer || job.customerName || job.client || '').toLowerCase().trim();

  // If email matches, that is definitive
  if (uEmail && jEmail && uEmail === jEmail) return true;
  if (uEmail && jAlt && uEmail === jAlt) return true;
  if (uEmail && jDemo && uEmail === jDemo) return true;

  if (uEmail === 'customer@demo.com' || uName.includes('emma')) {
    return jEmail === 'customer@demo.com' || jName.includes('emma');
  }

  if (uEmail.includes('harrison') || uEmail === 'customer2@demo.com' || uName.includes('harrison')) {
    return jEmail.includes('harrison') || jAlt.includes('harrison') || jDemo.includes('customer2') || jName.includes('harrison');
  }

  // Name match ONLY if exact full match and not generic word
  const genericNames = ['customer', 'client', 'user', 'test', 'admin', 'surveyor', 'njs'];
  if (uName && jName && uName === jName && !genericNames.includes(uName)) {
    return true;
  }

  return false;
};

// Dynamic completed & delivered checker across customer lifecycle
const isJobDelivered = (j) => {
  if (!j) return false;
  const s = (j.status || '').toLowerCase().trim();
  const stg = (j.stage || '').toLowerCase().trim();

  return (
    s === 'completed' ||
    s === 'delivered' ||
    stg === 'complete' ||
    stg === 'completed' ||
    (j.timelineStep || 0) >= 10
  );
};

export const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { jobs, addJob, updateJob } = useJobs();

  const myCustomerJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const userEmail = (user?.email || '').toLowerCase().trim();
  const [selectedJobId, setSelectedJobId] = useState(() => myCustomerJobs[0]?.id || null);

  const [apiActiveJob, setApiActiveJob] = useState(null);
  const [apiTracking, setApiTracking] = useState(null);

  // Sync Customer Dashboard & Tracking from live backend API
  useEffect(() => {
    Promise.all([
      customerDashboardApi.getDashboard().catch(() => null),
      customerTrackSurveyApi.getTracking().catch(() => null),
    ]).then(([dashRes, trackRes]) => {
      const dashPayload = dashRes?.activeJob ? dashRes : (dashRes?.data || dashRes);
      const trackPayload = trackRes?.currentStage || trackRes?.currentStep ? trackRes : (trackRes?.data || trackRes);

      if (trackPayload) {
        setApiTracking(trackPayload);
      }

      if (dashPayload?.activeJob) {
        setApiActiveJob(dashPayload.activeJob);
        // Synchronize with in-memory jobs list so all tabs/pages stay in sync
        try {
          const storedJobs = [...getStoredJobs()];
          const jobRef = dashPayload.activeJob.reference || dashPayload.activeJob.id;
          const idx = storedJobs.findIndex(
            (j) => j.id === jobRef || (userEmail && (j.customerEmail || '').toLowerCase() === userEmail)
          );
          const rawStage = dashPayload.activeJob.stage || trackPayload?.currentStage;
          const normStage = normalizeJobStage(rawStage);
          const isDelivered = normStage === 'COMPLETE' || (trackPayload?.currentStep || 0) >= 10;
          const isQA = normStage === 'QA_REVIEW' || (trackPayload?.currentStep || 0) >= 9 || (dashPayload.activeJob.timelineStep || 0) >= 9;
          const isDrafting = normStage === 'DRAFTING' || (trackPayload?.currentStep || 0) === 8;
          const isInspected = normStage === 'INSPECTED' || (trackPayload?.currentStep || 0) >= 7;
          const isBooked = normStage === 'BOOKED' || (trackPayload?.currentStep || 0) >= 6;
          const hasPaid = normStage === 'PAID' || dashPayload.activeJob.invoices?.some((i) => i.status === 'PAID') || dashPayload.activeJob.paymentStatus === 'PAID' || dashPayload.activeJob.paymentStatus === 'Paid';
          const isPaymentClaimed = (dashPayload.activeJob.paymentStatus || '').toLowerCase().includes('claimed');
          const isTermsSigned = normStage === 'TERMS_SIGNED' || (dashPayload.activeJob.termsStatus || '').toLowerCase() === 'signed' || dashPayload.activeJob.terms?.some((t) => t.signed);
          const isAccepted = normStage === 'QUOTE_ACCEPTED' || dashPayload.activeJob.status === 'Accepted' || (dashPayload.activeJob.quoteStatus || '').toLowerCase() === 'accepted';
          const isQuoted = normStage === 'QUOTE_ISSUED' || dashPayload.activeJob.status === 'Quoted';

          const fallbackStep = isDelivered ? 10 : isQA ? 9 : isDrafting ? 8 : isInspected ? 7 : isBooked ? 6 : (hasPaid || isPaymentClaimed) ? 5 : isTermsSigned ? 4 : isAccepted ? 3 : isQuoted ? 2 : 1;
          const calculatedStep = Math.max(
            Number(trackPayload?.currentStep) || 0,
            Number(dashPayload.activeJob.timelineStep) || 0,
            getStageStep(normStage) || fallbackStep
          );

          const syncedStatus = getStageLabel(normStage) || (isDelivered
            ? 'Completed'
            : isQA
            ? 'QA_Review'
            : isDrafting
            ? 'Drafting'
            : isInspected
            ? 'Inspected'
            : isBooked
            ? 'Booked'
            : hasPaid
            ? 'Paid'
            : isPaymentClaimed
            ? 'Payment Claimed'
            : isTermsSigned
            ? 'Terms Signed'
            : isAccepted
            ? 'Accepted'
            : isQuoted
            ? 'Quoted'
            : 'Enquiry');

          const parsedTotalFee = parseFloat(String(dashPayload.activeJob.totalFee || dashPayload.stats?.totalFee || '').replace(/[^0-9.]/g, ''));
          const resolvedApiTotal = dashPayload.activeJob.invoices?.[0]?.total || (!isNaN(parsedTotalFee) && parsedTotalFee > 0 ? parsedTotalFee : null);
          const resolvedApiBase = dashPayload.activeJob.invoices?.[0]?.subtotal || (resolvedApiTotal ? Math.round((resolvedApiTotal / 1.2) * 100) / 100 : null);

          // If backend says current job is only at Step 1 or 2, purge any stale milestone flags for this email
          if (calculatedStep <= 2 && userEmail) {
            try {
              localStorage.removeItem(`propertygroup_quote_accepted_${userEmail}`);
              localStorage.removeItem(`propertygroup_terms_signed_${userEmail}`);
              localStorage.removeItem(`propertygroup_payment_claimed_${userEmail}`);
              localStorage.removeItem(`propertygroup_payment_paid_${userEmail}`);
              localStorage.removeItem(`propertygroup_booking_confirmed_${userEmail}`);
            } catch (err) {
              console.warn('Failed to clear customer workflow cache:', err);
            }
          }

          const syncedData = {
            id: jobRef,
            jobNo: jobRef,
            dbId: dashPayload.activeJob.id,
            customer: dashPayload.activeJob.clientName || user?.name || 'Customer',
            clientName: dashPayload.activeJob.clientName || user?.name || 'Customer',
            customerEmail: userEmail || dashPayload.activeJob.clientEmail || '',
            clientEmail: userEmail || dashPayload.activeJob.clientEmail || '',
            customerPhone: dashPayload.activeJob.clientPhone || '',
            clientPhone: dashPayload.activeJob.clientPhone || '',
            property: dashPayload.activeJob.propertyAddress || dashPayload.activeJob.property,
            propertyAddress: dashPayload.activeJob.propertyAddress || dashPayload.activeJob.property,
            surveyType: dashPayload.activeJob.serviceType,
            status: syncedStatus,
            stage: dashPayload.activeJob.stage || (isDelivered ? 'COMPLETE' : (isQA ? 'QA_REVIEW' : (isBooked ? 'BOOKED' : (hasPaid ? 'PAID' : (isTermsSigned ? 'SIGNED' : (isAccepted ? 'ACCEPTED' : (isQuoted ? 'QUOTE' : 'ENQUIRY'))))))),
            timelineStep: calculatedStep,
            surveyor: dashPayload.activeJob.surveyor?.name || dashPayload.activeJob.surveyor || 'Pending Allocation',
            date: dashPayload.activeJob.inspectionDate ? new Date(dashPayload.activeJob.inspectionDate).toLocaleDateString('en-GB') : 'Date: TBD',
            timeSlot: dashPayload.activeJob.inspectionTime || 'Time: TBD',
            termsStatus: (isTermsSigned || calculatedStep >= 4 || isBooked || isInspected || isQA || isDelivered) ? 'Signed' : 'Pending',
            paymentStatus: (hasPaid || calculatedStep > 5 || isBooked || isInspected || isQA || isDelivered) ? 'Paid' : (isPaymentClaimed ? 'Claimed (Verification Pending)' : 'Pending'),
            invoices: dashPayload.activeJob.invoices || [],
            terms: dashPayload.activeJob.terms || [],
            quote: {
              total: resolvedApiTotal,
              baseFee: resolvedApiBase,
            },
            totalAmount: resolvedApiTotal,
            totalFee: dashPayload.activeJob.totalFee || null,
          };

          if (idx >= 0) {
            storedJobs[idx] = { ...storedJobs[idx], ...syncedData };
          } else {
            storedJobs.unshift(syncedData);
          }
          saveStoredJobs(storedJobs);
        } catch (err) {
          console.warn('Failed to update stored jobs cache:', err);
        }
      }
    });
  }, [userEmail]);

  const baseJob = myCustomerJobs.find((j) => j.id === selectedJobId) || myCustomerJobs[0] || null;
  const rawApiStage = apiActiveJob?.stage || apiTracking?.currentStage || baseJob?.stage;
  const normApiStage = normalizeJobStage(rawApiStage);
  const isApiJobDelivered = normApiStage === 'COMPLETE' || (apiTracking?.currentStep || 0) >= 10;
  const isApiJobQA = normApiStage === 'QA_REVIEW' || (apiTracking?.currentStep || 0) === 9;
  const isApiJobDrafting = normApiStage === 'DRAFTING' || (apiTracking?.currentStep || 0) === 8;
  const isApiJobInspected = normApiStage === 'INSPECTED' || (apiTracking?.currentStep || 0) === 7;
  const isApiJobBooked = normApiStage === 'BOOKED' || (apiTracking?.currentStep || 0) >= 6;
  const isApiJobPaid = normApiStage === 'PAID' || apiActiveJob?.invoices?.some((i) => i.status === 'PAID') || apiActiveJob?.paymentStatus === 'PAID' || apiActiveJob?.paymentStatus === 'Paid';
  const isApiJobClaimed =
    (apiActiveJob?.paymentStatus || '').toLowerCase().includes('claimed') ||
    (apiTracking?.paymentStatus || '').toLowerCase().includes('claimed') ||
    Boolean(apiActiveJob?.invoices?.some((i) => i.paymentMethod === 'BACS_TRANSFER_CLAIMED' && i.status !== 'PAID'));
  const isApiJobSigned = normApiStage === 'TERMS_SIGNED' || (apiActiveJob?.termsStatus || '').toLowerCase() === 'signed' || apiActiveJob?.terms?.some((t) => t.signed);
  const isApiJobAccepted = normApiStage === 'QUOTE_ACCEPTED' || apiActiveJob?.status === 'Accepted';
  const isApiJobQuoted = normApiStage === 'QUOTE_ISSUED' || apiActiveJob?.status === 'Quoted';

  const apiFallbackStep = isApiJobDelivered ? 10 : isApiJobQA ? 9 : isApiJobDrafting ? 8 : isApiJobInspected ? 7 : isApiJobBooked ? 6 : (isApiJobPaid || isApiJobClaimed) ? 5 : isApiJobSigned ? 4 : isApiJobAccepted ? 3 : isApiJobQuoted ? 2 : 1;
  const apiStepNumber = Math.max(
    Number(apiTracking?.currentStep) || 0,
    Number(apiActiveJob?.timelineStep) || 0,
    getStageStep(normApiStage) || apiFallbackStep
  );

  const activeJob = (baseJob || apiActiveJob) ? {
    ...(baseJob || {}),
    ...(apiActiveJob || {}),
    id: baseJob?.id || apiActiveJob?.reference || apiActiveJob?.id,
    jobNo: baseJob?.jobNo || apiActiveJob?.reference || apiActiveJob?.id,
    property: baseJob?.property || apiActiveJob?.propertyAddress || apiActiveJob?.property || 'Subject Property',
    propertyAddress: baseJob?.propertyAddress || apiActiveJob?.propertyAddress || baseJob?.property || 'Subject Property',
    surveyType: baseJob?.surveyType || apiActiveJob?.serviceType || 'RICS Level 2 Home Survey',
    surveyor: (() => {
      const sVal = typeof baseJob?.surveyor === 'object' ? (baseJob?.surveyor?.name || '') : String(baseJob?.surveyor || '');
      if (sVal && !['pending allocation', 'unassigned', 'tbd', 'none', ''].includes(sVal.toLowerCase().trim())) {
        return sVal;
      }
      return apiActiveJob?.surveyor?.name || (typeof apiActiveJob?.surveyor === 'string' ? apiActiveJob.surveyor : 'Pending Allocation');
    })(),
    date: (() => {
      const dVal = String(baseJob?.date || '').toLowerCase().trim();
      if (dVal && !['date: tbd', 'pending scheduling', 'tbd', ''].includes(dVal)) {
        return baseJob.date;
      }
      return apiActiveJob?.inspectionDate ? new Date(apiActiveJob.inspectionDate).toLocaleDateString('en-GB') : (baseJob?.date || 'Date: TBD');
    })(),
    timeSlot: (() => {
      const tVal = String(baseJob?.timeSlot || '').toLowerCase().trim();
      if (tVal && !['time: tbd', ''].includes(tVal)) {
        return baseJob.timeSlot;
      }
      return apiActiveJob?.inspectionTime || baseJob?.timeSlot || 'Time: TBD';
    })(),
    timelineStep: Math.max(
      Number(baseJob?.timelineStep) || 0,
      Number(apiActiveJob?.timelineStep) || 0,
      apiStepNumber,
      1
    ),
    status: getStageLabel(normApiStage) || (isApiJobPaid ? 'Paid' : (baseJob?.status || apiActiveJob?.status || 'Enquiry')),
    stage: normApiStage || 'ENQUIRY',
    paymentStatus: (isApiJobPaid || baseJob?.paymentStatus === 'Paid')
      ? 'Paid'
      : isApiJobClaimed
      ? 'Claimed (Verification Pending)'
      : (baseJob?.paymentStatus || apiActiveJob?.paymentStatus || 'Pending'),
    termsStatus: (baseJob?.termsStatus === 'Signed' || isApiJobSigned || apiActiveJob?.terms?.[0]?.signed || isApiJobDelivered || (apiTracking?.currentStep || 0) >= 4) ? 'Signed' : 'Pending',
  } : null;

  const historyJobs = myCustomerJobs.filter((j) => j.id !== activeJob?.id);
  const customerJob = activeJob;

  const isDeliveredActive = isJobDelivered(customerJob, userEmail);
  const currentStageStep = isDeliveredActive ? 10 : computeRICSStage(customerJob, apiTracking, userEmail);
  const resolvedCustomerJob = customerJob
    ? {
        ...customerJob,
        status: isDeliveredActive ? 'Completed' : customerJob.status,
        timelineStep: currentStageStep,
        paymentStatus: isDeliveredActive ? 'Paid' : customerJob.paymentStatus,
      }
    : null;
  const customerEmails = customerJob?.emails || [];
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookForm, setBookForm] = useState({
    property: '',
    location: '',
    surveyType: 'RICS Level 2 Home Survey',
    preferredDate: '',
  });

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setIsBookModalOpen(false);

    const newJobId = `JOB-2026-${Math.floor(100 + Math.random() * 899)}`;
    const newJob = {
      id: newJobId,
      jobNo: newJobId,
      customer: user?.name || 'Client',
      customerEmail: userEmail || user?.email || 'customer@demo.com',
      customerPhone: user?.phone || '',
      property: bookForm.property,
      location: bookForm.location,
      postcode: bookForm.location,
      surveyType: bookForm.surveyType,
      status: 'Enquiry',
      stage: 'enquiry',
      timelineStep: 1,
      termsStatus: 'Pending',
      paymentStatus: 'Pending',
      date: bookForm.preferredDate || 'Date: TBD',
      timeSlot: 'Time: TBD',
      surveyor: 'Pending Allocation',
      createdAt: new Date().toLocaleDateString('en-GB'),
      isNewInstruction: true,
      quote: null, // Turn off automated fee! Fee will be estimated and provided by NJS Practice
      activityLog: [
        {
          id: Date.now(),
          time: `${new Date().toLocaleDateString('en-GB')}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
          text: `Survey instruction enquiry submitted by ${user?.name || 'Client'} for ${bookForm.property}. Quote pending estimation.`,
        },
      ],
    };

    if (addJob) {
      addJob(newJob);
    }

    setSelectedJobId(newJobId);

    // Pull enquiry into in-memory CRM leads list
    try {
      const storedLeads = getStoredLeads();
      const newLeadEntry = {
        id: newJobId,
        reference: newJobId,
        customerName: user?.name || 'Private Client',
        clientName: user?.name || 'Private Client',
        customer: user?.name || 'Private Client',
        customerEmail: userEmail || user?.email || '',
        clientEmail: userEmail || user?.email || '',
        customerPhone: user?.phone || '',
        property: bookForm.property,
        location: bookForm.location,
        postcode: bookForm.location,
        enquiry: bookForm.surveyType,
        surveyType: bookForm.surveyType,
        serviceType: bookForm.surveyType,
        propertyType: 'Residential',
        status: 'New',
        stage: 'NEW',
        source: 'Customer Portal',
        estimatedValue: null, // Point 3: Turned off auto-fee!
        createdAt: new Date().toISOString(),
      };
      saveStoredLeads([newLeadEntry, ...storedLeads.filter((l) => l.id !== newJobId)]);
    } catch (err) {
      console.warn('Failed to save lead entry to local cache:', err);
    }

    // In-App Instant Notification to Admin
    try {
      emitNotification({
        role: 'ADMIN',
        title: `New Survey Quote Request - ${user?.name || 'Customer'}`,
        desc: `${user?.name || 'Customer'} requested a quote for ${bookForm.property} (${bookForm.surveyType}). Awaiting fee estimation.`,
        type: 'CRM_LEAD',
        link: '/admin/crm-leads',
      });
    } catch (err) {
      console.warn('Failed to emit admin quote notification:', err);
    }

    // Pull enquiry through to Backend DB & trigger email notifications to Admin (Bug 4)
    try {
      await publicApi.submitQuoteEnquiry({
        customerName: user?.name || 'Client',
        customerEmail: userEmail || user?.email || 'customer@demo.com',
        customerPhone: user?.phone || '',
        propertyAddress: bookForm.property,
        propertyPostcode: bookForm.location,
        serviceName: bookForm.surveyType,
        serviceId: bookForm.surveyType,
        enquiryCategory: 'SURVEY_QUOTE',
        sourcePage: '/customer/dashboard',
      }).catch((err) => {
        console.warn('Public quote enquiry sync error:', err);
      });
    } catch (err) {
      console.warn('Public quote enquiry dispatch skipped:', err);
    }

    setSelectedJobId(newJobId);

    addToast({
      type: 'success',
      title: 'Survey Instruction Received',
      message: `Your booking request for ${bookForm.property} has been logged as enquiry #${newJobId}. Our estimating team will issue your fixed-price quote shortly.`,
    });
    setBookForm({ property: '', location: '', surveyType: 'RICS Level 2 Home Survey', preferredDate: '' });
  };

  const handleDownloadReport = (reportName, property = resolvedCustomerJob?.property || 'Subject Property', surveyor = resolvedCustomerJob?.surveyor || 'Assigned Chartered Surveyor') => {
    downloadReportPDF({
      jobNo: resolvedCustomerJob?.id || 'JOB-2026-080',
      clientName: user?.name || resolvedCustomerJob?.customer || 'Client',
      property,
      surveyorName: surveyor,
    });
    addToast({
      type: 'success',
      title: 'Downloading Survey Report',
      message: `${reportName} downloaded successfully to your device.`,
    });
  };

  const allCustomerJobs = myCustomerJobs.length > 0 ? myCustomerJobs : (customerJob ? [customerJob] : []);
  const completedReports = allCustomerJobs.filter((j) => isJobDelivered(j, userEmail));
  const confirmedBookings = allCustomerJobs.filter((j) => !isJobDelivered(j, userEmail) && (j.status === 'Booked' || j.status === 'Scheduled' || (j.timelineStep || 0) >= 6));
  const activeBookings = allCustomerJobs.filter((j) => !isJobDelivered(j, userEmail) && j.status !== 'Cancelled');
  const pendingQuotes = allCustomerJobs.filter((j) => !isJobDelivered(j, userEmail) && (j.status === 'Quoted' || (j.timelineStep === 2)));

  // Dynamic isolated stat cards
  const resolvedFee = (() => {
    let fee =
      customerJob?.quote?.total ||
      (customerJob?.quote?.baseFee ? customerJob.quote.baseFee * 1.2 : null) ||
      customerJob?.totalAmount ||
      customerJob?.agreedFee ||
      customerJob?.invoices?.[0]?.total ||
      apiActiveJob?.invoices?.[0]?.total ||
      (customerJob?.totalFee ? parseFloat(String(customerJob.totalFee).replace(/[^0-9.]/g, '')) : null);
    if (fee && !isNaN(Number(fee)) && Number(fee) > 0) return Number(fee);
    if (apiActiveJob?.stats?.totalFee) {
      const parsed = parseFloat(String(apiActiveJob.stats.totalFee).replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    try {
      const allQuotes = getStoredQuotes();
      const matchQuote = allQuotes.find((q) => {
        const qEmail = (q.clientEmail || q.customerEmail || '').toLowerCase().trim();
        return (qEmail && userEmail && qEmail === userEmail) || (customerJob?.id && (q.id === customerJob.id || q.jobNo === customerJob.id || q.jobId === customerJob.id));
      });
      if (matchQuote) {
        const qFee = matchQuote.totalAmount || (matchQuote.baseFee ? matchQuote.baseFee * 1.2 : null) || matchQuote.total;
        if (qFee && !isNaN(Number(qFee)) && Number(qFee) > 0) return Number(qFee);
      }
      const allLeads = getStoredLeads();
      const matchLead = allLeads.find((l) => {
        const lEmail = (l.customerEmail || l.clientEmail || '').toLowerCase().trim();
        return (lEmail && userEmail && lEmail === userEmail) || (customerJob?.id && (l.id === customerJob.id || l.reference === customerJob.id));
      });
      if (matchLead && matchLead.estimatedValue) {
        const num = parseFloat(String(matchLead.estimatedValue).replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) return num;
      }
    } catch (err) {
      console.warn('Failed to parse quote amount:', err);
    }
    return null;
  })();

  const statCards = [
    {
      id: 'bookings',
      title: 'Active Bookings',
      value: `${confirmedBookings.length} Active`,
      subtext: confirmedBookings.length > 0
        ? `${confirmedBookings[0].property || confirmedBookings[0].propertyAddress || 'Your Property'} (${confirmedBookings[0].surveyType?.includes('Level 3') ? 'Level 3' : 'Level 2'})`
        : isDeliveredActive
        ? 'All instructions completed'
        : customerJob ? 'Survey slot pending quote & terms' : 'No active bookings',
      icon: CalendarCheck,
      color: 'bg-blue-50 text-[#2563EB]',
      path: '/customer/my-bookings',
    },
    {
      id: 'quotations',
      title: 'Quotations',
      value: pendingQuotes.length > 0
        ? `${pendingQuotes.length} ${pendingQuotes.some(q => q.status === 'Enquiry' || q.timelineStep === 1) ? 'In Review' : 'New'}`
        : isDeliveredActive
        ? '0 Active'
        : (currentStageStep >= 3 ? '1 Confirmed' : (resolvedFee ? '1 Proposal' : (customerJob ? '1 In Review' : '0 Quotes'))),
      subtext: pendingQuotes.length > 0
        ? 'Review & accept proposal'
        : isDeliveredActive
        ? 'All proposals concluded'
        : (currentStageStep >= 3 ? 'Quotation accepted' : (resolvedFee ? `Fee proposal: £${resolvedFee.toFixed(2)}` : 'Awaiting NJS fee proposal')),
      icon: Receipt,
      color: 'bg-indigo-50 text-indigo-600',
      path: '/customer/quotations',
    },
    {
      id: 'payment',
      title: 'Payment Status',
      value: (() => {
        const isPaid = isDeliveredActive || customerJob?.paymentStatus === 'Paid' || currentStageStep >= 6;
        if (isPaid) return resolvedFee ? `Paid (£${resolvedFee.toFixed(2)})` : '£0.00 (Settled)';
        if (!customerJob) return '£0.00';
        const isClaimed =
          customerJob.paymentStatus === 'Claimed (Verification Pending)' ||
          customerJob.paymentStatus === 'Claimed' ||
          customerJob.paymentStatus?.includes('Claimed') ||
          currentStageStep === 5;
        if (isClaimed) {
          return resolvedFee ? `£${resolvedFee.toFixed(2)}` : 'Payment Claimed';
        }
        if (resolvedFee) {
          return `£${resolvedFee.toFixed(2)}`;
        }
        return 'Pending Quote';
      })(),
      subtext: (() => {
        const isPaid = isDeliveredActive || customerJob?.paymentStatus === 'Paid' || currentStageStep >= 6;
        if (isPaid) return 'Payment confirmed & verified by NJS';
        if (!customerJob) return 'No balance due';
        const isClaimed =
          customerJob.paymentStatus === 'Claimed (Verification Pending)' ||
          customerJob.paymentStatus === 'Claimed' ||
          customerJob.paymentStatus?.includes('Claimed') ||
          currentStageStep === 5;
        if (isClaimed) {
          return 'Bank transfer submitted — awaiting verification';
        }
        if (resolvedFee) {
          return currentStageStep >= 3 ? 'Bank transfer pending settlement' : 'Official fee proposal issued';
        }
        return 'Awaiting NJS fee proposal';
      })(),
      icon: Building2,
      color: (() => {
        const isPaid = isDeliveredActive || customerJob?.paymentStatus === 'Paid' || currentStageStep >= 6;
        if (isPaid) return 'bg-emerald-50 text-emerald-600';
        const isClaimed =
          customerJob?.paymentStatus === 'Claimed (Verification Pending)' ||
          customerJob?.paymentStatus === 'Claimed' ||
          customerJob?.paymentStatus?.includes('Claimed') ||
          currentStageStep === 5;
        if (isClaimed) return 'bg-amber-50 text-amber-700';
        if (resolvedFee) return 'bg-blue-50 text-blue-700';
        return 'bg-slate-50 text-slate-700';
      })(),
      path: '/customer/invoices-and-payments',
    },
    {
      id: 'reports',
      title: 'Reports Available',
      value: `${Math.max(isDeliveredActive ? 1 : 0, completedReports.length)} Finalized`,
      subtext: (isDeliveredActive || completedReports.length > 0) ? 'Official RICS PDF copies' : 'Inspection pending',
      icon: FileSpreadsheet,
      color: 'bg-emerald-50 text-emerald-600',
      path: '/customer/reports',
    },
  ];

  // Dynamically isolated upcoming bookings for current customer
  const upcomingBookings = activeBookings.map((b) => ({
    id: b.id,
    property: b.property,
    location: b.location,
    surveyType: b.surveyType,
    surveyor: b.surveyor || 'Assigned Surveyor',
    surveyorAvatar: (b.surveyorAvatar && !b.surveyorAvatar.includes('unsplash.com')) ? b.surveyorAvatar : null,
    date: b.date || '27/10/2026',
    timeSlot: b.timeSlot || '10:00 - 13:00',
    status: b.status,
    statusClass: b.status === 'Completed'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : b.termsStatus === 'Pending'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-blue-50 text-[#2563EB] border-blue-200',
  }));

  // Dynamically isolated recent reports for current customer
  const recentReports = completedReports.map((j) => ({
    id: `RPT-${(j?.id || '880').toString().replace('JOB-2026-', '')}`,
    title: `RICS_${(j?.surveyType || 'Survey').toString().replace(/[^a-zA-Z0-9]/g, '_')}_${(j?.property || 'Property').toString().replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
    property: `${j?.property || 'Property'}${j?.location ? `, ${j.location}` : ''}`,
    date: j?.date || '27/10/2026',
    size: '14.2 MB',
    surveyor: j?.surveyor || 'Assigned Chartered Surveyor',
    status: 'Certified Copy',
  }));

  return (
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto pb-10">
      {/* 1. GRADIENT WELCOME BANNER (Compact & Elegant) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1F4D] via-[#162E6E] to-[#2563EB] p-5 sm:p-6 text-white shadow-lg shadow-[#0B1F4D]/15">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 h-36 w-36 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-blue-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Customer Survey Portal • RICS Regulated Practice</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Welcome back, {user?.name || 'Client'} 👋
            </h1>

            <p className="text-xs sm:text-[13px] text-blue-100/90 leading-relaxed max-w-xl">
              Track real-time progress for your property instructions, sign RICS terms, and download accredited survey reports.
            </p>
          </div>

          {/* Action Buttons: "Book a New Survey" & "Contact Support" */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0B1F4D] text-xs font-bold shadow-md transition-all min-h-[40px] cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 text-[#2563EB]" />
              <span>Book a New Survey</span>
            </button>

            <button
              onClick={() => navigate('/customer/support')}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/25 backdrop-blur-sm transition-all min-h-[40px] cursor-pointer w-full sm:w-auto"
            >
              <HelpCircle className="w-4 h-4 text-blue-200" />
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FOUR METRIC CARDS in 2x2 grid on phone, 4 on desktop (Compact & Refined) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              className="bg-white px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl border border-slate-200/80 shadow-2xs hover:border-[#2563EB] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between min-w-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mr-1">
                  {card.title}
                </span>
                <div className={`p-1 sm:p-1.5 rounded-lg ${card.color} group-hover:scale-105 transition-transform shrink-0`}>
                  <Icon className="w-3 h-3" />
                </div>
              </div>

              <div className="my-1">
                <div className="text-base sm:text-lg font-bold text-[#0B1F4D] tracking-tight truncate">
                  {card.value}
                </div>
                <div className="text-[10px] sm:text-[10.5px] text-slate-400 font-medium truncate mt-0.5">
                  {card.subtext}
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-100/90 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-[#2563EB]">
                <span>Manage</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Instruction Switcher (Active Request vs History) */}
      {myCustomerJobs.length > 1 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              {myCustomerJobs.length}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Instruction Details ({myCustomerJobs.indexOf(customerJob) + 1} of {myCustomerJobs.length})
              </div>
              <div className="text-sm font-bold text-[#0B1F4D] flex flex-wrap items-center gap-2 mt-0.5">
                <span className="break-words sm:truncate max-w-full sm:max-w-md">
                  {customerJob?.surveyType} &bull; {customerJob?.property || customerJob?.location}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase shrink-0 whitespace-nowrap ${
                  isDeliveredActive
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {isDeliveredActive ? 'Completed ✓' : (customerJob?.status || 'Active')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0 w-full lg:w-auto">
            <label htmlFor="dash-job-select" className="text-xs font-semibold text-slate-600 shrink-0 whitespace-nowrap">
              Switch Survey:
            </label>
            <select
              id="dash-job-select"
              value={customerJob?.id || ''}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
              }}
              className="w-full sm:w-80 lg:w-96 max-w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer truncate shadow-2xs"
            >
              {myCustomerJobs.map((j, idx) => {
                const isDeliv = isJobDelivered(j, userEmail);
                return (
                  <option key={j.id} value={j.id}>
                    {isDeliv ? '✓ Completed: ' : idx === 0 ? '★ Active: ' : '📋 History: '} {j.surveyType} — {j.property || j.location} ({j.id}){isDeliv ? ' [Report Delivered]' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* 2.5 LIVE 10-STAGE PROGRESS TRACKER (Client Requirement Point 13) */}
      {!customerJob ? (
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto shadow-2xs">
            <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-[#0B1F4D]">
              No Active Survey Instructions Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Welcome to your NJS Customer Portal! Instruct your first RICS Home Survey or request an instant quote to track milestones in real-time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full sm:w-auto max-w-sm mx-auto sm:max-w-none">
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Instruct a Survey</span>
            </button>
            <button
              onClick={() => navigate('/instant-quote')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
            >
              <span>Get Instant Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Authoritative Next Step Card derived directly from DB state */}
          {apiTracking?.nextStep && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0B1F4D] via-[#1E3A8A] to-[#1E40AF] text-white shadow-md border border-blue-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-white/10 text-white shrink-0 border border-white/15">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                      Next Step Action Required
                    </span>
                    <span className="text-xs font-semibold text-blue-200">
                      Step {apiTracking.currentStep || computeRICSStage(resolvedCustomerJob, apiTracking, userEmail)} of 10
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    {apiTracking.nextStep.title}
                  </h3>
                  <p className="text-xs text-blue-100/90 mt-1 max-w-xl">
                    {apiTracking.nextStep.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(apiTracking.nextStep.actionLink)}
                className="px-5 py-2.5 rounded-xl bg-white text-[#0B1F4D] hover:bg-blue-50 text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>{apiTracking.nextStep.actionText}</span>
                <ArrowRight className="w-4 h-4 text-[#2563EB]" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              RICS Inspection Progression
            </span>
            <button
              onClick={() => navigate('/customer/track-my-survey')}
              className="text-xs font-bold text-[#2563EB] hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Full Tracker &amp; Diary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <SurveyProgressTracker
            currentStep={computeRICSStage(resolvedCustomerJob, apiTracking, userEmail)}
            job={resolvedCustomerJob}
          />
        </div>
      )}

      {/* 2.6 SURVEY COMPLETED & REPORT DELIVERED CELEBRATION BANNER */}
      {isDeliveredActive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-[#0B1F4D] to-teal-900 text-white shadow-md border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Stage 10: 100% Delivered
                </span>
                <span className="text-xs font-semibold text-emerald-200">Official RICS Final Report</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                Your RICS Survey Report for {resolvedCustomerJob?.property || 'Subject Property'} is Ready
              </h3>
              <p className="text-xs text-blue-100/80 mt-0.5 max-w-xl">
                On-site inspection and Quality Assurance audit have concluded. Your official signed survey document with photographic defect evidence is archived and ready for download.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={() => handleDownloadReport(
                `RICS_Survey_${(resolvedCustomerJob?.property || 'Report').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                resolvedCustomerJob?.property,
                resolvedCustomerJob?.surveyor
              )}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Final Report (PDF)</span>
            </button>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-300" />
              <span>Book a New Survey</span>
            </button>
          </div>
        </div>
      )}

      {/* SurveyBooker Stage 2 Prompt Banner: Formal Proposal Ready to Review & Accept */}
      {!isDeliveredActive && (customerJob?.status === 'Quoted' || (customerJob?.timelineStep || 0) === 2) && customerJob?.status !== 'Accepted' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-[#0B1F4D] text-white shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">
                  Stage 2 Ready • Action Required
                </span>
                <span className="text-xs font-bold text-slate-700">Formal Proposal Issued</span>
              </div>
              <h4 className="text-sm font-bold text-[#0B1F4D] mt-1">
                Your survey quotation proposal for {customerJob?.property || 'your property'} is ready for review.
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Review your RICS service particulars and click "Accept Proposal" to proceed to Terms of Engagement.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/customer/quotations')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Review &amp; Accept Proposal</span>
            </button>
          </div>
        </div>
      )}

      {/* SurveyBooker Trigger 2 Next-Steps Prompt Banner (If Quote is Accepted but Terms Pending) */}
      {!isDeliveredActive && (customerJob?.status === 'Accepted' || customerJob?.quoteStatus === 'Accepted' || (customerJob?.timelineStep || 0) === 3) && customerJob?.termsStatus !== 'Signed' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-blue-50/40 to-slate-50 border border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                  Stage 3 Active • Next Action Required
                </span>
                <span className="text-xs font-bold text-slate-700">Quotation Accepted</span>
              </div>
              <h4 className="text-sm font-bold text-[#0B1F4D] mt-1">
                Your quotation for {customerJob?.property || 'your property'} has been confirmed!
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                We have emailed your confirmation. Please electronically sign your RICS Terms of Engagement and select your preferred inspection slot.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/customer/terms-to-sign')}
              className="px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>1. Sign Terms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/customer/my-bookings')}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>2. Choose Date</span>
            </button>
          </div>
        </div>
      )}

      {/* Stage 4 Prompt Banner: Terms Signed & Advance Bank Transfer Pending */}
      {!isDeliveredActive && customerJob?.termsStatus === 'Signed' && customerJob?.paymentStatus !== 'Paid' && !String(customerJob?.paymentStatus || '').toLowerCase().includes('claimed') && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-slate-50 border border-indigo-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shrink-0 shadow-2xs">
              <FileCheck className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200">
                  Stage 4 Complete • Terms Executed
                </span>
                <span className="text-xs font-bold text-slate-700">Bank Transfer Required</span>
              </div>
              <h4 className="text-sm font-bold text-[#0B1F4D] mt-1">
                Terms of Engagement Digitally Signed
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Your contractual agreement is locked and archived. Please submit your bank transfer notification or reference to confirm surveyor site dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/customer/invoices-and-payments')}
              className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Submit Payment Notification</span>
            </button>
          </div>
        </div>
      )}

      {/* Payment Claimed — Awaiting NJS Admin Verification Prompt Banner */}
      {!isDeliveredActive && (customerJob?.paymentStatus === 'Claimed (Verification Pending)' || customerJob?.paymentStatus === 'Claimed' || customerJob?.paymentStatus?.includes('Claimed')) && customerJob?.paymentStatus !== 'Paid' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/90 border border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shrink-0 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-300">
                  Payment Claimed — Awaiting NJS Admin Verification
                </span>
                <span className="text-xs font-bold text-slate-700">Bank Transfer Logged</span>
              </div>
              <h4 className="text-sm font-bold text-[#0B1F4D] mt-1">
                Bank Transfer Logged for {customerJob?.property || 'Subject Property'}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Your bank transfer notification has been submitted. Our accounts desk is reconciling the funds (Sort Code: 23-05-80, Account: 46452283). Your booking will be confirmed once funds clear.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/customer/invoices-and-payments')}
              className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>View Bank Details &amp; Status</span>
            </button>
          </div>
        </div>
      )}

      {/* Clean 2-Column Cohesive Operations & Documents Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT COLUMN: Property Logistics & Direct Communication */}
        <div className="space-y-4">
          {/* 1. Upcoming / Active Property Inspections */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B1F4D]">
                    Property Instruction &amp; Logistics
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Confirmed appointment details and site access arrangements.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/customer/my-bookings')}
                className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            {/* List or Active Card */}
            {upcomingBookings.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center space-y-2">
                <p className="text-xs text-slate-500">No active survey appointments currently booked.</p>
                <button
                  onClick={() => setIsBookModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#0B1F4D] text-white text-xs font-semibold hover:bg-[#162E6E] cursor-pointer"
                >
                  Instruct New Survey
                </button>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#2563EB] transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[#0B1F4D]">
                          {booking.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {booking.property}
                        </h4>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{booking.location}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${booking.statusClass}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {booking.surveyorAvatar ? (
                        <img
                          src={booking.surveyorAvatar}
                          alt={booking.surveyor}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#0B1F4D] text-white flex items-center justify-center font-bold text-[9px] ring-1 ring-slate-200">
                          {booking.surveyor?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'SR'}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-800 text-xs">{booking.surveyor}</span>
                        <span className="text-[10px] text-slate-400 block">{booking.surveyType}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-900 text-[11px]">{booking.date}</div>
                      <div className="text-[10px] text-slate-400">{booking.timeSlot}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-100">
                    <button
                      onClick={() => navigate('/customer/my-bookings')}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      Choose / Change Slot
                    </button>
                    <button
                      onClick={() => navigate('/customer/appointment-details')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      Access Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 2. Direct Operations Coordinator Chat */}
          <div className="p-4 rounded-2xl bg-white border border-blue-200/90 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B1F4D] bg-blue-100/70 px-2 py-0.5 rounded-md font-mono">
                    Direct Operations Desk
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0B1F4D] mt-0.5 truncate">
                  Need help or want to share property notes?
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  Live messaging with NJS booking coordinator &amp; assigned surveyor.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/customer/messages')}
              className="px-3.5 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Chat</span>
            </button>
          </div>

          {/* 3. Trustpilot Review Banner: Only when inspection/report is actually completed! */}
          {(customerJob?.reviewSubmitted || customerJob?.status === 'Completed' || (customerJob?.timelineStep && customerJob.timelineStep >= 7)) && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border border-emerald-300 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#00B67A] text-white flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                      Verified Trustpilot Review ★★★★★
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0B1F4D] mt-0.5 truncate">
                    {customerJob?.reviewSubmitted ? 'Thank you for your Trustpilot review!' : 'Rate your RICS Survey inspection experience'}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => navigate('/customer/leave-review')}
                className="px-3 py-1.5 rounded-xl bg-[#00B67A] hover:bg-[#009E6B] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>{customerJob?.reviewSubmitted ? 'View Review' : 'Rate Us'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Certified Reports & Email Audit Trail */}
        <div className="space-y-4">
          {/* 1. Certified Reports Desk */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B1F4D]">
                    Certified Reports &amp; Valuations
                  </h3>
                  <p className="text-[11px] text-slate-500">Official RICS accredited PDF downloads.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/customer/reports')}
                className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                All Reports
              </button>
            </div>

            {recentReports.length > 0 ? (
              <div className="space-y-2.5">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-emerald-500 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-900 text-xs truncate">
                          {report.property}
                        </h5>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {report.date} • {report.size} • {report.surveyor}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadReport(report.title, report.property, report.surveyor)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/70 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2563EB]" />
                  <span className="font-bold text-[#0B1F4D]">Report In Preparation Lifecycle</span>
                </div>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Your official RICS survey report with photographic defect evidence will become available for instant PDF download once on-site inspection and Quality Assurance (QA) are finalized.
                </p>
                <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10.5px] text-slate-500">
                  <span>Standard SLA: 48–72 hours post-visit</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    RICS Accredited
                  </span>
                </div>
              </div>
            )}

            <div className="p-2.5 bg-blue-50/60 border border-blue-200/60 rounded-xl text-[10.5px] text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span>All delivered reports include surveyor cryptographic seal &amp; RICS accreditation.</span>
            </div>
          </div>

          {/* 2. Email Correspondence & Audit Trail */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B1F4D]">
                    Email Correspondence &amp; Notices
                  </h3>
                  <p className="text-[11px] text-slate-500">Official milestone dispatches and audit copies.</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {customerEmails.length} logged
              </span>
            </div>

            {customerEmails.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center text-xs text-slate-400">
                All quotation emails, terms confirmations, and appointment updates are logged here.
              </div>
            ) : (
              <div className="space-y-2">
                {customerEmails.slice(0, 3).map((em, idx) => (
                  <div
                    key={em.id || idx}
                    onClick={() => setSelectedCustomerEmail(em)}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-400 transition-all cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {em.subject}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {em.date}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                      Delivered
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Email Modal for Customer */}
      {selectedCustomerEmail && (
        <Modal
          isOpen={!!selectedCustomerEmail}
          onClose={() => setSelectedCustomerEmail(null)}
          title={selectedCustomerEmail.subject}
          subtitle={`Dispatched: ${selectedCustomerEmail.date}`}
          maxWidth="max-w-xl"
          footer={
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={() => setSelectedCustomerEmail(null)}
                className="px-4 py-2 bg-[#0B1F4D] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs leading-relaxed text-slate-800">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px] text-slate-600">
              <div>From: NJS Property Group &lt;notifications@njspropertygroup.com&gt;</div>
              <div>Subject: {selectedCustomerEmail.subject}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 whitespace-pre-line font-sans">
              {selectedCustomerEmail.body || (
                `Dear ${user?.name || 'Customer'},\n\nThis is an automated operational notification regarding your survey.\n\nKind regards,\nNJS Property Group Team`
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Book a New Survey */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Instruct a New RICS Survey"
        subtitle="Request a certified surveyor inspection for a UK residential or commercial property."
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="book-survey-form"
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Submit Request</span>
            </button>
          </>
        }
      >
        <form id="book-survey-form" onSubmit={handleBookSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Property Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. 52 Clarendon Road"
              value={bookForm.property}
              onChange={(e) => setBookForm({ ...bookForm, property: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Postcode / Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. London W11 2HR"
                value={bookForm.location}
                onChange={(e) => setBookForm({ ...bookForm, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Date</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={bookForm.preferredDate}
                onChange={(e) => setBookForm({ ...bookForm, preferredDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Survey Standard</label>
            <select
              value={bookForm.surveyType}
              onChange={(e) => setBookForm({ ...bookForm, surveyType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            >
              <option value="RICS Level 2 Home Survey">RICS Level 2 Home Survey</option>
              <option value="RICS Level 2 Home Survey (with Valuation)">RICS Level 2 Home Survey (with Valuation)</option>
              <option value="RICS Level 3 Building Survey">RICS Level 3 Building Survey</option>
              <option value="New Build Snagging Survey">New Build Snagging Survey</option>
              <option value="Specific Defect Investigation">Specific Defect Investigation</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
