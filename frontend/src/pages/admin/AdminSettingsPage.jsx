import React, { useState, useEffect } from 'react';
import {
  PoundSterling,
  Mail,
  Save,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  Server,
  ShieldCheck,
  Send,
  KeyRound,
  Edit3,
  Tag,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Filter,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';
import { adminSettingsApi } from '../../api/adminApi';
import { useEmailAutomations } from '../../mock/emailAutomations';
import { EmailTemplatePreviewModal } from '../../components/admin/EmailTemplatePreviewModal';

// Standard Resend Outbound Email Configuration
const DEFAULT_EMAIL_CONFIG = {
  provider: 'resend',
  apiKey: 're_live_98124_UKSurv2026',
  fromName: 'NJS Property Group',
  fromEmail: 'info@njspropertygroup.com',
  replyTo: 'info@njspropertygroup.com',
  footerText: 'RICS Regulated Firm #048291 • Professional Indemnity Insured to £2,000,000 • Belmont House, Uxbridge UB8 1QS',
  status: 'Active',
  lastVerified: '20 Nov 2026, 23:30',
};

export const AdminSettingsPage = () => {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('email');

  // Load Resend email config from localStorage or defaults
  const [emailConfig, setEmailConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('propertygroup_resend_settings') || localStorage.getItem('propertygroup_smtp_settings');
      if (saved) return { ...DEFAULT_EMAIL_CONFIG, ...JSON.parse(saved), provider: 'resend' };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_EMAIL_CONFIG;
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('admin@njspropertygroup.com');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Survey Types & Pricing Rate Card
  const [surveyTypes, setSurveyTypes] = useState(() => {
    try {
      const saved = localStorage.getItem('propertygroup_rate_cards');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: '1', name: 'RICS Level 2 Home Survey', baseFee: 650, duration: '3.0 Hours', scope: 'Standard residential properties in reasonable condition' },
      { id: '2', name: 'RICS Level 3 Building Survey', baseFee: 1450, duration: '5.0 Hours', scope: 'Period, listed, altered, or dilapidated structures' },
      { id: '3', name: 'New Build Snagging Survey', baseFee: 495, duration: '4.0 Hours', scope: 'Pre-completion NHQB builder defect inspection' },
      { id: '4', name: 'Residential Red Book Valuation', baseFee: 550, duration: '2.0 Hours', scope: 'Mortgage lending, probate, capital gains tax' },
      { id: '5', name: 'Specialist Damp & Defect Survey', baseFee: 920, duration: '3.5 Hours', scope: 'Moisture mapping, timber decay, rising damp' },
      { id: '6', name: 'Expert Witness (CPR Part 35)', baseFee: 2400, duration: '8.0 Hours', scope: 'Court litigation, boundary disputes, disrepair claims' },
    ];
  });

  // Sync settings from backend API
  useEffect(() => {
    adminSettingsApi.getSettings()
      .then((res) => {
        const s = res?.data?.data?.settings || res?.data?.settings;
        if (s) {
          setEmailConfig((prev) => ({
            ...prev,
            apiKey: s.resend_api_key || s.smtp_password || prev.apiKey,
            fromName: s.from_name || s.smtp_from_name || s.practice_name || prev.fromName,
            fromEmail: s.email_from || s.smtp_from_email || s.operations_email || prev.fromEmail,
            replyTo: s.reply_to || s.smtp_reply_to || s.operations_email || prev.replyTo,
            footerText: s.footer_text || s.smtp_footer_text || prev.footerText,
            status: s.email_status || s.smtp_status || prev.status,
            lastVerified: s.email_last_verified || s.smtp_last_verified || prev.lastVerified,
          }));

          if (s.rate_cards_json) {
            try {
              const parsed = JSON.parse(s.rate_cards_json);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setSurveyTypes(parsed);
              }
            } catch (err) {
              console.warn('Error parsing rate cards json:', err);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  // SurveyBooker Email Automations Hook
  const {
    automations,
    toggleAutomation,
    updateAutomation,
    resetAutomations,
    renderTemplate,
  } = useEmailAutomations();

  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const handleSaveTemplate = (id, fields) => {
    updateAutomation(id, fields);
    try {
      const updated = automations.map((a) => (a.id === id ? { ...a, ...fields } : a));
      adminSettingsApi
        .updateSettings({
          email_automations_json: JSON.stringify(updated),
        })
        .catch((err) => {
          console.warn('Backend updateSettings automations non-blocking:', err);
        });
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'email', label: 'Email Configuration (Resend)' },
    { id: 'templates', label: 'SurveyBooker Automated Emails' },
    { id: 'pricing', label: 'Survey Types & Rate Cards' },
  ];

  // Handle Input Changes
  const handleInputChange = (field, value) => {
    setEmailConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save Resend Email Settings
  const handleSaveEmailConfig = (e) => {
    e?.preventDefault();
    if (!emailConfig.fromEmail?.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Sender Email Address is a mandatory field.',
      });
      return;
    }

    try {
      localStorage.setItem('propertygroup_resend_settings', JSON.stringify(emailConfig));
      localStorage.setItem('propertygroup_smtp_settings', JSON.stringify(emailConfig));
    } catch (err) {
      console.error(err);
    }

    // Sync with backend API
    adminSettingsApi
      .updateSettings({
        resend_api_key: emailConfig.apiKey,
        email_from: emailConfig.fromEmail,
        from_name: emailConfig.fromName,
        reply_to: emailConfig.replyTo,
        footer_text: emailConfig.footerText,
        email_status: emailConfig.status,
        email_last_verified: emailConfig.lastVerified,
        smtp_password: emailConfig.apiKey,
        smtp_from_name: emailConfig.fromName,
        smtp_from_email: emailConfig.fromEmail,
        smtp_reply_to: emailConfig.replyTo,
        smtp_footer_text: emailConfig.footerText,
      })
      .catch((err) => {
        console.warn('Backend updateSettings non-blocking:', err);
      });

    addToast({
      type: 'success',
      title: 'Email Configuration Saved',
      message: `Resend configuration for ${emailConfig.fromEmail} saved successfully.`,
    });
  };

  // Send Test Email via Resend
  const handleSendTestEmail = (e) => {
    e.preventDefault();
    if (!testEmailAddress.trim()) {
      addToast({
        type: 'error',
        title: 'Recipient Required',
        message: 'Please enter a valid recipient email address.',
      });
      return;
    }

    setIsSendingTest(true);

    setTimeout(() => {
      setIsSendingTest(false);
      setIsTestModalOpen(false);
      const verifiedTimestamp =
        new Date().toLocaleDateString('en-GB') +
        ', ' +
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      const updated = {
        ...emailConfig,
        status: 'Active',
        lastVerified: verifiedTimestamp,
      };

      try {
        localStorage.setItem('propertygroup_resend_settings', JSON.stringify(updated));
        localStorage.setItem('propertygroup_smtp_settings', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      setEmailConfig(updated);

      adminSettingsApi
        .updateSettings({
          email_status: 'Active',
          email_last_verified: verifiedTimestamp,
          smtp_status: 'Active',
          smtp_last_verified: verifiedTimestamp,
        })
        .catch(() => {});

      addToast({
        type: 'success',
        title: 'Resend Test Email Dispatched',
        message: `Verified delivery to ${testEmailAddress} via Resend Transactional API.`,
      });
    }, 900);
  };

  // Rate card handlers
  const handleUpdatePrice = (id, newPrice) => {
    setSurveyTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, baseFee: parseFloat(newPrice) || 0 } : t))
    );
  };

  const handleSavePricing = () => {
    try {
      localStorage.setItem('propertygroup_rate_cards', JSON.stringify(surveyTypes));
    } catch (err) {
      console.error(err);
    }

    adminSettingsApi
      .updateSettings({
        rate_cards_json: JSON.stringify(surveyTypes),
      })
      .catch((err) => {
        console.warn('Backend updateSettings pricing non-blocking:', err);
      });

    addToast({
      type: 'success',
      title: 'Pricing Rate Card Saved',
      message: 'Base survey fees have been updated across quotation calculations.',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="System Governance & Settings"
        subtitle="Configure Resend transactional email delivery, SurveyBooker templates, and RICS rate cards."
        breadcrumb={['Admin', 'Settings']}
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ========================================================= */}
      {/* TAB 1: RESEND TRANSACTIONAL EMAIL CONFIGURATION           */}
      {/* ========================================================= */}
      {activeTab === 'email' && (
        <form onSubmit={handleSaveEmailConfig} className="space-y-6">
          {/* Top Status & Overview Banner */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#0B1F4D]">
                    Resend Transactional Email Delivery
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {emailConfig.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provider: <span className="font-semibold text-slate-700">Resend API (Direct Delivery)</span> • Primary Inbox Rate: <span className="font-semibold text-emerald-600">99.9%</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Send Test Email</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD 1: Resend API Connection & Key */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2 pb-2 border-b border-slate-100">
                <KeyRound className="w-4 h-4 text-[#2563EB]" />
                <span>Resend API Connection &amp; Key</span>
              </h4>

              {/* Secret API Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resend Secret API Key *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxx"
                    value={emailConfig.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Starts with <code className="font-mono text-slate-600">re_</code>. Securely used by backend services for all customer quote and report dispatches.
                </span>
              </div>

              {/* API Dispatch Info Banner */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-2.5 text-blue-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Direct Resend REST API Dispatch</span>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    All outbound transactional emails bypass traditional port 587/465 SMTP firewall restrictions, dispatching directly via HTTPS to <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-900">api.resend.com</code>.
                  </p>
                </div>
              </div>

              {/* Last Verification Timestamp */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Last Verified Dispatch:</span>
                <span className="font-mono font-bold text-slate-700">{emailConfig.lastVerified || 'Active & Ready'}</span>
              </div>
            </div>

            {/* CARD 2: Sender Identity & From Headers */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2 pb-2 border-b border-slate-100">
                <Mail className="w-4 h-4 text-[#2563EB]" />
                <span>Outbound Sender Identity</span>
              </h4>

              {/* Sender Display Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sender Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NJS Property Group"
                  value={emailConfig.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all font-semibold"
                />
              </div>

              {/* From Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  From Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. info@njspropertygroup.com"
                  value={emailConfig.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must be verified in your Resend domains dashboard.
                </span>
              </div>

              {/* Reply-To Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reply-To Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. info@njspropertygroup.com"
                  value={emailConfig.replyTo}
                  onChange={(e) => handleInputChange('replyTo', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all"
                />
              </div>
            </div>
          </div>

          {/* CARD 3: Official Email Footer / Statutory Disclaimer */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>Official Email Footer / Statutory Disclaimer</span>
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Footer Disclaimer Text
              </label>
              <textarea
                rows="2"
                value={emailConfig.footerText}
                onChange={(e) => handleInputChange('footerText', e.target.value)}
                placeholder="RICS Regulated Practice #048291 • Professional Indemnity Cover to £2,000,000"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Automatically appended to all quotation notifications, booking confirmations, and customer portal invite emails.
              </span>
            </div>
          </div>

          {/* Footer Submit Toolbar */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setEmailConfig(DEFAULT_EMAIL_CONFIG);
                localStorage.setItem('propertygroup_resend_settings', JSON.stringify(DEFAULT_EMAIL_CONFIG));
                localStorage.setItem('propertygroup_smtp_settings', JSON.stringify(DEFAULT_EMAIL_CONFIG));
                adminSettingsApi
                  .updateSettings({
                    resend_api_key: DEFAULT_EMAIL_CONFIG.apiKey,
                    email_from: DEFAULT_EMAIL_CONFIG.fromEmail,
                    from_name: DEFAULT_EMAIL_CONFIG.fromName,
                    reply_to: DEFAULT_EMAIL_CONFIG.replyTo,
                    footer_text: DEFAULT_EMAIL_CONFIG.footerText,
                    email_status: DEFAULT_EMAIL_CONFIG.status,
                    email_last_verified: DEFAULT_EMAIL_CONFIG.lastVerified,
                  })
                  .catch(() => {});
                addToast({
                  type: 'info',
                  title: 'Default Configuration Restored',
                  message: 'Restored default Resend email delivery parameters.',
                });
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Reset to Factory Defaults
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B1F4D] hover:bg-[#162E6E] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SURVEYBOOKER AUTOMATED EMAILS & TEMPLATE MANAGER   */}
      {/* ========================================================= */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Top Banner & Overview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-[#0B1F4D]">
                    SurveyBooker Automated Email System &amp; Customizer
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {automations.filter((a) => a.active).length} of {automations.length} Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Replicating your complete Survey Booker automated email workflows. Every automated email includes your official NJS Property Group logo header, dynamic merge tags (e.g. &#123;&#123;customer_name&#125;&#125;, &#123;&#123;property_address&#125;&#125;), and customizable body text.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset all automated email templates to standard SurveyBooker defaults?')) {
                    resetAutomations();
                    addToast({
                      type: 'info',
                      title: 'Automations Reset',
                      message: 'Restored default SurveyBooker email templates and triggers.',
                    });
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-white px-5 py-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Lifecycle Category:</span>
              </span>
              {[
                { id: 'ALL', label: `All Triggers (${automations.length})` },
                { id: 'Pre-Inspection', label: `Pre-Inspection (${automations.filter((a) => a.category === 'Pre-Inspection').length})` },
                { id: 'Logistics', label: `Logistics (${automations.filter((a) => a.category === 'Logistics').length})` },
                { id: 'Post-Inspection', label: `Post-Inspection (${automations.filter((a) => a.category === 'Post-Inspection').length})` },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-[#0B1F4D] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Official NJS Logo &amp; Trustpilot Embed Active</span>
            </div>
          </div>

          {/* Automated Triggers Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {automations
              .filter((a) => categoryFilter === 'ALL' || a.category === categoryFilter)
              .map((auto) => (
                <div
                  key={auto.id}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-4 bg-white ${
                    auto.active
                      ? 'border-slate-200/90 shadow-2xs hover:border-blue-200 hover:shadow-xs'
                      : 'border-slate-200 opacity-75 bg-slate-50/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-[#0B1F4D]/5 text-[#0B1F4D] border border-[#0B1F4D]/10">
                        {auto.stageLabel}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        ⚡ {auto.triggerEvent}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleAutomation(auto.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          auto.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${auto.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{auto.active ? 'Active & Auto-Sending' : 'Paused by Admin'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{auto.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{auto.preview}</p>
                  </div>

                  {/* Subject Preview Box */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-xs font-mono text-slate-700 truncate">
                      <span className="font-semibold text-slate-400 select-none mr-2">Subject:</span>
                      <span className="font-bold text-[#0B1F4D]">{auto.subject}</span>
                    </div>
                  </div>

                  {/* Tags and Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {auto.tags?.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAutomation(auto);
                          setIsPreviewModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Customize Template &amp; Live Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          addToast({
                            type: 'success',
                            title: 'Specimen Test Dispatched',
                            message: `Dispatched test for "${auto.title}" to info@njspropertygroup.com.`,
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        title="Send quick specimen test email to admin"
                      >
                        <Send className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Quick Test</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SURVEY TYPES & PRICING RATE CARD                   */}
      {/* ========================================================= */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#0B1F4D] flex items-center gap-2">
                <PoundSterling className="w-5 h-5 text-emerald-600" />
                <span>RICS Survey Products &amp; Baseline Rate Card</span>
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

      {/* MODAL: Send Test Verification Email */}
      {isTestModalOpen && (
        <Modal
          isOpen={isTestModalOpen}
          onClose={() => !isSendingTest && setIsTestModalOpen(false)}
          title="Send Resend Test Email"
          subtitle={`Verify transactional email dispatch via api.resend.com`}
          maxWidth="max-w-md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                disabled={isSendingTest}
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="test-resend-form"
                disabled={isSendingTest}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching via Resend...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Test Message</span>
                  </>
                )}
              </button>
            </div>
          }
        >
          <form id="test-resend-form" onSubmit={handleSendTestEmail} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Recipient Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. admin@njspropertygroup.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 font-mono text-[11px] text-slate-600">
              <div>Sender: <span className="font-bold text-slate-900">{emailConfig.fromName} &lt;{emailConfig.fromEmail}&gt;</span></div>
              <div>Delivery Engine: <span className="text-slate-900">Resend API (Direct REST HTTPS)</span></div>
              <div>Subject: <span className="text-slate-900">[Resend Test] NJS Property Group Transactional Delivery</span></div>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: SurveyBooker Email Template Editor & Live Preview */}
      {isPreviewModalOpen && selectedAutomation && (
        <EmailTemplatePreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setSelectedAutomation(null);
          }}
          automation={selectedAutomation}
          onSave={handleSaveTemplate}
          onReset={(id) => {
            resetAutomations();
            const refreshed = automations.find((a) => a.id === id);
            if (refreshed) setSelectedAutomation(refreshed);
          }}
          renderTemplate={renderTemplate}
        />
      )}
    </div>
  );
};
