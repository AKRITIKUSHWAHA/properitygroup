const fs = require('fs');
const path = require('path');

const modPath = path.join(__dirname, '../src/pages/customer/CustomerModules.jsx');
let content = fs.readFileSync(modPath, 'utf8');

// Ensure useJobs and SURVEYORS are imported
if (!content.includes('useJobs')) {
  content = content.replace(
    "import { Modal } from '../../components/common/Modal';",
    "import { Modal } from '../../components/common/Modal';\nimport { useJobs, SURVEYORS } from '../../mock/jobs';"
  );
}

// Add isJobForCustomer helper at top if not present
const helperCode = `
// Strict customer isolation helper
const isJobForCustomer = (job, user) => {
  if (!job || !user) return false;
  const uEmail = (user.email || '').toLowerCase().trim();
  const uName = (user.name || '').toLowerCase().trim();
  const jEmail = (job.customerEmail || '').toLowerCase().trim();
  const jAlt = (job.customerAltEmail || '').toLowerCase().trim();
  const jDemo = (job.customerDemoEmail || '').toLowerCase().trim();
  const jName = (job.customer || '').toLowerCase().trim();

  if (uEmail === 'customer@demo.com' || uName.includes('emma')) {
    return jEmail === 'customer@demo.com' || jName.includes('emma');
  }

  if (uEmail.includes('harrison') || uEmail === 'customer2@demo.com' || uName.includes('harrison')) {
    return jEmail.includes('harrison') || jAlt.includes('harrison') || jDemo.includes('customer2') || jName.includes('harrison');
  }

  return (
    (jEmail && jEmail === uEmail) ||
    (jAlt && jAlt === uEmail) ||
    (jDemo && jDemo === uEmail) ||
    (jName && uName && jName === uName)
  );
};
`;

if (!content.includes('const isJobForCustomer =')) {
  content = content.replace("export const CustomerTermsPage", helperCode + "\nexport const CustomerTermsPage");
}

// ----------------------------------------------------
// 1. UPDATE CustomerBookingsPage
// ----------------------------------------------------
const oldBookingsRegex = /export const CustomerBookingsPage = \(\) => \{[\s\S]*?\n\};\n\n\/\/ ===+/;
const newBookings = `export const CustomerBookingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();

  const myBookings = jobs.filter((j) => isJobForCustomer(j, user));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Booked Surveys"
        subtitle="View your confirmed property appointments, assigned surveyors, and active inspections."
        breadcrumb={['Customer Portal', 'My Bookings']}
      />

      <div className="space-y-4">
        {myBookings.map((b) => (
          <div
            key={b.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={\`text-[11px] font-bold px-2.5 py-0.5 rounded-full border \${
                  b.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : b.termsStatus === 'Pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-[#2563EB] border-blue-200'
                }\`}>
                  {b.status}
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">
                  {b.id}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900">{b.property}</h4>
              <p className="text-xs text-slate-500">{b.location}</p>
              <div className="text-xs text-[#2563EB] font-semibold">{b.surveyType}</div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <span className="text-xs text-slate-400 block font-mono">Date & Slot</span>
                <span className="text-xs font-bold text-slate-800 block">{b.date} • {b.timeSlot}</span>
                <span className="text-xs font-semibold text-slate-600">Surveyor: {b.surveyor || 'Pending Allocation'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/customer/track-my-survey')}
                  className="px-3.5 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Track Live Progress
                </button>
                <button
                  onClick={() => navigate('/customer/appointment-details')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Appointment Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {myBookings.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            No survey bookings found under your client account.
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================`;
content = content.replace(oldBookingsRegex, newBookings);

