import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  CreditCard,
  PoundSterling,
  Plus,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { BookingsTrendChart } from '../../components/charts/BookingsTrendChart';
import { JobsStatusDonutChart } from '../../components/charts/JobsStatusDonutChart';
import { RecentActivityRow } from '../../components/dashboard/RecentActivityRow';
import { NewBookingModal } from '../../components/calendar/NewBookingModal';
import { useJobs } from '../../mock/jobs';
import { useToast } from '../../components/ToastContext';

export const AdminDashboardPage = () => {
  const { addJob } = useJobs();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Exactly the 4 KPI cards specified by user:
  // Total Leads 248, Survey Bookings 176, Quotations £421,860, Payments Received £298,430 with % change
  const kpiCards = [
    {
      label: 'Total Leads',
      value: '248',
      change: '+18.2%',
      subtext: 'vs previous month',
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Survey Bookings',
      value: '176',
      change: '+12.4%',
      subtext: 'vs previous month',
      icon: CalendarCheck,
      color: 'bg-blue-50 text-[#2563EB]',
    },
    {
      label: 'Quotations',
      value: '£421,860',
      change: '+8.6%',
      subtext: 'pipeline value (GBP)',
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Payments Received',
      value: '£298,430',
      change: '+15.3%',
      subtext: 'settled revenue (GBP)',
      icon: PoundSterling,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const handleCreateJob = (newJob) => {
    addJob(newJob);
    addToast({
      type: newJob.canBook ? 'success' : 'info',
      title: 'Survey Job Scheduled',
      message: newJob.canBook
        ? `Job ${newJob.jobNo} booked with ${newJob.surveyor}.`
        : `Job ${newJob.jobNo} saved. Waiting for terms and advance payment.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Super Admin Dashboard"
        subtitle="Executive survey operations, bookings growth, revenue performance, and surveyor management across the UK."
        breadcrumb={['Super Admin', 'Dashboard']}
        actionLabel="Create Survey Job"
        actionIcon={Plus}
        onAction={() => setIsModalOpen(true)}
      />

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-black text-[#0B1F4D] mt-2.5 tracking-tight">
                {stat.value}
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {stat.change}
                </span>
                <span className="text-slate-400 font-medium">{stat.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Bookings Trend Line Chart + Jobs by Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Trend Chart (2 columns) */}
        <div className="lg:col-span-2 min-w-0">
          <BookingsTrendChart />
        </div>

        {/* Jobs by Status Donut Chart (1 column) */}
        <div className="lg:col-span-1 min-w-0">
          <JobsStatusDonutChart />
        </div>
      </div>

      {/* Recent Activity Row */}
      <RecentActivityRow />

      {/* New Booking Modal */}
      <NewBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateJob}
      />
    </div>
  );
};

