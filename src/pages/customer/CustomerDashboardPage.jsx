import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CalendarCheck,
  CreditCard,
  PenTool,
  CheckCircle2,
  Clock,
  MapPin,
  Download,
  Plus,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Phone,
  ArrowRight,
  Sparkles,
  Receipt,
  FileSpreadsheet,
  Mail,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/ToastContext';
import { Modal } from '../../components/common/Modal';
import { useJobs } from '../../mock/jobs';

export const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { jobs } = useJobs();

  const customerJob = jobs.find((j) => j.customerEmail === user?.email || j.customer === user?.name) || jobs[0];
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
      message: `Your booking request for ${bookForm.property} has been logged. Our operations team will issue your fixed-price quote within 2 hours.`,
    });
    setBookForm({ property: '', location: '', surveyType: 'RICS Level 2 Home Survey', preferredDate: '' });
  };

  const handleDownloadReport = (reportName) => {
    addToast({
      type: 'success',
      title: 'Downloading Survey Report',
      message: `${reportName} is downloading to your device.`,
    });
  };

  // 4 Cards required by prompt:
  // Active Bookings, Quotation, Payment Due, Reports Available
  const statCards = [
    {
      id: 'bookings',
      title: 'Active Bookings',
      value: '1 Active',
      subtext: '14 Mayfair Gate (Level 2)',
      icon: CalendarCheck,
      color: 'bg-blue-50 text-[#2563EB]',
      path: '/customer/my-bookings',
    },
    {
      id: 'quotations',
      title: 'Quotations',
      value: '1 New (£1,450)',
      subtext: '12 Pembroke Sq (Level 3)',
      icon: Receipt,
      color: 'bg-indigo-50 text-indigo-600',
      path: '/customer/quotations',
    },
    {
      id: 'payment',
      title: 'Payment Due',
      value: '£924.00',
      subtext: 'Terms & deposit pending',
      icon: CreditCard,
      color: 'bg-amber-50 text-amber-600',
      path: '/customer/terms-to-sign',
    },
    {
      id: 'reports',
      title: 'Reports Available',
      value: '2 Finalized',
      subtext: 'Official RICS PDF copies',
      icon: FileSpreadsheet,
      color: 'bg-emerald-50 text-emerald-600',
      path: '/customer/reports',
    },
  ];

  // Upcoming Bookings data
  const upcomingBookings = [
    {
      id: 'JOB-2026-080',
      property: '14 Mayfair Gate',
      location: 'Mayfair, London W1K 2PB',
      surveyType: 'RICS Home Survey - Level 2 (with Valuation)',
      surveyor: 'David Thorne MRICS',
      surveyorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
      date: '27/10/2026',
      timeSlot: '10:00 - 13:00',
      status: 'In Progress (Site Inspection)',
      statusClass: 'bg-blue-50 text-[#2563EB] border-blue-200',
    },
    {
      id: 'JOB-2026-082',
      property: '12 Pembroke Square',
      location: 'Kensington, London W8 6PA',
      surveyType: 'RICS Building Survey - Level 3',
      surveyor: 'Oliver Hughes MRICS',
      surveyorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
      date: '29/10/2026',
      timeSlot: '09:30 - 13:00',
      status: 'Awaiting Terms & Payment',
      statusClass: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  ];

  // Recent Reports data
  const recentReports = [
    {
      id: 'RPT-80',
      title: 'RICS_Level_2_Home_Survey_14_Mayfair_Gate.pdf',
      property: '14 Mayfair Gate, London W1K',
      date: '27/10/2026',
      size: '14.2 MB',
      surveyor: 'David Thorne MRICS',
      status: 'Certified Copy',
    },
    {
      id: 'RPT-79',
      title: 'RICS_Level_2_Survey_22_Richmond_Green.pdf',
      property: '22 Richmond Green, Richmond TW9',
      date: '14/09/2025',
      size: '12.8 MB',
      surveyor: 'Claire Bennet AssocRICS',
      status: 'Archived Final',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. GRADIENT WELCOME BANNER (Required by Prompt) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1F4D] via-[#162E6E] to-[#2563EB] p-6 sm:p-8 text-white shadow-xl shadow-[#0B1F4D]/20">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Customer Survey Portal • RICS Regulated Practice</span>
            </div>

            <h1 className="text-fluid-banner font-black tracking-tight leading-tight">
              Welcome back, {user?.name || 'Emma Watson'} 👋
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Track the live progress of your property inspections, execute RICS terms of engagement, and download your accredited valuation & structural reports.
            </p>
          </div>

          {/* Action Buttons: "Book a New Survey" & "Contact Support" (Required by prompt) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#0B1F4D] text-xs sm:text-sm font-bold shadow-md transition-all min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#2563EB]" />
              <span>Book a New Survey</span>
            </button>

            <button
              onClick={() => navigate('/customer/support')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold border border-white/25 backdrop-blur-sm transition-all min-h-[44px] cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-blue-200" />
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FOUR METRIC CARDS in 2x2 grid on phone, 4 on desktop (Required by Prompt) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-2xl ${card.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="my-3">
                <div className="text-2xl font-black text-[#0B1F4D] tracking-tight font-mono">
                  {card.value}
                </div>
                <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
                  {card.subtext}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2563EB]">
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. TWO COLUMNS: UPCOMING BOOKINGS & RECENT REPORTS WITH DOWNLOAD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Upcoming Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-[#2563EB]" />
                  <span>Upcoming Property Inspections</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Site visit dates and surveyor logistics for your instructed properties.
                </p>
              </div>
              <button
                onClick={() => navigate('/customer/my-bookings')}
                className="text-xs font-bold text-[#2563EB] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-[#2563EB] transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-[#0B1F4D]">
                          {booking.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {booking.property}
                        </h4>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{booking.location}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${booking.statusClass}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={booking.surveyorAvatar}
                        alt={booking.surveyor}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <span className="font-bold text-slate-800">{booking.surveyor}</span>
                        <span className="text-[10px] text-slate-400 block">{booking.surveyType}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right font-mono">
                        <div className="font-bold text-slate-900">{booking.date}</div>
                        <div className="text-[10px] text-slate-400">{booking.timeSlot}</div>
                      </div>

                      {booking.id === 'JOB-2026-082' ? (
                        <button
                          onClick={() => navigate('/customer/terms-to-sign')}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Sign Terms
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Recent Reports with Download (Required by Prompt) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Recent Reports</span>
                </h3>
                <p className="text-xs text-slate-500">Official RICS PDFs</p>
              </div>
              <button
                onClick={() => navigate('/customer/reports')}
                className="text-xs font-bold text-[#2563EB] hover:underline"
              >
                All (2)
              </button>
            </div>

            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-emerald-500 transition-all space-y-2 group"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-slate-900 text-xs truncate">
                        {report.property}
                      </h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        {report.date} • {report.size}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-500">
                      {report.surveyor}
                    </span>

                    {/* Download button - Full-width on mobile */}
                    <button
                      onClick={() => handleDownloadReport(report.title)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs min-h-[44px] cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-2xl text-[11px] text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span>All reports include surveyor digital signature & RICS accreditation watermark.</span>
            </div>
          </div>

          {/* Customer Email Notifications Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#2563EB]" />
                  <span>Email Correspondence</span>
                </h3>
                <p className="text-xs text-slate-500">Milestone updates sent to your email</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {customerEmails.length}
              </span>
            </div>

            {customerEmails.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">No emails logged yet.</p>
            ) : (
              <div className="space-y-2.5">
                {customerEmails.slice(0, 3).map((em, idx) => (
                  <div
                    key={em.id || idx}
                    onClick={() => setSelectedCustomerEmail(em)}
                    className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-blue-400 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {em.subject}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        Delivered
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{em.date}</span>
                      <span className="text-[#2563EB] font-sans font-bold flex items-center gap-0.5">
                        Read <Eye className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Email Modal for Customer */}
      {selectedCustomerEmail && (
        <Modal
          isOpen={!!selectedCustomerEmail}
          onClose={() => setSelectedCustomerEmail(null)}
          title={selectedCustomerEmail.subject}
          subtitle={`Dispatched: ${selectedCustomerEmail.date}`}
          maxWidth="max-w-xl"
          footer={
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={() => setSelectedCustomerEmail(null)}
                className="px-4 py-2 bg-[#0B1F4D] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs leading-relaxed text-slate-800">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px] text-slate-600">
              <div>From: UK Property Surveying Practice &lt;notifications@propertygroup.co.uk&gt;</div>
              <div>Subject: {selectedCustomerEmail.subject}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 whitespace-pre-line font-sans">
              {selectedCustomerEmail.body || (
                `Dear ${user?.name || 'Customer'},\n\nThis is an automated operational notification regarding your survey.\n\nKind regards,\nUK Property Surveying Practice Team`
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Book a New Survey */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Instruct a New RICS Survey"
        subtitle="Request a certified surveyor inspection for a UK residential or commercial property."
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="book-survey-form"
              className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Submit Request</span>
            </button>
          </>
        }
      >
        <form id="book-survey-form" onSubmit={handleBookSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Property Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. 52 Clarendon Road"
              value={bookForm.property}
              onChange={(e) => setBookForm({ ...bookForm, property: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Postcode / Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. London W11 2HR"
                value={bookForm.location}
                onChange={(e) => setBookForm({ ...bookForm, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Date</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={bookForm.preferredDate}
                onChange={(e) => setBookForm({ ...bookForm, preferredDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Survey Standard</label>
            <select
              value={bookForm.surveyType}
              onChange={(e) => setBookForm({ ...bookForm, surveyType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
            >
              <option value="RICS Level 2 Home Survey">RICS Level 2 Home Survey</option>
              <option value="RICS Level 2 Home Survey (with Valuation)">RICS Level 2 Home Survey (with Valuation)</option>
              <option value="RICS Level 3 Building Survey">RICS Level 3 Building Survey</option>
              <option value="New Build Snagging Survey">New Build Snagging Survey</option>
              <option value="Specific Defect Investigation">Specific Defect Investigation</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
