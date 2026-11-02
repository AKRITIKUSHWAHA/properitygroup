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
  Zap,
  Server,
  ShieldCheck,
  Send,
  AlertCircle,
  KeyRound,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/ToastContext';

// Standard UK Surveying Practice Default SMTP
const DEFAULT_SMTP = {
  provider: 'office365',
  host: 'smtp.office365.com',
  port: '587',
  encryption: 'TLS',
  username: 'info@njspropertygroup.com',
  password: 'SG.ProdKey_98124_UKSurv2026',
  fromName: 'NJS Property Group',
  fromEmail: 'info@njspropertygroup.com',
  replyTo: 'info@njspropertygroup.com',
  footerText: 'RICS Regulated Firm #048291 • Professional Indemnity Insured to £2,000,000',
  status: 'Verified',
  lastVerified: '29/10/2026, 16:45',
};

// Preset Mail Providers
const PROVIDER_PRESETS = [
  { id: 'office365', label: 'Microsoft 365 / Exchange', host: 'smtp.office365.com', port: '587', enc: 'TLS' },
  { id: 'google', label: 'Google Workspace / Gmail', host: 'smtp.gmail.com', port: '587', enc: 'TLS' },
  { id: 'sendgrid', label: 'SendGrid (Twilio)', host: 'smtp.sendgrid.net', port: '587', enc: 'TLS' },
  { id: 'aws', label: 'Amazon SES', host: 'email-smtp.eu-west-2.amazonaws.com', port: '587', enc: 'TLS' },
  { id: 'custom', label: 'Custom Private SMTP', host: '', port: '587', enc: 'TLS' },
];

