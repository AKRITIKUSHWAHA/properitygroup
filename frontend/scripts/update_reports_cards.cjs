const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'admin', 'AdminReportsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `      {/* 4 TOP EXECUTIVE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Gross Invoiced Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <PoundSterling className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight">
              {kpiData.revenue}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>{kpiData.revChange}</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Total Survey Inspections</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight flex items-baseline gap-1.5">
              <span>{kpiData.surveysCount}</span>
              <span className="text-sm font-semibold text-slate-400">
                {kpiData.surveysUnit}
              </span>
            </div>
            <div className="text-[11px] font-bold text-blue-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span>{kpiData.survChange}</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Inquiry Conversion Rate</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight">
              {kpiData.conversion}
            </div>
            <div className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{kpiData.convChange}</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Average SLA Turnaround</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight flex items-baseline gap-1.5">
              <span>{kpiData.slaCount}</span>
              <span className="text-sm font-semibold text-slate-400">
                {kpiData.slaUnit}
              </span>
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{kpiData.slaNote}</span>
            </div>
          </div>
        </div>
      </div>`;

const replacement = `      {/* 4 TOP EXECUTIVE KPI METRIC CARDS */}
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
      </div>`;

const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const updatedNormalized = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  const updatedContent = updatedNormalized.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log('Successfully updated AdminReportsPage.jsx with compact metric cards!');
} else {
  console.error('Target not found in AdminReportsPage.jsx');
  process.exit(1);
}
