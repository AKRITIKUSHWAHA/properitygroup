import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck,
  Building2,
  CalendarCheck,
  Eye,
  FileText,
  ShieldCheck,
  Send,
  Sparkles,
  Download,
} from 'lucide-react';

/**
 * 10-Stage RICS Survey Progress Tracker Component
 * Strictly maps to client's Master Development List (Point 13):
 * 1. Enquiry Received
 * 2. Quote Issued
 * 3. Quote Accepted
 * 4. Terms Signed
 * 5. Payment Confirmed
 * 6. Appointment Booked
 * 7. Inspection Completed
 * 8. Report Preparation
 * 9. Quality Check
 * 10. Report Delivered
 */

/**
 * Shared single source of truth for RICS 10-Stage calculation across all pages
 */
export const computeRICSStage = (job, apiTracking = null, userEmail = '') => {
  const jobRef = (job?.jobNo || job?.id || job?.reference || '').toString().trim();
  const cleanRef = jobRef.replace(/[^a-zA-Z0-9_-]/g, '');
  const digitsRef = jobRef.replace(/[^0-9]/g, '');

  const isDeliveredLocal =
    localStorage.getItem('propertygroup_delivered') === 'true' ||
    (userEmail && localStorage.getItem(`propertygroup_delivered_${userEmail}`) === 'true') ||
    (jobRef && localStorage.getItem(`propertygroup_delivered_${jobRef}`) === 'true') ||
    (cleanRef && localStorage.getItem(`propertygroup_delivered_${cleanRef}`) === 'true');

  const isQALocal =
    localStorage.getItem('propertygroup_qareview') === 'true' ||
    (userEmail && localStorage.getItem(`propertygroup_qareview_${userEmail}`) === 'true') ||
    (jobRef && localStorage.getItem(`propertygroup_qareview_${jobRef}`) === 'true') ||
    (cleanRef && localStorage.getItem(`propertygroup_qareview_${cleanRef}`) === 'true') ||
    (digitsRef && localStorage.getItem(`propertygroup_qareview_JOB-2026-${digitsRef}`) === 'true');

  const isDraftingLocal =
    localStorage.getItem('propertygroup_drafting') === 'true' ||
    (userEmail && localStorage.getItem(`propertygroup_drafting_${userEmail}`) === 'true') ||
    (jobRef && localStorage.getItem(`propertygroup_drafting_${jobRef}`) === 'true') ||
    (cleanRef && localStorage.getItem(`propertygroup_drafting_${cleanRef}`) === 'true');

  const isInspectedLocal =
    localStorage.getItem('propertygroup_inspection_completed') === 'true' ||
    (userEmail && localStorage.getItem(`propertygroup_inspection_completed_${userEmail}`) === 'true') ||
    (jobRef && localStorage.getItem(`propertygroup_inspection_completed_${jobRef}`) === 'true') ||
    (cleanRef && localStorage.getItem(`propertygroup_inspection_completed_${cleanRef}`) === 'true');

  const status = (job?.status || '').toLowerCase().trim();
  const stage = (job?.stage || '').toUpperCase().trim();
  const termsStatus = (job?.termsStatus || '').toLowerCase().trim();
  const paymentStatus = (job?.paymentStatus || '').toLowerCase().trim();
  const step = Number(job?.timelineStep) || 0;

  const apiStep = Number(apiTracking?.currentStep || apiTracking?.timelineStep || job?.timelineStep) || 0;
  const apiStage = String(
    apiTracking?.currentStage ||
    apiTracking?.stage ||
    apiTracking?.job?.stage ||
    job?.stage ||
    ''
  ).toUpperCase().trim();
  const isApiSigned = Boolean(apiTracking?.signed || apiTracking?.isSigned);

  const hasDate = Boolean(job?.date && !['date: tbd', 'pending scheduling', 'tbd', ''].includes(job.date.toLowerCase().trim()));
  const hasSurveyor = Boolean(job?.surveyor && !['pending allocation', 'unassigned', 'tbd', 'none', ''].includes(job.surveyor.toLowerCase().trim()));

  // 10. Completed / Delivered
  if (
    status === 'completed' || status === 'delivered' ||
    stage === 'COMPLETE' || stage === 'COMPLETED' ||
    apiStage === 'COMPLETE' || apiStage === 'COMPLETED' ||
    step >= 10 || apiStep >= 10 || isDeliveredLocal
  ) {
    return 10;
  }

  // 9. QA Review
  if (
    status === 'qa_review' || status === 'qa review' ||
    stage === 'QA_REVIEW' || apiStage === 'QA_REVIEW' ||
    step === 9 || apiStep === 9 || isQALocal ||
    ((stage === 'PREPARING_REPORT' || apiStage === 'PREPARING_REPORT') && (isQALocal || status === 'qa_review' || step >= 9 || apiStep >= 9))
  ) {
    return 9;
  }

  // 8. Drafting / Preparing Report
  if (
    status === 'drafting' || status === 'preparing report' ||
    stage === 'PREPARING_REPORT' || stage === 'DRAFTING' ||
    apiStage === 'PREPARING_REPORT' || apiStage === 'DRAFTING' ||
    step === 8 || apiStep === 8 || isDraftingLocal
  ) {
    return 8;
  }

  // 7. Inspection Completed
  if (
    status === 'inspected' ||
    stage === 'INSPECTED' || apiStage === 'INSPECTED' ||
    step === 7 || apiStep === 7 || isInspectedLocal
  ) {
    return 7;
  }

  // 6. Appointment Booked
  if (
    status === 'booked' || status === 'scheduled' ||
    stage === 'BOOKED' || stage === 'SCHEDULED' ||
    apiStage === 'BOOKED' || apiStage === 'SCHEDULED' ||
    step === 6 || apiStep === 6 ||
    (hasDate && (paymentStatus === 'paid' || paymentStatus.includes('claimed') || termsStatus === 'signed')) ||
    (hasSurveyor && (paymentStatus === 'paid' || paymentStatus.includes('claimed')))
  ) {
    return 6;
  }

  // 5. Payment Confirmed / Verification Pending
  if (
    paymentStatus === 'paid' || paymentStatus.includes('claimed') ||
    stage === 'PAID' || apiStage === 'PAID' ||
    step === 5 || apiStep === 5
  ) {
    return 5;
  }

  // 4. Terms Signed
  if (
    termsStatus === 'signed' ||
    stage === 'SIGNED' || apiStage === 'SIGNED' ||
    isApiSigned ||
    step === 4 || apiStep === 4
  ) {
    return 4;
  }

  // 3. Quote Accepted
  if (
    status === 'accepted' || job?.quoteStatus === 'Accepted' ||
    stage === 'ACCEPTED' || apiStage === 'ACCEPTED' ||
    step === 3 || apiStep === 3
  ) {
    return 3;
  }

  // 2. Quote Issued
  if (
    status === 'quoted' ||
    stage === 'QUOTE' || stage === 'QUOTED' ||
    apiStage === 'QUOTE' || apiStage === 'QUOTED' ||
    step === 2 || apiStep === 2
  ) {
    return 2;
  }

  // 1. Enquiry
  if (step === 1 || apiStep === 1 || status === 'enquiry' || stage === 'ENQUIRY' || apiStage === 'ENQUIRY') {
    return 1;
  }

  if (step > 0) return Math.min(10, Math.max(1, step));
  if (apiStep > 0) return Math.min(10, Math.max(1, apiStep));
  return 1;
};

