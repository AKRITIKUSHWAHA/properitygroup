import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Mail,
  Send,
  SlidersHorizontal,
  FileText,
  FileSignature,
  CreditCard,
  PoundSterling,
  Key,
  Home,
  Check,
  Plus,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Sparkles,
  PhoneCall,
  ShieldAlert,
  Lock,
  Upload,
  CalendarDays,
  FileUp,
  XCircle,
  Archive,
  RefreshCw,
  Zap,
  Eye,
} from 'lucide-react';
import { useJobs } from '../../mock/jobs';
import { StatusPill } from '../../components/common/StatusPill';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { ClientProfileModal } from '../../components/crm/ClientProfileModal';
import { useClientProfiles } from '../../mock/clientProfiles';
import { useEmailAutomations } from '../../mock/emailAutomations';

// Canonical 6-Step SurveyBooker Pipeline (From Video 1)
const STATUS_TIMELINE_STEPS = [
  'Quote',
  'Paid',
  'Accepted',
  'Booked',
  'Preparing report',
  'Complete',
];

export const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = location.pathname.startsWith('/staff') ? '/staff/survey-jobs' : '/admin/jobs';
  const { addToast } = useToast();
  const { jobs, updateJob } = useJobs();
  const { addCallLog } = useClientProfiles();

  // Find job from persistent jobs collection, fallback to first job
  const job = useMemo(() => {
    return jobs.find((j) => j.id === jobId) || jobs[0];
  }, [jobs, jobId]);

  const [activeTab, setActiveTab] = useState('job-details'); // 'job-details', 'notes-calls', 'tasks', 'documents', 'emails', 'activity-log'

  // Email Automation Hook
  const { dispatchStepEmail, automations } = useEmailAutomations();
  const [viewingEmail, setViewingEmail] = useState(null);

  // Modals state
  const [isSendTermsModalOpen, setIsSendTermsModalOpen] = useState(false);
  const [isAdjustQuoteModalOpen, setIsAdjustQuoteModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientModalTab, setClientModalTab] = useState('calls');

  // Form states for adjusting quote
  const [quoteForm, setQuoteForm] = useState({
    baseFee: job?.quote?.baseFee || 650.0,
    discount: job?.quote?.discount || 0.0,
    droneExtra: job?.quote?.extras?.some((e) => e.name.toLowerCase().includes('drone')) ?? true,
    debriefExtra: job?.quote?.extras?.some((e) => e.name.toLowerCase().includes('debrief')) ?? true,
    thermalExtra: job?.quote?.extras?.some((e) => e.name.toLowerCase().includes('thermal')) ?? false,
  });

  // State for notes & calls
  const [newNoteText, setNewNoteText] = useState('');
  const [callDirection, setCallDirection] = useState('Inbound');
  const [newTaskText, setNewTaskText] = useState('');

  // What's Next file upload state (from Video 1)
  const [reportFileName, setReportFileName] = useState('');
  const [reportUrl, setReportUrl] = useState('');

  // Calculate quote figures
  const extrasTotal =
    (quoteForm.droneExtra ? 120.0 : 0) +
    (quoteForm.debriefExtra ? 50.0 : 0) +
    (quoteForm.thermalExtra ? 150.0 : 0);
  const subtotal = Math.max(0, quoteForm.baseFee + extrasTotal - quoteForm.discount);
  const vat = subtotal * 0.2; // 20% UK VAT
  const totalAmount = subtotal + vat;

  // Calculate current canonical 6-step index
  const getCurrentStepIndex = () => {
    const rawStep = job?.timelineStep || 4;
    if (rawStep <= 2) return 0; // Quote
    if (rawStep === 3) return 1; // Paid
    if (rawStep === 4 || rawStep === 5) return 2; // Accepted
    if (rawStep === 6 || rawStep === 7) return 3; // Booked
    if (rawStep === 8) return 4; // Preparing report
    return 5; // Complete
  };

  const currentStepIndex = getCurrentStepIndex();

  // Handle Timeline Step Click to advance / change stage
  const handleStepClick = (stepIndex) => {
    const stepName = STATUS_TIMELINE_STEPS[stepIndex];
    let newTimelineStep = 1;
    let newStatus = 'Quote requested';
    let newPaymentStatus = job.paymentStatus;
    let newTermsStatus = job.termsStatus;
    let newCanBook = job.canBook;

    if (stepIndex === 0) {
      newTimelineStep = 1;
      newStatus = 'Quote requested';
    } else if (stepIndex === 1) {
      newTimelineStep = 3;
      newStatus = 'Payment received';
      newPaymentStatus = 'Paid';
    } else if (stepIndex === 2) {
      newTimelineStep = 5;
      newStatus = 'Accepted';
      newTermsStatus = 'Signed';
    } else if (stepIndex === 3) {
      newTimelineStep = 7;
      newStatus = 'Booked';
      newCanBook = true;
    } else if (stepIndex === 4) {
      newTimelineStep = 8;
      newStatus = 'Preparing report';
    } else if (stepIndex === 5) {
      newTimelineStep = 10;
      newStatus = 'Completed';
    }

    // Trigger automated email for this milestone
    const emailResult = dispatchStepEmail(stepIndex, {
      ...job,
      quoteTotal: totalAmount.toFixed(2),
    });
    let updatedEmails = job.emails || [];
    let emailActivityText = '';

    if (emailResult && emailResult.wasSent && emailResult.emailRecord) {
      updatedEmails = [emailResult.emailRecord, ...updatedEmails];
      emailActivityText = ` • Auto-email sent: "${emailResult.emailRecord.subject}"`;
    }

    const newActivity = {
      id: Date.now(),
      time: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      text: `Workflow milestone moved to "${stepName}" (Stage ${stepIndex + 1}/6)${emailActivityText}.`,
    };

    updateJob(job.id, {
      timelineStep: newTimelineStep,
      status: newStatus,
      paymentStatus: newPaymentStatus,
      termsStatus: newTermsStatus,
      canBook: newCanBook,
      emails: updatedEmails,
      activityLog: [newActivity, ...(job.activityLog || [])],
    });

    if (emailResult && emailResult.wasSent) {
      addToast({
        type: 'success',
        title: 'Milestone Updated & Client Emailed',
        message: `Dispatched automated notification to ${job.customerEmail || 'customer@demo.com'} for ${stepName}.`,
      });
    } else {
      addToast({
        type: 'info',
        title: 'Survey Stage Updated',
        message: `Job milestone moved to: ${stepName}.`,
      });
    }
  };

  // What's Next Action Handlers (Matching Video 1)
  const handleWhatsNextConfirm = () => {
    if (currentStepIndex === 0) {
      // Quote -> advance to Accepted
      handleStepClick(2);
    } else if (currentStepIndex === 1) {
      // Paid -> advance to Accepted / Booked
      handleStepClick(3);
    } else if (currentStepIndex === 2) {
      // Accepted -> advance to Booked
      handleStepClick(3);
    } else if (currentStepIndex === 3) {
      // Booked -> Confirm inspection went ahead -> Advance to Preparing report
      handleStepClick(4);
      addToast({
        type: 'success',
        title: 'Inspection Confirmed',
        message: 'Site inspection attended. Job moved to "Preparing report" stage.',
      });
    } else if (currentStepIndex === 4) {
      // Preparing report -> Upload report PDF -> Advance to Complete
      if (!reportFileName && !reportUrl) {
        addToast({
          type: 'warning',
          title: 'Select Report Document',
          message: 'Please choose a PDF report or input a report URL to upload.',
        });
        return;
      }
      handleStepClick(5);
      addToast({
        type: 'success',
        title: 'Report Uploaded Successfully',
        message: 'Final survey report saved. Client email notification dispatched.',
      });
    }
  };

  const handleWhatsNextReschedule = () => {
    addToast({
      type: 'info',
      title: 'Reschedule Requested',
      message: 'Opening scheduler to select alternative surveyor inspection slot.',
    });
    navigate('/staff/calendar');
  };

  const handleWhatsNextArchive = () => {
    if (window.confirm('Are you sure you want to archive this survey record?')) {
      updateJob(job.id, { status: 'Archived' });
      addToast({
        type: 'info',
        title: 'Record Archived',
        message: `Job ${job.jobNo} moved to archive.`,
      });
    }
  };

  const handleWhatsNextCancel = () => {
    if (window.confirm('Cancel this survey job instruction?')) {
      updateJob(job.id, { status: 'Cancelled' });
      addToast({
        type: 'warning',
        title: 'Job Cancelled',
        message: `Job ${job.jobNo} marked as cancelled.`,
      });
    }
  };

  // Handle Save Note (Internal Note)
  const handleSaveAsNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote = {
      id: Date.now(),
      type: 'note',
      author: 'Operations Staff',
      date: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      text: newNoteText.trim(),
    };

    updateJob(job.id, {
      notes: [newNote, ...(job.notes || [])],
    });

    setNewNoteText('');
    addToast({
      type: 'info',
      title: 'Internal Note Saved',
      message: 'Operational note recorded on job file.',
    });
  };

  // Handle Save Call (Phone Call Record with Exact Timestamp)
  const handleSaveAsCall = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const timestamp = new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const newCallNote = {
      id: Date.now(),
      type: 'call',
      direction: callDirection,
      author: 'Operations Staff',
      date: timestamp,
      text: `[${callDirection.toUpperCase()} CALL] ${newNoteText.trim()}`,
    };

    // Update job notes
    updateJob(job.id, {
      notes: [newCallNote, ...(job.notes || [])],
    });

    // Also persist into clientProfile store
    const clientEmail = job.customerEmail || 'customer@demo.com';
    addCallLog(clientEmail, {
      timestamp,
      direction: callDirection,
      staff: 'Sarah Jenkins',
      duration: '4 mins',
      subject: `Call regarding Job #${job.jobNo} (${job.property})`,
      notes: newNoteText.trim(),
      tags: [job.surveyType, callDirection],
    });

    setNewNoteText('');
    addToast({
      type: 'success',
      title: 'Call Interaction Logged',
      message: `Call recorded at ${timestamp} and linked to ${job.customer}'s profile.`,
    });
  };

  // Toggle task
  const handleToggleTask = (taskId) => {
    const updatedTasks = (job.tasks || []).map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    updateJob(job.id, { tasks: updatedTasks });
  };

  // Add task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      done: false,
    };

    updateJob(job.id, {
      tasks: [...(job.tasks || []), newTask],
    });
    setNewTaskText('');
  };

  const tabs = [
    { id: 'job-details', label: 'Job details' },
    { id: 'notes-calls', label: `Notes and calls (${job?.notes?.length || 0})` },
    { id: 'tasks', label: `Tasks (${(job?.tasks || []).filter((t) => t.done).length}/${job?.tasks?.length || 0})` },
    { id: 'documents', label: `Documents (${job?.documents?.length || 0})` },
    { id: 'emails', label: `Emails (${job?.emails?.length || 0})` },
    { id: 'activity-log', label: 'Activity log' },
  ];

  if (!job) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-sm">Job record could not be loaded.</p>
        <button
          onClick={() => navigate(backPath)}
          className="mt-4 px-4 py-2 bg-[#0B1F4D] text-white text-xs font-bold rounded-xl"
        >
          Return to Survey Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0B1F4D] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Survey Jobs Master Register</span>
        </button>
      </div>

      {/* 6-STEP SURVEYBOOKER PIPELINE (Quote -> Paid -> Accepted -> Booked -> Preparing report -> Complete) */}
      <div className="bg-[#0B1F4D] p-5 sm:p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
              SurveyBooker Pipeline
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-mono text-slate-300">ID: {job.jobNo}</span>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30">
            Current Stage: {STATUS_TIMELINE_STEPS[currentStepIndex]}
          </span>
        </div>

        {/* Stepper Bar */}
        <div className="flex items-center justify-between relative px-2 sm:px-6">
          {/* Background Connecting Bar */}
          <div className="absolute top-4 left-6 right-6 h-1 bg-slate-700/80 -z-0" />

          {STATUS_TIMELINE_STEPS.map((stepName, idx) => {
            const stepNumber = idx + 1;
            const isPast = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={stepName}
                onClick={() => handleStepClick(idx)}
                className="flex flex-col items-center cursor-pointer group relative z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isPast
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-[#0284C7] text-white ring-4 ring-sky-400/30 shadow-md scale-110'
                      : 'bg-[#1E293B] border-2 border-slate-600 text-slate-400 group-hover:border-slate-400'
                  }`}
                >
                  {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : stepNumber}
                </div>

                <span
                  className={`text-[11px] text-center font-bold mt-2 max-w-[85px] leading-tight transition-colors ${
                    isCurrent
                      ? 'text-sky-300'
                      : isPast
                      ? 'text-slate-200'
                      : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  {stepName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Email Automation Indicator */}
        <div className="flex items-center justify-between text-xs bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl mt-5 border border-white/15">
          <div className="flex items-center gap-2 text-sky-200">
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Automated Client Email Active: <strong className="text-white">{STATUS_TIMELINE_STEPS[currentStepIndex]}</strong> notification will be sent on transition</span>
          </div>
          <span className="text-[11px] font-mono text-slate-300 hidden sm:inline">
            Target: {job.customerEmail || 'customer@demo.com'}
          </span>
        </div>
      </div>

      {/* HEADER: Job Title, Customer, Survey Booker ID, Badges */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="font-mono text-sm font-black px-3 py-1 rounded-xl bg-[#0B1F4D] text-white tracking-wide">
              {job.jobNo}
            </span>
            <span className="text-base font-extrabold text-slate-900">
              {job.customer}
            </span>

            {/* Terms status badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                job.termsStatus === 'Signed'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <FileSignature className="w-3.5 h-3.5 text-current" />
              Terms: {job.termsStatus}
            </span>

            {/* Payment status badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                job.paymentStatus === 'Paid'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-current" />
              Payment: {job.paymentStatus}
            </span>

            <StatusPill status={job.status} />
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span>
              {job.property}, {job.location}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[#2563EB] font-bold">{job.surveyType}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono text-slate-500">Booker ID: 1826303</span>
          </div>
        </div>

        {/* Action Buttons: "Send terms" and "Confirm/Adjust quote" */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAdjustQuoteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:border-[#2563EB] bg-white text-slate-700 hover:text-[#2563EB] text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Confirm/Adjust quote</span>
          </button>

          <button
            onClick={() => setIsSendTermsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-md shadow-[#0B1F4D]/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send terms</span>
          </button>
        </div>
      </div>

      {/* WHAT'S NEXT ACTION BOX (SurveyBooker Exact Benchmark from Video 1) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Top Teal Header */}
        <div className="bg-[#07779D] text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-200" />
            <h3 className="font-extrabold text-sm tracking-wide m-0 text-white">What's Next?</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsNextArchive}
              className="px-3 py-1 rounded-lg bg-sky-600/60 hover:bg-sky-600 text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
            <button
              onClick={handleWhatsNextCancel}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* Dynamic Contextual Prompt based on Active Stage */}
        <div className="p-6 space-y-4">
          {/* Stage 0: Quote */}
          {currentStepIndex === 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Survey Stage:</span>
                <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Quote requested
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed m-0">
                A bespoke quote is required for this property search. Please verify property details and submit your quotation proposal using the button below.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleWhatsNextCancel}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => setIsAdjustQuoteModalOpen(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm / Adjust Quote</span>
                </button>
              </div>
            </div>
          )}

          {/* Stage 1: Paid */}
          {currentStepIndex === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Survey Stage:</span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Payment Received
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed m-0">
                Client has settled the advance survey fee (£{job?.quote?.baseFee || 650}.00). Please liaise with the vendor or selling agent to confirm on-site inspection timing.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleWhatsNextConfirm}
                  className="px-5 py-2.5 bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarDays className="w-4 h-4 text-sky-400" />
                  <span>Schedule Inspection Appointment</span>
                </button>
              </div>
            </div>
          )}

          {/* Stage 2: Accepted */}
          {currentStepIndex === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Survey Stage:</span>
                <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Quote Accepted &bull; Terms Sent
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed m-0">
                Customer has agreed to the survey fee proposal. Standard RICS Terms of Engagement have been dispatched to <strong>{job.customerEmail}</strong>.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleWhatsNextConfirm}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Terms &amp; Mark Bookable</span>
                </button>
                <button
                  onClick={() => setIsSendTermsModalOpen(true)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Resend Terms Email
                </button>
              </div>
            </div>
          )}

          {/* Stage 3: Booked */}
          {currentStepIndex === 3 && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>The inspection is booked for {job.date || '28/10/2026'} at {job.timeSlot || '09:00 AM'}.</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Survey Stage:</span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Booked
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed m-0">
                The job is confirmed with surveyor <strong>{job.surveyor}</strong>. You can confirm the appointment went ahead or reschedule the appointment using the buttons below.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleWhatsNextReschedule}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reschedule
                </button>
                <button
                  onClick={handleWhatsNextConfirm}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Inspection Completed</span>
                </button>
              </div>
            </div>
          )}

          {/* Stage 4: Preparing report */}
          {currentStepIndex === 4 && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>The technical report is due by {job.date || '28/10/2026'} 6:00 PM.</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Survey Stage:</span>
                <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Preparing report
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed m-0">
                Please submit your finalized survey report using the fields below. You can then press upload to save the document and mark the job as complete.
              </p>

              {/* Upload Report Inputs (From Video 1) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Select Report PDF:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="report-upload-file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setReportFileName(e.target.files[0].name);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="report-upload-file"
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer flex items-center gap-1.5"
                    >
                      <FileUp className="w-4 h-4 text-slate-600" />
                      <span>Choose file</span>
                    </label>
                    <span className="text-xs font-mono text-slate-600 truncate">
                      {reportFileName || 'No file chosen (e.g. 200742-Level 3.pdf)'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Digital Report URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://reports.propertygroup.co.uk/rep-..."
                    value={reportUrl}
                    onChange={(e) => setReportUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleWhatsNextReschedule}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reschedule
                </button>
                <button
                  onClick={handleWhatsNextConfirm}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload &amp; Complete Job</span>
                </button>
              </div>
            </div>
          )}

          {/* Stage 5: Complete */}
          {currentStepIndex === 5 && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Job Completed &bull; Technical Report Delivered</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed m-0">
                All inspection milestones have been completed and the indexed RICS survey PDF has been archived in the customer's portal and dispatched via email.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => alert('Downloading official RICS report PDF...')}
                  className="px-5 py-2.5 bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>Download Final Report (PDF)</span>
                </button>
                <button
                  onClick={() => {
                    setClientModalTab('calls');
                    setIsClientModalOpen(true);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Log Post-Survey Debrief Call
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* THREE KEY CARDS ROW: Contacts Card, Property Details Card, Quote Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Contacts Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
                <User className="w-4 h-4 text-[#2563EB]" />
                Contacts Directory
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">3 Parties</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Client */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Client / Purchaser
                </span>
                <div className="font-bold text-slate-900">{job.contacts?.client?.name || job.customer}</div>
                <div className="text-slate-600 mt-1 flex items-center gap-1.5 truncate">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  {job.contacts?.client?.phone || job.customerPhone}
                </div>
                <div className="text-slate-600 flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  {job.contacts?.client?.email || job.customerEmail}
                </div>
                <button
                  onClick={() => {
                    setClientModalTab('calls');
                    setIsClientModalOpen(true);
                  }}
                  className="mt-2.5 w-full py-1.5 px-2.5 rounded-xl bg-white hover:bg-[#0B1F4D] text-[#0B1F4D] hover:text-white border border-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <PhoneCall className="w-3 h-3 text-[#2563EB]" />
                  <span>Call Notes &amp; Complaints Log</span>
                </button>
              </div>

              {/* Solicitor */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Conveyancing Solicitor
                </span>
                <div className="font-bold text-slate-900">{job.contacts?.solicitor?.firm || 'Pending Solicitor'}</div>
                <div className="text-slate-600 mt-1">Lead: {job.contacts?.solicitor?.name || 'Solicitor Direct'}</div>
                <div className="text-slate-500 font-mono text-[11px]">Ref: {job.contacts?.solicitor?.ref || 'N/A'}</div>
              </div>

              {/* Estate Agent */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Keyholder / Estate Agent
                </span>
                <div className="font-bold text-slate-900">{job.contacts?.agent?.agency || 'Local Agent'}</div>
                <div className="text-slate-600 mt-1">Contact: {job.contacts?.agent?.name || 'Office Manager'}</div>
                <div className="text-slate-600">{job.contacts?.agent?.phone || '+44 20 7000 0000'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Property Details Card (value, bedrooms, tenure, listed building, access details) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
                <Home className="w-4 h-4 text-[#2563EB]" />
                Property Specifications
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">UK Registry</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Estimated Value:</span>
                <span className="font-extrabold text-[#0B1F4D] font-mono text-sm">
                  {job.propertyDetails?.value || '£750,000'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Bedrooms / Accommodation:</span>
                <span className="font-bold text-slate-800">
                  {job.propertyDetails?.bedrooms || '3 Bedrooms, 2 Bathrooms'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium block text-[11px]">Tenure Status:</span>
                <span className="font-bold text-slate-800 leading-snug">
                  {job.propertyDetails?.tenure || 'Freehold'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Listed Building Grade:</span>
                <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {job.propertyDetails?.listedBuilding || 'None'}
                </span>
              </div>

              <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-amber-900 block flex items-center gap-1 mb-0.5">
                  <Key className="w-3 h-3 text-amber-600" />
                  Key Collection & Access Details
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {job.propertyDetails?.accessDetails || 'Keys held by estate agent.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Quote Table (extras, discount, tax, total) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
                <PoundSterling className="w-4 h-4 text-emerald-600" />
                Quotation Breakdown
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                GBP (£) UK
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Base Survey Fee ({job.surveyType}):</span>
                <span className="font-bold text-slate-900 font-mono">
                  £{(job.quote?.baseFee || 650).toFixed(2)}
                </span>
              </div>

              {(job.quote?.extras || []).map((extra, i) => (
                <div key={i} className="flex items-center justify-between text-slate-600 pl-2 border-l-2 border-blue-200">
                  <span className="text-[11px] truncate">{extra.name}:</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    +£{extra.amount.toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between text-emerald-700 font-medium pt-1 border-t border-slate-100">
                <span>Promotional Discount:</span>
                <span className="font-mono font-bold">-£{(job.quote?.discount || 0).toFixed(2)}</span>
              </div>

              {(() => {
                const base = job.quote?.baseFee || 650;
                const extrasSum = (job.quote?.extras || []).reduce((s, e) => s + e.amount, 0);
                const disc = job.quote?.discount || 0;
                const net = Math.max(0, base + extrasSum - disc);
                const tax = net * 0.2;
                const gross = net + tax;

                return (
                  <>
                    <div className="flex items-center justify-between text-slate-500 pt-1">
                      <span>Subtotal (Net):</span>
                      <span className="font-mono font-bold text-slate-800">
                        £{net.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span>UK Standard VAT (20%):</span>
                      <span className="font-mono font-bold text-slate-800">
                        £{tax.toFixed(2)}
                      </span>
                    </div>

                    {/* Total Row */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-[#0B1F4D] block">
                          Total Quoted Fee
                        </span>
                        <span className="text-[10px] text-slate-400">Inclusive of VAT</span>
                      </div>
                      <div className="text-lg font-black text-emerald-700 font-mono">
                        £{gross.toFixed(2)}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Payment terms: 100% advance</span>
            <span
              className={`font-semibold ${
                job.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {job.paymentStatus === 'Paid' ? 'Payment captured' : 'Awaiting payment'}
            </span>
          </div>
        </div>
      </div>

      {/* SIX TABS SECTION: Job details, Notes and calls, Tasks, Documents, Emails, Activity log */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="px-6 pt-4 border-b border-slate-200/80 bg-slate-50/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap -mb-px cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#2563EB] text-[#0B1F4D]'
                  : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panes */}
        <div className="p-6">
          {/* 1. Job details */}
          {activeTab === 'job-details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Assigned Surveyor
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{job.surveyor}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Chartered Valuation Surveyor</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Inspection Schedule
                  </span>
                  <div className="font-bold text-slate-900 text-sm font-mono">{job.date}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Time window: {job.timeSlot}</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Report Delivery SLA
                  </span>
                  <div className="font-bold text-emerald-700 text-sm">Target: 48 Hours Post-Site</div>
                  <div className="text-xs text-slate-500 mt-0.5">Peer-reviewed RICS format</div>
                </div>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-[#0B1F4D] uppercase tracking-wider">
                  Scope of Inspection &amp; Specific Instructions
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full RICS Home Survey Level 2 covering building fabric, dampness testing with Protimeter moisture meter, roof void inspection, services condition ratings (1-3), and formal open-market valuation for purchaser {job.customer}.
                </p>
              </div>
            </div>
          )}

          {/* 2. Notes and calls (SPLIT BUTTONS: Save as note vs Save as call) */}
          {activeTab === 'notes-calls' && (
            <div className="space-y-5 max-w-3xl">
              {/* Quick Link to Dedicated Client Profile & Complaints */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-xs font-bold text-slate-800">
                    Client Call History &amp; Complaints Log for {job.customer}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setClientModalTab('calls');
                      setIsClientModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#0B1F4D] text-[#0B1F4D] hover:text-white border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    View All Calls
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClientModalTab('complaints');
                      setIsClientModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    Complaints Log
                  </button>
                </div>
              </div>

              {/* Form to add note or call with 2 distinct buttons (SurveyBooker format from Video 1) */}
              <div className="space-y-2.5 p-4 bg-slate-50/90 border border-slate-200 rounded-2xl">
                <textarea
                  rows="3"
                  placeholder="Record customer call summary, complaint details, surveyor debrief, or agent key pickup notes..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {/* Call direction toggle */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[11px]">Direction:</span>
                    <button
                      type="button"
                      onClick={() => setCallDirection('Inbound')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        callDirection === 'Inbound'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Inbound Call
                    </button>
                    <button
                      type="button"
                      onClick={() => setCallDirection('Outbound')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        callDirection === 'Outbound'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Outbound Call
                    </button>
                  </div>

                  {/* Two distinct buttons: Save as note & Save as call */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveAsNote}
                      className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Save as note</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveAsCall}
                      className="px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Save as call</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes list */}
              <div className="space-y-3 divide-y divide-slate-100">
                {(job.notes || []).map((note) => (
                  <div key={note.id} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0B1F4D]">{note.author}</span>
                        {note.direction && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              note.direction === 'Inbound'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {note.direction} Call
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[11px] font-mono">{note.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-4 max-w-3xl">
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new checklist task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shrink-0 cursor-pointer"
                >
                  Add Task
                </button>
              </form>

              {/* Tasks list */}
              <div className="space-y-2">
                {(job.tasks || []).map((task) => (
                  <label
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      task.done ? 'bg-slate-50 border-slate-200 line-through text-slate-400' : 'bg-white border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => handleToggleTask(task.id)}
                      className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span className="text-xs sm:text-sm font-medium">{task.text}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 4. Documents */}
          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {(job.documents || []).map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-[#2563EB] transition-all flex flex-col justify-between group cursor-pointer"
                  onClick={() => alert(`Downloading ${doc.name}...`)}
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                      {doc.name}
                    </h5>
                    <div className="text-[10px] text-slate-400 mt-1">{doc.size} • {doc.date}</div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-[#2563EB]">
                    <span>Download</span>
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. Emails */}
          {activeTab === 'emails' && (
            <div className="space-y-4 max-w-4xl">
              {/* Header Action Bar */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#2563EB]" />
                    <span>Customer Automated Email Correspondence</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time transactional audit log of emails triggered for <strong>{job.customer}</strong> ({job.customerEmail || 'customer@demo.com'}).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const result = dispatchStepEmail(currentStepIndex, {
                      ...job,
                      quoteTotal: totalAmount.toFixed(2),
                    });
                    if (result && result.wasSent) {
                      updateJob(job.id, {
                        emails: [result.emailRecord, ...(job.emails || [])],
                      });
                      addToast({
                        type: 'success',
                        title: 'Email Re-Dispatched',
                        message: `Sent copy of ${STATUS_TIMELINE_STEPS[currentStepIndex]} notification to ${job.customerEmail || 'customer@demo.com'}.`,
                      });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-sky-300" />
                  <span>Resend Current Milestone Email</span>
                </button>
              </div>

              {/* Email List */}
              {(!job.emails || job.emails.length === 0) ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-400">
                  No automated emails logged yet. Click any workflow milestone above to trigger customer email.
                </div>
              ) : (
                <div className="space-y-3">
                  {(job.emails || []).map((email, emailIdx) => (
                    <div
                      key={email.id || emailIdx}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">{email.subject}</span>
                              {email.stageLabel && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] font-bold border border-blue-100">
                                  {email.stageLabel}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Recipient: <span className="font-mono">{email.to}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            {email.status || 'Delivered'}
                          </span>

                          <button
                            type="button"
                            onClick={() => setViewingEmail(email)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200/80"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Email</span>
                          </button>
                        </div>
                      </div>

                      {email.body && (
                        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 text-xs text-slate-600 line-clamp-2 font-mono whitespace-pre-line">
                          {email.body}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Dispatched: {email.date}
                        </span>
                        <span className="text-slate-500 font-medium">Delivered via SMTP Gateway</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. Activity log */}
          {activeTab === 'activity-log' && (
            <div className="space-y-3 max-w-3xl">
              {(job.activityLog || []).map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <span className="text-slate-800 font-medium">{log.text}</span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Adjust Quote Modal */}
      <Modal
        isOpen={isAdjustQuoteModalOpen}
        onClose={() => setIsAdjustQuoteModalOpen(false)}
        title="Adjust &amp; Confirm Survey Quotation"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Base Survey Fee (£)</label>
            <input
              type="number"
              value={quoteForm.baseFee}
              onChange={(e) => setQuoteForm({ ...quoteForm, baseFee: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-700 block">Optional Valuation &amp; Defect Extras:</span>
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
              <span>Drone Roof &amp; Flashing Inspection (+£120.00)</span>
              <input
                type="checkbox"
                checked={quoteForm.droneExtra}
                onChange={(e) => setQuoteForm({ ...quoteForm, droneExtra: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600"
              />
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
              <span>Same-Day Verbal Debrief by Surveyor (+£50.00)</span>
              <input
                type="checkbox"
                checked={quoteForm.debriefExtra}
                onChange={(e) => setQuoteForm({ ...quoteForm, debriefExtra: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600"
              />
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
              <span>Thermal Imaging Defect Assessment (+£150.00)</span>
              <input
                type="checkbox"
                checked={quoteForm.thermalExtra}
                onChange={(e) => setQuoteForm({ ...quoteForm, thermalExtra: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-700 block mb-1">Promotional Discount (£)</label>
            <input
              type="number"
              value={quoteForm.discount}
              onChange={(e) => setQuoteForm({ ...quoteForm, discount: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
            />
          </div>

          {/* Real-time recalculated total */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <span className="font-bold text-[#0B1F4D]">Total Fee (Inc. 20% VAT):</span>
            <span className="font-black text-sm text-blue-700 font-mono">
              £{totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={() => setIsAdjustQuoteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsAdjustQuoteModalOpen(false);
                addToast({
                  type: 'success',
                  title: 'Quotation Updated',
                  message: `New total £${totalAmount.toFixed(2)} confirmed.`,
                });
              }}
              className="px-5 py-2 bg-[#0B1F4D] text-white rounded-xl font-bold"
            >
              Save &amp; Confirm Quote
            </button>
          </div>
        </div>
      </Modal>

      {/* Send Terms Modal */}
      <Modal
        isOpen={isSendTermsModalOpen}
        onClose={() => setIsSendTermsModalOpen(false)}
        title="Send RICS Terms of Engagement Contract"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Dispatch digital Terms of Engagement agreement for <strong>{job.surveyType}</strong> to{' '}
            <strong>{job.customerEmail}</strong>.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Document Type:</span>
              <span className="font-bold text-slate-800">RICS Home Survey Standard (2026/27)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Agreed Fixed Fee:</span>
              <span className="font-bold text-emerald-700 font-mono">£{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Schedule:</span>
              <span className="font-bold text-slate-800">100% in advance of site visit</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={() => setIsSendTermsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsSendTermsModalOpen(false);
                updateJob(job.id, { termsStatus: 'Signed' });
                addToast({
                  type: 'success',
                  title: 'Terms of Engagement Dispatched',
                  message: 'Agreement contract sent to client email.',
                });
              }}
              className="px-5 py-2 bg-[#0B1F4D] text-white rounded-xl font-bold"
            >
              Dispatch Agreement Now
            </button>
          </div>
        </div>
      </Modal>

      {/* View Full Dispatched Email Modal */}
      {viewingEmail && (
        <Modal
          isOpen={!!viewingEmail}
          onClose={() => setViewingEmail(null)}
          title={viewingEmail.subject}
          subtitle={`Dispatched to ${viewingEmail.to} • ${viewingEmail.date}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Status: {viewingEmail.status || 'Delivered'}
              </span>
              <button
                type="button"
                onClick={() => setViewingEmail(null)}
                className="px-4 py-2 bg-[#0B1F4D] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Email
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16 font-semibold">From:</span>
                <span className="font-bold text-slate-800">UK Property Surveying Practice</span>
                <span className="text-slate-400 font-mono text-[11px]">&lt;notifications@propertygroup.co.uk&gt;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16 font-semibold">To:</span>
                <span className="font-mono text-slate-800">{viewingEmail.to}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16 font-semibold">Date:</span>
                <span className="font-mono text-slate-700">{viewingEmail.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-16 font-semibold">Subject:</span>
                <span className="font-bold text-[#0B1F4D]">{viewingEmail.subject}</span>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 leading-relaxed font-sans whitespace-pre-line text-slate-800 shadow-2xs">
              {viewingEmail.body || (
                `Dear ${job.customer},\n\nThis is an automated operational notification regarding your survey at ${job.property || job.location}.\n\nReference: ${job.jobNo}\nService: ${job.surveyType}\nStatus: ${job.status}\n\nKind regards,\nUK Property Surveying Practice Team`
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Client Profile & Complaints Modal */}
      <ClientProfileModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clientEmail={job.customerEmail || 'customer@demo.com'}
        clientName={job.customer}
        defaultTab={clientModalTab}
      />
    </div>
  );
};
