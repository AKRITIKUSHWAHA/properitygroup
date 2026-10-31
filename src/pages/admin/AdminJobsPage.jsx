import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Eye,
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
  Lock,
  MoreVertical,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  FileText,
  TrendingUp,
  UserCheck,
  Copy,
  Building2,
  ShieldCheck,
  CalendarDays,
  FileCheck2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { StatusPill } from '../../components/common/StatusPill';
import { SURVEYORS, useJobs } from '../../mock/jobs';
import { NewBookingModal } from '../../components/calendar/NewBookingModal';
import { ClientProfileModal } from '../../components/crm/ClientProfileModal';
import { useToast } from '../../components/ToastContext';

// 3-Dot Clean Action Dropdown Menu for each Survey Job
const JobRowActions = ({ job, baseJobsPath, onOpenClientProfile }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCopy = (e, text, label) => {
    e.stopPropagation();
    setIsOpen(false);
    navigator.clipboard?.writeText(text);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${label}: ${text}`,
    });
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors cursor-pointer"
        title="Job actions"
        aria-label="Job actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Primary View Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              navigate(`${baseJobsPath}/${job.id}`);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#0B1F4D] bg-blue-50/70 hover:bg-blue-100/80 transition-colors cursor-pointer text-left"
          >
            <Eye className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>Open Job Workspace</span>
          </button>

          {/* Client Profile, Call Notes & Complaints */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onOpenClientProfile(job.customerEmail, 'calls');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0B1F4D] transition-colors cursor-pointer text-left"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>Call Notes &amp; Complaints</span>
          </button>

          <div className="h-px bg-slate-100 my-1" />

          {/* Copy Shortcuts */}
          <button
            type="button"
            onClick={(e) => handleCopy(e, job.jobNo, 'Job Reference')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Copy Job Reference</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleCopy(e, `${job.property}, ${job.location}`, 'Property Address')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Copy Property Address</span>
          </button>

          <div className="h-px bg-slate-100 my-1" />

          {/* Access / Logistics Link */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              navigate(`${baseJobsPath}/${job.id}?tab=access`);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>View Access &amp; Keys</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const AdminJobsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const baseJobsPath = location.pathname.startsWith('/staff') ? '/staff/survey-jobs' : '/admin/jobs';
  const { addToast } = useToast();
  const { jobs, addJob } = useJobs();

  const queryFilter = useMemo(() => {
    return new URLSearchParams(location.search).get('filter') || 'All';
  }, [location.search]);

  const [activeTab, setActiveTab] = useState(queryFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [surveyorFilter, setSurveyorFilter] = useState('All');
  const [pageSize] = useState(10);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);
  const [clientModalTab, setClientModalTab] = useState('calls');

  // SurveyBooker Operational Pipeline Tabs (Matching Client Audio & Workflow)
  const tabs = useMemo(() => {
    const actionRequiredCount = jobs.filter(
      (j) => !j.canBook || j.termsStatus !== 'Signed' || j.paymentStatus !== 'Paid'
    ).length;
    const bookedCount = jobs.filter(
      (j) => j.status.toLowerCase() === 'scheduled' || j.status.toLowerCase() === 'booked'
    ).length;
    const inProgressCount = jobs.filter(
      (j) => j.status.toLowerCase() === 'in progress' || j.status.toLowerCase() === 'preparing report'
    ).length;
    const completedCount = jobs.filter((j) => j.status.toLowerCase() === 'completed').length;

    return [
      { id: 'All', label: 'All Survey Jobs', count: jobs.length },
      { id: 'Action Required', label: 'Terms & Payment Pending', count: actionRequiredCount },
      { id: 'Scheduled', label: 'Appointments / Booked', count: bookedCount },
      { id: 'In Progress', label: 'Preparing Report', count: inProgressCount },
      { id: 'Completed', label: 'Completed Reports', count: completedCount },
    ];
  }, [jobs]);

  // Executive KPI Metrics
  const scheduledCount = jobs.filter(
    (j) => j.status.toLowerCase() === 'scheduled' || j.status.toLowerCase() === 'booked'
  ).length;
  const inProgressReports = jobs.filter(
    (j) => j.status.toLowerCase() === 'in progress' || j.status.toLowerCase() === 'preparing report'
  ).length;
  const completedJobs = jobs.filter((j) => j.status.toLowerCase() === 'completed').length;

  // Handle new job creation
  const handleCreateJob = (newJob) => {
    addJob(newJob);
    addToast({
      type: newJob.canBook ? 'success' : 'info',
      title: 'Survey Job Registered',
      message: newJob.canBook
        ? `Job ${newJob.jobNo} created and scheduled with ${newJob.surveyor}.`
        : `Job ${newJob.jobNo} placed on hold. Waiting for terms and advance payment.`,
    });
  };

  // Filtered dataset
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // Tab filter
      if (activeTab === 'Action Required') {
        const isWaiting = !j.canBook || j.termsStatus !== 'Signed' || j.paymentStatus !== 'Paid';
        if (!isWaiting) return false;
      } else if (activeTab === 'Scheduled') {
        const isScheduled = j.status.toLowerCase() === 'scheduled' || j.status.toLowerCase() === 'booked';
        if (!isScheduled) return false;
      } else if (activeTab === 'In Progress') {
        const isInProgress = j.status.toLowerCase() === 'in progress' || j.status.toLowerCase() === 'preparing report';
        if (!isInProgress) return false;
      } else if (activeTab === 'Completed') {
        if (j.status.toLowerCase() !== 'completed') return false;
      } else if (activeTab !== 'All' && j.status.toLowerCase() !== activeTab.toLowerCase()) {
        return false;
      }

      // Surveyor filter
      if (surveyorFilter !== 'All' && j.surveyor !== surveyorFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const match =
          j.jobNo.toLowerCase().includes(query) ||
          j.customer.toLowerCase().includes(query) ||
          j.customerEmail?.toLowerCase().includes(query) ||
          j.property.toLowerCase().includes(query) ||
          j.location.toLowerCase().includes(query) ||
          j.surveyType.toLowerCase().includes(query) ||
          j.surveyor.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [jobs, activeTab, surveyorFilter, searchTerm]);

  // Table state & helpers
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // Reset page when filter/search/tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, surveyorFilter, searchTerm]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedJobs = useMemo(() => {
    if (!sortKey) return filteredJobs;
    return [...filteredJobs].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      const compare = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      return sortDir === 'asc' ? compare : -compare;
    });
  }, [filteredJobs, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedJobs = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return sortedJobs.slice(start, start + pageSize);
  }, [sortedJobs, effectivePage, pageSize]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Survey Jobs Master Register"
        subtitle="Manage ongoing RICS inspections, milestone progress, surveyor allocations, and client deliverable ETAs."
        breadcrumb={['Admin', 'Survey Jobs']}
        actionLabel="Create Survey Job"
        actionIcon={Plus}
        onAction={() => setIsNewBookingModalOpen(true)}
      />

      {/* 3 Top Executive Metric Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Survey Register</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#0B1F4D]">{jobs.length} Active Instructions</div>
          <div className="text-xs text-slate-500">
            {completedJobs} completed reports issued this month
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">On-Site Appointments</span>
            <CalendarDays className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {scheduledCount} Scheduled Visits
          </div>
          <div className="text-xs text-slate-500">
            Confirmed surveyor attendance across London &amp; Home Counties
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reports In Progress</span>
            <FileCheck2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">
            {inProgressReports} Drafting &amp; QA
          </div>
          <div className="text-xs text-slate-500">
            48h turnaround SLA from on-site inspection
          </div>
        </div>
      </div>

      {/* SurveyBooker Stage Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Toolbar: Search & Surveyor Filter */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Job No., customer, property address, or surveyor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all min-h-[42px]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-400 text-[11px] font-semibold">Surveyor:</span>
            <select
              value={surveyorFilter}
              onChange={(e) => setSurveyorFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer min-h-[40px]"
            >
              <option value="All">All Surveyors</option>
              {SURVEYORS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || surveyorFilter !== 'All' || activeTab !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSurveyorFilter('All');
                setActiveTab('All');
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer min-h-[40px]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table Component */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No survey jobs found</p>
            <p className="text-xs text-slate-500 mt-1">
              No property survey jobs match the selected status tab or search query.
            </p>
            <button
              onClick={() => setIsNewBookingModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
            >
              Create Survey Job
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th
                      onClick={() => handleSort('jobNo')}
                      className="py-3 px-4 sm:px-5 whitespace-nowrap min-w-[140px] cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Job Ref / Date</span>
                        {sortKey === 'jobNo' ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('customer')}
                      className="py-3 px-4 min-w-[210px] cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Customer</span>
                        {sortKey === 'customer' ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('surveyType')}
                      className="py-3 px-4 min-w-[250px] cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Survey &amp; Property</span>
                        {sortKey === 'surveyType' ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('surveyor')}
                      className="py-3 px-4 min-w-[200px] whitespace-nowrap cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Surveyor</span>
                        {sortKey === 'surveyor' ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="py-3 px-4 min-w-[170px] whitespace-nowrap cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>SurveyBooker Stage</span>
                        {sortKey === 'status' ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 sm:px-5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedJobs.map((row) => {
                    const sObj = SURVEYORS.find((s) => s.id === row.surveyorId);
                    const isWaiting = !row.canBook || row.termsStatus !== 'Signed' || row.paymentStatus !== 'Paid';

                    return (
                      <tr
                        key={row.id}
                        onClick={() => navigate(`${baseJobsPath}/${row.id}`)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* 1. Job Ref / Date */}
                        <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`${baseJobsPath}/${row.id}`);
                            }}
                            className="text-[#2563EB] hover:text-[#0B1F4D] font-mono font-bold hover:underline flex items-center gap-1 group/job cursor-pointer text-xs"
                            title="Open job details workspace"
                          >
                            <span>{row.jobNo}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/job:opacity-100 transition-opacity" />
                          </button>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{row.date}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span>{row.timeSlot}</span>
                          </div>
                        </td>

                        {/* 2. Customer */}
                        <td className="py-3.5 px-4 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClientEmail(row.customerEmail);
                              setClientModalTab('calls');
                            }}
                            className="text-left font-bold text-slate-900 hover:text-[#2563EB] hover:underline flex items-center gap-1.5 group/cust cursor-pointer text-xs"
                            title="Click to view client profile, call notes & complaints"
                          >
                            <span>{row.customer}</span>
                            <PhoneCall className="w-3 h-3 text-[#2563EB] opacity-60 group-hover/cust:opacity-100 transition-opacity shrink-0" />
                          </button>
                          <div className="text-[11px] text-slate-500 mt-0.5 break-all sm:truncate max-w-[210px]">
                            {row.customerEmail}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {row.customerPhone}
                          </div>
                        </td>

                        {/* 3. Survey & Property */}
                        <td className="py-3.5 px-4 min-w-[250px]">
                          <div className="font-bold text-[#0B1F4D] text-xs leading-snug group-hover:text-[#2563EB] transition-colors">
                            {row.surveyType}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1 flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span className="leading-tight text-slate-600 font-medium">
                              {row.property}, {row.location}
                            </span>
                          </div>
                        </td>

                        {/* 4. Surveyor */}
                        <td className="py-3.5 px-4 min-w-[200px] whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="relative shrink-0">
                              <img
                                src={sObj?.avatar}
                                alt={row.surveyor}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shadow-2xs"
                              />
                              <span
                                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white"
                                style={{ backgroundColor: sObj?.color || '#2563EB' }}
                                title="Surveyor Calendar Color"
                              />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800">
                                {row.surveyor}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                {sObj?.credentials || 'Chartered Surveyor'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 5. SurveyBooker Stage */}
                        <td className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">
                          <div className="space-y-1">
                            <StatusPill status={row.status} />
                            {isWaiting ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 block w-fit">
                                <Lock className="w-2.5 h-2.5 text-amber-700" />
                                <span>Terms / Pay Pending</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 block w-fit">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Cleared to Inspect</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 6. Actions */}
                        <td
                          className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <JobRowActions
                            job={row}
                            baseJobsPath={baseJobsPath}
                            onOpenClientProfile={(email, tab) => {
                              setSelectedClientEmail(email);
                              setClientModalTab(tab);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Clean Pagination Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="text-[11px] text-slate-500 font-medium">
                Showing{' '}
                <span className="font-bold text-slate-800">
                  {filteredJobs.length === 0 ? 0 : (effectivePage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(effectivePage * pageSize, filteredJobs.length)}
                </span>{' '}
                of <span className="font-bold text-slate-800">{filteredJobs.length}</span> survey jobs
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 self-center sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={effectivePage === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setCurrentPage(pg)}
                        className={`w-7 h-7 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                          pg === effectivePage
                            ? 'bg-[#0B1F4D] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={effectivePage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Survey Job Modal */}
      <NewBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        onSubmit={handleCreateJob}
      />

      {/* Client Profile, Call Notes & Complaints Modal */}
      <ClientProfileModal
        isOpen={!!selectedClientEmail}
        onClose={() => setSelectedClientEmail(null)}
        clientEmail={selectedClientEmail}
        initialTab={clientModalTab}
      />
    </div>
  );
};
