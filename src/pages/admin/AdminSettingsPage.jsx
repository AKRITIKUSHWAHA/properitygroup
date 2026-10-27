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
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';

export const AdminSettingsPage = () => {
  const { addToast } = useToast();

  // Exactly the 4 tabs requested by user:
  // (survey types and pricing, lead sources, email templates, service areas)
  const [activeTab, setActiveTab] = useState('pricing');

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

  // Tab 3: Email Templates State
  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: 'tpl-1',
      name: 'Quotation Proposal & Scope of Service',
      subject: 'Your Survey Quotation for {{property_address}}',
      trigger: 'On Quotation Generated',
      body: 'Dear {{customer_name}},\n\nThank you for instructing UK Property Surveying Practice. Please find attached your formal fixed-fee quotation for {{survey_type}} at {{property_address}}.\n\nTotal Quoted Fee: £{{quote_total}} (inc. 20% VAT).',
    },
    {
      id: 'tpl-2',
      name: 'Terms of Engagement E-Sign Mandate',
      subject: 'Action Required: RICS Terms of Engagement for {{property_address}}',
      trigger: 'On Quote Accepted',
      body: 'Dear {{customer_name}},\n\nPlease review and digitally execute your mandatory RICS Terms of Engagement using our secure portal:\n\n{{esign_link}}\n\nNote: Inspection date will be confirmed upon signature.',
    },
    {
      id: 'tpl-3',
      name: 'Inspection Access & Logistics Confirmation',
      subject: 'Site Inspection Confirmed: {{inspection_date}} at {{property_address}}',
      trigger: 'On Terms Signed & Payment Cleared',
      body: 'Dear {{customer_name}},\n\nWe are pleased to confirm that your surveyor {{surveyor_name}} will attend {{property_address}} on {{inspection_date}} during {{time_slot}}.\n\nKeys will be collected from {{key_location}}.',
    },
    {
      id: 'tpl-4',
      name: 'Final Survey Report Ready for Download',
      subject: 'Completed RICS Survey Report: {{property_address}}',
      trigger: 'On QA Approval',
      body: 'Dear {{customer_name}},\n\nYour finalized, peer-reviewed RICS survey report has been uploaded to your client portal and is ready for download:\n\n{{report_download_link}}',
    },
  ]);

  // Tab 4: Service Areas State
  const [serviceAreas, setServiceAreas] = useState([
    { id: 'area-1', name: 'London South West & Surrey', postcodes: 'SW, KT, TW, GU', leadSurveyor: 'David Thorne MRICS', standardTravel: 'Included' },
    { id: 'area-2', name: 'London West & Central', postcodes: 'W, WC, NW, EC', leadSurveyor: 'Oliver Hughes MRICS', standardTravel: 'Included' },
    { id: 'area-3', name: 'Surrey Hills & Outer Border', postcodes: 'RH, CR, SM', leadSurveyor: 'Claire Bennet AssocRICS', standardTravel: 'Included' },
    { id: 'area-4', name: 'Thames Valley & Berkshire', postcodes: 'OX, RG, HP, SL', leadSurveyor: 'Fiona Macintyre MRICS', standardTravel: '£40 surcharge outside M25' },
  ]);

  // Edit Template Modal
  const [editingTemplate, setEditingTemplate] = useState(null);

  const tabs = [
    { id: 'pricing', label: 'Survey Types & Pricing' },
    { id: 'leads', label: 'Lead Sources' },
    { id: 'templates', label: 'Email Templates' },
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

  const handleSaveTemplate = (e) => {
    e.preventDefault();
    setEmailTemplates((prev) =>
      prev.map((t) => (t.id === editingTemplate.id ? editingTemplate : t))
    );
    setEditingTemplate(null);
    addToast({
      type: 'success',
      title: 'Email Template Saved',
      message: 'Automated notification template updated.',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="System Governance & Settings"
        subtitle="Configure survey pricing matrices, marketing lead sources, automated email templates, and regional UK coverage areas."
        breadcrumb={['Super Admin', 'Settings']}
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
                <span>Survey Types & Base Pricing Matrix (GBP)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Base fee values applied before property size adjustments, extras, and 20% UK VAT.
              </p>
            </div>

            <button
              onClick={handleSavePricing}
              className="px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Pricing Matrix</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveyTypes.map((survey) => (
              <div
                key={survey.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-[#2563EB] transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{survey.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {survey.duration}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-snug">{survey.scope}</p>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Base Fee (£ ex VAT):</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-500 text-xs">£</span>
                    <input
                      type="number"
                      step="10"
                      value={survey.baseFee}
                      onChange={(e) => handleUpdatePrice(survey.id, e.target.value)}
                      className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-black text-sm text-[#0B1F4D] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>
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

      {/* TAB 3: EMAIL TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#2563EB]" />
                <span>Automated Email Notification Templates</span>
              </h3>
              <p className="text-xs text-slate-500">
                Triggered automatically at key milestones in the survey lifecycle.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {emailTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{tpl.name}</span>
                    <span className="text-[11px] font-mono text-[#2563EB] font-semibold">
                      Trigger: {tpl.trigger}
                    </span>
                  </div>

                  <button
                    onClick={() => setEditingTemplate(tpl)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#2563EB] text-slate-700 hover:text-[#2563EB] font-bold text-xs transition-all shadow-2xs cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Template</span>
                  </button>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/60 font-mono text-[11px] text-slate-600">
                  <div className="font-bold text-slate-800 mb-1">Subject: {tpl.subject}</div>
                  <p className="whitespace-pre-line text-slate-500 line-clamp-2">{tpl.body}</p>
                </div>
              </div>
            ))}
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

      {/* Edit Email Template Modal */}
      {editingTemplate && (
        <Modal
          isOpen={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          title={`Edit Email Template: ${editingTemplate.name}`}
          subtitle={`Trigger: ${editingTemplate.trigger}`}
          maxWidth="max-w-xl"
          footer={
            <>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-template-form"
                className="px-5 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
              >
                Save Changes
              </button>
            </>
          }
        >
          <form id="edit-template-form" onSubmit={handleSaveTemplate} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject Line</label>
              <input
                type="text"
                required
                value={editingTemplate.subject}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message Body (Supports dynamic tags)</label>
              <textarea
                rows="6"
                required
                value={editingTemplate.body}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Available tags: {'{{customer_name}}, {{property_address}}, {{quote_total}}, {{inspection_date}}, {{surveyor_name}}'}
              </span>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
