import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useJobs } from '../../mock/jobs';
import { StatusPill } from '../../components/common/StatusPill';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';

// The exact 10 steps requested by user:
// Quote requested, Quote sent, Accepted, Terms sent, Terms signed, Payment received, Booked, Survey done, Report sent, Closed
const STATUS_TIMELINE_STEPS = [
  'Quote requested',
  'Quote sent',
  'Accepted',
  'Terms sent',
  'Terms signed',
  'Payment received',
  'Booked',
  'Survey done',
  'Report sent',
  'Closed',
];

export const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { jobs, updateJob } = useJobs();

  // Find job from persistent jobs collection, fallback to first job
  const job = useMemo(() => {
    return jobs.find((j) => j.id === jobId) || jobs[0];
  }, [jobs, jobId]);

  const [activeTab, setActiveTab] = useState('job-details'); // 'job-details', 'notes-calls', 'tasks', 'documents', 'emails', 'activity-log'

  // Modals state
  const [isSendTermsModalOpen, setIsSendTermsModalOpen] = useState(false);
  const [isAdjustQuoteModalOpen, setIsAdjustQuoteModalOpen] = useState(false);

  // Form states for adjusting quote
  const [quoteForm, setQuoteForm] = useState({
    baseFee: job?.quote?.baseFee || 650.0,
    discount: job?.quote?.discount || 0.0,
    droneExtra: job?.quote?.extras?.some((e) => e.name.toLowerCase().includes('drone')) ?? true,
    debriefExtra: job?.quote?.extras?.some((e) => e.name.toLowerCase().includes('debrief')) ?? true,
    thermalExtra: job?.quote?.extras?.some((e) => e.name.toLowerCase().includes('thermal')) ?? false,
  });

  // State for notes & tasks
  const [newNoteText, setNewNoteText] = useState('');
  const [newTaskText, setNewTaskText] = useState('');

  // Calculate quote figures
  const extrasTotal =
    (quoteForm.droneExtra ? 120.0 : 0) +
    (quoteForm.debriefExtra ? 50.0 : 0) +
    (quoteForm.thermalExtra ? 150.0 : 0);
  const subtotal = Math.max(0, quoteForm.baseFee + extrasTotal - quoteForm.discount);
  const vat = subtotal * 0.2; // 20% UK VAT
  const totalAmount = subtotal + vat;

  const currentStep = job?.timelineStep || 7;

  // Handle Timeline Step Click to advance / change stage
  const handleStepClick = (stepIndex) => {
    const stepNumber = stepIndex + 1;
    const stepName = STATUS_TIMELINE_STEPS[stepIndex];
    const newProgress = Math.min(100, stepNumber * 10);

    let newStatus = job.status;
    let newTermsStatus = job.termsStatus;
    let newPaymentStatus = job.paymentStatus;
    let newCanBook = job.canBook;

    if (stepNumber >= 5) newTermsStatus = 'Signed';
    if (stepNumber >= 6) newPaymentStatus = 'Paid';
    if (stepNumber >= 7) {
      newCanBook = true;
      newStatus = stepNumber === 10 ? 'Completed' : 'Scheduled';
    }
    if (stepNumber === 8) newStatus = 'In Progress';
    if (stepNumber === 10) newStatus = 'Completed';

    const newActivity = {
      id: Date.now(),
      time: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      text: `Workflow advanced to milestone "${stepName}" (Stage ${stepNumber}/10).`,
    };

    updateJob(job.id, {
      timelineStep: stepNumber,
      progress: newProgress,
      status: newStatus,
      termsStatus: newTermsStatus,
      paymentStatus: newPaymentStatus,
      canBook: newCanBook,
      activityLog: [newActivity, ...(job.activityLog || [])],
    });

    addToast({
      type: 'info',
      title: 'Milestone Updated',
      message: `Job status progressed to: ${stepName}.`,
    });
  };

  // Handle Send Terms action
  const handleConfirmSendTerms = (markSignedImmediately = false) => {
    setIsSendTermsModalOpen(false);

    const newTermsStatus = markSignedImmediately ? 'Signed' : 'Terms Sent (Awaiting E-Sign)';
    const newStep = markSignedImmediately ? Math.max(job.timelineStep, 5) : Math.max(job.timelineStep, 4);
    const canBookNow = (markSignedImmediately || job.termsStatus === 'Signed') && job.paymentStatus === 'Paid';

    const newActivity = {
      id: Date.now(),
      time: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      text: markSignedImmediately
        ? `RICS Terms of Engagement executed and verified digitally.`
        : `RICS Terms of Engagement dispatched to ${job.customerEmail}.`,
    };

    updateJob(job.id, {
      termsStatus: newTermsStatus,
      timelineStep: newStep,
      canBook: canBookNow,
      activityLog: [newActivity, ...(job.activityLog || [])],
    });

    addToast({
      type: 'success',
      title: markSignedImmediately ? 'Terms Executed' : 'Terms of Engagement Dispatched',
      message: markSignedImmediately
        ? 'Terms marked as signed. Inspection requirement cleared.'
        : `Digital signature link sent to ${job.customerEmail} (RICS Mandate v2026).`,
    });
  };

  // Handle Confirm / Adjust Quote action
  const handleSaveQuoteAdjustments = () => {
    setIsAdjustQuoteModalOpen(false);

    const extras = [];
    if (quoteForm.droneExtra) extras.push({ name: 'Drone Roof & Flashing Inspection', amount: 120.0 });
    if (quoteForm.debriefExtra) extras.push({ name: 'Same-day Verbal Debrief by Surveyor', amount: 50.0 });
    if (quoteForm.thermalExtra) extras.push({ name: 'Thermal Imaging Defect Assessment', amount: 150.0 });

    const newActivity = {
      id: Date.now(),
      time: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      text: `Quotation revised. Base: £${quoteForm.baseFee.toFixed(2)}, Extras: £${extrasTotal.toFixed(2)}, Discount: £${quoteForm.discount.toFixed(2)}. Total: £${totalAmount.toFixed(2)}.`,
    };

    updateJob(job.id, {
      quote: {
        baseFee: parseFloat(quoteForm.baseFee),
        discount: parseFloat(quoteForm.discount),
        extras,
        vatRate: 0.2,
      },
      activityLog: [newActivity, ...(job.activityLog || [])],
    });

    addToast({
      type: 'success',
      title: 'Quotation Updated',
      message: `Revised total £${totalAmount.toFixed(2)} confirmed. Client proposal recalculated.`,
    });
  };

  // Add note
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote = {
      id: Date.now(),
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
      title: 'Note Recorded',
      message: 'Call note logged in job file.',
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
          onClick={() => navigate('/admin/survey-jobs')}
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
          onClick={() => navigate('/admin/survey-jobs')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0B1F4D] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Survey Jobs Master Register</span>
        </button>
      </div>

      {/* HEADER: Job No., Customer, Address, Badges, and "Send terms" & "Confirm/Adjust quote" buttons */}
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

      {/* 10-STEP STATUS TIMELINE: Quote requested -> Closed */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Survey Lifecycle Status Timeline
          </span>
          <span className="text-xs font-bold text-[#2563EB]">
            Current Stage: {STATUS_TIMELINE_STEPS[currentStep - 1] || 'In Progress'} ({currentStep}/10)
          </span>
        </div>

        {/* Stepper bar */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center min-w-[850px] justify-between relative">
            {/* Background track line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

            {STATUS_TIMELINE_STEPS.map((stepName, idx) => {
              const stepNumber = idx + 1;
              const isPast = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;

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
                        ? 'bg-[#2563EB] text-white ring-4 ring-blue-500/25 shadow-md scale-110'
                        : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[2.5]" /> : stepNumber}
                  </div>

                  <span
                    className={`text-[10px] text-center font-bold mt-2 max-w-[80px] leading-tight transition-colors ${
                      isCurrent
                        ? 'text-[#0B1F4D]'
                        : isPast
                        ? 'text-slate-700'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    {stepName}
                  </span>
                </div>
              );
            })}
          </div>
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
        <div className="px-6 pt-4 border-b border-slate-200/80 bg-[#F3F5F9]/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
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
                  Scope of Inspection & Specific Instructions
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full RICS Home Survey Level 2 covering building fabric, dampness testing with Protimeter moisture meter, roof void inspection, services condition ratings (1-3), and formal open-market valuation for purchaser {job.customer}.
                </p>
              </div>
            </div>
          )}

          {/* 2. Notes and calls */}
          {activeTab === 'notes-calls' && (
            <div className="space-y-5 max-w-3xl">
              {/* Form to add note */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows="3"
                  placeholder="Record customer call summary, surveyor debrief, or agent key pickup notes..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Note</span>
                  </button>
                </div>
              </form>

              {/* Notes list */}
              <div className="space-y-3 divide-y divide-slate-100">
                {(job.notes || []).map((note) => (
                  <div key={note.id} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#0B1F4D]">{note.author}</span>
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
            <div className="space-y-5 max-w-2xl">
              {/* Add task form */}
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New operational task (e.g. Call vendor to confirm loft ladder)..."
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
            <div className="space-y-3 max-w-3xl">
              {(job.emails || []).map((email) => (
                <div
                  key={email.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{email.subject}</div>
                      <div className="text-[11px] text-slate-500">Recipient: {email.to}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {email.status}
                    </span>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">{email.date}</div>
                  </div>
                </div>
              ))}
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

      {/* MODAL 1: Send Terms Modal */}
      <Modal
        isOpen={isSendTermsModalOpen}
        onClose={() => setIsSendTermsModalOpen(false)}
        title="Dispatch Terms of Engagement (RICS Compliance)"
        subtitle={`Send legal mandate to client ${job.customer} (${job.customerEmail})`}
        maxWidth="max-w-xl"
        footer={
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <button
              onClick={() => handleConfirmSendTerms(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              ✓ Mark Terms Signed Directly
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSendTermsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmSendTerms(false)}
                className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Send Signature Link
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed">
            The client will receive an email and SMS with a secure link to execute the RICS Level 2 Standard Terms of Engagement. Inspection will remain pending until signed.
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client Email</label>
            <input
              type="email"
              disabled
              value={job.customerEmail}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Accreditation Mandate</label>
            <input
              type="text"
              disabled
              value="RICS Home Survey Standard (1st Edition, 2026 Mandate)"
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-medium"
            />
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Confirm / Adjust Quote Modal */}
      <Modal
        isOpen={isAdjustQuoteModalOpen}
        onClose={() => setIsAdjustQuoteModalOpen(false)}
        title="Confirm / Adjust Quotation"
        subtitle={`Adjust survey fees, discounts, and optional inspection extras for ${job.jobNo}`}
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              onClick={() => setIsAdjustQuoteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveQuoteAdjustments}
              className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Save & Recalculate
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Base Survey Fee (£ GBP)
            </label>
            <input
              type="number"
              step="10"
              value={quoteForm.baseFee}
              onChange={(e) => setQuoteForm({ ...quoteForm, baseFee: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
            />
          </div>

          <div className="space-y-2 pt-1">
            <span className="block font-semibold text-slate-700">Optional Inspection Extras</span>
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <span className="font-medium text-slate-700">Drone Roof & Chimney Inspection (+£120.00)</span>
              <input
                type="checkbox"
                checked={quoteForm.droneExtra}
                onChange={(e) => setQuoteForm({ ...quoteForm, droneExtra: e.target.checked })}
                className="w-4 h-4 rounded text-[#2563EB]"
              />
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <span className="font-medium text-slate-700">Same-Day Verbal Surveyor Debrief (+£50.00)</span>
              <input
                type="checkbox"
                checked={quoteForm.debriefExtra}
                onChange={(e) => setQuoteForm({ ...quoteForm, debriefExtra: e.target.checked })}
                className="w-4 h-4 rounded text-[#2563EB]"
              />
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <span className="font-medium text-slate-700">Thermal Imaging Defect Assessment (+£150.00)</span>
              <input
                type="checkbox"
                checked={quoteForm.thermalExtra}
                onChange={(e) => setQuoteForm({ ...quoteForm, thermalExtra: e.target.checked })}
                className="w-4 h-4 rounded text-[#2563EB]"
              />
            </label>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Client Discount (£ GBP)
            </label>
            <input
              type="number"
              step="5"
              value={quoteForm.discount}
              onChange={(e) => setQuoteForm({ ...quoteForm, discount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-emerald-700 font-bold"
            />
          </div>

          {/* Real-time Calculation Summary */}
          <div className="p-3 bg-slate-100 rounded-2xl space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>UK VAT (20%):</span>
              <span>£{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-xs">
              <span>Revised Total (inc. VAT):</span>
              <span className="text-emerald-700 font-black">£{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
