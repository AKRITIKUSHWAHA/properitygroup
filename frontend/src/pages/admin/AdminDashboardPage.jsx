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
  MessageSquare,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { SurveyBookerWorkflowBuckets } from '../../components/dashboard/SurveyBookerWorkflowBuckets';
import { NewBookingModal } from '../../components/calendar/NewBookingModal';
import { ClientProfileModal } from '../../components/crm/ClientProfileModal';
import { AdminMessagesModal } from '../../components/crm/AdminMessagesModal';
import { SendQuoteModal } from '../../components/crm/SendQuoteModal';
import { useJobs } from '../../mock/jobs';
import { useLeads } from '../../mock/leads';
import { useMessages } from '../../mock/messages';
import { useToast } from '../../components/ToastContext';
import { adminDashboardApi, adminSurveyJobsApi, adminCrmAndLeadsApi } from '../../api/adminApi';
import { useEffect } from 'react';

// Mapper from Backend Job model to Frontend Job state
const mapBackendJobToFrontend = (bj) => {
  let mappedStatus = 'Action Required';
  let timelineStep = 2;
  const stage = (bj.stage || '').toUpperCase();
  if (stage === 'COMPLETE') {
    mappedStatus = 'Completed';
    timelineStep = 10;
  } else if (stage === 'PREPARING_REPORT' || stage === 'IN_PROGRESS') {
    mappedStatus = 'In Progress';
    timelineStep = 8;
  } else if (stage === 'BOOKED' || stage === 'CONFIRMED' || stage === 'SCHEDULED' || stage === 'INSPECTION_BOOKED') {
    mappedStatus = 'Scheduled';
    timelineStep = 6;
  } else if (stage === 'QUOTE' || stage === 'INSTRUCTION' || stage === 'NEW') {
    mappedStatus = 'Action Required';
    timelineStep = 2;
  } else if (stage === 'PAID') {
    mappedStatus = 'Action Required';
    timelineStep = 3;
  } else if (stage === 'ACCEPTED') {
    mappedStatus = 'Action Required';
    timelineStep = 4;
  }

  const termsSigned = Array.isArray(bj.terms) && bj.terms.some((t) => t.signed);
  const invoicePaid = Array.isArray(bj.invoices) && bj.invoices.some((i) => i.status === 'PAID');

  const termsStatus = termsSigned ? 'Signed' : (Array.isArray(bj.terms) && bj.terms.length > 0 ? 'Sent' : 'Pending');
  const paymentStatus = invoicePaid ? 'Paid' : (Array.isArray(bj.invoices) && bj.invoices.length > 0 ? 'Invoice Sent' : 'Awaiting Payment');
  const canBook = termsSigned && invoicePaid;

  const hasAllocatedSurveyor = Boolean(bj.surveyor?.name || bj.surveyorId);
  const surveyorName = hasAllocatedSurveyor ? (bj.surveyor?.name || 'Assigned Surveyor') : 'Unassigned';
  const sId = hasAllocatedSurveyor ? (bj.surveyorId ? `srv-${bj.surveyorId}` : 'srv-assigned') : null;

  return {
    id: String(bj.id),
    dbId: bj.id,
    jobNo: bj.reference || `JOB-2026-${String(bj.id).padStart(3, '0')}`,
    date: bj.inspectionDate
      ? new Date(bj.inspectionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : null,
    timeSlot: bj.inspectionTime || null,
    customer: bj.clientName || 'Private Client',
    customerEmail: bj.clientEmail || 'client@example.com',
    customerPhone: bj.clientPhone || '+44 7700 900000',
    surveyType: bj.serviceType || 'RICS Level 2 Home Survey',
    property: bj.propertyAddress || 'London Property',
    location: bj.postcode ? `${bj.postcode}, London` : 'London, UK',
    postcode: bj.postcode || 'W1K 2PB',
    surveyor: surveyorName,
    surveyorId: sId,
    status: mappedStatus,
    timelineStep,
    termsStatus,
    paymentStatus,
    canBook: canBook || mappedStatus === 'Scheduled' || mappedStatus === 'Completed',
    accessNotes: bj.company?.keyCollectionProtocol || 'Keys held at estate agent branch',
    backendSynced: true,
  };
};

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
  const { jobs, setJobs, addJob } = useJobs();
  const { leads, setLeads, updateLeadStatus } = useLeads();
  const { addToast } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [quotingLead, setQuotingLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRef, setSearchRef] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [activeBucketFilter, setActiveBucketFilter] = useState('all');
  const [backendBuckets, setBackendBuckets] = useState(null);

  // Fetch dashboard stats, jobs, leads & action buckets from backend API
  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      adminSurveyJobsApi.getJobs(),
      adminCrmAndLeadsApi.getLeads(),
      adminDashboardApi.getActionBuckets(),
      adminDashboardApi.getStats(),
    ]).then(([jobsRes, leadsRes, bucketsRes]) => {
      if (!isMounted) return;

      // 1. Synchronize Jobs
      if (jobsRes.status === 'fulfilled') {
        const apiJobs = jobsRes.value?.data?.data?.jobs || jobsRes.value?.jobs || [];
        if (Array.isArray(apiJobs)) {
          const mapped = apiJobs.map(mapBackendJobToFrontend).filter((bj) => {
            const email = (bj.customerEmail || '').toLowerCase().trim();
            const name = (bj.customer || '').toLowerCase().trim();
            const prop = (bj.property || '').toLowerCase().trim();
            const id = String(bj.id || '').trim();
            const jobNo = String(bj.jobNo || '').trim().toUpperCase();
            return (
              email !== 'customer@demo.com' &&
              email !== 'customer2@demo.com' &&
              !email.includes('akku') &&
              !name.includes('akku') &&
              !prop.includes('mp nagar') &&
              !prop.includes('bhopal') &&
              !prop.includes('plot no 45') &&
              id !== '7' &&
              id !== 'JOB-2026-101' &&
              jobNo !== 'JOB-2026-101'
            );
          });
          // Deduplicate multiple entries for identical client instruction
          const seen = new Set();
          const deduplicated = [];
          for (const item of mapped) {
            const key = `${(item.customerEmail || '').toLowerCase()}_${(item.property || '').toLowerCase().replace(/\s+/g, '')}`;
            if (!seen.has(key)) {
              seen.add(key);
              deduplicated.push(item);
            }
          }
          setJobs(deduplicated);
        }
      }

      // 2. Synchronize Leads
      if (leadsRes.status === 'fulfilled') {
        const rawLeads = leadsRes.value?.leads || leadsRes.value?.data?.leads || (Array.isArray(leadsRes.value) ? leadsRes.value : []);
        if (Array.isArray(rawLeads)) {
          const cleanLeads = rawLeads.filter((l) => {
            const name = (l.clientName || '').toLowerCase().trim();
            const email = (l.clientEmail || '').toLowerCase().trim();
            const addr = (l.propertyAddress || '').toLowerCase().trim();
            return !name.includes('akku') && !email.includes('akku') && !addr.includes('mp nagar') && !addr.includes('bhopal') && l.id !== 7;
          });
          const statusMap = {
            NEW: 'New',
            CONTACTED: 'Contacted',
            QUALIFIED: 'Qualified',
            QUOTE_SENT: 'Quoted',
            CONVERTED: 'Converted',
            LOST: 'Lost',
          };
          const mappedLeads = cleanLeads.map((l) => ({
            id: l.reference || `NJS-2026-${l.id}`,
            customerName: l.clientName || 'Private Client',
            customerEmail: l.clientEmail || '',
            customerPhone: l.clientPhone || '',
            enquiry: l.serviceType || 'RICS Level 2 Home Survey',
            property: l.propertyAddress || 'London Property',
            location: l.postcode || '',
            status: statusMap[l.status?.toUpperCase()] || l.status || 'New',
            source: l.source || 'Website',
          }));
          setLeads(mappedLeads);
        }
      }

      // 3. Synchronize Action Buckets
      if (bucketsRes.status === 'fulfilled') {
        const buckets = bucketsRes.value?.buckets || bucketsRes.value?.data?.buckets || [];
        if (Array.isArray(buckets) && buckets.length > 0) {
          setBackendBuckets(buckets);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const { conversations } = useMessages();
  const totalUnreadMessages = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unreadAdmin || 0), 0);
  }, [conversations]);

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
    if (rawStep === 6) return 'Booked';
    if (rawStep === 7 || rawStep === 8 || rawStep === 9) return 'Preparing report';
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

  // Filter leads awaiting quotes when 'quotes-to-submit' is selected
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const s = String(l.status || '').toLowerCase();
      const isUnquoted = s === 'new' || s === 'contacted' || s === 'qualified';
      if (!isUnquoted) return false;

      if (searchRef.trim() && !l.id?.toLowerCase().includes(searchRef.toLowerCase())) {
        return false;
      }
      if (searchClient.trim() && !l.customerName?.toLowerCase().includes(searchClient.toLowerCase())) {
        return false;
      }
      if (searchLocation.trim()) {
        const loc = searchLocation.toLowerCase();
        const matchesLoc = l.property?.toLowerCase().includes(loc) || l.location?.toLowerCase().includes(loc);
        if (!matchesLoc) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          l.id?.toLowerCase().includes(q) ||
          l.customerName?.toLowerCase().includes(q) ||
          l.property?.toLowerCase().includes(q) ||
          l.location?.toLowerCase().includes(q) ||
          l.enquiry?.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      return true;
    });
  }, [leads, searchRef, searchClient, searchLocation, searchQuery]);

  // Filter jobs by search and active bucket
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Column searches
      if (searchRef.trim() && !job.jobNo?.toLowerCase().includes(searchRef.toLowerCase())) {
        return false;
      }
      if (searchClient.trim() && !job.customer?.toLowerCase().includes(searchClient.toLowerCase())) {
        return false;
      }
      if (searchLocation.trim()) {
        const loc = searchLocation.toLowerCase();
        const matchesLoc = job.property?.toLowerCase().includes(loc) || job.location?.toLowerCase().includes(loc);
        if (!matchesLoc) return false;
      }
      // General search match
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
        return !job.canBook || job.termsStatus !== 'Signed' || job.paymentStatus !== 'Paid';
      }
      if (activeBucketFilter === 'appointments') {
        return job.status === 'Booked' || job.status === 'Scheduled' || job.timelineStep === 7;
      }
      if (activeBucketFilter === 'reports-to-upload') {
        return job.status === 'Preparing report' || job.status === 'In Progress' || job.timelineStep === 8;
      }

      return true;
    });
  }, [jobs, searchRef, searchClient, searchLocation, searchQuery, activeBucketFilter]);

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
        backendBuckets={backendBuckets}
        jobs={jobs}
        leads={leads}
      />

      {/* Main Content: Active Survey Instructions Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        {/* Toolbar: Title, Active Filter indicator, Quick Search & Reset */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-[#0B1F4D] flex items-center gap-2 flex-wrap">
              <Building className="w-5 h-5 text-[#2563EB]" />
              <span>
                {activeBucketFilter === 'quotes-to-submit'
                  ? 'Quotes to Submit (Inbound Enquiries)'
                  : activeBucketFilter === 'terms-to-send'
                  ? 'Terms to Send Queue'
                  : activeBucketFilter === 'jobs-to-book'
                  ? 'Jobs to Book (Awaiting Booking)'
                  : activeBucketFilter === 'appointments'
                  ? 'Appointments (Booked Attendances)'
                  : activeBucketFilter === 'reports-to-upload'
                  ? 'Reports to Upload'
                  : 'Active Survey Instructions & Action Queue'}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                {activeBucketFilter === 'quotes-to-submit'
                  ? `${filteredLeads.length} ${filteredLeads.length === 1 ? 'Enquiry' : 'Enquiries'}`
                  : `${filteredJobs.length} ${filteredJobs.length === 1 ? 'Job' : 'Jobs'}`}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeBucketFilter === 'quotes-to-submit'
                ? 'Incoming enquiries from Local Surveyors Direct and website awaiting quotation proposals.'
                : 'Current RICS residential surveys organized by SurveyBooker progression stages.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick General Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Quick search all..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {(activeBucketFilter !== 'all' || searchQuery || searchRef || searchClient || searchLocation) && (
              <button
                type="button"
                onClick={() => {
                  setActiveBucketFilter('all');
                  setSearchQuery('');
                  setSearchRef('');
                  setSearchClient('');
                  setSearchLocation('');
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* SurveyBooker-Style Inline Column Filter Boxes (Matching SurveyBooker Image 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Search Survey ID / Ref
            </label>
            <input
              type="text"
              placeholder="e.g. NJS-2026, JOB-101, LSD-..."
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Search Customer / Name
            </label>
            <input
              type="text"
              placeholder="e.g. John, Fiona, Smith..."
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Search Property Address / Postcode
            </label>
            <input
              type="text"
              placeholder="e.g. London, Mayfair, SW1A..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conditional Content: Leads Queue vs Survey Jobs Queue */}
        {activeBucketFilter === 'quotes-to-submit' ? (
          /* INBOUND LEADS / QUOTES TO SUBMIT VIEW */
          filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No pending quotes found in this filter</p>
              <p className="text-xs text-slate-500 mt-1">
                All inbound inquiries from Local Surveyors Direct and website have been quoted!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 sm:p-5 rounded-2xl border border-blue-100 bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-3"
                >
                  {/* Lead Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-blue-900 text-white">
                        {lead.id}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        lead.source === 'Local Surveyors Direct'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {lead.source || 'Website'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{lead.customerName}</span>
                        {lead.customerEmail && (
                          <button
                            type="button"
                            onClick={(e) => handleOpenClientProfile(e, lead.customerEmail)}
                            title="Open Client Profile"
                            className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-[11px] font-bold border border-blue-200/80 transition-colors cursor-pointer"
                          >
                            Client Profile
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQuotingLead(lead)}
                      className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0 self-end sm:self-auto"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Send Quote Proposal &rarr;</span>
                    </button>
                  </div>

                  {/* Lead Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="font-semibold truncate">
                        {lead.property} {lead.location ? `(${lead.location})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{lead.enquiry}</span>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-2 text-slate-500">
                      <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Pending Quote Proposal
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* STANDARD SURVEY JOBS VIEW */
          filteredJobs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No survey jobs found in this view</p>
              <p className="text-xs text-slate-500 mt-1">
                Try selecting "All records" above or clear your column filters.
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
                        <span className="font-medium text-slate-600 truncate text-[11px]">
                          {job.surveyor && job.surveyor !== 'Pending Allocation' && job.surveyor !== 'Unassigned' && job.surveyor !== 'Unallocated'
                            ? job.surveyor
                            : 'Surveyor: Unassigned'}
                        </span>
                        {job.date && job.date !== 'Pending Allocation' ? (
                          <span className="font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60 shrink-0 text-slate-700 font-semibold">
                            {job.date}
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-slate-400 bg-slate-50/70 px-2 py-0.5 rounded-md border border-slate-200/60 shrink-0">
                            Date: TBD
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
          )
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

      {/* Central Messaging Desk Modal */}
      <AdminMessagesModal
        isOpen={isMessagesModalOpen}
        onClose={() => setIsMessagesModalOpen(false)}
      />

      {/* Send Quote Modal from Dashboard */}
      {quotingLead && (
        <SendQuoteModal
          isOpen={!!quotingLead}
          onClose={() => setQuotingLead(null)}
          lead={quotingLead}
          onQuoteSent={(leadId, quotedAmount, quoteRef) => {
            updateLeadStatus(leadId, 'Quoted', {
              estimatedValue: quotedAmount,
              quoteRef: quoteRef,
            });
            setQuotingLead(null);
            addToast({
              type: 'success',
              title: 'Quote Dispatched',
              message: `Fee proposal sent for ${quotingLead.customerName || leadId}.`,
            });
          }}
        />
      )}
    </div>
  );
};
