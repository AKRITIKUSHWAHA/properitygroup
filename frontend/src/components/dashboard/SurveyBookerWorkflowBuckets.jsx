import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Send,
  Calendar,
  CheckCircle2,
  Upload,
  CalendarDays,
  ChevronRight,
  Layers,
  Sparkles,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useJobs } from '../../mock/jobs';
import { useLeads } from '../../mock/leads';

export const SurveyBookerWorkflowBuckets = ({ activeFilter, onSelectFilter, backendBuckets = null }) => {
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const { leads } = useLeads();

  // Helper to extract count from backendBuckets if present
  const getBackendCount = (bucketId) => {
    if (!Array.isArray(backendBuckets)) return null;
    const b = backendBuckets.find((item) => item.id === bucketId);
    return b ? b.count : null;
  };

  // Dynamic calculations matching SurveyBooker workflow buckets
  const bQuotes = getBackendCount('quotes_to_submit');
  const quotesToSubmit = bQuotes !== null ? bQuotes : (leads.filter(
    (l) => l.status === 'New' || l.status === 'Contacted' || !l.quotedAmount
  ).length + jobs.filter((j) => j.status === 'Quote requested').length);

  const bTerms = getBackendCount('terms_to_sign');
  const termsToSend = bTerms !== null ? bTerms : jobs.filter(
    (j) => j.status === 'Quote sent' || j.status === 'Accepted' || j.termsStatus === 'Not Sent'
  ).length;

  const unbookedJobs = jobs.filter(
    (j) =>
      (j.termsStatus === 'Signed' || j.paymentStatus === 'Paid' || j.status === 'Accepted' || j.quoteStatus === 'Accepted') &&
      j.status !== 'Booked' &&
      j.status !== 'Scheduled' &&
      j.status !== 'Survey done' &&
      j.status !== 'Closed'
  );
  const bJobsToBook = getBackendCount('jobs_to_book');
  const jobsToBook = bJobsToBook !== null ? bJobsToBook : unbookedJobs.length;
  const remindersSentCount = unbookedJobs.filter((j) => (j.bookingReminderCount || 0) > 0).length;

  const bAppointments = getBackendCount('appointments');
  const appointments = bAppointments !== null ? bAppointments : jobs.filter(
    (j) => j.status === 'Booked' || j.status === 'Scheduled' || j.timelineStep === 7
  ).length;

  const bReports = getBackendCount('reports_to_upload');
  const reportsToUpload = bReports !== null ? bReports : jobs.filter(
    (j) => j.status === 'Survey done' || j.status === 'Preparing report' || j.timelineStep === 8
  ).length;

  const allRecords = jobs.length;

  const buckets = [
    {
      id: 'all',
      title: 'All records',
      count: allRecords,
      badgeNote: '0 unread',
      icon: Layers,
      color: 'bg-slate-50 text-slate-700 border-slate-200',
      activeColor: 'bg-[#0B1F4D] text-white border-[#0B1F4D]',
      targetRoute: '/admin/jobs',
      desc: 'All active instructions & archive',
    },
    {
      id: 'quotes-to-submit',
      title: 'Quotes to submit',
      count: quotesToSubmit,
      badgeNote: quotesToSubmit > 0 ? 'Action required' : 'All clear',
      icon: FileText,
      color: 'bg-blue-50/70 text-blue-700 border-blue-200/80',
      activeColor: 'bg-blue-600 text-white border-blue-600',
      targetRoute: '/admin/leads?filter=New',
      desc: 'Inbound LSD & direct quote requests',
    },
    {
      id: 'terms-to-send',
      title: 'Terms to send',
      count: termsToSend,
      badgeNote: termsToSend > 0 ? 'Contracts pending' : 'All sent',
      icon: Send,
      color: 'bg-indigo-50/70 text-indigo-700 border-indigo-200/80',
      activeColor: 'bg-indigo-600 text-white border-indigo-600',
      targetRoute: '/admin/jobs?filter=Accepted',
      desc: 'Accepted proposals awaiting agreement dispatch',
    },
    {
      id: 'jobs-to-book',
      title: 'Jobs to book',
      count: jobsToBook,
      badgeNote: remindersSentCount > 0 ? `${remindersSentCount} Chased (1/2)` : (jobsToBook > 0 ? 'Awaiting Booking' : 'All booked'),
      icon: Calendar,
      color: 'bg-amber-50/70 text-amber-700 border-amber-200/80',
      activeColor: 'bg-amber-600 text-white border-amber-600',
      targetRoute: '/admin/jobs?filter=Action Required',
      desc: 'Accepted proposals awaiting inspection booking',
    },
    {
      id: 'appointments',
      title: 'Appointments',
      count: appointments,
      badgeNote: appointments > 0 ? 'Confirmed inspections' : 'None scheduled',
      icon: CalendarDays,
      color: 'bg-emerald-50/70 text-emerald-700 border-emerald-200/80',
      activeColor: 'bg-emerald-600 text-white border-emerald-600',
      targetRoute: '/admin/jobs?filter=Booked',
      desc: 'Scheduled on-site surveyor attendances',
    },
    {
      id: 'reports-to-upload',
      title: 'Reports to upload',
      count: reportsToUpload,
      badgeNote: reportsToUpload > 0 ? 'Awaiting report' : 'Up to date',
      icon: Upload,
      color: 'bg-rose-50/70 text-rose-700 border-rose-200/80',
      activeColor: 'bg-rose-600 text-white border-rose-600',
      targetRoute: '/admin/jobs?filter=Survey done',
      desc: 'Surveys inspected awaiting final PDF release',
    },
  ];

  const handleClick = (bucket) => {
    if (onSelectFilter) {
      onSelectFilter(bucket.id);
    }
    if (bucket.targetRoute) {
      navigate(bucket.targetRoute);
    }
  };

  return (
    <div className="space-y-3">
      {/* SurveyBooker Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0B1F4D] text-white">
              SurveyBooker Workflow
            </span>
            <span className="text-xs text-slate-400 font-medium">NJS Property Group Operations</span>
          </div>
          <h3 className="text-base font-extrabold text-[#0B1F4D] mt-1">
            Priority Action Buckets &bull; Live Queue
          </h3>
        </div>

        <button
          onClick={() => navigate('/staff/calendar')}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          <CalendarDays className="w-4 h-4 text-[#0B1F4D]" />
          <span>Open Calendar &amp; Tasks</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>

      {/* 6 Action Buckets Grid (Matching Video 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {buckets.map((b) => {
          const Icon = b.icon;
          const isSelected = activeFilter === b.id;

          return (
            <div
              key={b.id}
              onClick={() => handleClick(b)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                isSelected
                  ? b.activeColor + ' shadow-md scale-[1.01]'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
                    isSelected ? 'bg-white/20 text-white border-white/30' : b.color
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-black tracking-tight truncate ${
                        isSelected ? 'text-white' : 'text-slate-900 group-hover:text-[#0B1F4D]'
                      }`}
                    >
                      {b.title}
                    </span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white text-[#0B1F4D]'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {b.count}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      isSelected ? 'text-white/80' : 'text-slate-500'
                    }`}
                  >
                    {b.desc}
                  </p>
                </div>
              </div>

              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${
                  isSelected ? 'text-white' : 'text-slate-400'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

