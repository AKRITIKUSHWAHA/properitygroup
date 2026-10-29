import React, { useState } from 'react';
import {
  Settings,
  PoundSterling,
  Target,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  Edit,
  Eye,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  Check,
  AlertCircle,
  ShieldCheck,
  Tag,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { useEmailAutomations } from '../../mock/emailAutomations';
import { EmailTemplatePreviewModal } from '../../components/admin/EmailTemplatePreviewModal';

export const AdminSettingsPage = () => {
  const { addToast } = useToast();
  const {
    automations,
    sentLogs,
    toggleAutomation,
    updateAutomation,
    resetAutomations,
    renderTemplate,
  } = useEmailAutomations();

  // Exactly the 4 tabs requested by user:
  // (survey types and pricing, lead sources, email automations, service areas)
  const [activeTab, setActiveTab] = useState('templates'); // default to templates for immediate verification

  // Tab 1: Survey Types & Pricing State
  const [surveyTypes, setSurveyTypes] = useState([
    { id: '1', name: 'RICS Level 2 Home Survey', baseFee: 650, duration: '3.0 Hours', scope: 'Standard residential properties in reasonable condition' },
    { id: '2', name: 'RICS Level 3 Building Survey', baseFee: 1450, duration: '5.0 Hours', scope: 'Period, listed, altered, or dilapidated structures' },
    { id: '3', name: 'New Build Snagging Survey', baseFee: 495, duration: '4.0 Hours', scope: 'Pre-completion NHQB builder defect inspection' },
    { id: '4', name: 'Residential Red Book Valuation', baseFee: 550, duration: '2.0 Hours', scope: 'Mortgage lending, probate, capital gains tax' },
    { id: '5', name: 'Specialist Damp & Defect Survey', baseFee: 920, duration: '3.5 Hours', scope: 'Moisture mapping, timber decay, rising damp' },
    { id: '6', name: 'Expert Witness (CPR Part 35)', baseFee: 2400, duration: '8.0 Hours', scope: 'Court litigation, boundary disputes, disrepair claims' },
  ]);

  // Tab 2: Lead Sources State
  const [leadSources, setLeadSources] = useState([
    { id: 'src-1', name: 'Website Organic (SEO)', active: true, cpl: '£14.20', conversion: '74.2%' },
    { id: 'src-2', name: 'Estate Agent Referrals', active: true, cpl: '£0.00 (Panel)', conversion: '82.5%' },
    { id: 'src-3', name: 'Local Surveyors Direct', active: true, cpl: '£28.00', conversion: '68.0%' },
    { id: 'src-4', name: 'Google Ads (Search PPC)', active: true, cpl: '£42.50', conversion: '61.4%' },
    { id: 'src-5', name: 'Conveyancing Solicitor Panel', active: true, cpl: '£0.00 (B2B)', conversion: '88.1%' },
    { id: 'src-6', name: 'Expert Witness Direct Referral', active: true, cpl: '£0.00 (Legal)', conversion: '92.0%' },
  ]);

  // Tab 4: Service Areas State
  const [serviceAreas, setServiceAreas] = useState([
    { id: 'area-1', name: 'London South West & Surrey', postcodes: 'SW, KT, TW, GU', leadSurveyor: 'David Thorne MRICS', standardTravel: 'Included' },
    { id: 'area-2', name: 'London West & Central', postcodes: 'W, WC, NW, EC', leadSurveyor: 'Oliver Hughes MRICS', standardTravel: 'Included' },
    { id: 'area-3', name: 'Surrey Hills & Outer Border', postcodes: 'RH, CR, SM', leadSurveyor: 'Claire Bennet AssocRICS', standardTravel: 'Included' },
    { id: 'area-4', name: 'Thames Valley & Berkshire', postcodes: 'OX, RG, HP, SL', leadSurveyor: 'Fiona Macintyre MRICS', standardTravel: '£40 surcharge outside M25' },
  ]);

  // Preview & Edit Automation Modal
  const [previewingAutomation, setPreviewingAutomation] = useState(null);

  const tabs = [
    { id: 'pricing', label: 'Survey Types & Pricing' },
    { id: 'leads', label: 'Lead Sources' },
    { id: 'templates', label: 'Email Automations & Workflows' },
    { id: 'areas', label: 'Service Areas' },
  ];

  const handleUpdatePrice = (id, newPrice) => {
    setSurveyTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, baseFee: parseFloat(newPrice) || 0 } : t))
    );
  };

  const handleSavePricing = () => {
    addToast({
      type: 'success',
      title: 'Pricing Matrix Saved',
      message: 'Base survey fees have been updated across quote calculations.',
    });
  };

  const toggleLeadSource = (id) => {
    setLeadSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
    addToast({
      type: 'info',
      title: 'Lead Source Updated',
      message: 'Source channel status toggled.',
    });
  };

  const handleToggleAutomation = (id, stageLabel) => {
    toggleAutomation(id);
    const target = automations.find((a) => a.id === id);
    const willBeActive = target ? !target.active : false;
    addToast({
      type: willBeActive ? 'success' : 'warning',
      title: willBeActive ? 'Email Automation Activated' : 'Email Automation Paused',
      message: `${stageLabel} automated client email is now ${willBeActive ? 'ACTIVE' : 'PAUSED'}.`,
    });
  };

  const activeAutomationsCount = automations.filter((a) => a.active).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="System Governance & Settings"
        subtitle="Configure survey pricing matrices, marketing lead sources, 6-step customer email automations, and regional UK coverage areas."
        breadcrumb={['Admin', 'Settings']}
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: SURVEY TYPES & PRICING */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
                <PoundSterling className="w-5 h-5 text-emerald-600" />
                <span>RICS Survey Products & Baseline Rate Card</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure baseline starting fees, estimated on-site survey inspection durations, and official scope.
              </p>
            </div>
            <button
              onClick={handleSavePricing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1F4D] hover:bg-[#162E6E] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>Save Rate Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveyTypes.map((type) => (
              <div
                key={type.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-bold text-slate-900 text-sm">{type.name}</div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-bold text-slate-400">£</span>
                    <input
                      type="number"
                      value={type.baseFee}
                      onChange={(e) => handleUpdatePrice(type.id, e.target.value)}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-black font-mono text-[#0B1F4D] text-right focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{type.scope}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Typical Duration: {type.duration}</span>
                  </span>
                  <span className="font-semibold text-emerald-600">Active in Quote Estimator</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LEAD SOURCES */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
                <Target className="w-5 h-5 text-[#2563EB]" />
                <span>Marketing Lead Sources & Attribution</span>
              </h3>
              <p className="text-xs text-slate-500">
                Track inquiry acquisition channels, cost-per-lead (CPL), and conversion rates.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {leadSources.map((source) => (
              <div
                key={source.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${source.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <div>
                    <span className="font-bold text-slate-900 block">{source.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      CPL: {source.cpl} • Conversion Rate: {source.conversion}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleLeadSource(source.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    source.active
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {source.active ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER EMAIL AUTOMATIONS & STAGE TRIGGERS */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Top Banner: Metric Highlights & Controls */}
          <div className="bg-gradient-to-r from-[#0B1F4D] to-[#1E3A8A] text-white p-6 sm:p-7 rounded-3xl shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Real-Time Customer Email Triggers</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Client Journey Email Automations
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Har milestone change par customer ko automated professional email send hota hai. Aap har step ko yahan se On / Off kar sakte hain aur templates customize kar sakte hain.
                </p>
              </div>

              {/* Status Stats */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center">
                  <div className="text-2xl font-black text-emerald-400">{activeAutomationsCount}/6</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Active Stages</div>
                </div>

                <button
                  type="button"
                  onClick={resetAutomations}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-bold border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Reset to default RICS templates"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6 Step Automations Cards */}
          <div className="space-y-4">
            {automations.map((item, idx) => (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 shadow-2xs space-y-4 ${
                  item.active
                    ? 'border-slate-200/90 hover:border-blue-300'
                    : 'border-slate-200/60 opacity-75 bg-slate-50/50'
                }`}
              >
                {/* Header row: Step pill, Title, Trigger, Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    {/* Step badge */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                        item.active
                          ? 'bg-[#0B1F4D] text-white shadow-xs'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#2563EB] font-mono">
                          {item.stageLabel}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                          Trigger: {item.triggerEvent}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{item.title}</h4>
                    </div>
                  </div>

                  {/* Actions & Switch */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewingAutomation(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview &amp; Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleAutomation(item.id, item.stageLabel)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        item.active
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${item.active ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                      <span>{item.active ? 'Active' : 'Paused'}</span>
                    </button>
                  </div>
                </div>

                {/* Subject & Preview Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-900">
                    <span className="font-bold text-[#0B1F4D] uppercase tracking-wider text-[11px]">Subject:</span>
                    <span className="font-semibold text-slate-800">
                      {renderTemplate(item.subject, {
                        property: '14 Mayfair Gate, London',
                        jobNo: 'JOB-2026-080',
                        surveyor: 'David Thorne MRICS',
                        date: '28 Oct 2026',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    {item.preview}
                  </p>

                  {/* Tags */}
                  {item.tags && (
                    <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                      {item.tags.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-white text-slate-600 text-[10px] font-medium border border-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Automated Email Dispatch Log */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Recent Automated Client Email Dispatches</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit trail of automated emails triggered by workflow stage advances.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Total Dispatched: {sentLogs.length}
              </span>
            </div>

            {sentLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Stage move hone par automated emails yahan real-time record honge. (Try advancing any job stage in Job Details).
              </div>
            ) : (
              <div className="space-y-2.5">
                {sentLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{log.subject}</div>
                        <div className="text-[11px] text-slate-500">
                          To: <span className="font-mono">{log.to}</span> • Job: <span className="font-mono">{log.jobNo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 block mb-1">
                        {log.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE AREAS */}
      {activeTab === 'areas' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                <span>Regional UK Service Areas & Surveyor Allocations</span>
              </h3>
              <p className="text-xs text-slate-500">
                Postcode routing rules ensuring optimal travel radius and mileage efficiency.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {serviceAreas.map((area) => (
              <div
                key={area.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{area.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 font-mono font-bold text-[#0B1F4D]">
                    {area.postcodes}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div>Lead Surveyor: <strong>{area.leadSurveyor}</strong></div>
                  <div>Travel Policy: <strong>{area.standardTravel}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview & Edit Automation Template Modal */}
      {previewingAutomation && (
        <EmailTemplatePreviewModal
          isOpen={!!previewingAutomation}
          onClose={() => setPreviewingAutomation(null)}
          automation={previewingAutomation}
          onSave={(id, fields) => {
            updateAutomation(id, fields);
            setPreviewingAutomation(null);
          }}
          renderTemplate={renderTemplate}
        />
      )}
    </div>
  );
};
