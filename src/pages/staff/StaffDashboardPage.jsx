import React from 'react';
import {
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Target,
  ArrowUpRight,
  Clock,
  PhoneCall,
  MapPin,
  PoundSterling,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';

export const StaffDashboardPage = () => {
  const stats = [
    { label: 'Unassigned Bookings', value: '5', subtext: 'Require surveyor allocation', icon: CalendarDays, color: 'text-amber-600 bg-amber-50' },
    { label: 'Active Survey Jobs', value: '36', subtext: 'In field or in drafting', icon: ClipboardCheck, color: 'text-blue-600 bg-blue-50' },
    { label: 'Uncontacted Leads', value: '14', subtext: 'SLA < 60 mins', icon: Target, color: 'text-purple-600 bg-purple-50' },
    { label: 'Today\'s Payments', value: '£8,450', subtext: '12 client transactions', icon: PoundSterling, color: 'text-emerald-600 bg-emerald-50' },
  ];

  const todayTasks = [
    { time: '09:30', title: 'Confirm access keys with Knight Frank Mayfair for 14 Mayfair Gate (Emma Watson)', status: 'Urgent', statusColor: 'bg-rose-100 text-rose-800' },
    { time: '11:00', title: 'Allocate surveyor for RICS Level 3 inspection in Wimbledon SW19', status: 'Pending', statusColor: 'bg-amber-100 text-amber-800' },
    { time: '14:15', title: 'Dispatch finalized valuation report for 42 Belgrave Square', status: 'Ready', statusColor: 'bg-emerald-100 text-emerald-800' },
    { time: '16:00', title: 'Follow-up on 6 outstanding quotations expiring end of week', status: 'In Progress', statusColor: 'bg-blue-100 text-blue-800' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations & Staff Dashboard"
        subtitle="Manage daily surveyor dispatching, site access coordination, client bookings, and phone enquiries."
        breadcrumb={['Admin / Staff', 'Dashboard']}
        actionLabel="Quick Book Survey"
        actionIcon={CalendarDays}
        onAction={() => alert('Quick Book Survey modal triggered')}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                <div className={`p-2 rounded-xl ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#0B1F4D] mt-2 tracking-tight">
                {s.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{s.subtext}</div>
            </div>
          );
        })}
      </div>

      {/* Operations Priority Board */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <h2 className="text-base font-bold text-[#0B1F4D] mb-1">
          Today's Operational Action List
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Time-critical dispatch tasks and customer communications for UK daylight hours.
        </p>

        <div className="divide-y divide-slate-100">
          {todayTasks.map((task, i) => (
            <div key={i} className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                  {task.time}
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                  {task.title}
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${task.statusColor}`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
