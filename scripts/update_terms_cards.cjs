const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'admin', 'AdminTermsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `      {/* TOP 3 EXECUTIVE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Executed Legal Panel
            </span>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight">
              {kpiStats.signedCount}{' '}
              <span className="text-sm font-semibold text-slate-400">/ {kpiStats.total}</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Verified digital signatures
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Signed Compliance Rate
            </span>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight">
              {kpiStats.rate}%
            </div>
            <div className="text-[11px] text-[#2563EB] font-semibold flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3 text-[#2563EB]" />
              Average turnaround &lt; 18h
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
            <FileSignature className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Pending Client Signatures
            </span>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight">
              {kpiStats.pendingCount}{' '}
              <span className="text-sm font-semibold text-slate-400">Awaiting</span>
            </div>
            <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-amber-500" />
              Auto-reminders dispatched
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>`;

const replacement = `      {/* TOP 3 EXECUTIVE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Executed Legal Panel
            </span>
            <div className="text-xl sm:text-2xl font-bold text-[#0B1F4D] tracking-tight">
              {kpiStats.signedCount}{' '}
              <span className="text-xs font-semibold text-slate-500">/ {kpiStats.total}</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>Verified digital signatures</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Signed Compliance Rate
            </span>
            <div className="text-xl sm:text-2xl font-bold text-[#0B1F4D] tracking-tight">
              {kpiStats.rate}%
            </div>
            <div className="text-[11px] text-[#2563EB] font-medium flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-[#2563EB] shrink-0" />
              <span>Average turnaround &lt; 18h</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
            <FileSignature className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Pending Client Signatures
            </span>
            <div className="text-xl sm:text-2xl font-bold text-[#0B1F4D] tracking-tight">
              {kpiStats.pendingCount}{' '}
              <span className="text-xs font-semibold text-slate-500">Awaiting</span>
            </div>
            <div className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Auto-reminders dispatched</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
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
  console.log('Successfully updated AdminTermsPage.jsx with compact metric cards!');
} else {
  console.error('Target not found in AdminTermsPage.jsx');
  process.exit(1);
}
