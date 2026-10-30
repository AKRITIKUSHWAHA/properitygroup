import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

// ==========================================
// 1. SURVEYOR CALENDAR PAGE (Dynamic Date Fix for Point 8)
// ==========================================
export const SurveyorCalendarPage = () => {
  const navigate = useNavigate();

  // Dynamic date calculation so calendar NEVER displays incorrect "Today" (Fixes Client Point 8)
  const today = new Date();
  const formatDay = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  // Generate 5 days starting from yesterday or today
  const dynamicDays = [-1, 0, 1, 2, 3].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const isToday = offset === 0;
    return {
      label: isToday ? `Today (${formatDay(d)})` : formatDay(d),
      isToday,
      appointments: isToday ? 2 : offset === 1 ? 1 : 2,
    };
  });

  const [selectedDay, setSelectedDay] = useState(dynamicDays[1].label);

  const appointments = [
    {
      id: 'JOB-2026-080',
      time: '10:00 - 13:00',
      property: '14 Mayfair Gate',
      location: 'Mayfair, London W1K 2PB',
      type: 'RICS Home Survey Level 2',
      client: 'Emma Watson',
      phone: '+44 7700 900147',
      access: 'Keys with Foxtons Mayfair (Branch Ref #FX-402)',
      status: 'In Progress (On-Site)',
      countdown: '34h 22m remaining (48h SLA)',
    },
    {
      id: 'JOB-2026-081',
      time: '14:30 - 16:30',
      property: '24 Kensington Palace Gardens',
      location: 'London W8 4QQ',
      type: 'RICS Building Survey Level 3',
      client: 'Kensington Estates PLC',
      phone: '+44 20 7946 0912',
      access: 'Concierge front desk (Security code 8492#)',
      status: 'Scheduled',
      countdown: '72h SLA Target',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Field Calendar & Diary"
        subtitle="Manage daily inspection appointments, check-in logistics, and travel windows."
        breadcrumb={['Surveyor', 'My Calendar']}
      />

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
              Schedule for {selectedDay}
            </h3>
            <p className="text-xs text-slate-500">Daylight hours optimized for external & roof void inspection.</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-xl">
            {appointments.length} Appointments Confirmed
          </span>
        </div>

        <div className="space-y-3">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-[#2563EB] transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#0B1F4D] bg-white px-2.5 py-1 rounded-xl border border-slate-200">
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
                    {apt.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200/70">
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">
                    Access: <strong>{apt.access}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Client Contact: <strong>{apt.client}</strong> ({apt.phone})
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{apt.type}</span>
                <button
                  onClick={() => navigate('/surveyor/dashboard')}
                  className="font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open On-Site Check-in</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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
  const [filter, setFilter] = useState('active'); // 'active' | 'completed'

  const jobs = [
    {
      id: 'JOB-2026-080',
      property: '14 Mayfair Gate, London W1K 2PB',
      type: 'RICS Level 2 Home Survey',
      client: 'Emma Watson',
      targetSla: '48h Turnaround',
      countdown: '34h 22m remaining',
      deadlineUrgent: false,
      status: 'On-Site / Drafting',
      progress: 75,
      isCompleted: false,
    },
    {
      id: 'JOB-2026-081',
      property: '24 Kensington Palace Gardens, W8 4QQ',
      type: 'RICS Level 3 Building Survey',
      client: 'Kensington Estates PLC',
      targetSla: '72h Turnaround',
      countdown: '68h 10m remaining',
      deadlineUrgent: false,
      status: 'Inspection Scheduled',
      progress: 40,
      isCompleted: false,
    },
    {
      id: 'JOB-2026-079',
      property: '8 Chichester Road, Richmond TW10',
      type: 'Specific Structural Defect Survey',
      client: 'Richmond Borough Properties',
      targetSla: 'Delivered On Time',
      countdown: 'Completed (QA Passed)',
      deadlineUrgent: false,
      status: 'Completed & Dispatched',
      progress: 100,
      isCompleted: true,
    },
  ];

  const filteredJobs = jobs.filter((j) => (filter === 'active' ? !j.isCompleted : j.isCompleted));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Allocated Survey Jobs"
        subtitle="Manage assigned properties, track 48h report drafting deadlines, and review QA approvals."
        breadcrumb={['Surveyor', 'My Jobs']}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'active'
              ? 'bg-[#0B1F4D] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Active Jobs (2)
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-[#0B1F4D] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Completed Jobs (1)
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
                <span className="text-xs text-[#2563EB] font-semibold">{j.type}</span>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#0B1F4D]">
                  {j.status}
                </span>
                {/* 48h Countdown Timer Badge */}
                <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1 block sm:inline-block">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>{j.countdown}</span>
                </div>
              </div>
            </div>

            {/* Lifecycle Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Inspection & QA Lifecycle</span>
                <span className="text-[#0B1F4D] font-mono">{j.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    j.isCompleted ? 'bg-emerald-500' : 'bg-[#0B1F4D]'
                  }`}
                  style={{ width: `${j.progress}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">Client: <strong>{j.client}</strong></span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/surveyor/dashboard')}
                  className="px-3 py-1.5 bg-[#0B1F4D] text-white rounded-xl font-bold text-xs hover:bg-[#162E6E] cursor-pointer"
                >
                  On-Site Portal
                </button>
                <button
                  onClick={() => navigate('/surveyor/upload-reports')}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Upload Draft
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. SURVEYOR SITE VISITS PAGE (Checklist & Access)
// ==========================================
export const SurveyorSiteVisitsPage = () => {
  const { addToast } = useToast();
  const [hasArrived, setHasArrived] = useState(true);
  const [hasFinished, setHasFinished] = useState(false);

  const handleArrival = () => {
    setHasArrived(true);
    addToast({
      type: 'success',
      title: 'GPS Site Check-in Logged',
      message: 'Arrival recorded at 14 Mayfair Gate. On-site inspection timer active.',
    });
  };

  const handleFinished = () => {
    setHasFinished(true);
    addToast({
      type: 'success',
      title: 'Site Visit Concluded',
      message: 'Physical survey finished. Please return property keys to Foxtons Mayfair.',
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
                JOB-2026-080
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                14 Mayfair Gate, Mayfair, London W1K 2PB
              </h4>
              <span className="text-xs text-slate-500">Appointment Slot: 10:00 - 13:00 (Today)</span>
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
              <span className="text-[10px] font-bold text-slate-400 uppercase">Keyholder Contact</span>
              <div className="font-bold text-slate-800">Foxtons Mayfair Branch</div>
              <div className="text-slate-500">Ref: <strong>#FX-402</strong> • Tel: 020 7946 0888</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Concierge Access</span>
              <div className="font-bold text-slate-800 font-mono">Code: #8492</div>
              <div className="text-slate-500">Mansion block concierge on front gate</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-1">
              <span className="text-[10px] font-bold text-blue-700 uppercase">Critical Client Caveat</span>
              <div className="font-bold text-blue-900">Skirting Board Moisture Check</div>
              <div className="text-blue-800 text-[11px]">Protimeter reading taken in rear dining room</div>
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

  const [selectedJob, setSelectedJob] = useState('JOB-2026-080');
  const [reportStandard, setReportStandard] = useState('RICS Level 2 Home Survey (Final)');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      name: 'Draft_Level2_Report_14_Mayfair_Gate_v1.pdf',
      size: '14.2 MB',
      date: 'Today, 14:15',
      jobId: 'JOB-2026-080',
      status: 'Under Admin QA Review',
    },
    {
      name: 'HighRes_Defect_Photographs_Richmond_Archive.zip',
      size: '48.6 MB',
      date: '25/10/2026, 17:30',
      jobId: 'JOB-2026-079',
      status: 'Approved & Dispatched',
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

  const processFiles = (files) => {
    const newItems = Array.from(files).map((f) => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      date: 'Just now',
      jobId: selectedJob,
      status: 'Under Admin QA Review',
    }));

    setUploadedFiles((prev) => [...newItems, ...prev]);
    addToast({
      type: 'success',
      title: 'Report Artifact Uploaded',
      message: `${files.length} document(s) uploaded and queued for Quality Review.`,
    });
  };

  const handleSubmitAllQA = () => {
    addToast({
      type: 'success',
      title: 'Dispatched for Quality Assurance',
      message: 'All condition rating drafts for JOB-2026-080 submitted to Lead Surveyor for review.',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Upload Reports & Submit for Quality Review"
        subtitle="Deliver completed RICS condition reports, photographic evidence, and submit draft reports for Admin QA sign-off."
        breadcrumb={['Surveyor', 'Upload Reports']}
      />

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
              <option value="JOB-2026-080">JOB-2026-080 — 14 Mayfair Gate, London W1K</option>
              <option value="JOB-2026-081">JOB-2026-081 — 24 Kensington Palace Gardens, W8</option>
              <option value="JOB-2026-079">JOB-2026-079 — 8 Chichester Road, Richmond TW10</option>
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

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#2563EB] bg-blue-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-[#2563EB] bg-slate-50/50 hover:bg-white'
          }`}
        >
          <input
            type="file"
            id="report-file-input"
            multiple
            accept=".pdf,.docx,.doc,.zip,.jpg,.png"
            onChange={handleFileInput}
            className="hidden"
          />
          <label htmlFor="report-file-input" className="cursor-pointer block space-y-3">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-[#0B1F4D] flex items-center justify-center mx-auto">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Drag and drop your report draft here, or{' '}
                <span className="text-[#2563EB] hover:underline">browse files</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, DOCX, and ZIP archives up to 100 MB.
              </p>
            </div>
          </label>
        </div>

        {/* Submit to Admin QA Button */}
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-700" />
            <div>
              <h5 className="text-xs font-bold text-purple-950">Ready for QA Sign-Off?</h5>
              <p className="text-[11px] text-purple-800">Admin team peer-reviews all condition ratings before client release.</p>
            </div>
          </div>

          <button
            onClick={handleSubmitAllQA}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm shrink-0"
          >
            Submit for QA Review
          </button>
        </div>

        {/* Uploaded Documents Register */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Uploaded Report Artifacts
          </h4>

          <div className="space-y-2">
            {uploadedFiles.map((doc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-[#0B1F4D] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">{doc.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {doc.jobId} • {doc.size} • {doc.date}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                    doc.status === 'Approved & Dispatched'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {doc.status}
                </span>
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