// ----------------------------------------------------
// 2. UPDATE CustomerQuotationsPage
// ----------------------------------------------------
const oldQuotesRegex = /export const CustomerQuotationsPage = \(\) => \{[\s\S]*?\n\};\n\n\/\/ ===+/;
const newQuotes = `export const CustomerQuotationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const quotes = myJobs.map((j) => {
    const net = j.quote?.baseFee || (j.surveyType?.includes('Level 3') ? 1450.0 : 650.0);
    const vat = net * 0.2;
    const total = net + vat;
    return {
      id: \`QUO-\${j.id.replace('JOB-2026-', '')}\`,
      jobId: j.id,
      property: \`\${j.property}, \${j.location}\`,
      surveyType: j.surveyType,
      net: \`£\${net.toFixed(2)}\`,
      vat: \`£\${vat.toFixed(2)}\`,
      total: \`£\${total.toFixed(2)}\`,
      date: j.date || '28/10/2026',
      status: j.termsStatus === 'Signed' ? 'Accepted & Executed' : 'Open Proposal',
      termsStatus: j.termsStatus,
      validUntil: j.termsStatus === 'Signed' ? 'Confirmed' : '14 Days Remaining',
    };
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Quotations & Fixed Fee Proposals"
        subtitle="Review official transparent quotations issued under the NJS Property Group rate cards."
        breadcrumb={['Customer Portal', 'Quotations']}
      />

      <div className="space-y-4">
        {quotes.map((q) => (
          <div
            key={q.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${
                  q.termsStatus === 'Signed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-[#0B1F4D]'
                }\`}>
                  {q.status}
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">{q.id}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{q.property}</h4>
              <p className="text-xs text-[#2563EB] font-semibold mt-0.5">{q.surveyType}</p>
              <div className="text-xs text-slate-400 mt-2">
                Valid: <strong>{q.validUntil}</strong> • Issued on {q.date}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <div className="text-xs text-slate-400 font-mono">Net: {q.net} + 20% VAT</div>
                <div className="text-xl font-black text-[#0B1F4D] font-mono">{q.total}</div>
                <span className="text-[11px] text-emerald-600 font-bold block">Fixed Fee Guaranteed</span>
              </div>

              {q.termsStatus === 'Signed' ? (
                <button
                  onClick={() => navigate('/customer/terms-to-sign')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  View Signed Terms
                </button>
              ) : (
                <button
                  onClick={() => navigate('/customer/terms-to-sign')}
                  className="px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  Review & Sign Terms
                </button>
              )}
            </div>
          </div>
        ))}

        {quotes.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            No quotations found under your account.
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================`;
content = content.replace(oldQuotesRegex, newQuotes);

// ----------------------------------------------------
// 3. UPDATE CustomerInvoicesPage
// ----------------------------------------------------
const oldInvoicesRegex = /export const CustomerInvoicesPage = \(\) => \{[\s\S]*?\n\};\n\n\/\/ ===+/;
const newInvoices = `export const CustomerInvoicesPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { jobs } = useJobs();

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const invoices = myJobs.map((j) => {
    const net = j.quote?.baseFee || (j.surveyType?.includes('Level 3') ? 1450.0 : 650.0);
    const vat = net * 0.2;
    const total = net + vat;
    return {
      invNo: \`INV-2026-\${j.id.replace('JOB-2026-', '90')}\`,
      jobRef: j.id,
      property: \`\${j.property}, \${j.location}\`,
      service: j.surveyType,
      date: j.date || '26/10/2026',
      net: \`£\${net.toFixed(2)}\`,
      vat: \`£\${vat.toFixed(2)}\`,
      total: \`£\${total.toFixed(2)}\`,
      status: j.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid',
      method: j.paymentStatus === 'Paid' ? 'Stripe Card (•••• 4242)' : 'Pending Settlement',
    };
  });

  const handleDownloadInvoice = (inv) => {
    downloadInvoicePDF({
      invoiceNo: inv.invNo,
      jobNo: inv.jobRef,
      clientName: user?.name || 'Client',
      property: inv.property,
      paymentMethod: inv.method,
    });
    addToast({
      type: 'success',
      title: 'Invoice Downloaded',
      message: \`Downloaded VAT invoice \${inv.invNo}.\`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Invoices & VAT Receipts"
        subtitle="Download official HMRC-compliant VAT receipts and inspect settled client payments."
        breadcrumb={['Customer Portal', 'Invoices & Payments']}
      />

      <div className="space-y-4">
        {invoices.map((inv) => (
          <div
            key={inv.invNo}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${
                  inv.status === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }\`}>
                  {inv.status}
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">{inv.invNo}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{inv.property}</h4>
              <p className="text-xs text-slate-500">{inv.service}</p>
              <div className="text-xs text-slate-400 mt-2">
                Settled on {inv.date} via <strong>{inv.method}</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <div className="text-xs text-slate-400 font-mono">Net: {inv.net} (20% VAT: {inv.vat})</div>
                <div className="text-xl font-black text-[#0B1F4D] font-mono">{inv.total}</div>
              </div>

              <button
                onClick={() => handleDownloadInvoice(inv)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download VAT Receipt</span>
              </button>
            </div>
          </div>
        ))}

        {invoices.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            No invoices generated yet.
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================`;
content = content.replace(oldInvoicesRegex, newInvoices);

