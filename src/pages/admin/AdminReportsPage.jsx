import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  PoundSterling,
  ClipboardCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useToast } from '../../components/ToastContext';
import { Table } from '../../components/common/Table';

export const AdminReportsPage = () => {
  const { addToast } = useToast();

  const handleExportCSV = () => {
    addToast({
      type: 'success',
      title: 'Export Generated',
      message: 'Downloaded Property_Group_Analytics_Q4_2026.csv with full financial ledger.',
    });
  };

  const kpis = [
    { label: 'Gross Invoiced Revenue', value: '£421,860', change: '+18.4% vs Sep', isPos: true },
    { label: 'Total Survey Inspections', value: '176 Jobs', change: '+12.5%', isPos: true },
    { label: 'Inquiry Conversion Rate', value: '71.2%', change: '+4.1%', isPos: true },
    { label: 'Average SLA Turnaround', value: '38.4 Hours', change: 'Well within 48h SLA', isPos: true },
  ];

  const surveyorPerformance = [
    { name: 'David Thorne MRICS', surveys: 46, onTimeRate: '98.5%', revenue: '£42,850', qaScore: '5.0 / 5.0' },
    { name: 'Oliver Hughes MRICS', surveys: 38, onTimeRate: '96.2%', revenue: '£54,200', qaScore: '4.95 / 5.0' },
    { name: 'Claire Bennet AssocRICS', surveys: 34, onTimeRate: '100%', revenue: '£29,400', qaScore: '5.0 / 5.0' },
    { name: 'Jonathan Cross FRICS', surveys: 32, onTimeRate: '97.0%', revenue: '£68,900', qaScore: '4.98 / 5.0' },
    { name: 'Fiona Macintyre MRICS', surveys: 26, onTimeRate: '95.8%', revenue: '£22,100', qaScore: '4.92 / 5.0' },
  ];

  const columns = [
    { key: 'name', header: 'Chartered Surveyor', sortable: true, className: 'font-bold text-xs text-slate-900' },
    { key: 'surveys', header: 'Completed (Oct)', sortable: true, render: (val) => `${val} Surveys` },
    { key: 'onTimeRate', header: 'SLA Delivery Rate', sortable: true, className: 'text-emerald-700 font-bold' },
    { key: 'revenue', header: 'Settled Fee Revenue', sortable: true, className: 'font-mono font-bold text-[#0B1F4D]' },
    { key: 'qaScore', header: 'RICS Peer Audit Score', sortable: true, render: (val) => (
      <span className="inline-flex items-center gap-1 font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
        ★ {val}
      </span>
    )},
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Reports & Financial Analytics"
        subtitle="Executive operational performance, RICS delivery turnaround SLAs, and revenue breakdown across the UK."
        breadcrumb={['Admin', 'Reports & Analytics']}
        actionLabel="Export CSV Report"
        actionIcon={Download}
        onAction={handleExportCSV}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight font-mono">{kpi.value}</div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Service Revenue Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#2563EB]" />
            <span>Revenue by Survey Standard (October 2026)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>RICS Level 2 Home Survey (42%)</span>
                <span className="font-mono">£177,180</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>RICS Level 3 Building Survey (31%)</span>
                <span className="font-mono">£130,776</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '31%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Red Book Commercial Valuation (16%)</span>
                <span className="font-mono">£67,497</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '16%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Specific Defect & Damp Inspections (11%)</span>
                <span className="font-mono">£46,407</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '11%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SLA Performance & Quality Assurance</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Every final report undergoes a mandatory 2-stage QA review before release. In October, 97.4% of reports were delivered to clients within 48 hours of site visits.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">Avg On-Site Duration</span>
              <span className="text-lg font-black text-slate-900 font-mono">3.2 Hours</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">Defect Dispute Rate</span>
              <span className="text-lg font-black text-emerald-700 font-mono">0.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Surveyor League Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#0B1F4D]">
          Surveyor Productivity & Audit Compliance
        </h3>
        <Table columns={columns} data={surveyorPerformance} pageSize={10} />
      </div>
    </div>
  );
};
