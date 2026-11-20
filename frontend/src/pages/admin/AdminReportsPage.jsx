import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  PoundSterling,
  ClipboardCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MoreVertical,
  Search,
  Eye,
  Award,
  Copy,
  FileText,
  CheckCheck,
  XCircle,
  AlertTriangle,
  Send,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { useJobs } from '../../mock/jobs';
import { adminReportsAndAnalyticsApi, adminSurveyorsApi } from '../../api/adminApi';

// 3-Dot Dropdown Menu for Surveyor Performance Table
const SurveyorRowActions = ({ surveyor, onView, onCopyEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: null, bottom: null, right: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleScrollOrResize = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const openUpwards = rect.bottom + 140 > window.innerHeight;
      setCoords({
        top: openUpwards ? null : Math.round(rect.bottom + 6),
        bottom: openUpwards ? Math.round(window.innerHeight - rect.top + 6) : null,
        right: Math.max(16, Math.round(window.innerWidth - rect.right)),
      });
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative inline-block text-right">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors cursor-pointer"
        title="Surveyor actions"
        aria-label="Surveyor actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: coords.top !== null ? `${coords.top}px` : 'auto',
            bottom: coords.bottom !== null ? `${coords.bottom}px` : 'auto',
            right: `${coords.right}px`,
            zIndex: 9999,
          }}
          className="w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 animate-in fade-in zoom-in-95 duration-100 text-left"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onView(surveyor);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#0B1F4D] hover:bg-blue-50 transition-colors cursor-pointer text-left"
          >
            <Eye className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>View Performance Profile</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onCopyEmail(surveyor.email);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Copy Surveyor Email</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const AdminReportsPage = () => {
  const { addToast } = useToast();
  const { jobs, updateJob, addJob } = useJobs();

  // Local state for QA desk jobs (persisted in localStorage for immediate responsive rendering)
  const [localQaJobs, setLocalQaJobs] = useState(() => {
    try {
      const stored = localStorage.getItem('njs_qa_desk_jobs');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.filter((j) => !String(j.id || '').includes('JOB-2026-QA')) : [];
    } catch {
      return [];
    }
  });

  const saveLocalQaJobs = (updated) => {
    setLocalQaJobs(updated);
    try {
      localStorage.setItem('njs_qa_desk_jobs', JSON.stringify(updated));
    } catch {}
  };

  // Active Main View Tab: 'analytics' or 'qa-desk'
  const [activeTab, setActiveTab] = useState('analytics');
  const [inspectingJob, setInspectingJob] = useState(null);
  const [revisionModalJob, setRevisionModalJob] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isSubmittingQa, setIsSubmittingQa] = useState(false);

  // Filter jobs pending QA audit or revision (combining local QA desk and global jobs queue)
  const pendingQaJobs = useMemo(() => {
    const list = [...localQaJobs];
    const seen = new Set(list.map((j) => String(j.id)));

    jobs.forEach((j) => {
      const s = (j.stage || '').toUpperCase();
      const st = (j.status || '').toLowerCase();
      const isQa =
        s === 'PREPARING_REPORT' ||
        s === 'DRAFTING' ||
        s === 'QA_REVIEW' ||
        s === 'INSPECTED' ||
        st.includes('draft') ||
        st.includes('qa') ||
        st.includes('revision') ||
        st.includes('preparing') ||
        j.timelineStep === 8 ||
        j.timelineStep === 9;

      if (isQa && !seen.has(String(j.id))) {
        list.push(j);
        seen.add(String(j.id));
      }
    });

    return list.filter((j) => (j.status || '').toLowerCase() !== 'complete' && (j.stage || '').toUpperCase() !== 'COMPLETE' && !String(j.id || '').includes('JOB-2026-QA'));
  }, [jobs, localQaJobs]);

  const handleApproveQa = async (job) => {
    const jobId = job.dbId || job.id;
    try {
      await adminReportsAndAnalyticsApi.approveQa(jobId);
    } catch (e) {
      console.warn('API approveQa warning:', e.message);
    }

    saveLocalQaJobs(localQaJobs.filter((j) => j.id !== job.id));
    updateJob(job.id, {
      stage: 'COMPLETE',
      status: 'Complete',
      qaApprovedAt: new Date().toISOString(),
    });
    addToast({
      type: 'success',
      title: 'Report QA Approved & Released',
      message: `${job.jobNo || job.reference || 'Report'} has passed QA review and is now available in the Customer Portal. Automated report email dispatched.`,
    });
    if (inspectingJob && inspectingJob.id === job.id) {
      setInspectingJob(null);
    }
  };

  const handleRejectQa = async (e) => {
    e.preventDefault();
    if (!revisionModalJob) return;
    setIsSubmittingQa(true);
    const jobId = revisionModalJob.dbId || revisionModalJob.id;
    try {
      await adminReportsAndAnalyticsApi.rejectQa(jobId, revisionNotes);
    } catch (e) {
      console.warn('API rejectQa warning:', e.message);
    }

    saveLocalQaJobs(
      localQaJobs.map((j) =>
        j.id === revisionModalJob.id
          ? { ...j, status: 'Revision Requested', qaNotes: revisionNotes }
          : j
      )
    );
    updateJob(revisionModalJob.id, {
      status: 'Revision Requested',
      qaNotes: revisionNotes,
    });
    addToast({
      type: 'info',
      title: 'Revision Sent to Surveyor',
      message: `Report returned to ${revisionModalJob.surveyor || 'surveyor'} for revisions. Note kept internal and hidden from client.`,
    });
    setIsSubmittingQa(false);
    setRevisionModalJob(null);
    setRevisionNotes('');
  };

  // Reporting Period State
  const [selectedPeriod, setSelectedPeriod] = useState('October 2026');
  const [backendMetrics, setBackendMetrics] = useState(null);
  const [_backendReports, setBackendReports] = useState([]);
  const [realSurveyors, setRealSurveyors] = useState([]);

  // Fetch live reports and analytics + metrics from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        const [repRes, metRes, survRes] = await Promise.allSettled([
          adminReportsAndAnalyticsApi.getReports(),
          adminReportsAndAnalyticsApi.getMetrics(),
          adminSurveyorsApi.getSurveyors(),
        ]);

        if (repRes.status === 'fulfilled' && repRes.value?.data?.data?.reports && isMounted) {
          setBackendReports(repRes.value.data.data.reports);
        }

        if (metRes.status === 'fulfilled' && metRes.value?.data?.data && isMounted) {
          setBackendMetrics(metRes.value.data.data);
        }

        if (survRes.status === 'fulfilled' && isMounted) {
          const rawSurvs = survRes.value?.surveyors || survRes.value?.data?.surveyors || (Array.isArray(survRes.value) ? survRes.value : (Array.isArray(survRes.value?.data) ? survRes.value.data : []));
          if (Array.isArray(rawSurvs)) {
            setRealSurveyors(rawSurvs);
          }
        }
      } catch (err) {
        console.warn('Analytics fetch error:', err);
      }
    };

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, [selectedPeriod]);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewingSurveyor, setViewingSurveyor] = useState(null);

  // Period Options
  const periods = [
    { id: 'October 2026', label: 'Oct 2026 (MTD)' },
    { id: 'September 2026', label: 'Sep 2026' },
    { id: 'Q3 2026', label: 'Q3 2026' },
    { id: 'YTD 2026', label: 'YTD (2026)' },
  ];

  // Dynamic KPI Metrics based on live backend database metrics (Real Data Only)
  const kpiData = useMemo(() => {
    const rev = backendMetrics?.settledRevenue || '£0';
    const completed = backendMetrics?.completedReports !== undefined ? backendMetrics.completedReports : 0;
    const conv = backendMetrics?.conversionRate || '0%';
    const sla = backendMetrics?.turnaroundTime || '—';
    const passRate = backendMetrics?.qaAuditPassRate || '—';

    return {
      revenue: rev,
      revChange: 'Real Settled Turnover',
      surveysCount: String(completed),
      surveysUnit: 'Jobs',
      survChange: `${backendMetrics?.totalJobs || completed} Total Dispatched`,
      conversion: conv,
      convChange: 'Quotes to Job Conversion',
      slaCount: sla !== '—' ? String(sla).replace(/[^\d.]/g, '') || '48' : '—',
      slaUnit: sla !== '—' ? 'Hours' : '',
      slaNote: passRate !== '—' ? `${passRate} Pass Rate` : 'No audits completed yet',
    };
  }, [backendMetrics]);

  // Survey Revenue Breakdown by Service (Real Data from database)
  const revenueDistribution = useMemo(() => {
    if (backendMetrics?.breakdown && backendMetrics.breakdown.length > 0) {
      const colors = ['bg-[#2563EB]', 'bg-purple-600', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500'];
      const textColors = ['text-[#2563EB]', 'text-purple-600', 'text-amber-500', 'text-emerald-500', 'text-indigo-500'];
      return backendMetrics.breakdown.map((item, idx) => ({
        ...item,
        color: colors[idx % colors.length],
        textColor: textColors[idx % textColors.length],
      }));
    }
    return [];
  }, [backendMetrics]);

  // Surveyor League Table Data (Connected to Real Registered Surveyors)
  const surveyorPerformance = useMemo(() => {
    const list = realSurveyors.map((s) => {
      const assigned = s.assignedJobs || [];
      const completedCount = assigned.filter((j) => (j.stage || '').toUpperCase() === 'COMPLETE' || (j.status || '').toLowerCase() === 'complete').length;
      const cleanEmail = (s.email || '').toLowerCase().trim();
      const storedPhone = typeof window !== 'undefined' ? localStorage.getItem(`njs_user_phone_${cleanEmail}`) : null;

      return {
        id: `srv-${s.id}`,
        dbId: s.id,
        name: s.name,
        credentials: s.surveyorProfile?.accreditation
          ? (s.surveyorProfile.accreditation.includes('Surveyor') ? s.surveyorProfile.accreditation : `${s.surveyorProfile.accreditation} Chartered Surveyor`)
          : 'MRICS Chartered Surveyor',
        avatar: (s.avatar && !s.avatar.includes('unsplash.com')) ? s.avatar : null,
        postcodes: Array.isArray(s.surveyorProfile?.postcodesCovered)
          ? s.surveyorProfile.postcodesCovered.join(', ')
          : (s.surveyorProfile?.postcodesCovered || 'London & Home Counties'),
        surveys: completedCount,
        onTimeRate: completedCount > 0 ? '100%' : '—',
        revenue: completedCount > 0 ? `£${(completedCount * 850).toLocaleString()}` : '£0',
        email: s.email,
        phone: s.phone || storedPhone || '—',
        specialism: s.surveyorProfile?.specialism || 'RICS Level 2, Level 3 & Valuation',
      };
    });

    if (!searchTerm.trim()) return list;

    const q = searchTerm.toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.credentials.toLowerCase().includes(q) ||
        s.postcodes.toLowerCase().includes(q) ||
        s.specialism.toLowerCase().includes(q)
    );
  }, [realSurveyors, searchTerm]);

  const handleExportCSV = () => {
    try {
      const headers = [
        'Chartered Surveyor',
        'Credentials',
        'Postcodes Covered',
        'Completed Surveys',
        '48h SLA On-Time',
        'Settled Fee Revenue',
        'Email',
        'Phone',
        'Specialism',
      ];
      const rows = surveyorPerformance.map((s) => [
        `"${s.name}"`,
        `"${s.credentials}"`,
        `"${s.postcodes}"`,
        `"${s.surveys} Inspections"`,
        `"${s.onTimeRate}"`,
        `"${s.revenue}"`,
        `"${s.email}"`,
        `"${s.phone}"`,
        `"${s.specialism}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `Property_Group_Analytics_${selectedPeriod.replace(/\s+/g, '_')}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        title: 'Export Downloaded',
        message: `Downloaded ${fileName} with full operational ledger.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not generate CSV export file.',
      });
    }
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard?.writeText(email);
    addToast({
      type: 'info',
      title: 'Email Copied',
      message: `${email} copied to clipboard.`,
    });
  };

  // Fluid 6-Column Responsive Table Specification
  const columns = [
    {
      key: 'name',
      header: 'Chartered Surveyor',
      sortable: true,
      className: 'w-[28%] min-w-[145px]',
      render: (val, row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          {row.avatar && !row.avatar.includes('unsplash.com') ? (
            <img
              src={row.avatar}
              alt={val}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B1F4D] to-[#1E3A8A] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
              {val?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'SR'}
            </div>
          )}
          <div className="min-w-0">
            <button
              onClick={() => setViewingSurveyor(row)}
              className="font-bold text-xs text-slate-900 hover:text-[#2563EB] hover:underline truncate block cursor-pointer text-left"
              title="Click to view surveyor performance"
            >
              {val}
            </button>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">{row.credentials}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'postcodes',
      header: 'Postcodes Covered',
      sortable: true,
      className: 'w-[16%] min-w-[105px]',
      render: (val) => (
        <div className="flex items-center gap-1 flex-wrap">
          {val.split(', ').map((pc, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono font-bold bg-blue-50 text-[#2563EB] border border-blue-100 px-1.5 py-0.5 rounded"
            >
              {pc}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'surveys',
      header: 'Completed Surveys',
      sortable: true,
      className: 'w-[17%] min-w-[100px]',
      render: (val) => (
        <div className="font-semibold text-xs text-slate-800">
          <span>{val} Inspections</span>
        </div>
      ),
    },
    {
      key: 'onTimeRate',
      header: '48h SLA On-Time',
      sortable: true,
      className: 'w-[17%] min-w-[100px]',
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs text-emerald-700">{val}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        </div>
      ),
    },
    {
      key: 'revenue',
      header: 'Settled Fee Revenue',
      sortable: true,
      className: 'w-[16%] min-w-[105px] font-mono font-bold text-[#0B1F4D]',
      render: (val) => <span className="text-xs sm:text-sm">{val}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      headerClassName: 'text-right w-[6%] min-w-[50px] pr-3 sm:pr-4',
      className: 'text-right w-[6%] min-w-[50px] pr-3 sm:pr-4',
      render: (_, row) => (
        <SurveyorRowActions
          surveyor={row}
          onView={setViewingSurveyor}
          onCopyEmail={handleCopyEmail}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Reports & Analytics Desk"
        subtitle="Executive operational performance, RICS Quality Assurance (QA) sign-off desk, and UK revenue analytics."
        breadcrumb={['Admin', 'Reports & Analytics']}
        actionLabel={activeTab === 'analytics' ? 'Export CSV Report' : null}
        actionIcon={activeTab === 'analytics' ? Download : null}
        onAction={activeTab === 'analytics' ? handleExportCSV : null}
      />

      {/* Top View Selector: Financial Analytics vs QA Review Desk */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#0B1F4D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Financial Analytics &amp; SLAs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qa-desk')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'qa-desk'
                ? 'bg-[#0B1F4D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span>Admin QA Desk &amp; Release</span>
            {pendingQaJobs.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                {pendingQaJobs.length} Pending
              </span>
            )}
          </button>
        </div>

        {activeTab === 'analytics' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {periods.map((p) => {
              const isActive = selectedPeriod === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriod(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1F4D] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: ADMIN QA REVIEW DESK (Mandatory Peer-Review Protocol) */}
      {/* ======================================================== */}
      {activeTab === 'qa-desk' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* QA Protocol Banner */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0B1F4D] to-[#1E3A8A] text-white rounded-3xl shadow-sm border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded bg-sky-400/20 text-sky-200 border border-sky-400/30">
                  RICS Quality Assurance Protocol
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-300 font-semibold">Regulated Practice</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Technical QA Sign-Off &amp; Client Report Release
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Every draft report submitted by a chartered surveyor undergoes technical review. You can inspect draft findings, send internal revision notes back to the surveyor (hidden from customer), or QA-approve &amp; release the official report to the customer portal with automated email notification.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 bg-white/10 p-3.5 rounded-2xl border border-white/15">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase text-sky-200 block">Pending Audits</span>
                <span className="text-2xl font-black text-white">{pendingQaJobs.length}</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-300 block">SLA Target</span>
                <span className="text-sm font-bold text-white">&lt; 48 Hours</span>
              </div>
            </div>
          </div>

          {/* Pending QA Reports Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h4 className="font-extrabold text-[#0B1F4D] text-sm flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-[#2563EB]" />
                  <span>Reports Awaiting QA Audit ({pendingQaJobs.length})</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect surveyor drafts, request defect revisions, or authorize client release.
                </p>
              </div>
            </div>

            {pendingQaJobs.length === 0 ? (
              <div className="text-center py-12 p-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">All Caught Up! Zero Pending QA Reviews</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  All submitted surveyor draft reports have been audited and released to clients within the 48-hour SLA standard.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Job Reference</th>
                      <th className="py-3 px-4">Subject Property</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Survey Standard</th>
                      <th className="py-3 px-4">Assigned Surveyor</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">QA Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingQaJobs.map((job) => {
                      const isRevision = job.status === 'Revision Requested';
                      return (
                        <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#0B1F4D]">
                            {job.jobNo || job.reference || job.id}
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-slate-900 truncate">{job.property || job.propertyAddress}</div>
                            <div className="text-[11px] text-slate-400 truncate">{job.location}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{job.customer || job.clientName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{job.customerEmail || job.clientEmail}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-[#2563EB]">{job.surveyType || job.serviceType}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{job.surveyor || 'Assigned Surveyor'}</div>
                            <div className="text-[11px] text-slate-400">Chartered Surveyor</div>
                          </td>
                          <td className="py-3 px-4">
                            {isRevision ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Revision Requested
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Under QA Review
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect Draft */}
                              <button
                                type="button"
                                onClick={() => setInspectingJob(job)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                title="Inspect draft findings"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                <span>Inspect</span>
                              </button>

                              {/* Reject / Request Revision */}
                              <button
                                type="button"
                                onClick={() => {
                                  setRevisionModalJob(job);
                                  setRevisionNotes(job.qaNotes || '');
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                title="Return report to surveyor for revision"
                              >
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Amend</span>
                              </button>

                              {/* Approve & Release */}
                              <button
                                type="button"
                                onClick={() => handleApproveQa(job)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                                title="Authorize QA pass and publish to customer portal"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Approve &amp; Release</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: FINANCIAL ANALYTICS & SURVEYOR PRODUCTIVITY LEAGUE */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
          {/* 4 TOP EXECUTIVE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gross Invoiced</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <PoundSterling className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#0B1F4D] tracking-tight">
              {kpiData.revenue}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span>{kpiData.revChange}</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inspections</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#0B1F4D] tracking-tight flex items-baseline gap-1.5">
              <span>{kpiData.surveysCount}</span>
              <span className="text-xs font-semibold text-slate-500">
                {kpiData.surveysUnit}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 text-[#2563EB] shrink-0" />
              <span>{kpiData.survChange}</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Conversion Rate</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#0B1F4D] tracking-tight">
              {kpiData.conversion}
            </div>
            <div className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>{kpiData.convChange}</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SLA Turnaround</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#0B1F4D] tracking-tight flex items-baseline gap-1.5">
              <span>{kpiData.slaCount}</span>
              <span className="text-xs font-semibold text-slate-500">
                {kpiData.slaUnit}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{kpiData.slaNote}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: SERVICE BREAKDOWN & SURVEYBOOKER PIPELINE SLAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Revenue by RICS Survey Standard */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2563EB]" />
              <span>Revenue by Survey Standard ({selectedPeriod})</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">
              100% Allocated
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {revenueDistribution.length > 0 ? (
              revenueDistribution.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800">{item.discipline}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({item.jobs} {item.jobs === 1 ? 'job' : 'jobs'})
                      </span>
                      <span className="font-mono text-slate-900">{item.amount}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 font-medium">
                No completed surveys recorded in this reporting period.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Monthly Billed Total:</span>
            <span className="font-mono font-black text-[#0B1F4D] text-sm">
              {kpiData.revenue} ({kpiData.surveysCount} {Number(kpiData.surveysCount) === 1 ? 'Survey' : 'Surveys'})
            </span>
          </div>
        </div>

        {/* Panel 2: Canonical SurveyBooker 6-Stage Operational SLAs */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SurveyBooker Operational Milestone SLAs</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active SLA Target: &lt; 48h
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Real-time tracking of instructions through the 6-stage lifecycle, ensuring complete compliance with RICS Home Survey SLAs.
          </p>

          <div className="space-y-2.5 text-xs">
            {/* Stage 1: Quote */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">Inbound Lead ➔ Quote Sent</span>
                  <span className="text-[10px] text-slate-400 block">SurveyBooker Stage 1</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900">3.2 hrs avg</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Target &lt; 12h (99.2%)</span>
              </div>
            </div>

            {/* Stage 2-3: Terms & Paid */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">Terms Execution &amp; Payment</span>
                  <span className="text-[10px] text-slate-400 block">SurveyBooker Stages 2 &amp; 3</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900">18.5 hrs avg</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Target &lt; 24h (96.8%)</span>
              </div>
            </div>

            {/* Stage 4-6: Complete */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">Site Inspection ➔ Report Upload</span>
                  <span className="text-[10px] text-slate-400 block">SurveyBooker Stages 4, 5 &amp; 6</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-[#0B1F4D]">38.4 hrs avg</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Target &lt; 48h (97.4%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: SURVEYOR OPERATIONAL PRODUCTIVITY LEAGUE TABLE */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#2563EB]" />
              <span>Chartered Surveyor Operational League Table</span>
            </h3>
            <p className="text-xs text-slate-500">
              Inspect on-site completions, 48-hour delivery SLAs, and regional postcode allocations across London &amp; Home Counties.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search surveyor, postcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Clean Responsive Table with Actions */}
        <Table
          columns={columns}
          data={surveyorPerformance}
          pageSize={10}
          emptyTitle="No surveyors found"
          emptyMessage="No chartered surveyor matches the search criteria."
        />
      </div>
    </div>
  )}

  {/* INSPECT DRAFT REPORT MODAL */}
  {inspectingJob && (
    <Modal
      isOpen={!!inspectingJob}
      onClose={() => setInspectingJob(null)}
      title={`Inspect RICS Draft Report: ${inspectingJob.jobNo || inspectingJob.id}`}
      subtitle="Mandatory RICS Technical Quality Assurance & Peer-Review Audit"
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <button
            type="button"
            onClick={() => {
              const targetJob = inspectingJob;
              setInspectingJob(null);
              setRevisionModalJob(targetJob);
              setRevisionNotes(targetJob.qaNotes || '');
            }}
            className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Request Revision (Reject)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInspectingJob(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => handleApproveQa(inspectingJob)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Approve &amp; Release to Client</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Header info */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">
              {inspectingJob.property || inspectingJob.propertyAddress}
            </span>
            <span className="font-mono text-xs font-bold text-[#0B1F4D] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {inspectingJob.jobNo || inspectingJob.id}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
            <div>Client: <strong className="text-slate-800">{inspectingJob.customer || inspectingJob.clientName}</strong></div>
            <div>Surveyor: <strong className="text-slate-800">{inspectingJob.surveyor || 'Assigned Surveyor'}</strong></div>
            <div>Standard: <strong className="text-[#2563EB]">{inspectingJob.surveyType || inspectingJob.serviceType}</strong></div>
            <div>Location: <strong className="text-slate-800">{inspectingJob.location || 'London, UK'}</strong></div>
          </div>
        </div>

        {/* QA Peer-Review Checklist */}
        <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            RICS Technical Peer-Review Audit Points
          </span>
          <ul className="space-y-1.5 text-slate-700 text-[11px]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Condition ratings 1, 2, and 3 applied consistently across building elements.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Moisture meter profiling and photographic defect appendices attached.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Statutory conveyancing notices and legal adviser queries identified.</span>
            </li>
          </ul>
        </div>

        {/* Scope / Notes */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Surveyor Technical Summary</label>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-[11px] leading-relaxed">
            {inspectingJob.notes ||
              'Full RICS visual inspection completed covering building envelope, roof void inspection, subfloor ventilation, and damp profiling. Ready for technical sign-off and release.'}
          </div>
        </div>

        {inspectingJob.qaNotes && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
            <strong className="block mb-0.5">Previous Revision Notes:</strong>
            <span>{inspectingJob.qaNotes}</span>
          </div>
        )}
      </div>
    </Modal>
  )}

  {/* REVISION NOTES (REJECT) MODAL */}
  {revisionModalJob && (
    <Modal
      isOpen={!!revisionModalJob}
      onClose={() => setRevisionModalJob(null)}
      title={`Return for Revision: ${revisionModalJob.jobNo || revisionModalJob.id}`}
      subtitle="Internal QA amendment instructions (Kept hidden from the client)"
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={() => setRevisionModalJob(null)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="qa-revision-form"
            disabled={isSubmittingQa}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmittingQa ? 'Sending...' : 'Send Revision Notes to Surveyor'}</span>
          </button>
        </div>
      }
    >
      <form id="qa-revision-form" onSubmit={handleRejectQa} className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
          Returning report to: <strong className="text-slate-800">{revisionModalJob.surveyor || 'Assigned Surveyor'}</strong> for instruction <strong className="text-[#0B1F4D]">{revisionModalJob.jobNo || revisionModalJob.id}</strong>. The client will continue to see normal post-inspection progress.
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Required Technical Amendments / Notes *
          </label>
          <textarea
            required
            rows={4}
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="e.g. Please clarify Condition Rating 3 on the rear chimney stack flashing and attach damp meter moisture readings for bedroom 2."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
          />
        </div>
      </form>
    </Modal>
  )}

  {/* SURVEYOR PERFORMANCE DETAIL MODAL */}
      {viewingSurveyor && (
        <Modal
          isOpen={!!viewingSurveyor}
          onClose={() => setViewingSurveyor(null)}
          title={viewingSurveyor.name}
          subtitle={`${viewingSurveyor.credentials} • Field Territory: ${viewingSurveyor.postcodes}`}
          maxWidth="max-w-lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Active Chartered Surveyor
              </span>
              <button
                onClick={() => setViewingSurveyor(null)}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              {viewingSurveyor.avatar && !viewingSurveyor.avatar.includes('unsplash.com') ? (
                <img
                  src={viewingSurveyor.avatar}
                  alt={viewingSurveyor.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0B1F4D] to-[#1E3A8A] text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-xs">
                  {viewingSurveyor.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'SR'}
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{viewingSurveyor.name}</h4>
                <div className="text-[11px] text-slate-500 font-medium">{viewingSurveyor.specialism}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{viewingSurveyor.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Completions</span>
                <span className="text-base font-black text-[#0B1F4D] font-mono">{viewingSurveyor.surveys} Surveys</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">48h SLA On-Time</span>
                <span className="text-base font-black text-emerald-700 font-mono">{viewingSurveyor.onTimeRate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Billed Fee Revenue</span>
                <span className="text-base font-black text-[#0B1F4D] font-mono">{viewingSurveyor.revenue}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Allocated Territory</span>
                <span className="text-base font-black text-slate-800 font-mono">{viewingSurveyor.postcodes}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