// ----------------------------------------------------
// 4. UPDATE CustomerReportsPage
// ----------------------------------------------------
const oldReportsRegex = /export const CustomerReportsPage = \(\) => \{[\s\S]*?\n\};\n\n\/\/ ===+/;
const newReports = `export const CustomerReportsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { jobs } = useJobs();

  const myCompletedJobs = jobs.filter(
    (j) => isJobForCustomer(j, user) && (j.status === 'Completed' || j.timelineStep >= 7)
  );

  const reports = myCompletedJobs.map((j) => ({
    id: \`RPT-\${j.id.replace('JOB-2026-', '')}\`,
    title: \`RICS_\${j.surveyType?.replace(/[^a-zA-Z0-9]/g, '_')}_\${j.property?.replace(/[^a-zA-Z0-9]/g, '_')}.pdf\`,
    property: \`\${j.property}, \${j.location}\`,
    date: j.date || '27/10/2026',
    size: '14.2 MB',
    surveyor: j.surveyor || 'David Thorne MRICS',
    conditionRating: 'Condition 1 & 2 (Official RICS Traffic-Light Audit)',
  }));

  const handleDownloadReport = (r) => {
    downloadReportPDF({
      jobNo: r.id,
      clientName: user?.name || 'Client',
      property: r.property,
      surveyorName: r.surveyor,
    });
    addToast({
      type: 'success',
      title: 'Report Downloaded',
      message: \`Downloaded official RICS report for \${r.property}\`,
    });
  };

  const handleDownloadSample = (level) => {
    downloadReportPDF({
      jobNo: \`SAMPLE-LVL-\${level}\`,
      clientName: 'Sample Client (Anonymised)',
      property: level === 2 ? '14 Mayfair Gate, London W1K' : '24 Kensington Palace Gardens, London W8',
      surveyType: level === 2 ? 'RICS Level 2 Home Survey' : 'RICS Level 3 Building Survey',
      surveyorName: level === 2 ? 'David Thorne MRICS' : 'Oliver Hughes MRICS',
    });
    addToast({
      type: 'success',
      title: 'Sample Downloaded',
      message: \`Downloaded anonymised RICS Level \${level} Sample Survey Report.\`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Completed Survey Reports"
        subtitle="Download accredited RICS condition & building survey reports with cryptographic watermark."
        breadcrumb={['Customer Portal', 'Reports']}
      />

      <div className="space-y-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{r.id}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Certified Report
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{r.property}</h4>
                <div className="text-xs text-slate-500 font-mono">
                  {r.title} • {r.size} • Uploaded {r.date}
                </div>
                <div className="text-xs text-slate-700 font-medium pt-1">
                  Surveyor: <strong>{r.surveyor}</strong> • {r.conditionRating}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownloadReport(r)}
              className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Report</span>
            </button>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            No completed reports released yet for your properties. Reports are uploaded within 48h-72h following inspection.
          </div>
        )}

        {/* Specimen / Sample Reports */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Reference RICS Sample Reports
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => handleDownloadSample(2)}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-left cursor-pointer transition-all"
            >
              <div>
                <div className="font-bold text-slate-800">Sample Level 2 Home Survey</div>
                <div className="text-slate-400 text-[11px]">Specimen PDF with condition ratings</div>
              </div>
              <Download className="w-4 h-4 text-slate-600" />
            </button>

            <button
              onClick={() => handleDownloadSample(3)}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-left cursor-pointer transition-all"
            >
              <div>
                <div className="font-bold text-slate-800">Sample Level 3 Building Survey</div>
                <div className="text-slate-400 text-[11px]">Full structural defect analysis template</div>
              </div>
              <Download className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================`;