export const getSurveyStages = (job) => {
  const property = job?.property || 'the property';
  const surveyor = (job?.surveyor && !['pending allocation', 'unassigned', 'tbd', 'none', ''].includes(String(job.surveyor).toLowerCase().trim()))
    ? job.surveyor
    : 'Assigned Chartered Surveyor';
  const fee = job?.quote?.baseFee ? `£${job.quote.baseFee.toFixed(2)} (+VAT)` : 'agreed fee';

  return [
    {
      step: 1,
      title: 'Enquiry Received',
      shortName: 'Enquiry',
      date: job?.date ? `Logged: ${job.date}` : 'Recently',
      icon: Send,
      desc: `Survey instruction logged for ${property} via online portal.`,
    },
    {
      step: 2,
      title: 'Quote Issued',
      shortName: 'Quote',
      date: 'NJS Estimating',
      icon: FileText,
      desc: `Fixed-price fee proposal ${fee} issued by NJS estimating team.`,
    },
    {
      step: 3,
      title: 'Quote Accepted',
      shortName: 'Accepted',
      date: 'Client Instruction',
      icon: CheckCircle2,
      desc: `Customer confirmed instruction for ${job?.surveyType || 'RICS Survey'}.`,
    },
    {
      step: 4,
      title: 'Terms Signed',
      shortName: 'Signed',
      date: job?.termsStatus === 'Signed' ? 'Executed' : 'Pending',
      icon: FileCheck,
      desc: 'RICS Letter of Engagement digitally executed under RICS regulatory governance.',
    },
    {
      step: 5,
      title: 'Payment Confirmed',
      shortName: 'Bank Transfer',
      date: job?.paymentStatus === 'Paid'
        ? 'Settled'
        : (job?.paymentStatus === 'Claimed (Verification Pending)' || job?.paymentStatus === 'Claimed' || job?.paymentStatus?.includes('Claimed'))
        ? 'Verification Pending'
        : 'Pending',
      icon: Building2,
      desc: job?.paymentStatus === 'Paid'
        ? 'Bank transfer verified and cleared in full. Official VAT receipt available in portal.'
        : (job?.paymentStatus === 'Claimed (Verification Pending)' || job?.paymentStatus === 'Claimed' || job?.paymentStatus?.includes('Claimed'))
        ? 'Payment Claimed — Awaiting NJS Admin Verification.'
        : 'Direct bank transfer pending to NJS client account.',
    },
    {
      step: 6,
      title: 'Appointment Booked',
      shortName: 'Booked',
      date: job?.date ? `${job.date}, ${job.timeSlot || 'Confirmed slot'}` : 'Scheduled',
      icon: CalendarCheck,
      desc: `Inspection confirmed with ${surveyor}. Access arranged directly with selling agent.`,
    },
    {
      step: 7,
      title: 'Inspection Completed',
      shortName: 'Inspected',
      date: 'Field Inspection',
      icon: Eye,
      desc: `Physical on-site inspection concluded by ${surveyor}.`,
    },
    {
      step: 8,
      title: 'Report Preparation',
      shortName: 'Drafting',
      date: 'Drafting',
      icon: Sparkles,
      desc: 'Surveyor drafting technical condition ratings and analyzing photographic evidence.',
    },
    {
      step: 9,
      title: 'Quality Check',
      shortName: 'QA Review',
      date: 'Peer Review',
      icon: ShieldCheck,
      desc: 'Lead Surveyor auditing defect ratings against RICS Home Survey Standard.',
    },
    {
      step: 10,
      title: 'Report Delivered',
      shortName: 'Delivered',
      date: 'Available Now',
      icon: Download,
      desc: 'Final accredited survey report published to your customer portal for instant download.',
    },
  ];
};

