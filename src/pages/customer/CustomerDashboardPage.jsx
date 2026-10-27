import React from 'react';
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
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../auth/AuthContext';

export const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const steps = [
    { title: 'Quotation Accepted', desc: '£650.00 agreed', done: true },
    { title: 'Terms Signed', desc: 'RICS Level 2 contract', done: true },
    { title: 'Site Inspection', desc: 'Visited 26/10/2026', done: true },
    { title: 'Report Finalized', desc: 'Under Chief Surveyor review', current: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name || 'Property Client'}`}
        subtitle="Track your home survey progress, review terms of engagement, and download your final RICS report."
        breadcrumb={['Customer Portal', 'My Dashboard']}
        actionLabel="Request New Survey"
        actionIcon={FileText}
        onAction={() => navigate('/customer/quotations')}
      />

      {/* Active Survey Progress Spotlight Card */}
      <div className="bg-gradient-to-br from-[#0B1F4D] to-[#162E6E] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#0B1F4D]/25 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2563EB] text-white shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Inspection In Progress
            </span>
            <span className="text-xs text-[#C9D3E3] font-mono">Reference: JOB-2026-080</span>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-1" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                14 Mayfair Gate, London W1K 2PB
              </h2>
              <p className="text-xs sm:text-sm text-[#C9D3E3] mt-0.5">
                Service: <strong>RICS Home Survey - Level 2 (with Valuation)</strong>
              </p>
            </div>
          </div>

          {/* 4-Step Progress Tracker */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    {step.done ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-400 text-[#0B1F4D] flex items-center justify-center font-bold text-xs shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                      </div>
                    ) : step.current ? (
                      <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white ring-4 ring-blue-400/30 flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/20 text-white/50 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    <span
                      className={`text-xs font-bold leading-tight ${
                        step.done || step.current ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#C9D3E3]/80 pl-8">{step.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80"
                alt="David Thorne"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
              />
              <div>
                <div className="text-xs font-bold text-white">David Thorne MRICS</div>
                <div className="text-[11px] text-[#C9D3E3]">Assigned Chartered Surveyor</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/customer/terms-to-sign')}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <PenTool className="w-3.5 h-3.5" />
                View Signed Terms
              </button>
              <button
                onClick={() => navigate('/customer/reports')}
                className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                Report Delivery ETA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/customer/my-bookings')}
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#2563EB] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#0B1F4D] group-hover:text-[#2563EB] transition-colors">
            My Bookings
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed inspection dates, vendor key access arrangements, and property details.
          </p>
        </div>

        <div
          onClick={() => navigate('/customer/quotations')}
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#2563EB] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#0B1F4D] group-hover:text-[#2563EB] transition-colors">
            Survey Quotations
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Formal fee proposals in GBP, breakdown of survey scope, and online acceptance.
          </p>
        </div>

        <div
          onClick={() => navigate('/customer/invoices-and-payments')}
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#2563EB] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#0B1F4D] group-hover:text-[#2563EB] transition-colors">
            Invoices & Payments
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            View paid VAT invoices, download receipts, and manage UK card transactions.
          </p>
        </div>
      </div>
    </div>
  );
};