content = content.replace(oldReportsRegex, newReports);

// ----------------------------------------------------
// 5. UPDATE CustomerAppointmentDetailsPage
// ----------------------------------------------------
const oldAptRegex = /export const CustomerAppointmentDetailsPage = \(\) => \{[\s\S]*?\n\};\n\n\/\/ ===+/;
const newApt = `export const CustomerAppointmentDetailsPage = () => {
  const { user } = useAuth();
  const { jobs } = useJobs();

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const currentJob = myJobs[0] || null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Appointment Details"
        subtitle="Specific timing, inspection window, and surveyor details for your survey."
        breadcrumb={['Customer Portal', 'Appointment Details']}
      />

      {currentJob ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#2563EB]" />
              <h3 className="text-sm font-bold text-[#0B1F4D]">Confirmed Time Slot</h3>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-xs space-y-2">
              <div className="text-lg font-black text-[#0B1F4D]">{currentJob.date || 'Confirmed Schedule'}</div>
              <div className="text-slate-700 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2563EB]" />
                <span>{currentJob.timeSlot || '10:00 AM – 13:00 PM'}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                The surveyor conducts a meticulous 2 to 3 hour inspection including loft voids, subfloors, and grounds.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">{currentJob.surveyType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Surveyor:</span>
                <span className="font-bold text-[#0B1F4D]">{currentJob.surveyor || 'Pending Allocation'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Booking Status:</span>
                <span className="font-bold text-emerald-700">{currentJob.status}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-[#0B1F4D]">Property Access Coordination</h3>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-950">Arranged Directly with Selling Agent</span>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed pt-1">
                Our chartered surveyor coordinates access logistics directly with the estate agency and keyholder prior to arrival.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Access Arrangement:</span>
                <span className="font-bold text-slate-800">Direct Surveyor Coordination</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Client Attendance:</span>
                <span className="font-bold text-emerald-700">Not Required (Zero Hassle)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Key & Entry Protocols:</span>
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Restricted to Surveyor & Selling Agent</span>
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
              <strong>Security Notice:</strong> In compliance with UK property vendor security standards, internal key tags and private building entry codes are restricted exclusively to the assigned RICS surveyor. You do not need to attend in person.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
          No scheduled survey appointment found for your account.
        </div>
      )}
    </div>
  );
};

// ==========================================`;
content = content.replace(oldAptRegex, newApt);

// ----------------------------------------------------
// 6. UPDATE CustomerAssignedSurveyorPage
// ----------------------------------------------------
const oldSrvRegex = /export const CustomerAssignedSurveyorPage = \(\) => \{[\s\S]*?\n\};\n\n\/\/ ===+/;
const newSrv = `export const CustomerAssignedSurveyorPage = () => {
  const { user } = useAuth();
  const { jobs } = useJobs();
  const { addToast } = useToast();

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const currentJob = myJobs[0] || null;
  const surveyorName = currentJob?.surveyor || 'David Thorne MRICS';
  const surveyor = SURVEYORS.find((s) => s.name === surveyorName) || SURVEYORS[0];

  const handleRequestCall = () => {
    addToast({
      type: 'success',
      title: 'Call Request Logged',
      message: \`\${surveyor.name} will contact you today regarding your inspection at \${currentJob?.property || 'your property'}.\`,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Assigned Chartered Surveyor"
        subtitle="Meet the certified RICS professional conducting your inspection."
        breadcrumb={['Customer Portal', 'Assigned Surveyor']}
      />

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100">
          <img
            src={surveyor.avatar}
            alt={surveyor.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
          />

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B1F4D] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                RICS Regulated Member
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Verified Credentials
              </span>
            </div>

            <h3 className="text-xl font-black text-[#0B1F4D]">{surveyor.name}</h3>
            <p className="text-xs text-slate-500">{surveyor.credentials}</p>
            <p className="text-xs text-slate-600 pt-1">
              Experienced RICS specialist covering London postcodes ({surveyor.postcodes}) for period conversions, defect diagnosis, and Red Book valuation.
            </p>
          </div>

          <button
            onClick={handleRequestCall}
            className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Request Call-Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Inspection</span>
            <div className="font-bold text-slate-900">{currentJob?.property || '14 Mayfair Gate'}</div>
            <div className="text-slate-500 font-mono">{currentJob?.surveyType || 'RICS Level 2'}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Turnaround SLA</span>
            <div className="font-bold text-slate-900">48h Delivery Window</div>
            <div className="text-slate-500">Delivered directly to your portal</div>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-1">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase">RICS Compliance</span>
            <div className="font-bold text-[#0B1F4D]">VRS Regulated</div>
            <div className="text-blue-900 text-[11px]">Strict valuation & safety standards</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================`;