export const SURVEY_STAGES = getSurveyStages(null);

export const SurveyProgressTracker = ({ currentStep = 7, job = null }) => {
  const [selectedStep, setSelectedStep] = useState(currentStep);
  const stages = getSurveyStages(job);

  useEffect(() => {
    setSelectedStep(currentStep);
  }, [currentStep]);

  // Derive step status: 'completed' | 'current' | 'upcoming'
  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const safeStep = Math.min(10, Math.max(1, Number(currentStep) || 1));
  const activeStageObj = stages.find((s) => s.step === selectedStep) || stages[safeStep - 1] || stages[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Instruction Progress
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0B1F4D] mt-1">
            10-Stage RICS Survey Progress Tracker
          </h2>
          <p className="text-xs text-slate-500">
            Real-time milestone tracking for {job?.property || 'Your Property'}
          </p>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="text-xs text-slate-600">Current Phase:</span>
          <span className="text-xs font-bold text-[#0B1F4D] bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs">
            Stage {safeStep} of 10: {stages[safeStep - 1]?.title || 'Progress'}
          </span>
        </div>
      </div>

      {/* Progress Bar (Overall percentage) */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
          <span>Overall Journey Completion</span>
          <span className="text-[#0B1F4D]">{Math.round((currentStep / 10) * 100)}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="h-full bg-gradient-to-r from-[#0B1F4D] via-blue-600 to-emerald-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(currentStep / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Stepper (Horizontal with scroll on tablet) */}
      <div className="hidden lg:block overflow-x-auto pb-4">
        <div className="flex items-start justify-between min-w-[860px] relative">
          {/* Connector Line */}
          <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
          <div
            className="absolute top-5 left-6 h-0.5 bg-[#0B1F4D] transition-all duration-500 -z-0"
            style={{ width: `${((currentStep - 1) / 9) * 100}%` }}
          />

          {stages.map((stage) => {
            const status = getStepStatus(stage.step);
            const isSelected = selectedStep === stage.step;
            const Icon = stage.icon;

            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setSelectedStep(stage.step)}
                className={`flex flex-col items-center group relative z-10 text-center transition-all focus:outline-none max-w-[85px]`}
              >
                {/* Node Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm
                    ${
                      status === 'completed'
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 group-hover:scale-110'
                        : status === 'current'
                        ? 'bg-[#0B1F4D] text-white ring-4 ring-blue-100 scale-110 animate-bounce-subtle'
                        : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
                    }
                    ${isSelected ? 'ring-[#0B1F4D]/30 border-2 border-[#0B1F4D]' : ''}
                  `}
                >
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <span>{stage.step}</span>
                  )}
                </div>

                {/* Title */}
                <span
                  className={`mt-2 text-[11px] font-semibold leading-tight line-clamp-2 transition-colors
                    ${
                      status === 'completed'
                        ? 'text-slate-800'
                        : status === 'current'
                        ? 'text-[#0B1F4D] font-bold'
                        : 'text-slate-400'
                    }
                  `}
                >
                  {stage.shortName}
                </span>

                {/* Date */}
                <span className="text-[9px] text-slate-400 mt-0.5">
                  {stage.date.split(',')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet Vertical Timeline (< lg) */}
      <div className="lg:hidden space-y-3">
        {SURVEY_STAGES.map((stage) => {
          const status = getStepStatus(stage.step);
          const isCurrent = status === 'current';
          const isDone = status === 'completed';

          return (
            <div
              key={stage.step}
              onClick={() => setSelectedStep(stage.step)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3
                ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-200 ring-1 ring-blue-300/50'
                    : isDone
                    ? 'bg-white border-slate-200/80 hover:bg-slate-50'
                    : 'bg-slate-50/60 border-slate-200/50 opacity-60'
                }
              `}
            >
              <div
                className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold
                  ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#0B1F4D] text-white ring-2 ring-blue-200'
                      : 'bg-slate-200 text-slate-600'
                  }
                `}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : stage.step}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {stage.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {stage.date}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stage Detail Card */}
      <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0B1F4D] text-white flex items-center justify-center shrink-0">
            <activeStageObj.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0B1F4D]">
                Step {activeStageObj.step}: {activeStageObj.title}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                  ${
                    getStepStatus(activeStageObj.step) === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : getStepStatus(activeStageObj.step) === 'current'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }
                `}
              >
                {getStepStatus(activeStageObj.step) === 'completed'
                  ? 'Completed'
                  : getStepStatus(activeStageObj.step) === 'current'
                  ? 'Active Stage'
                  : 'Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">{activeStageObj.desc}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Timestamp: {activeStageObj.date}
            </p>
          </div>
        </div>

        {/* Quick action button for current stage */}
        <div className="shrink-0 self-end sm:self-center">
          {activeStageObj.step === 4 && (
            <a
              href="/customer/terms-to-sign"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1F4D] text-white text-xs font-semibold rounded-lg hover:bg-[#15337A] transition-colors"
            >
              Sign Terms <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
          {activeStageObj.step === 5 && (
            <a
              href="/customer/invoices-and-payments"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              View Receipt <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
          {activeStageObj.step === 6 && (
            <a
              href="/customer/appointment-details"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1F4D] text-white text-xs font-semibold rounded-lg hover:bg-[#15337A] transition-colors"
            >
              Appointment Details <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
          {activeStageObj.step >= 9 && (
            <a
              href="/customer/reports"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1F4D] text-white text-xs font-semibold rounded-lg hover:bg-[#15337A] transition-colors"
            >
              Download Report <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

