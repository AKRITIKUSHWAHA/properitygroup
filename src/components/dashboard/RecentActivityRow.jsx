import React from 'react';
import {
  FileCheck2,
  Receipt,
  CreditCard,
  Send,
  UserCheck,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';

const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: 'completion',
    title: 'RICS Level 2 Survey Completed & Approved',
    desc: 'David Thorne MRICS completed structural inspection & uploaded full report',
    property: '14 Mayfair Gate, London W1K 2PB',
    time: '12 minutes ago',
    date: '27/10/2026, 16:32',
    icon: FileCheck2,
    iconColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amount: '£650.00',
  },
  {
    id: 2,
    type: 'quote',
    title: 'Quotation Accepted by Private Client',
    desc: 'Quotation #KQ-2026-948 approved for Level 3 Building Survey in Kensington',
    property: '24 Kensington Palace Gardens, W8 4QQ',
    time: '45 minutes ago',
    date: '27/10/2026, 15:58',
    icon: Receipt,
    iconColor: 'bg-blue-50 text-[#2563EB] border-blue-200',
    amount: '£1,850.00',
  },
  {
    id: 3,
    type: 'payment',
    title: 'Advance Payment Received (Stripe UK)',
    desc: 'Payment captured for Specific Structural Defect assessment report',
    property: '8 Chichester Road, Richmond TW10 6RF',
    time: '2 hours ago',
    date: '27/10/2026, 14:40',
    icon: CreditCard,
    iconColor: 'bg-purple-50 text-purple-600 border-purple-200',
    amount: '£920.00',
  },
  {
    id: 4,
    type: 'lead',
    title: 'New Commercial Survey Inquiry (Partner Referral)',
    desc: 'Referral submitted from Savills Residential Panel for Red Book Valuation',
    property: '42 Belgrave Square, London SW1X 8NT',
    time: '3 hours ago',
    date: '27/10/2026, 13:25',
    icon: Send,
    iconColor: 'bg-amber-50 text-amber-600 border-amber-200',
    amount: '£3,200.00',
  },
  {
    id: 5,
    type: 'assignment',
    title: 'Chartered Surveyor Allocated to Inspection',
    desc: 'Oliver Hughes MRICS accepted site visit inspection slot for tomorrow morning',
    property: '18 Highfield Ave, Guildford GU2 7YZ',
    time: '5 hours ago',
    date: '27/10/2026, 11:10',
    icon: UserCheck,
    iconColor: 'bg-sky-50 text-sky-600 border-sky-200',
    amount: null,
  },
];

export const RecentActivityRow = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#0B1F4D]">
            Live Survey Operations & Recent Activity
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of quotations, surveyor dispatches, payments, and document signatures.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Stream (UK)
        </span>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-slate-100">
        {RECENT_ACTIVITIES.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${act.iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-[#0B1F4D] leading-tight">
                      {act.title}
                    </h4>
                    {act.amount && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {act.amount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {act.desc}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {act.property}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {act.time}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-13 sm:pl-0">
                <span className="text-[11px] font-mono text-slate-400 block">
                  {act.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