content = content.replace(oldSrvRegex, newSrv);

// ----------------------------------------------------
// 7. UPDATE CustomerMessagesPage
// ----------------------------------------------------
const oldMsgRegex = /export const CustomerMessagesPage = \(\) => \{[\s\S]*?\n\};\n\n\/\/ ===+/;
const newMsg = `export const CustomerMessagesPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { jobs } = useJobs();
  const { conversations, sendMessage, markAsRead } = useMessages();

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const currentJob = myJobs[0] || null;

  // Strict customer conversation isolation:
  const currentConv = conversations.find((c) => {
    const uEmail = (user?.email || '').toLowerCase().trim();
    const cEmail = (c.clientEmail || '').toLowerCase().trim();
    if (uEmail === 'customer@demo.com') return cEmail === 'customer@demo.com';
    if (uEmail.includes('harrison') || uEmail === 'customer2@demo.com') {
      return cEmail.includes('harrison') || c.id === 'conv-3';
    }
    return cEmail === uEmail;
  });

  // Effective conversation (isolated, never leaks another customer's thread)
  const effectiveConv = currentConv || {
    id: \`conv-\${user?.id || 'new'}\`,
    jobId: currentJob?.id || 'ENQ-2026',
    clientEmail: user?.email,
    clientName: user?.name,
    property: currentJob?.property || 'Your Property',
    surveyType: currentJob?.surveyType || 'RICS Survey',
    messages: [
      {
        id: 1,
        sender: 'NJS Operations Desk',
        role: 'admin',
        text: \`Hello \${user?.name || 'Client'}, welcome to your dedicated communications channel with NJS Property Group. How can our surveying team assist you today?\`,
        time: 'Today',
      },
    ],
  };

  const messages = effectiveConv.messages || [];
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    if (currentConv?.id) {
      markAsRead(currentConv.id, 'client');
    }
  }, [currentConv?.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const textToSend = inputMessage;
    setInputMessage('');

    sendMessage(
      effectiveConv.id,
      textToSend,
      user?.name || 'Client',
      'client'
    );

    addToast({
      type: 'success',
      title: 'Message Sent to NJS Desk',
      message: 'Your query has been dispatched to operations (info@njspropertygroup.com).',
    });
  };

  const handleAttach = () => {
    addToast({
      type: 'info',
      title: 'Attachment Upload',
      message: 'Photograph / document attached to your enquiry.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Direct Messages"
        subtitle="Secure, direct communication with the NJS operations coordination desk."
        breadcrumb={['Customer Portal', 'Messages']}
      />

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B1F4D] text-white flex items-center justify-center font-bold text-sm">
              NJS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">NJS Operations & Surveyor Desk</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[11px] text-slate-400">
                Ref: {effectiveConv.jobId} • {effectiveConv.property}
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-xl">
            Active Thread
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((m) => {
            const isClient = m.role === 'client';
            return (
              <div
                key={m.id}
                className={\`flex flex-col \${isClient ? 'items-end' : 'items-start'}\`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400">{m.sender}</span>
                  <span className="text-[9px] text-slate-300 font-mono">• {m.time}</span>
                </div>
                <div
                  className={\`max-w-md p-4 rounded-2xl text-xs leading-relaxed shadow-xs \${
                    isClient
                      ? 'bg-[#0B1F4D] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }\`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={handleAttach}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message to NJS coordination team..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D]"
          />

          <button
            type="submit"
            className="p-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================`;
content = content.replace(oldMsgRegex, newMsg);

fs.writeFileSync(modPath, content, 'utf8');
console.log('Successfully updated CustomerModules.jsx with strict customer isolation!');
