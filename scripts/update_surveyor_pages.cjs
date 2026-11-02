const fs = require('fs');
const path = require('path');

// ==========================================
// 1. UPDATE SurveyorModules.jsx
// ==========================================
const modulesPath = path.join(__dirname, '../src/pages/surveyor/SurveyorModules.jsx');
let modulesContent = fs.readFileSync(modulesPath, 'utf8');

// Ensure imports include useAuth and useJobs
if (!modulesContent.includes("import { useAuth }")) {
  modulesContent = modulesContent.replace(
    "import { Modal } from '../../components/common/Modal';",
    "import { Modal } from '../../components/common/Modal';\nimport { useAuth } from '../../auth/AuthContext';\nimport { useJobs } from '../../mock/jobs';"
  );
}

// Replace SurveyorCalendarPage
const oldCalendarRegex = /export const SurveyorCalendarPage = \(\) => \{[\s\S]*?\n\};\n\n\/\/ ===+/;
const newCalendar = `export const SurveyorCalendarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();

  const surveyorId = user?.surveyorId || (user?.email === 'surveyor@demo.com' ? 'srv-1' : null);
  const surveyorName = user?.name;

  const myJobs = jobs.filter((j) =>
    (surveyorId && j.surveyorId === surveyorId) ||
    (surveyorName && j.surveyor === surveyorName)
  );

  const today = new Date();
  const formatDay = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  const dynamicDays = [-1, 0, 1, 2, 3].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const isToday = offset === 0;
    return {
      label: isToday ? \`Today (\${formatDay(d)})\` : formatDay(d),
      isToday,
      appointments: isToday ? Math.min(2, myJobs.length) : offset === 1 ? 1 : 0,
    };
  });

  const [selectedDay, setSelectedDay] = useState(dynamicDays[1].label);

  const appointments = myJobs
    .filter((j) => j.status !== 'Completed')
    .slice(0, 3)
    .map((j) => ({
      id: j.id,
      time: j.timeSlot || '10:00 - 13:00',
      property: j.property,
      location: j.location,
      type: j.surveyType,
      client: j.customer,
      phone: j.customerPhone || '+44 7700 900147',
      access: j.propertyDetails?.accessDetails || 'Keys with estate agent',
      status: j.status,
      countdown: j.countdown || '48h SLA Target',
    }));

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
            className={\`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all shrink-0 cursor-pointer \${
              selectedDay === d.label
                ? 'bg-[#0B1F4D] text-white border-[#0B1F4D] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }\`}
          >
            <span>{d.label}</span>
            <span
              className={\`ml-2 px-1.5 py-0.5 rounded-full text-[10px] \${
                selectedDay === d.label ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }\`}
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

// ==========================================`;

modulesContent = modulesContent.replace(oldCalendarRegex, newCalendar);

// Replace SurveyorJobsPage
const oldJobsRegex = /export const SurveyorJobsPage = \(\) => \{[\s\S]*?\n\};\n\n\/\/ ===+/;
const newJobs = `export const SurveyorJobsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();
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

      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('active')}
          className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer \${
            filter === 'active'
              ? 'bg-[#0B1F4D] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }\`}
        >
          Active Jobs ({activeJobs.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer \${
            filter === 'completed'
              ? 'bg-[#0B1F4D] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }\`}
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
                <span className={\`px-3 py-1 rounded-full text-xs font-bold \${j.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-[#0B1F4D]'}\`}>
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
                  className={\`h-full rounded-full transition-all duration-500 \${
                    j.status === 'Completed' ? 'bg-emerald-500' : 'bg-[#0B1F4D]'
                  }\`}
                  style={{ width: \`\${j.progress || (j.status === 'Completed' ? 100 : 50)}%\` }}
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
                  onClick={() => navigate('/surveyor/upload-reports')}
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

// ==========================================`;

modulesContent = modulesContent.replace(oldJobsRegex, newJobs);

