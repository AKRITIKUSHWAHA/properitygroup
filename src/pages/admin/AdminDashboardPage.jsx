import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  User,
  MapPin,
  Calendar,
  Building,
  ArrowRight,
  Clock,
  CheckCircle2,
  PhoneCall,
  FileText,
  CreditCard,
  FileSignature,
  CalendarCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { SurveyBookerWorkflowBuckets } from '../../components/dashboard/SurveyBookerWorkflowBuckets';
import { NewBookingModal } from '../../components/calendar/NewBookingModal';
import { ClientProfileModal } from '../../components/crm/ClientProfileModal';
import { useJobs } from '../../mock/jobs';
import { useToast } from '../../components/ToastContext';

// Canonical 6-Step SurveyBooker Pipeline
const STAGES = [
  'Quote',
  'Paid',
  'Accepted',
  'Booked',
  'Preparing report',
  'Complete',
];

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { jobs, addJob } = useJobs();
  const { addToast } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBucketFilter, setActiveBucketFilter] = useState('all');

  const handleCreateJob = (newJob) => {
    addJob(newJob);
    setIsCreateModalOpen(false);
    addToast({
      type: newJob.canBook ? 'success' : 'info',
      title: 'Survey Job Scheduled',
      message: newJob.canBook
        ? `Job ${newJob.jobNo} booked with ${newJob.surveyor}.`
        : `Job ${newJob.jobNo} created and added to queue.`,
    });
  };

  const handleOpenClientProfile = (e, email) => {
    e.stopPropagation();
    setSelectedClientEmail(email || 'customer@demo.com');
    setIsClientModalOpen(true);
  };

  // Map raw job timelineStep to canonical 6-stage name
  const getJobStage = (job) => {
    const rawStep = job?.timelineStep || 4;
    if (rawStep <= 2) return 'Quote';
    if (rawStep === 3) return 'Paid';
    if (rawStep === 4 || rawStep === 5) return 'Accepted';
    if (rawStep === 6 || rawStep === 7) return 'Booked';
    if (rawStep === 8) return 'Preparing report';
    return 'Complete';
  };

  const getStageBadgeClass = (stage) => {
    switch (stage) {
      case 'Quote':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Paid':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Accepted':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Booked':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Preparing report':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Complete':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Filter jobs by search and active bucket
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          job.jobNo?.toLowerCase().includes(q) ||
          job.customer?.toLowerCase().includes(q) ||
          job.property?.toLowerCase().includes(q) ||
          job.location?.toLowerCase().includes(q) ||
          job.surveyor?.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Bucket match
      if (activeBucketFilter === 'all') return true;
      if (activeBucketFilter === 'quotes-to-submit') {
        return job.status === 'Quote requested' || job.timelineStep <= 2;
      }
      if (activeBucketFilter === 'terms-to-send') {
        return job.termsStatus === 'Not Sent' || job.status === 'Accepted';
      }
      if (activeBucketFilter === 'jobs-to-book') {
        return (job.paymentStatus === 'Paid' || job.termsStatus === 'Signed') && job.status !== 'Booked' && job.status !== 'Completed';
      }
      if (activeBucketFilter === 'appointments') {
        return job.status === 'Booked' || job.timelineStep === 7;
      }
      if (activeBucketFilter === 'reports-to-upload') {
        return job.status === 'Preparing report' || job.timelineStep === 8;
      }

      return true;
    });
  }, [jobs, searchQuery, activeBucketFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Admin Dashboard"
        subtitle="SurveyBooker operations workflow, action queues, and active property instructions."
        breadcrumb={['Admin', 'Dashboard']}
        actionLabel="Create Survey Job"
        actionIcon={Plus}
        onAction={() => setIsCreateModalOpen(true)}
      />

      {/* SurveyBooker 6 Action Buckets Strip (Video 1 Benchmark) */}
      <SurveyBookerWorkflowBuckets
        activeFilter={activeBucketFilter}
        onSelectFilter={setActiveBucketFilter}
      />

      {/* Main Content: Active Survey Instructions Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        {/* Toolbar: Title, Search, and Active Filter indicator */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-[#0B1F4D] flex items-center gap-2">
              <Building className="w-5 h-5 text-[#2563EB]" />
              <span>Active Survey Instructions &amp; Action Queue</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current RICS residential surveys organized by SurveyBooker progression stages.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search client, address, job ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {activeBucketFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveBucketFilter('all')}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Jobs List / Table */}
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No survey jobs found in this view</p>
            <p className="text-xs text-slate-500 mt-1">
              Try selecting "All records" above or clear your search query.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => {
              const stage = getJobStage(job);
              const stageBadgeClass = getStageBadgeClass(stage);

              return (
                <div
                  key={job.id}
                  onClick={() => navigate(`/admin/jobs/${job.id}`)}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer space-y-3 group"
                >
                  {/* Top Bar: Job No, Customer with Profile Shortcut, Stage Pill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-[#0B1F4D] text-white">
                        {job.jobNo}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{job.customer}</span>
                        <button
                          type="button"
                          onClick={(e) => handleOpenClientProfile(e, job.customerEmail)}
                          title="Open Client Call Notes & Complaints Log"
                          className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-[11px] font-bold border border-blue-200/80 transition-colors cursor-pointer"
                        >
                          Client Profile
                        </button>
                      </div>
                    </div>

                    {/* Stage Badge & Manage Button */}
                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${stageBadgeClass}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                        Stage: {stage}
                      </span>

                      <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#2563EB] group-hover:translate-x-0.5 transition-transform">
                        <span>Manage</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Property Address, Survey Type, and Assigned Surveyor */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                    {/* Property Address */}
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="font-semibold truncate">
                        {job.property || job.location}
                      </span>
                    </div>

                    {/* Survey Type */}
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{job.surveyType}</span>
                    </div>

                    {/* Assigned Surveyor & Inspection Date */}
                    <div className="flex items-center justify-between md:justify-end gap-2 text-slate-500">
                      <span className="font-medium text-slate-700 truncate">
                        {job.surveyor || 'Unallocated'}
                      </span>
                      {job.date && (
                        <span className="font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60 shrink-0">
                          {job.date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Pipeline Micro-Stepper */}
                  <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Pipeline:</span>
                      <span className="font-semibold text-slate-700">
                        {job.termsStatus === 'Signed' ? 'Terms Signed ✓' : 'Terms Pending'}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        {job.paymentStatus === 'Paid' ? 'Paid Online ✓' : 'Payment Awaiting'}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {job.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create New Booking Modal */}
      <NewBookingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateJob}
      />

      {/* Client Profile Modal (Call Notes & Complaints) */}
      <ClientProfileModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clientEmail={selectedClientEmail}
        initialTab="calls"
      />
    </div>
  );
};
