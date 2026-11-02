const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'admin', 'AdminSurveyorsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `      {/* 3 Top Metric Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Accredited Panel</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#0B1F4D]">{surveyorsList.length} Surveyors</div>
          <div className="text-xs text-slate-500">Chartered MRICS / FRICS / AssocRICS</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Monthly Load</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{totalInspections} Inspections</div>
          <div className="text-xs text-slate-500">Scheduled on-site visits across UK</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">PII Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">100% Validated</div>
          <div className="text-xs text-slate-500">Professional Indemnity Insurance up to date</div>
        </div>
      </div>`;

const replacement = `      {/* 3 Compact Metric Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Accredited Panel */}
        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Accredited Panel
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1F4D]">
              {surveyorsList.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Surveyors</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
            Chartered MRICS / FRICS / AssocRICS
          </p>
        </div>

        {/* Card 2: Active Monthly Load */}
        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Monthly Load
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-700">
              {totalInspections}
            </span>
            <span className="text-xs font-semibold text-slate-500">Inspections</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
            Scheduled on-site visits across UK
          </p>
        </div>

        {/* Card 3: PII Compliance */}
        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              PII Compliance
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              100%
            </span>
            <span className="text-xs font-semibold text-slate-500">Validated</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
            Professional Indemnity Insurance up to date
          </p>
        </div>
      </div>`;

// Normalize line endings for replacement
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const updatedNormalized = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  // Restore CRLF
  const updatedContent = updatedNormalized.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log('Successfully updated AdminSurveyorsPage.jsx with compact metric cards!');
} else {
  console.error('Target not found in AdminSurveyorsPage.jsx');
  process.exit(1);
}
