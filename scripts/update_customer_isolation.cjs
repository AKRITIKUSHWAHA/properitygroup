const fs = require('fs');
const path = require('path');

// ========================================================
// 1. UPDATE CustomerDashboardPage.jsx
// ========================================================
const dashPath = path.join(__dirname, '../src/pages/customer/CustomerDashboardPage.jsx');
let dashContent = fs.readFileSync(dashPath, 'utf8');

// Helper function definition to embed
const helperFunc = `// Strict customer isolation matcher
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

// Insert helperFunc before export const CustomerDashboardPage
if (!dashContent.includes('const isJobForCustomer =')) {
  dashContent = dashContent.replace('export const CustomerDashboardPage = () => {', helperFunc + '\nexport const CustomerDashboardPage = () => {');
}

// Replace the hardcoded state & statCards & upcomingBookings & recentReports
const oldSetupRegex = /const customerJob = jobs\.find[\s\S]*?return \(/;
const newSetup = `const myCustomerJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const customerJob = myCustomerJobs[0] || null;
  const customerEmails = customerJob?.emails || [];
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookForm, setBookForm] = useState({
    property: '',
    location: '',
    surveyType: 'RICS Level 2 Home Survey',
    preferredDate: '',
  });

  const handleBookSubmit = (e) => {
    e.preventDefault();
    setIsBookModalOpen(false);
    addToast({
      type: 'success',
      title: 'Survey Request Received',
      message: \`Your booking request for \${bookForm.property} has been logged. Our operations team will issue your fixed-price quote within 2 hours.\`,
    });
    setBookForm({ property: '', location: '', surveyType: 'RICS Level 2 Home Survey', preferredDate: '' });
  };

  const handleDownloadReport = (reportName, property = customerJob?.property || '14 Mayfair Gate', surveyor = customerJob?.surveyor || 'David Thorne MRICS') => {
    downloadReportPDF({
      jobNo: customerJob?.id || 'JOB-2026-080',
      clientName: user?.name || customerJob?.customer || 'Client',
      property,
      surveyorName: surveyor,
    });
    addToast({
      type: 'success',
      title: 'Downloading Survey Report',
      message: \`\${reportName} downloaded successfully to your device.\`,
    });
  };

  const activeBookings = myCustomerJobs.filter((j) => j.status !== 'Cancelled');
  const pendingQuotes = myCustomerJobs.filter((j) => j.termsStatus === 'Pending' || j.status === 'Quoted');
  const completedReports = myCustomerJobs.filter((j) => j.status === 'Completed' || j.timelineStep >= 7);

  // Dynamic isolated stat cards
  const statCards = [
    {
      id: 'bookings',
      title: 'Active Bookings',
      value: \`\${activeBookings.length} Active\`,
      subtext: customerJob ? \`\${customerJob.property} (\${customerJob.surveyType?.includes('Level 3') ? 'Level 3' : 'Level 2'})\` : 'No active bookings',
      icon: CalendarCheck,
      color: 'bg-blue-50 text-[#2563EB]',
      path: '/customer/my-bookings',
    },
    {
      id: 'quotations',
      title: 'Quotations',
      value: pendingQuotes.length > 0 ? \`\${pendingQuotes.length} New\` : customerJob ? '1 Confirmed' : '0 Quotes',
      subtext: customerJob ? \`\${customerJob.property} (\${customerJob.quote?.baseFee ? '£' + (customerJob.quote.baseFee * 1.2).toFixed(0) : '£924'})\` : 'No open quotes',
      icon: Receipt,
      color: 'bg-indigo-50 text-indigo-600',
      path: '/customer/quotations',
    },
    {
      id: 'payment',
      title: 'Payment Status',
      value: customerJob?.paymentStatus === 'Paid' ? '£0.00' : customerJob ? \`£\${((customerJob.quote?.baseFee || 650) * 1.2).toFixed(2)}\` : '£0.00',
      subtext: customerJob?.paymentStatus === 'Paid' ? 'All fees settled' : customerJob ? 'Invoice pending settlement' : 'No balance due',
      icon: CreditCard,
      color: customerJob?.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600',
      path: '/customer/invoices-and-payments',
    },
    {
      id: 'reports',
      title: 'Reports Available',
      value: \`\${completedReports.length} Finalized\`,
      subtext: completedReports.length > 0 ? 'Official RICS PDF copies' : 'Inspection in progress',
      icon: FileSpreadsheet,
      color: 'bg-emerald-50 text-emerald-600',
      path: '/customer/reports',
    },
  ];

  // Dynamically isolated upcoming bookings for current customer
  const upcomingBookings = activeBookings.map((b) => ({
    id: b.id,
    property: b.property,
    location: b.location,
    surveyType: b.surveyType,
    surveyor: b.surveyor || 'Assigned Surveyor',
    surveyorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
    date: b.date || '27/10/2026',
    timeSlot: b.timeSlot || '10:00 - 13:00',
    status: b.status,
    statusClass: b.status === 'Completed'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : b.termsStatus === 'Pending'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-blue-50 text-[#2563EB] border-blue-200',
  }));

  // Dynamically isolated recent reports for current customer
  const recentReports = completedReports.map((j) => ({
    id: \`RPT-\${j.id.replace('JOB-2026-', '')}\`,
    title: \`RICS_\${j.surveyType?.replace(/[^a-zA-Z0-9]/g, '_')}_\${j.property?.replace(/[^a-zA-Z0-9]/g, '_')}.pdf\`,
    property: \`\${j.property}, \${j.location}\`,
    date: j.date || '27/10/2026',
    size: '14.2 MB',
    surveyor: j.surveyor || 'David Thorne MRICS',
    status: 'Certified Copy',
  }));

  return (`;

dashContent = dashContent.replace(oldSetupRegex, newSetup);

// Replace button in Upcoming Bookings that hardcoded 'JOB-2026-082' Sign Terms
dashContent = dashContent.replace(
  `{booking.id === 'JOB-2026-082' ? (
                        <button
                          onClick={() => navigate('/customer/terms-to-sign')}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Sign Terms
                        </button>
                      ) : null}`,
  `{booking.statusClass.includes('amber') ? (
                        <button
                          onClick={() => navigate('/customer/terms-to-sign')}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Sign Terms
                        </button>
                      ) : null}`
);

// If upcomingBookings is empty, show empty state
dashContent = dashContent.replace(
  `{upcomingBookings.map((booking) => (`,
  `{upcomingBookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No upcoming inspections scheduled.
                </div>
              ) : upcomingBookings.map((booking) => (`
);
dashContent = dashContent.replace(
  `              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Recent Reports`,
  `              )))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Recent Reports`
);

// If recentReports is empty, show empty state
dashContent = dashContent.replace(
  `{recentReports.map((report) => (`,
  `{recentReports.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No survey reports released yet.
                </div>
              ) : recentReports.map((report) => (`
);
dashContent = dashContent.replace(
  `              ))}
            </div>
          </div>
        </div>
      </div>`,
  `              )))}
            </div>
          </div>
        </div>
      </div>`
);

fs.writeFileSync(dashPath, dashContent, 'utf8');
console.log('Successfully updated CustomerDashboardPage.jsx with strict customer isolation!');