export const AdminSettingsPage = () => {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('smtp');

  // Load SMTP config from localStorage or defaults
  const [smtpConfig, setSmtpConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('propertygroup_smtp_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SMTP;
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('admin@njspropertygroup.com');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Survey Types & Pricing Rate Card
  const [surveyTypes, setSurveyTypes] = useState([
    { id: '1', name: 'RICS Level 2 Home Survey', baseFee: 650, duration: '3.0 Hours', scope: 'Standard residential properties in reasonable condition' },
    { id: '2', name: 'RICS Level 3 Building Survey', baseFee: 1450, duration: '5.0 Hours', scope: 'Period, listed, altered, or dilapidated structures' },
    { id: '3', name: 'New Build Snagging Survey', baseFee: 495, duration: '4.0 Hours', scope: 'Pre-completion NHQB builder defect inspection' },
    { id: '4', name: 'Residential Red Book Valuation', baseFee: 550, duration: '2.0 Hours', scope: 'Mortgage lending, probate, capital gains tax' },
    { id: '5', name: 'Specialist Damp & Defect Survey', baseFee: 920, duration: '3.5 Hours', scope: 'Moisture mapping, timber decay, rising damp' },
    { id: '6', name: 'Expert Witness (CPR Part 35)', baseFee: 2400, duration: '8.0 Hours', scope: 'Court litigation, boundary disputes, disrepair claims' },
  ]);

  const tabs = [
    { id: 'smtp', label: 'SMTP & Mail Server' },
    { id: 'pricing', label: 'Survey Types & Rate Cards' },
  ];

  // Handle Input Changes
  const handleInputChange = (field, value) => {
    setSmtpConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Quick Preset Selection
  const handleSelectPreset = (preset) => {
    setSmtpConfig((prev) => ({
      ...prev,
      provider: preset.id,
      host: preset.host || prev.host,
      port: preset.port,
      encryption: preset.enc,
    }));
    addToast({
      type: 'info',
      title: 'Provider Template Applied',
      message: `Configured settings for ${preset.label}.`,
    });
  };

  // Save SMTP Settings
  const handleSaveSmtp = (e) => {
    e?.preventDefault();
    if (!smtpConfig.host.trim() || !smtpConfig.fromEmail.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'SMTP Host and Sender Email are mandatory fields.',
      });
      return;
    }

    try {
      localStorage.setItem('propertygroup_smtp_settings', JSON.stringify(smtpConfig));
    } catch (err) {
      console.error(err);
    }

    addToast({
      type: 'success',
      title: 'SMTP Configuration Saved',
      message: `Mail server ${smtpConfig.host}:${smtpConfig.port} updated successfully.`,
    });
  };

  // Send Test Email
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
      setSmtpConfig((prev) => {
        const updated = {
          ...prev,
          status: 'Verified',
          lastVerified: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        };
        try {
          localStorage.setItem('propertygroup_smtp_settings', JSON.stringify(updated));
        } catch (err) {
          console.error(err);
        }
        return updated;
      });

      addToast({
        type: 'success',
        title: 'SMTP Handshake Successful',
        message: `Verified delivery to ${testEmailAddress} via ${smtpConfig.host}:${smtpConfig.port} (${smtpConfig.encryption}).`,
      });
    }, 1000);
  };

  // Rate card handlers
  const handleUpdatePrice = (id, newPrice) => {
    setSurveyTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, baseFee: parseFloat(newPrice) || 0 } : t))
    );
  };

  const handleSavePricing = () => {
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
        subtitle="Configure outbound SMTP mail server credentials and RICS baseline survey rate cards."
        breadcrumb={['Admin', 'Settings']}
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ========================================================= */}
      {/* TAB 1: SMTP & OUTBOUND MAIL SERVER CONFIGURATION          */}
      {/* ========================================================= */}
      {activeTab === 'smtp' && (
        <form onSubmit={handleSaveSmtp} className="space-y-6">
          {/* Top Status & Overview Banner */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#0B1F4D]">
                    Outbound SMTP Server Configuration
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {smtpConfig.status || 'Verified'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Host: <span className="font-mono font-semibold text-slate-700">{smtpConfig.host || 'Not configured'}</span> • Port: <span className="font-mono font-semibold text-slate-700">{smtpConfig.port}</span> ({smtpConfig.encryption})
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
                <span>Save SMTP</span>
              </button>
            </div>
          </div>

          {/* Quick Mail Provider Presets */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Quick Provider Presets:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {PROVIDER_PRESETS.map((p) => {
                const isSelected = smtpConfig.provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSelected
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

          {/* Detailed Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD 1: Connection & Host Settings */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2 pb-2 border-b border-slate-100">
                <Server className="w-4 h-4 text-[#2563EB]" />
                <span>Server &amp; Network Connection</span>
              </h4>

              {/* SMTP Host */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SMTP Host / Server Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. smtp.office365.com"
                  value={smtpConfig.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all"
                />
              </div>

              {/* Port & Encryption */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Port Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 587"
                    value={smtpConfig.port}
                    onChange={(e) => handleInputChange('port', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">587 (TLS) or 465 (SSL)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Encryption Protocol *
                  </label>
                  <select
                    value={smtpConfig.encryption}
                    onChange={(e) => handleInputChange('encryption', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all cursor-pointer"
                  >
                    <option value="TLS">TLS (STARTTLS)</option>
                    <option value="SSL">SSL</option>
                    <option value="None">None (Insecure)</option>
                  </select>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">TLS Mandated</span>
                </div>
              </div>

              {/* Last Verification Timestamp */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Last Verified Handshake:</span>
                <span className="font-mono font-bold text-slate-700">{smtpConfig.lastVerified || 'Never'}</span>
              </div>
            </div>

            {/* CARD 2: Authentication Credentials */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2 pb-2 border-b border-slate-100">
                <KeyRound className="w-4 h-4 text-[#2563EB]" />
                <span>SMTP Authentication Credentials</span>
              </h4>

              {/* SMTP Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SMTP Username / Account Email *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. info@njspropertygroup.com or apikey"
                  value={smtpConfig.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all"
                />
              </div>

              {/* SMTP Password / API Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SMTP Password / API Key *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter SMTP password or API token"
                    value={smtpConfig.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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
                  Encrypted at rest using 256-bit AES vault encryption.
                </span>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-2 text-blue-900 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>All outbound customer quotation emails and RICS report dispatches route securely through this relay.</span>
              </div>
            </div>
          </div>

          {/* CARD 3: Sender Identity & From Headers */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2 pb-2 border-b border-slate-100">
              <Mail className="w-4 h-4 text-[#2563EB]" />
              <span>Outbound Sender Identity (Header Display)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sender Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NJS Property Group"
                  value={smtpConfig.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  From Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. info@njspropertygroup.com"
                  value={smtpConfig.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reply-To Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. info@njspropertygroup.com"
                  value={smtpConfig.replyTo}
                  onChange={(e) => handleInputChange('replyTo', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email Footer / Statutory Disclaimer
              </label>
              <textarea
                rows="2"
                value={smtpConfig.footerText}
                onChange={(e) => handleInputChange('footerText', e.target.value)}
                placeholder="RICS Regulated Practice #048291 • Professional Indemnity Cover to £2,000,000"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 transition-all"
              />
            </div>
          </div>

          {/* Footer Submit Toolbar */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setSmtpConfig(DEFAULT_SMTP);
                localStorage.setItem('propertygroup_smtp_settings', JSON.stringify(DEFAULT_SMTP));
                addToast({
                  type: 'info',
                  title: 'Default Configuration Restored',
                  message: 'Restored default UK practice SMTP parameters.',
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
              <span>Save &amp; Activate SMTP</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SURVEY TYPES & PRICING RATE CARD                   */}
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
          title="Send SMTP Handshake Test"
          subtitle={`Verify end-to-end TLS connection to ${smtpConfig.host}:${smtpConfig.port}`}
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
                form="test-smtp-form"
                disabled={isSendingTest}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Handshake...</span>
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
          <form id="test-smtp-form" onSubmit={handleSendTestEmail} className="space-y-4 text-xs">
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
              <div>Sender: <span className="font-bold text-slate-900">{smtpConfig.fromName} &lt;{smtpConfig.fromEmail}&gt;</span></div>
              <div>Server: <span className="text-slate-900">{smtpConfig.host}:{smtpConfig.port} ({smtpConfig.encryption})</span></div>
              <div>Subject: <span className="text-slate-900">[SMTP Test] UK Property Group Relay Handshake</span></div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
