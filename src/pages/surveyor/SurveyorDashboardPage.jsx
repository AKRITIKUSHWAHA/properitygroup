import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertCircle,
  Phone,
  Key,
  MapPin,
  UploadCloud,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';

export const SurveyorDashboardPage = () => {
  const navigate = useNavigate();
  const stats = [
    { label: 'Site Visits Today', value: '2', subtext: 'Guildford & Richmond', change: 'Confirmed', isPositive: true },
    { label: 'Pending Report Uploads', value: '3', subtext: 'Due within 24h', change: 'Urgent', isPositive: false },
    { label: 'Surveys Completed (Oct)', value: '14', subtext: 'Target 16 achieved (87%)', change: '+2 vs Sep', isPositive: true },
    { label: 'Quality Audit Score', value: '5.0 / 5.0', subtext: 'RICS compliant pass rate', change: 'Top Tier', isPositive: true },
  ];

  const todayVisits = [
    {
      time: '10:00 - 13:00',
      address: '18 Highfield Ave, Guildford, Surrey GU2 7YZ',
      type: 'RICS Home Survey - Level 2',
      client: 'Marcus Taylor (Buyer)',
      phone: '+44 7700 900384',
      access: 'Collect keys from Savills Guildford (Branch ref #SG-491)',
      notes: 'Please inspect roof void insulation and suspected dampness in rear dining room.',
      status: 'In Progress',
      statusClass: 'bg-blue-100 text-blue-800',
    },
    {
      time: '14:30 - 16:30',
      address: '24 Kensington Palace Gardens, London W8 4QQ',
      type: 'RICS Building Survey - Level 3',
      client: 'Kensington Estates PLC',
      phone: '+44 20 7946 0912',
      access: 'Concierge desk - access code 8492#',
      notes: 'Structural report covering 4 storeys plus basement vault.',
      status: 'Upcoming',
      statusClass: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surveyor Field Portal"
        subtitle="On-site inspection schedule, site access instructions, defect notes, and report uploading."
        breadcrumb={['Surveyor', 'Dashboard']}
        actionLabel="Upload Draft Report"
        actionIcon={UploadCloud}
        onAction={() => navigate('/surveyor/upload-reports')}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  stat.isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-black text-[#0B1F4D] mt-2 tracking-tight">
              {stat.value}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{stat.subtext}</div>
          </div>
        ))}
      </div>

      {/* Today's Schedule Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#0B1F4D]">
              Today's Field Inspections (UK Daylight Hours)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm site arrival and key collection details below.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            2 Site Appointments
          </span>
        </div>

        <div className="space-y-4">
          {todayVisits.map((visit, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:border-blue-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B1F4D] text-white text-xs font-bold font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#C9D3E3]" />
                    {visit.time}
                  </span>
                  <span className="text-xs font-bold text-[#2563EB]">{visit.type}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold self-start sm:self-auto ${visit.statusClass}`}>
                  {visit.status}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-sm font-bold text-slate-900 leading-snug">
                  {visit.address}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Client: <strong className="text-slate-800">{visit.client}</strong> ({visit.phone})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">
                    Access: <strong className="text-slate-800">{visit.access}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-500 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                <AlertCircle className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                <span>
                  <strong>Client Inspection Specifics:</strong> {visit.notes}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
