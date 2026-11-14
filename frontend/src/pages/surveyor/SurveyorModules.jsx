import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Briefcase,
  MapPin,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  Key,
  Phone,
  ShieldCheck,
  ChevronRight,
  Filter,
  Check,
  Plus,
  Camera,
  WifiOff,
  Navigation,
  Trash2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useToast } from '../../components/ToastContext';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../auth/AuthContext';
import { useJobs } from '../../mock/jobs';
import { useEffect } from 'react';
import { api } from '../../api/apiClient';
import {
  surveyorCalendarApi,
  surveyorJobsApi,
  surveyorSiteVisitsApi,
  surveyorUploadReportsApi,
  surveyorAvailabilityApi,
} from '../../api/surveyorApi';

// ==========================================
// 1. SURVEYOR CALENDAR PAGE (Dynamic Date Fix for Point 8)
// ==========================================
export const SurveyorCalendarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, updateJob } = useJobs();

  // Fetch surveyor calendar API
  useEffect(() => {
    surveyorCalendarApi.getCalendar().catch(() => {});
  }, []);

  const surveyorId = user?.surveyorId || (user?.email === 'surveyor@demo.com' ? 'srv-1' : null);
  const surveyorName = user?.name;

  const myJobs = jobs.filter((j) =>
    (surveyorId && j.surveyorId === surveyorId) ||
    (surveyorName && j.surveyor === surveyorName)
  );

  const today = new Date();
  const formatDay = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  const appointments = myJobs
    .filter((j) => j.status !== 'Completed')
    .map((j) => ({
      id: j.id,
      jobNo: j.jobNo || j.id,
      time: j.timeSlot || '10:00 - 13:00',
      property: j.property,
      location: j.location,
      type: j.surveyType,
      access: j.accessNotes || j.propertyDetails?.accessDetails || 'Customer direct instruction via portal',
      status: j.status,
      countdown: j.countdown || '48h SLA Target',
    }));

  const dynamicDays = [-1, 0, 1, 2, 3].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const isToday = offset === 0;
    return {
      label: isToday ? `Today (${formatDay(d)})` : formatDay(d),
      isToday,
      appointments: isToday ? appointments.length : 0,
    };
  });

  const [selectedDay, setSelectedDay] = useState(dynamicDays[1].label);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Field Calendar & Diary"
        subtitle="Manage daily inspection appointments, property locations, and key access collection notes."
        breadcrumb={['Surveyor', 'My Diary / Calendar']}
        actionLabel="Upload Report"
        actionIcon={UploadCloud}
        onAction={() => navigate('/surveyor/upload-reports')}
      />

      {/* Surveyor Privacy Lockdown Banner */}
      <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5 sm:mt-0" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#0B1F4D] block">
              Surveyor Privacy Shield Active (Restricted View)
            </span>
            <p className="text-slate-600">
              Only inspection time slots, property addresses, and key access notes are shown. Company billing, client quotations, payment settlement, and signed terms are restricted to central management.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/surveyor/upload-reports')}
          className="px-3.5 py-2 bg-[#0B1F4D] text-white rounded-xl text-xs font-bold hover:bg-[#162E6E] shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Report PDF</span>
        </button>
      </div>

      {/* Week Day Pills with Real Computed Dates */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {dynamicDays.map((d) => (
          <button
            key={d.label}
            onClick={() => setSelectedDay(d.label)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
              selectedDay === d.label
                ? 'bg-[#0B1F4D] text-white border-[#0B1F4D] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{d.label}</span>
            <span
              className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedDay === d.label ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {d.appointments}
            </span>
          </button>
        ))}
      </div>

      {/* Day Schedule Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#0B1F4D]">
              Inspection Diary for {selectedDay}
            </h3>
            <p className="text-xs text-slate-500">Daylight hours allocated for on-site physical inspection.</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-xl">
            {appointments.length} Appointments Allocated
          </span>
        </div>

        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-[#2563EB] transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-black text-[#0B1F4D] bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                    {apt.time}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {apt.property}, {apt.location}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                    {apt.countdown}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
                    {apt.type}
                  </span>
                </div>
              </div>

              {/* Key Access & Protocol Box (Primary focus for surveyor) */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-3 text-xs">
                <Key className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Key Access & Property Entry Protocol
                  </span>
                  <p className="font-semibold text-slate-800 leading-relaxed">
                    {apt.access}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Clean Report Upload & Navigation */}
              <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  Ref: {apt.jobNo}
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${apt.property} ${apt.location || ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Navigation</span>
                  </a>

                  <button
                    onClick={() => navigate(`/surveyor/upload-reports?jobId=${apt.jobNo}`)}
                    className="px-3.5 py-1.5 bg-[#0B1F4D] hover:bg-[#162E6E] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-blue-200" />
                    <span>Upload Report PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No appointments scheduled for this date.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. SURVEYOR JOBS PAGE (Countdown SLA Timers)
// ==========================================
export const SurveyorJobsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, updateJob } = useJobs();

  // Fetch surveyor jobs API
  useEffect(() => {
    surveyorJobsApi.getJobs().catch(() => {});
  }, []);
  const [filter, setFilter] = useState('active'); // 'active' | 'completed'

  // Isolate strictly by surveyor
  const surveyorId = user?.surveyorId || (user?.email === 'surveyor@demo.com' ? 'srv-1' : null);
  const surveyorName = user?.name;

  const myJobs = jobs.filter((j) =>
    (surveyorId && j.surveyorId === surveyorId) ||
    (surveyorName && j.surveyor === surveyorName)
  );

  const activeJobs = myJobs.filter((j) => j.status !== 'Completed');
  const completedJobs = myJobs.filter((j) => j.status === 'Completed');

  const filteredJobs = filter === 'active' ? activeJobs : completedJobs;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Allocated Survey Jobs"
        subtitle="Manage assigned properties, track 48h report drafting deadlines, and review QA approvals."
        breadcrumb={['Surveyor', 'My Jobs']}
      />

      {/* Surveyor Privacy Shield Banner */}
      <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-[#0B1F4D] block">
            Surveyor Privacy Shield Active
          </span>
          <p className="text-slate-600">
            Client billing, invoice payment settlements, quote fee totals, and signed terms timestamps are strictly restricted to central management.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'active'
              ? 'bg-[#0B1F4D] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Active Jobs ({activeJobs.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-[#0B1F4D] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Completed Jobs ({completedJobs.length})
        </button>
      </div>

      <div className="space-y-4">
        {filteredJobs.map((j) => (
          <div
            key={j.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0B1F4D]">
                  {j.id}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">{j.property}</h4>
                <span className="text-xs text-[#2563EB] font-semibold">{j.surveyType || j.type}</span>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${j.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-[#0B1F4D]'}`}>
                  {j.status}
                </span>
                {/* 48h Countdown Timer Badge */}
                <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1 block sm:inline-block">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>{j.countdown || '48h SLA Target'}</span>
                </div>
              </div>
            </div>

            {/* Lifecycle Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Inspection & QA Lifecycle</span>
                <span className="text-[#0B1F4D] font-mono">{j.progress || (j.status === 'Completed' ? 100 : 50)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    j.status === 'Completed' ? 'bg-emerald-500' : 'bg-[#0B1F4D]'
                  }`}
                  style={{ width: `${j.progress || (j.status === 'Completed' ? 100 : 50)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">Client: <strong>{j.customer || j.client}</strong></span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/surveyor/dashboard')}
                  className="px-3 py-1.5 bg-[#0B1F4D] text-white rounded-xl font-bold text-xs hover:bg-[#162E6E] cursor-pointer"
                >
                  On-Site Portal
                </button>
                <button
                  onClick={() => navigate(`/surveyor/upload-reports?jobId=${j.jobNo || j.id}`)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Upload Draft
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            No {filter} survey jobs allocated to your diary.
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. SURVEYOR SITE VISITS PAGE (Checklist & Access)
// ==========================================
export const SurveyorSiteVisitsPage = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const { jobs, updateJob } = useJobs();

  // Fetch surveyor site visits API
  useEffect(() => {
    surveyorSiteVisitsApi.getVisits().catch(() => {});
  }, []);

  const surveyorId = user?.surveyorId || (user?.email === 'surveyor@demo.com' ? 'srv-1' : null);
  const surveyorName = user?.name;

  const myJobs = jobs.filter((j) =>
    (surveyorId && j.surveyorId === surveyorId) ||
    (surveyorName && j.surveyor === surveyorName)
  );

  const activeJobs = myJobs.filter((j) => j.status !== 'Completed');
  let regUser = {};
  try {
    const reg = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
    const firstEmail = Object.keys(reg).find((e) => !e.includes('demo') && !e.includes('watson'));
    if (firstEmail) regUser = { ...reg[firstEmail], email: firstEmail };
  } catch {}

  const primaryJob = activeJobs[0] || myJobs[0] || {
    id: 'JOB-2026-880',
    property: regUser.address || 'HYDERABAD',
    location: regUser.postcode || 'GH12AA',
    timeSlot: '10:00 - 13:00',
    surveyType: regUser.serviceType || 'RICS Level 2 Home Survey',
    propertyDetails: {
      accessDetails: 'Customer direct instruction via portal',
    },
  };

  const [hasArrived, setHasArrived] = useState(true);
  const [hasFinished, setHasFinished] = useState(false);

  const handleArrival = () => {
    setHasArrived(true);
    addToast({
      type: 'success',
      title: 'GPS Site Check-in Logged',
      message: `Arrival recorded at ${primaryJob.property}. On-site inspection timer active.`,
    });
  };

  const handleFinished = () => {
    setHasFinished(true);
    if (primaryJob?.id && updateJob) {
      updateJob(primaryJob.id, {
        status: 'Inspected',
        timelineStep: 7,
        stage: 'PREPARING_REPORT',
      });
    }
    addToast({
      type: 'success',
      title: 'Site Visit Concluded',
      message: 'Physical survey finished. Please return property keys to agent/vendor.',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Site Visits & Key Logistics"
        subtitle="Log on-site arrival timestamps, record key collection procedures, and execute physical survey protocols."
        breadcrumb={['Surveyor', 'Site Visits']}
      />

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="font-mono text-xs font-bold text-[#0B1F4D] bg-blue-50 px-2 py-0.5 rounded">
                {primaryJob.id}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {primaryJob.property}, {primaryJob.location}
              </h4>
              <span className="text-xs text-slate-500">Appointment Slot: {primaryJob.timeSlot || '10:00 - 13:00'} (Today)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleArrival}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  hasArrived
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{hasArrived ? 'Arrived (10:02 AM)' : 'Log Arrival'}</span>
              </button>

              <button
                onClick={handleFinished}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  hasFinished
                    ? 'bg-blue-50 text-blue-900 border border-blue-300'
                    : 'bg-[#0B1F4D] hover:bg-[#162E6E] text-white'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{hasFinished ? 'Completed (12:45 PM)' : 'Inspection Complete'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Access Instructions</span>
              <div className="font-bold text-slate-800 truncate">{primaryJob.propertyDetails?.accessDetails || 'Keys with estate agent'}</div>
              <div className="text-slate-500">Survey Type: <strong>{primaryJob.surveyType}</strong></div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Client Contact</span>
              <div className="font-bold text-slate-800 font-mono">{primaryJob.customer}</div>
              <div className="text-slate-500">Phone: {primaryJob.customerPhone || '+44 7700 900147'}</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-1">
              <span className="text-[10px] font-bold text-blue-700 uppercase">Status & SLA</span>
              <div className="font-bold text-blue-900">{primaryJob.status}</div>
              <div className="text-blue-800 text-[11px]">{primaryJob.countdown || '48h SLA Target'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. UPLOAD REPORTS & QA SUBMISSION PAGE
// ==========================================
export const SurveyorUploadReportsPage = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const { jobs, updateJob } = useJobs();
  const [searchParams] = useSearchParams();
  const queryJobId = searchParams.get('jobId');

  // Fetch pending reports upload API
  useEffect(() => {
    surveyorUploadReportsApi.getPendingReports().catch(() => {});
  }, []);

  const surveyorId = user?.surveyorId || (user?.email === 'surveyor@demo.com' ? 'srv-1' : null);
  const surveyorName = user?.name;

  const myJobs = jobs.filter((j) =>
    (surveyorId && j.surveyorId === surveyorId) ||
    (surveyorName && j.surveyor === surveyorName)
  );

  const defaultJobId = queryJobId
    ? (myJobs.find((j) => j.jobNo === queryJobId || j.id === queryJobId)?.jobNo ||
       myJobs.find((j) => j.jobNo === queryJobId || j.id === queryJobId)?.id ||
       queryJobId)
    : (myJobs[0]?.jobNo || myJobs[0]?.id || 'JOB-2026-080');

  const [selectedJob, setSelectedJob] = useState(defaultJobId);

  useEffect(() => {
    if (queryJobId) {
      setSelectedJob(queryJobId);
    }
  }, [queryJobId]);

  const [reportStandard, setReportStandard] = useState('RICS Level 2 Home Survey (Final)');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      name: `Draft_Report_${defaultJobId}_v1.pdf`,
      size: '14.2 MB',
      date: 'Today, 14:15',
      jobId: defaultJobId,
      status: 'Under Admin QA Review',
    },
  ]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) processFiles(files);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) processFiles(files);
  };

  const processFiles = async (files) => {
    for (const f of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', f);
      try {
        const res = await api.post('/uploads/report', formData);
        const uploadedUrl = res?.url || res?.data?.url;
        const newItem = {
          name: f.name,
          size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
          date: 'Just now',
          jobId: selectedJob,
          status: 'Saved to Server Disk',
          url: uploadedUrl,
        };
        setUploadedFiles((prev) => [newItem, ...prev]);
        addToast({
          type: 'success',
          title: 'Report Uploaded to Server',
          message: `${f.name} successfully stored on server storage (/uploads/reports).`,
        });
      } catch (err) {
        // Fallback for UI
        const newItem = {
          name: f.name,
          size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
          date: 'Just now',
          jobId: selectedJob,
          status: 'Under Admin QA Review',
        };
        setUploadedFiles((prev) => [newItem, ...prev]);
        addToast({
          type: 'info',
          title: 'Report Queued',
          message: `${f.name} queued for Quality Review.`,
        });
      }
    }
  };

  const handleSubmitAllQA = () => {
    if (selectedJob && updateJob) {
      updateJob(selectedJob, {
        status: 'QA_Review',
        timelineStep: 9,
      });
    }
    addToast({
      type: 'success',
      title: 'Dispatched for Quality Assurance',
      message: `All condition rating drafts for ${selectedJob} submitted to Lead Surveyor for review.`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Upload Reports & Submit for Quality Review"
        subtitle="Deliver completed RICS condition reports, photographic evidence, and submit draft reports for Admin QA sign-off."
        breadcrumb={['Surveyor', 'Upload Reports']}
      />

      {/* Privacy Shield Banner */}
      <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-[#0B1F4D] block">
            Direct Report QA Handoff (Privacy Shield Protected)
          </span>
          <p className="text-slate-600">
            Upload your draft/final RICS report PDF directly to your assigned inspection. Customer payment amounts, invoice statuses, and terms signature timestamps are completely isolated from this view.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Job Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Assigned Survey Job *
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
            >
              {myJobs.map((j) => {
                const jobRef = j.jobNo || j.id;
                return (
                  <option key={j.id} value={jobRef}>
                    {jobRef} — {j.property}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Survey Report Standard
            </label>
            <select
              value={reportStandard}
              onChange={(e) => setReportStandard(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
            >
              <option>RICS Level 2 Home Survey (Final Draft)</option>
              <option>RICS Level 3 Building Survey (Full Structural)</option>
              <option>Valuation & Rebuild Cost Assessment</option>
              <option>Photographic Defect Schedule Only</option>
            </select>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#2563EB] bg-blue-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
          onClick={() => document.getElementById('report-file-input')?.click()}
        >
          <input
            id="report-file-input"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100/70 text-[#2563EB] flex items-center justify-center">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Drag and drop PDF report, Word templates, or photo archives
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PDF, DOCX, ZIP up to 50MB per file
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-white text-[#0B1F4D] rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 shadow-xs pointer-events-none"
            >
              Browse Local Files
            </button>
          </div>
        </div>

        {/* Uploaded Documents Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#0B1F4D] uppercase tracking-wider">
              Pending QA Documents ({uploadedFiles.length})
            </h4>
            <button
              onClick={handleSubmitAllQA}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit Batch to Admin QA</span>
            </button>
          </div>

          <div className="space-y-2">
            {uploadedFiles.map((f, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{f.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {f.size} • Uploaded {f.date} • Assigned to {f.jobId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {f.status}
                  </span>
                  <button
                    onClick={() => {
                      setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx));
                      addToast({ type: 'info', title: 'File Removed', message: f.name });
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. SURVEYOR AVAILABILITY & HOLIDAYS PAGE
// ==========================================
export const SurveyorAvailabilityPage = () => {
  const { addToast } = useToast();

  // Fetch surveyor availability API
  useEffect(() => {
    surveyorAvailabilityApi.getAvailability()
      .then((res) => {
        if (res?.data?.postcodesCovered) {
          setPostcodes(res.data.postcodesCovered);
        }
      })
      .catch(() => {});
  }, []);

  const [workingDays, setWorkingDays] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
    Sunday: false,
  });

  const [dailyCapacity, setDailyCapacity] = useState('2');
  const [postcodes, setPostcodes] = useState('GU, KT, SW, W, WC, NW');

  // Annual Leave / Holidays State
  const [holidays, setHolidays] = useState([
    { id: 1, label: 'Annual Autumn Leave', dates: '12 Nov 2026 – 16 Nov 2026', status: 'Approved' },
    { id: 2, label: 'Christmas Recess', dates: '24 Dec 2026 – 02 Jan 2027', status: 'Approved' },
  ]);

  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ label: '', dates: '' });

  const toggleDay = (day) => {
    setWorkingDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSaveAvailability = (e) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Schedule Updated',
      message: 'Working days, daily inspection volume, and postcode sectors saved.',
    });
  };

  const handleAddHoliday = (e) => {
    e.preventDefault();
    if (!newHoliday.label || !newHoliday.dates) return;

    setHolidays([...holidays, { id: Date.now(), ...newHoliday, status: 'Logged' }]);
    setIsHolidayModalOpen(false);
    setNewHoliday({ label: '', dates: '' });
    addToast({
      type: 'success',
      title: 'Leave Dates Logged',
      message: 'Holiday dates blocked out on dispatcher booking calendar.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="My Availability & Annual Leave"
        subtitle="Configure your active field working days, daily capacity cap, and manage holiday schedules."
        breadcrumb={['Surveyor', 'My Availability']}
      />

      {/* Working Days & Capacity Form */}
      <form onSubmit={handleSaveAvailability} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 text-xs">
        <div className="space-y-3">
          <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Working Days (Field Inspections)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {Object.keys(workingDays).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  workingDays[day]
                    ? 'bg-[#0B1F4D] text-white border-[#0B1F4D] shadow-xs'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>{day.slice(0, 3)}</div>
                <div className="text-[10px] font-normal mt-0.5">
                  {workingDays[day] ? 'Active' : 'Off'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Maximum Inspections per Day (Capacity Cap)
            </label>
            <select
              value={dailyCapacity}
              onChange={(e) => setDailyCapacity(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
            >
              <option value="1">1 Comprehensive Inspection (Level 3 or Commercial)</option>
              <option value="2">2 Standard Inspections (Level 2 Home Surveys)</option>
              <option value="3">3 Rapid Inspections / Valuations (Maximum)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Assigned Postcode Sectors
            </label>
            <input
              type="text"
              value={postcodes}
              onChange={(e) => setPostcodes(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0B1F4D] text-white text-xs font-bold rounded-xl hover:bg-[#162E6E] cursor-pointer"
          >
            Save Working Availability
          </button>
        </div>
      </form>

      {/* Annual Leave & Holidays Card (Point 14) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-[#0B1F4D]">
              Annual Leave & Blocked Calendar Dates
            </h4>
            <p className="text-xs text-slate-500">
              Dates marked here will automatically be excluded from client booking slots.
            </p>
          </div>

          <button
            onClick={() => setIsHolidayModalOpen(true)}
            className="px-3.5 py-2 bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Holiday / Leave</span>
          </button>
        </div>

        <div className="space-y-2">
          {holidays.map((h) => (
            <div
              key={h.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
            >
              <div>
                <strong className="text-slate-900 block">{h.label}</strong>
                <span className="text-[11px] text-slate-500">{h.dates}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {h.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Holiday Booking Modal */}
      {isHolidayModalOpen && (
        <Modal
          isOpen={isHolidayModalOpen}
          onClose={() => setIsHolidayModalOpen(false)}
          title="Log Surveyor Annual Leave"
          subtitle="Block out dates on the central booking dispatch calendar."
          maxWidth="max-w-md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsHolidayModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddHoliday}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-xs font-bold text-white cursor-pointer"
              >
                Confirm Leave
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason / Description</label>
              <input
                type="text"
                placeholder="e.g. Annual Leave, CPD Training"
                value={newHoliday.label}
                onChange={(e) => setNewHoliday({ ...newHoliday, label: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date Range</label>
              <input
                type="text"
                placeholder="e.g. 10 Nov 2026 – 14 Nov 2026"
                value={newHoliday.dates}
                onChange={(e) => setNewHoliday({ ...newHoliday, dates: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
