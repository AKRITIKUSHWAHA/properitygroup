import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Table } from '../../components/common/Table';
import { StatusPill } from '../../components/common/StatusPill';
import { INITIAL_JOBS, SURVEYORS } from '../../mock/jobs';

export const AdminJobsPage = () => {
  const navigate = useNavigate();
  const [jobs] = useState(INITIAL_JOBS);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [surveyorFilter, setSurveyorFilter] = useState('All');
  const [pageSize, setPageSize] = useState(10);

  // Tabs by status: All, Scheduled, In Progress, Completed, On Hold
  const tabs = useMemo(() => {
    const statuses = ['Scheduled', 'In Progress', 'Completed', 'On Hold'];
    return [
      { id: 'All', label: 'All Jobs', count: jobs.length },
      ...statuses.map((st) => ({
        id: st,
        label: st,
        count: jobs.filter((j) => j.status.toLowerCase() === st.toLowerCase()).length,
      })),
    ];
  }, [jobs]);

  // Filtered dataset
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // Tab filter
      if (activeTab !== 'All' && j.status.toLowerCase() !== activeTab.toLowerCase()) {
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
          j.property.toLowerCase().includes(query) ||
          j.location.toLowerCase().includes(query) ||
          j.surveyType.toLowerCase().includes(query) ||
          j.surveyor.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [jobs, activeTab, surveyorFilter, searchTerm]);

  // Table columns definition (User Spec: Job No., Customer, Survey Type, Property, Surveyor, Date/Time, Status, Progress bar)
  const columns = [
    {
      key: 'jobNo',
      header: 'Job No.',
      sortable: true,
      className: 'font-mono font-bold text-[#0B1F4D] whitespace-nowrap',
      render: (val, row) => (
        <button
          onClick={() => navigate(`/admin/survey-jobs/${row.id}`)}
          className="text-[#2563EB] hover:text-[#0B1F4D] font-bold hover:underline flex items-center gap-1 group"
        >
          <span>{val}</span>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      sortable: true,
      render: (val, row) => (
        <div className="min-w-[130px]">
          <div className="font-bold text-slate-800 leading-tight">{val}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[150px]">
            {row.customerEmail}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {row.customerPhone}
          </div>
        </div>
      ),
    },
    {
      key: 'surveyType',
      header: 'Survey Type',
      sortable: true,
      render: (val) => (
        <div className="min-w-[170px] max-w-[220px]">
          <span className="font-semibold text-slate-800 text-xs line-clamp-2">
            {val}
          </span>
        </div>
      ),
    },
    {
      key: 'property',
      header: 'Property',
      sortable: true,
      render: (val, row) => (
        <div className="min-w-[170px] max-w-[220px]">
          <div className="font-bold text-slate-900 text-xs truncate">{val}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="truncate">{row.location}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'surveyor',
      header: 'Surveyor',
      sortable: true,
      render: (val, row) => {
        const sObj = SURVEYORS.find((s) => s.id === row.surveyorId);
        return (
          <div className="flex items-center gap-2 whitespace-nowrap min-w-[140px]">
            <img
              src={sObj?.avatar}
              alt={val}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div>
              <div className="text-xs font-bold text-slate-800 truncate">{val}</div>
              <div className="text-[10px] text-slate-400 font-medium truncate">
                {sObj?.credentials.split(' ')[0]} {sObj?.credentials.split(' ')[1]}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'date',
      header: 'Date / Time',
      sortable: true,
      render: (val, row) => (
        <div className="whitespace-nowrap min-w-[110px]">
          <div className="text-xs font-mono font-bold text-slate-800">{val}</div>
          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{row.timeSlot}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val) => <StatusPill status={val} />,
    },
    {
      key: 'progress',
      header: 'Progress bar',
      sortable: true,
      className: 'min-w-[130px]',
      render: (val) => {
        const isComplete = val === 100;
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className={isComplete ? 'text-emerald-700' : 'text-slate-700'}>
                {val}%
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {isComplete ? 'Complete' : 'Stage 7/10'}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete
                    ? 'bg-emerald-500'
                    : val >= 50
                    ? 'bg-[#2563EB]'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      className: 'text-right whitespace-nowrap',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/admin/survey-jobs/${row.id}`)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0B1F4D] text-slate-700 hover:text-white text-xs font-bold transition-all shadow-2xs group"
        >
          <span>View Job</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Survey Jobs Master Register"
        subtitle="Manage ongoing RICS inspections, milestone progress, surveyor allocations, and client deliverable ETAs."
        breadcrumb={['Super Admin', 'Survey Jobs']}
        actionLabel="Create Survey Job"
        actionIcon={Plus}
        onAction={() => alert('New Job Dialog')}
      />

      {/* Tabs by Status */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Toolbar: Search & Surveyor Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Job No., customer, property address, or surveyor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-semibold">Surveyor:</span>
          <select
            value={surveyorFilter}
            onChange={(e) => setSurveyorFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          >
            <option value="All">All Surveyors</option>
            {SURVEYORS.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table Component */}
      <Table
        columns={columns}
        data={filteredJobs}
        pageSize={pageSize}
        emptyTitle="No survey jobs found"
        emptyMessage="No property survey jobs match the selected status tab or search query."
      />
    </div>
  );
};
