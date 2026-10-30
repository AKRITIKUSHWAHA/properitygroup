import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck,
  CreditCard,
  CalendarCheck,
  Eye,
  FileText,
  ShieldCheck,
  Send,
  Sparkles,
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

export const SURVEY_STAGES = [
  {
    step: 1,
    title: 'Enquiry Received',
    shortName: 'Enquiry',
    date: '24 Oct 2026, 14:15',
    icon: Send,
    desc: 'Survey enquiry logged for 14 Mayfair Gate via online portal.',
  },
  {
    step: 2,
    title: 'Quote Issued',
    shortName: 'Quote',
    date: '24 Oct 2026, 15:30',
    icon: FileText,
    desc: 'Fixed-price fee proposal £770.00 (+VAT) issued by NJS estimating team.',
  },
  {
    step: 3,
    title: 'Quote Accepted',
    shortName: 'Accepted',
    date: '25 Oct 2026, 09:40',
    icon: CheckCircle2,
    desc: 'Customer approved quotation terms and elected Level 2 Survey.',
  },
  {
    step: 4,
    title: 'Terms Signed',
    shortName: 'Signed',
    date: '26 Oct 2026, 11:15',
    icon: FileCheck,
    desc: 'RICS Letter of Engagement digitally executed with timestamp and IP stamp.',
  },
  {
    step: 5,
    title: 'Payment Confirmed',
    shortName: 'Paid',
    date: '26 Oct 2026, 11:20',
    icon: CreditCard,
    desc: 'Stripe transaction settled in full (£924.00 inc. VAT). Receipt generated.',
  },
  {
    step: 6,
    title: 'Appointment Booked',
    shortName: 'Booked',
    date: '26 Oct 2026, 16:30',
    icon: CalendarCheck,
    desc: 'Confirmed for 27 Oct, 10:00 - 13:00 with lead surveyor David Thorne MRICS.',
  },
  {
    step: 7,
    title: 'Inspection Completed',
    shortName: 'Inspected',
    date: '27 Oct 2026, 12:45',
    icon: Eye,
    desc: 'Physical on-site inspection concluded. Key returned to Foxtons Mayfair.',
  },
  {
    step: 8,
    title: 'Report Preparation',
    shortName: 'Drafting',
    date: '27 Oct 2026, 16:00',
    icon: Sparkles,
    desc: 'Surveyor drafting technical condition ratings and analyzing photographic evidence.',
  },
  {
    step: 9,
    title: 'Quality Check',
    shortName: 'QA Review',
    date: '28 Oct 2026, 10:30',
    icon: ShieldCheck,
    desc: 'Peer review and compliance sign-off by Lead Partner / Chartered Surveyor.',
  },
  {
    step: 10,
    title: 'Report Delivered',
    shortName: 'Delivered',
    date: '28 Oct 2026, 14:00',
    icon: CheckCircle2,
    desc: 'Final official RICS PDF report published to client portal & emailed.',
  },
];

export const SurveyProgressTracker = ({ currentStep = 7, job = null }) => {
  const [selectedStep, setSelectedStep] = useState(currentStep);

  // Derive step status: 'completed' | 'current' | 'upcoming'
  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const activeStageObj = SURVEY_STAGES.find((s) => s.step === selectedStep) || SURVEY_STAGES[currentStep - 1];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 mb-6">
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
            Real-time milestone tracking for {job?.property || '14 Mayfair Gate, London W1K 2PB'}
          </p>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="text-xs text-slate-600">Current Phase:</span>
          <span className="text-xs font-bold text-[#0B1F4D] bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs">
            Stage {currentStep} of 10: {SURVEY_STAGES[currentStep - 1]?.title}
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

          {SURVEY_STAGES.map((stage) => {
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
