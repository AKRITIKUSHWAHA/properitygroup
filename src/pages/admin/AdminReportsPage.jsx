import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  MoreVertical,
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  Award,
  User,
  ArrowUpRight,
  Filter,
  Check,
  Copy,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { SURVEYORS } from '../../mock/jobs';

// 3-Dot Dropdown Menu for Surveyor Performance Table
const SurveyorRowActions = ({ surveyor, onView, onCopyEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-right" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors cursor-pointer"
        title="Surveyor actions"
        aria-label="Surveyor actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onView(surveyor);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#0B1F4D] hover:bg-blue-50 transition-colors cursor-pointer text-left"
          >
            <Eye className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>View Performance Profile</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onCopyEmail(surveyor.email);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Copy Surveyor Email</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const AdminReportsPage = () => {
  const { addToast } = useToast();

  // Reporting Period State
  const [selectedPeriod, setSelectedPeriod] = useState('October 2026'); // 'October 2026' | 'September 2026' | 'Q3 2026' | 'YTD 2026'
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingSurveyor, setViewingSurveyor] = useState(null);

  // Period Options
  const periods = [
    { id: 'October 2026', label: 'Oct 2026 (MTD)' },
    { id: 'September 2026', label: 'Sep 2026' },
    { id: 'Q3 2026', label: 'Q3 2026' },
    { id: 'YTD 2026', label: 'YTD (2026)' },
  ];

  // Dynamic KPI Metrics based on selected period
  const kpiData = useMemo(() => {
    switch (selectedPeriod) {
      case 'September 2026':
        return {
          revenue: '£356,200',
          revChange: '+11.2% vs Aug',
          surveysCount: '156',
          surveysUnit: 'Jobs',
          survChange: '+9.4% volume',
          conversion: '68.5%',
          convChange: '+2.8% vs Aug',
          slaCount: '39.2',
          slaUnit: 'Hours',
          slaNote: '96.8% within 48h SLA',
        };
      case 'Q3 2026':
        return {
          revenue: '£1,048,900',
          revChange: '+15.7% vs Q2',
          surveysCount: '452',
          surveysUnit: 'Jobs',
          survChange: '+14.1% volume',
          conversion: '70.4%',
          convChange: '+3.5% vs Q2',
          slaCount: '38.8',
          slaUnit: 'Hours',
          slaNote: '97.1% within 48h SLA',
        };
      case 'YTD 2026':
        return {
          revenue: '£3,418,600',
          revChange: '+22.4% vs 2025',
          surveysCount: '1,492',
          surveysUnit: 'Jobs',
          survChange: '+18.6% volume',
          conversion: '71.8%',
          convChange: '+4.5% vs 2025',
          slaCount: '38.5',
          slaUnit: 'Hours',
          slaNote: '97.2% within 48h SLA',
        };
      case 'October 2026':
      default:
        return {
          revenue: '£421,860',
          revChange: '+18.4% vs Sep',
          surveysCount: '176',
          surveysUnit: 'Jobs',
          survChange: '+12.5% volume',
          conversion: '71.2%',
          convChange: '+4.1% vs Sep',
          slaCount: '38.4',
          slaUnit: 'Hours',
          slaNote: '97.4% within 48h SLA',
        };
    }
  }, [selectedPeriod]);

  // Survey Revenue Breakdown by Service
  const revenueDistribution = useMemo(() => {
    return [
      {
        discipline: 'RICS Level 2 Home Survey',
        percentage: 42,
        amount: '£177,180',
        jobs: 74,
        color: 'bg-[#2563EB]',
        textColor: 'text-[#2563EB]',
      },
      {
        discipline: 'RICS Level 3 Comprehensive Building Survey',
        percentage: 31,
        amount: '£130,776',
        jobs: 42,
        color: 'bg-purple-600',
        textColor: 'text-purple-600',
      },
      {
        discipline: 'RICS Red Book Valuation (Probate & Lending)',
        percentage: 16,
        amount: '£67,497',
        jobs: 35,
        color: 'bg-amber-500',
        textColor: 'text-amber-500',
      },
      {
        discipline: 'Specialist Defect, Damp & Timber Assessment',
        percentage: 11,
        amount: '£46,407',
        jobs: 25,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-500',
      },
    ];
  }, []);

  // Surveyor League Table Data (Connected to SURVEYORS mock)
  const surveyorPerformance = useMemo(() => {
    const list = [
      {
        id: 'srv-1',
        name: 'David Thorne MRICS',
        credentials: 'Chartered Valuation Surveyor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
        postcodes: 'GU, KT, SW',
        surveys: 46,
        onTimeRate: '98.5%',
        revenue: '£42,850',
        email: 'david.thorne@njspropertygroup.com',
        phone: '+44 7700 900184',
        specialism: 'Valuations & Homebuyer L2',
      },
      {
        id: 'srv-2',
        name: 'Oliver Hughes MRICS',
        credentials: 'Senior Building Surveyor',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
        postcodes: 'W, NW, WC',
        surveys: 38,
        onTimeRate: '96.2%',
        revenue: '£54,200',
        email: 'oliver.hughes@njspropertygroup.com',
        phone: '+44 7700 900284',
        specialism: 'Period Structures & Level 3',
      },
      {
        id: 'srv-3',
        name: 'Claire Bennet AssocRICS',
        credentials: 'Residential Defect Specialist',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80',
        postcodes: 'TW, UB, SL',
        surveys: 34,
        onTimeRate: '100%',
        revenue: '£29,400',
        email: 'claire.bennet@njspropertygroup.com',
        phone: '+44 7700 900384',
        specialism: 'Damp, Timber & Defects',
      },
      {
        id: 'srv-4',
        name: 'Jonathan Cross FRICS',
        credentials: 'Fellow Chartered Surveyor',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80',
        postcodes: 'EC, SE, E',
        surveys: 32,
        onTimeRate: '97.0%',
        revenue: '£68,900',
        email: 'jonathan.cross@njspropertygroup.com',
        phone: '+44 7700 900484',
        specialism: 'Commercial Red Book & Party Wall',
      },
      {
        id: 'srv-5',
        name: 'Fiona Macintyre MRICS',
        credentials: 'Historic Buildings Consultant',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
        postcodes: 'OX, RG, HP',
        surveys: 26,
        onTimeRate: '95.8%',
        revenue: '£22,100',
        email: 'fiona.macintyre@njspropertygroup.com',
        phone: '+44 7700 900584',
        specialism: 'Listed Heritage & CPR35',
      },
    ];

    if (!searchTerm.trim()) return list;

    const q = searchTerm.toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.credentials.toLowerCase().includes(q) ||
        s.postcodes.toLowerCase().includes(q) ||
        s.specialism.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const handleExportCSV = () => {
    addToast({
      type: 'success',
      title: 'Export Generated',
      message: `Downloaded Property_Group_Analytics_${selectedPeriod.replace(/\s+/g, '_')}.csv with full operational ledger.`,
    });
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard?.writeText(email);
    addToast({
      type: 'info',
      title: 'Email Copied',
      message: `${email} copied to clipboard.`,
    });
  };

  // Fluid 6-Column Responsive Table Specification
  const columns = [
    {
      key: 'name',
      header: 'Chartered Surveyor',
      sortable: true,
      className: 'w-[28%] min-w-[145px]',
      render: (val, row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={row.avatar}
            alt={val}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <button
              onClick={() => setViewingSurveyor(row)}
              className="font-bold text-xs text-slate-900 hover:text-[#2563EB] hover:underline truncate block cursor-pointer text-left"
              title="Click to view surveyor performance"
            >
              {val}
            </button>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">{row.credentials}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'postcodes',
      header: 'Postcodes Covered',
      sortable: true,
      className: 'w-[16%] min-w-[105px]',
      render: (val) => (
        <div className="flex items-center gap-1 flex-wrap">
          {val.split(', ').map((pc, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono font-bold bg-blue-50 text-[#2563EB] border border-blue-100 px-1.5 py-0.5 rounded"
            >
              {pc}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'surveys',
      header: 'Completed Surveys',
      sortable: true,
      className: 'w-[17%] min-w-[100px]',
      render: (val) => (
        <div className="font-semibold text-xs text-slate-800">
          <span>{val} Inspections</span>
        </div>
      ),
    },
    {
      key: 'onTimeRate',
      header: '48h SLA On-Time',
      sortable: true,
      className: 'w-[17%] min-w-[100px]',
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs text-emerald-700">{val}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        </div>
      ),
    },
    {
      key: 'revenue',
      header: 'Settled Fee Revenue',
      sortable: true,
      className: 'w-[16%] min-w-[105px] font-mono font-bold text-[#0B1F4D]',
      render: (val) => <span className="text-xs sm:text-sm">{val}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      headerClassName: 'text-right w-[6%] min-w-[50px] pr-3 sm:pr-4',
      className: 'text-right w-[6%] min-w-[50px] pr-3 sm:pr-4',
      render: (_, row) => (
        <SurveyorRowActions
          surveyor={row}
          onView={setViewingSurveyor}
          onCopyEmail={handleCopyEmail}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Reports & Financial Analytics"
        subtitle="Executive operational performance, RICS delivery turnaround SLAs, and revenue breakdown across the UK."
        breadcrumb={['Admin', 'Reports & Analytics']}
        actionLabel="Export CSV Report"
        actionIcon={Download}
        onAction={handleExportCSV}
      />

      {/* Date Period Selector Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span className="text-xs font-bold text-slate-700">Reporting Period:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {periods.map((p) => {
            const isActive = selectedPeriod === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#0B1F4D] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 TOP EXECUTIVE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Gross Invoiced Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <PoundSterling className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight">
              {kpiData.revenue}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>{kpiData.revChange}</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Total Survey Inspections</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight flex items-baseline gap-1.5">
              <span>{kpiData.surveysCount}</span>
              <span className="text-sm font-semibold text-slate-400">
                {kpiData.surveysUnit}
              </span>
            </div>
            <div className="text-[11px] font-bold text-blue-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span>{kpiData.survChange}</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Inquiry Conversion Rate</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight">
              {kpiData.conversion}
            </div>
            <div className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{kpiData.convChange}</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold">Average SLA Turnaround</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B1F4D] tracking-tight flex items-baseline gap-1.5">
              <span>{kpiData.slaCount}</span>
              <span className="text-sm font-semibold text-slate-400">
                {kpiData.slaUnit}
              </span>
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{kpiData.slaNote}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: SERVICE BREAKDOWN & SURVEYBOOKER PIPELINE SLAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Revenue by RICS Survey Standard */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2563EB]" />
              <span>Revenue by Survey Standard ({selectedPeriod})</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">
              100% Allocated
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {revenueDistribution.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-800">{item.discipline}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({item.jobs} jobs)
                    </span>
                    <span className="font-mono text-slate-900">{item.amount}</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Monthly Billed Total:</span>
            <span className="font-mono font-black text-[#0B1F4D] text-sm">
              {kpiData.revenue} (176 Surveys)
            </span>
          </div>
        </div>

        {/* Panel 2: Canonical SurveyBooker 6-Stage Operational SLAs */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SurveyBooker Operational Milestone SLAs</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active SLA Target: &lt; 48h
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Real-time tracking of instructions through the 6-stage lifecycle, ensuring complete compliance with RICS Home Survey SLAs.
          </p>

          <div className="space-y-2.5 text-xs">
            {/* Stage 1: Quote */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">Inbound Lead ➔ Quote Sent</span>
                  <span className="text-[10px] text-slate-400 block">SurveyBooker Stage 1</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900">3.2 hrs avg</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Target &lt; 12h (99.2%)</span>
              </div>
            </div>

            {/* Stage 2-3: Terms & Paid */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">Terms Execution &amp; Payment</span>
                  <span className="text-[10px] text-slate-400 block">SurveyBooker Stages 2 &amp; 3</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900">18.5 hrs avg</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Target &lt; 24h (96.8%)</span>
              </div>
            </div>

            {/* Stage 4-6: Complete */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">Site Inspection ➔ Report Upload</span>
                  <span className="text-[10px] text-slate-400 block">SurveyBooker Stages 4, 5 &amp; 6</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-[#0B1F4D]">38.4 hrs avg</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Target &lt; 48h (97.4%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: SURVEYOR OPERATIONAL PRODUCTIVITY LEAGUE TABLE */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#2563EB]" />
              <span>Chartered Surveyor Operational League Table</span>
            </h3>
            <p className="text-xs text-slate-500">
              Inspect on-site completions, 48-hour delivery SLAs, and regional postcode allocations across London &amp; Home Counties.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search surveyor, postcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Clean Responsive Table with Actions */}
        <Table
          columns={columns}
          data={surveyorPerformance}
          pageSize={10}
          emptyTitle="No surveyors found"
          emptyMessage="No chartered surveyor matches the search criteria."
        />
      </div>

      {/* SURVEYOR PERFORMANCE DETAIL MODAL */}
      {viewingSurveyor && (
        <Modal
          isOpen={!!viewingSurveyor}
          onClose={() => setViewingSurveyor(null)}
          title={viewingSurveyor.name}
          subtitle={`${viewingSurveyor.credentials} • Field Territory: ${viewingSurveyor.postcodes}`}
          maxWidth="max-w-lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Active Chartered Surveyor
              </span>
              <button
                onClick={() => setViewingSurveyor(null)}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <img
                src={viewingSurveyor.avatar}
                alt={viewingSurveyor.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{viewingSurveyor.name}</h4>
                <div className="text-[11px] text-slate-500 font-medium">{viewingSurveyor.specialism}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{viewingSurveyor.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Completions</span>
                <span className="text-base font-black text-[#0B1F4D] font-mono">{viewingSurveyor.surveys} Surveys</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">48h SLA On-Time</span>
                <span className="text-base font-black text-emerald-700 font-mono">{viewingSurveyor.onTimeRate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Billed Fee Revenue</span>
                <span className="text-base font-black text-[#0B1F4D] font-mono">{viewingSurveyor.revenue}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Allocated Territory</span>
                <span className="text-base font-black text-slate-800 font-mono">{viewingSurveyor.postcodes}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