// Replace SurveyorSiteVisitsPage
const oldSiteVisitsRegex = /export const SurveyorSiteVisitsPage = \(\) => \{[\s\S]*?\n\};\n\n\/\/ ===+/;
const newSiteVisits = `export const SurveyorSiteVisitsPage = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const { jobs } = useJobs();

  const surveyorId = user?.surveyorId || (user?.email === 'surveyor@demo.com' ? 'srv-1' : null);
  const surveyorName = user?.name;

  const myJobs = jobs.filter((j) =>
    (surveyorId && j.surveyorId === surveyorId) ||
    (surveyorName && j.surveyor === surveyorName)
  );

  const activeJobs = myJobs.filter((j) => j.status !== 'Completed');
  const primaryJob = activeJobs[0] || myJobs[0] || {
    id: 'JOB-2026-080',
    property: '14 Mayfair Gate',
    location: 'Mayfair, London W1K 2PB',
    timeSlot: '10:00 - 13:00',
    surveyType: 'RICS Level 2 Home Survey',
    propertyDetails: {
      accessDetails: 'Keys with Foxtons Mayfair (Branch Ref #FX-402)',
    },
  };

  const [hasArrived, setHasArrived] = useState(true);
  const [hasFinished, setHasFinished] = useState(false);

  const handleArrival = () => {
    setHasArrived(true);
    addToast({
      type: 'success',
      title: 'GPS Site Check-in Logged',
      message: \`Arrival recorded at \${primaryJob.property}. On-site inspection timer active.\`,
    });
  };

  const handleFinished = () => {
    setHasFinished(true);
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
                className={\`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer \${
                  hasArrived
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }\`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{hasArrived ? 'Arrived (10:02 AM)' : 'Log Arrival'}</span>
              </button>

              <button
                onClick={handleFinished}
                className={\`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer \${
                  hasFinished
                    ? 'bg-blue-50 text-blue-900 border border-blue-300'
                    : 'bg-[#0B1F4D] hover:bg-[#162E6E] text-white'
                }\`}
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

// ==========================================`;

modulesContent = modulesContent.replace(oldSiteVisitsRegex, newSiteVisits);

// Replace SurveyorUploadReportsPage
const oldUploadRegex = /export const SurveyorUploadReportsPage = \(\) => \{[\s\S]*?\n\};\n\n\/\/ ===+/;
const newUpload = `export const SurveyorUploadReportsPage = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const { jobs } = useJobs();

  const surveyorId = user?.surveyorId || (user?.email === 'surveyor@demo.com' ? 'srv-1' : null);
  const surveyorName = user?.name;

  const myJobs = jobs.filter((j) =>
    (surveyorId && j.surveyorId === surveyorId) ||
    (surveyorName && j.surveyor === surveyorName)
  );

  const [selectedJob, setSelectedJob] = useState(myJobs[0]?.id || 'JOB-2026-080');
  const [reportStandard, setReportStandard] = useState('RICS Level 2 Home Survey (Final)');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      name: \`Draft_Report_\${myJobs[0]?.id || 'JOB-2026-080'}_v1.pdf\`,
      size: '14.2 MB',
      date: 'Today, 14:15',
      jobId: myJobs[0]?.id || 'JOB-2026-080',
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

  const processFiles = (files) => {
    const newItems = Array.from(files).map((f) => ({
      name: f.name,
      size: \`\${(f.size / (1024 * 1024)).toFixed(1)} MB\`,
      date: 'Just now',
      jobId: selectedJob,
      status: 'Under Admin QA Review',
    }));

    setUploadedFiles((prev) => [...newItems, ...prev]);
    addToast({
      type: 'success',
      title: 'Report Artifact Uploaded',
      message: \`\${files.length} document(s) uploaded and queued for Quality Review.\`,
    });
  };

  const handleSubmitAllQA = () => {
    addToast({
      type: 'success',
      title: 'Dispatched for Quality Assurance',
      message: \`All condition rating drafts for \${selectedJob} submitted to Lead Surveyor for review.\`,
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
              {myJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.id} — {j.property}
                </option>
              ))}
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
          className={\`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer \${
            isDragging
              ? 'border-[#2563EB] bg-blue-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }\`}
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

// ==========================================`;

modulesContent = modulesContent.replace(oldUploadRegex, newUpload);

fs.writeFileSync(modulesPath, modulesContent, 'utf8');
console.log('Successfully updated SurveyorModules.jsx with surveyor job isolation!');

