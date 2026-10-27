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
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useToast } from '../../components/ToastContext';
import { Modal } from '../../components/common/Modal';

// ==========================================
// 1. SURVEYOR CALENDAR PAGE
// ==========================================
export const SurveyorCalendarPage = () => {
  const [selectedDay, setSelectedDay] = useState('Today (27 Oct)');

  const days = [
    { label: 'Mon 26 Oct', appointments: 1 },
    { label: 'Today (27 Oct)', appointments: 2, isToday: true },
    { label: 'Wed 28 Oct', appointments: 1 },
    { label: 'Thu 29 Oct', appointments: 2 },
    { label: 'Fri 30 Oct', appointments: 1 },
  ];

  const appointments = [
    {
      time: '10:00 - 13:00',
      property: '14 Mayfair Gate',
      location: 'Mayfair, London W1K 2PB',
      type: 'RICS Home Survey Level 2',
      client: 'Emma Watson',
      phone: '+44 7700 900147',
      access: 'Keys with Foxtons Mayfair (Branch Ref #FX-402)',
      status: 'In Progress',
    },
    {
      time: '14:30 - 16:30',
      property: '24 Kensington Palace Gardens',
      location: 'London W8 4QQ',
      type: 'RICS Building Survey Level 3',
      client: 'Kensington Estates PLC',
      phone: '+44 20 7946 0912',
      access: 'Concierge front desk (Security code 8492#)',
      status: 'Scheduled',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Field Calendar"
        subtitle="Manage your daily on-site property inspection appointments, key collection logistics, and travel windows."
        breadcrumb={['Surveyor', 'My Calendar']}
      />

      {/* Week Day Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((d) => (
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
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
              selectedDay === d.label ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {d.appointments}
            </span>
          </button>
        ))}
      </div>

      {/* Day Schedule Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-[#0B1F4D]">
            Schedule for {selectedDay}
          </h3>
          <span className="text-xs font-mono font-bold text-[#2563EB]">
            {appointments.length} Site Visits Confirmed
          </span>
        </div>

        <div className="space-y-3">
          {appointments.map((apt, idx) => (
            <div
              key={idx}
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
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
                  {apt.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                <div>Client: <strong>{apt.client}</strong> ({apt.phone})</div>
                <div>Survey Type: <strong>{apt.type}</strong></div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{apt.access}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. SURVEYOR JOBS PAGE
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
      targetSla: '48h Post-Site (Due Tomorrow 13:00)',
      status: 'Report Drafting',
      progress: 75,
      isCompleted: false,
    },
    {
      id: 'JOB-2026-081',
      property: '24 Kensington Palace Gardens, W8 4QQ',
      type: 'RICS Level 3 Building Survey',
      client: 'Kensington Estates PLC',
      targetSla: '72h Post-Site (Due 30/10/2026)',
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
      status: 'Completed',
      progress: 100,
      isCompleted: true,
    },
    {
      id: 'JOB-2026-078',
      property: '42 Belgrave Square, London SW1X',
      type: 'Commercial Red Book Valuation',
      client: 'Apex Asset Holdings Ltd',
      targetSla: 'Delivered On Time',
      status: 'Completed',
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
          Completed Jobs (2)
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
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0B1F4D]">
                  {j.id}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">{j.property}</h4>
                <span className="text-xs text-[#2563EB] font-semibold">{j.type}</span>
              </div>

              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    j.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-[#2563EB]'
                  }`}
                >
                  {j.status}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">{j.targetSla}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Lifecycle Progress</span>
                <span className="text-[#0B1F4D] font-mono">{j.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    j.isCompleted ? 'bg-emerald-500' : 'bg-[#2563EB]'
                  }`}
                  style={{ width: `${j.progress}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Client: <strong>{j.client}</strong></span>
              <button
                onClick={() => navigate(`/jobs/${j.id}`)}
                className="inline-flex items-center gap-1 font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                <span>Full Job Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. SURVEYOR SITE VISITS PAGE
// ==========================================
export const SurveyorSiteVisitsPage = () => {
  const { addToast } = useToast();

  const handleCheckIn = (property) => {
    addToast({
      type: 'success',
      title: 'GPS Site Check-in Logged',
      message: `Arrival timestamp recorded at ${property}. Inspection clock started.`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Site Visits & Key Logistics"
        subtitle="Log on-site arrival timestamps, record key collection procedures, and note access instructions."
        breadcrumb={['Surveyor', 'Site Visits']}
      />

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">
                JOB-2026-080
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                14 Mayfair Gate, Mayfair, London W1K 2PB
              </h4>
              <span className="text-xs text-slate-500">Inspection Time: 10:00 - 13:00 (Today)</span>
            </div>

            <button
              onClick={() => handleCheckIn('14 Mayfair Gate')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log Site Arrival</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Keyholder</span>
              <div className="font-bold text-slate-800">Foxtons Mayfair Branch</div>
              <div className="text-slate-500">Contact: Branch Manager (020 7946 0888)</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Site Access Code</span>
              <div className="font-bold text-slate-800 font-mono">Portico Code: #8402</div>
              <div className="text-slate-500">Concierge on duty until 18:00</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Critical Inspection Caveats</span>
              <div className="font-bold text-slate-800">Roof Void & Damp Protimeter</div>
              <div className="text-slate-500">Test moisture readings in rear kitchen</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. UPLOAD REPORTS (FILE DROP ZONE REQUIRED BY USER PROMPT)
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
      date: '27/10/2026, 14:15',
      jobId: 'JOB-2026-080',
      status: 'Submitted for QA Review',
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
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = (files) => {
    const newItems = Array.from(files).map((f) => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      date: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      jobId: selectedJob,
      status: 'Submitted for QA Review',
    }));

    setUploadedFiles((prev) => [...newItems, ...prev]);
    addToast({
      type: 'success',
      title: 'Files Uploaded Successfully',
      message: `${files.length} report document(s) added to ${selectedJob} for quality assurance sign-off.`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Upload Survey Reports & Evidence"
        subtitle="Deliver completed RICS condition reports, high-resolution photographic evidence, and structural schedules."
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
            >
              <option value="JOB-2026-080">JOB-2026-080 — 14 Mayfair Gate, London W1K</option>
              <option value="JOB-2026-081">JOB-2026-081 — 24 Kensington Palace Gardens, W8</option>
              <option value="JOB-2026-079">JOB-2026-079 — 8 Chichester Road, Richmond TW10</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Report Standard / Document Classification
            </label>
            <select
              value={reportStandard}
              onChange={(e) => setReportStandard(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
            >
              <option value="RICS Level 2 Home Survey (Final)">RICS Level 2 Home Survey (Final)</option>
              <option value="RICS Level 3 Building Survey (Draft)">RICS Level 3 Building Survey (Draft)</option>
              <option value="High-Res Site Inspection Photos">High-Res Site Inspection Photos (ZIP)</option>
              <option value="Red Book Valuation Certificate">Red Book Valuation Certificate</option>
            </select>
          </div>
        </div>

        {/* Mobile Camera Snapshot & Offline Sync Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="file"
            id="camera-photo-input"
            accept="image/*"
            capture="environment"
            onChange={handleFileInput}
            className="hidden"
          />
          <label
            htmlFor="camera-photo-input"
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all min-h-[44px] cursor-pointer shadow-xs shrink-0"
          >
            <Camera className="w-4 h-4" />
            <span>Snap Site Photo (Camera)</span>
          </label>

          <div className="flex-1 text-slate-600 text-[11px] leading-tight flex items-center gap-2 bg-blue-50/80 p-2.5 rounded-2xl border border-blue-200/60">
            <WifiOff className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              <strong>Offline-Ready:</strong> Photos and reports are cached locally on phone and will automatically sync when network returns.
            </span>
          </div>
        </div>

        {/* INTERACTIVE FILE DROP ZONE (Required by prompt) */}
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
            <div className="w-14 h-14 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center mx-auto">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Drag and drop your finalized report here, or{' '}
                <span className="text-[#2563EB] hover:underline">browse files</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, DOCX, and ZIP archives up to 100 MB. Automatic virus scan applied.
              </p>
            </div>
          </label>
        </div>

        {/* Uploaded Documents Register */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Recently Uploaded Report Artifacts
          </h4>

          <div className="space-y-2">
            {uploadedFiles.map((doc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-[#2563EB] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">{doc.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {doc.jobId} • {doc.size} • {doc.date}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 shrink-0">
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
// 5. SURVEYOR AVAILABILITY PAGE
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
  const [postcodes, setPostcodes] = useState('GU, KT, SW, W');

  const toggleDay = (day) => {
    setWorkingDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Availability Updated',
      message: 'Your field working schedule and postcode sectors have been saved.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="My Working Availability & Postcodes"
        subtitle="Set your field inspection working days, daily inspection volume cap, and regional UK postcodes."
        breadcrumb={['Surveyor', 'My Availability']}
      />

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 text-xs">
        {/* Working Days */}
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

        {/* Capacity & Postcodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Maximum Inspections per Day
            </label>
            <select
              value={dailyCapacity}
              onChange={(e) => setDailyCapacity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
            >
              <option value="1">1 Comprehensive Inspection (Level 3 or Commercial)</option>
              <option value="2">2 Standard Inspections (Level 2 or Valuations)</option>
              <option value="3">3 Snagging / Defect Inspections</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Active Coverage Postcodes (UK Sectors)
            </label>
            <input
              type="text"
              value={postcodes}
              onChange={(e) => setPostcodes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold text-slate-900"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Comma separated e.g. GU, KT, SW, W, UB
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0B1F4D] text-white text-xs font-bold rounded-xl hover:bg-[#162E6E] cursor-pointer"
          >
            Save Availability Settings
          </button>
        </div>
      </form>
    </div>
  );
};
