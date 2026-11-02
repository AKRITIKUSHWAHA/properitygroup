const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../src/pages/surveyor/SurveyorDashboardPage.jsx');
let content = fs.readFileSync(dashPath, 'utf8');

// Ensure imports include useAuth and useJobs
if (!content.includes("import { useAuth }")) {
  content = content.replace(
    "import { Modal } from '../../components/common/Modal';",
    "import { Modal } from '../../components/common/Modal';\nimport { useAuth } from '../../auth/AuthContext';\nimport { useJobs } from '../../mock/jobs';"
  );
}

// Update the SurveyorDashboardPage body
const oldFuncStartRegex = /export const SurveyorDashboardPage = \(\) => \{[\s\S]*?\/\/ Turnaround Countdown State/;
const newFuncStart = `export const SurveyorDashboardPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const { jobs } = useJobs();

  // Strict surveyor job isolation
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
    surveyType: 'RICS Level 2 Home Survey',
    customer: 'Emma Watson',
    customerPhone: '+44 7700 900147',
    timeSlot: '10:00 - 13:00',
    status: 'In Progress',
    countdown: '34h 22m remaining',
    propertyDetails: {
      accessDetails: 'Keys with Foxtons Mayfair (Branch Ref #FX-402)',
      yearBuilt: 'c. 1892 (Victorian)',
      propertyType: 'Mansion Apartment',
    },
  };

  const secondaryJob = activeJobs[1] || null;

  // On-Site Status for Primary Job
  // 'scheduled' | 'arrived' | 'completed' | 'qa_submitted'
  const [jobStage, setJobStage] = useState('arrived');
  const [arrivalTimestamp, setArrivalTimestamp] = useState('Today at 10:02 AM');
  const [completeTimestamp, setCompleteTimestamp] = useState(null);

  // Turnaround Countdown State`;

content = content.replace(oldFuncStartRegex, newFuncStart);

// Replace Toast Messages to use primaryJob
content = content.replace(
  "Checked in at 14 Mayfair Gate at ${timeStr}. On-site inspection clock activated.",
  "Checked in at ${primaryJob.property} at ${timeStr}. On-site inspection clock activated."
);
content = content.replace(
  "Please ensure keys are returned to Foxtons Mayfair.",
  "Please ensure keys are returned to agent/vendor."
);
content = content.replace(
  "'Draft RICS Level 2 report and site evidence dispatched to Admin Quality Review Desk.'",
  "`Draft ${primaryJob.surveyType} report and site evidence for ${primaryJob.id} dispatched to Admin Quality Review Desk.`"
);

// Replace SLA Banner texts
content = content.replace(
  '<h2 className="text-lg sm:text-xl font-black">\n              14 Mayfair Gate — Level 2 Survey\n            </h2>\n            <p className="text-xs text-blue-100">\n              Target turnaround: 48 hours post-inspection • Instructing Client: Emma Watson\n            </p>',
  `<h2 className="text-lg sm:text-xl font-black">
              {primaryJob.property} — {primaryJob.surveyType}
            </h2>
            <p className="text-xs text-blue-100">
              Target turnaround: 48 hours post-inspection • Instructing Client: {primaryJob.customer}
            </p>`
);

// Replace Primary Job Box texts
content = content.replace(
  `<span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 font-mono">\n                JOB-2026-080\n              </span>`,
  `<span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 font-mono">
                {primaryJob.id}
              </span>`
);
content = content.replace(
  `<h3 className="text-xl font-black text-slate-900 mt-1.5">\n              14 Mayfair Gate, Mayfair, London W1K 2PB\n            </h3>\n            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">\n              <Clock className="w-3.5 h-3.5 text-slate-400" />\n              <span>Inspection Slot: <strong>10:00 – 13:00 (Today)</strong></span>\n            </p>`,
  `<h3 className="text-xl font-black text-slate-900 mt-1.5">
              {primaryJob.property}, {primaryJob.location}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Inspection Slot: <strong>{primaryJob.timeSlot || '10:00 – 13:00 (Today)'}</strong></span>
            </p>`
);

// Replace Google Maps link
content = content.replace(
  'href="https://maps.google.com/?q=14+Mayfair+Gate+London+W1K+2PB"',
  'href={`https://maps.google.com/?q=${encodeURIComponent(`${primaryJob.property} ${primaryJob.location || \'\'}`)}`}'
);

// Replace Key Collection box
content = content.replace(
  `<div className="font-bold text-slate-900">Foxtons Mayfair Branch</div>\n            <div className="text-slate-600 text-[11px]">Branch Ref: <strong>#FX-402</strong></div>\n            <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200">\n              Selling Agent: Sarah Croft (Knight Frank)\n            </div>`,
  `<div className="font-bold text-slate-900 truncate">{primaryJob.propertyDetails?.accessDetails || 'Keys with estate agent'}</div>
            <div className="text-slate-600 text-[11px]">Property Type: <strong>{primaryJob.propertyDetails?.propertyType || 'Residential'}</strong></div>
            <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200">
              Client Contact: {primaryJob.customer} ({primaryJob.customerPhone || '+44 7700 900147'})
            </div>`
);

// Replace Section 5 Second Appointment
const oldSec5Regex = /\{\/\* 5\. SECOND APPOINTMENT \(Afternoon Slot\) \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\{/;
const newSec5 = `{/* 5. SECOND APPOINTMENT (If allocated in diary) */}
      {secondaryJob && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                {secondaryJob.id}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {secondaryJob.property}, {secondaryJob.location}
              </h4>
              <span className="text-xs text-slate-500">Slot: {secondaryJob.timeSlot || '14:30 – 17:00 (Afternoon Inspection)'}</span>
            </div>

            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
              {secondaryJob.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl">
              Service: <strong>{secondaryJob.surveyType}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              Access: <strong>{secondaryJob.propertyDetails?.accessDetails || 'Keys with estate agent'}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
    {`;

content = content.replace(oldSec5Regex, newSec5);

fs.writeFileSync(dashPath, content, 'utf8');
console.log('Successfully updated SurveyorDashboardPage.jsx with dynamic isolated job binding!');
