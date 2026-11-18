import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  Building,
  ShieldCheck,
  Star,
  Copy,
  ExternalLink,
  Edit3,
  Sparkles,
  Tag,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../ToastContext';

export const EmailTemplatePreviewModal = ({
  isOpen,
  onClose,
  automation,
  onSave,
  onReset,
  renderTemplate,
}) => {
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    templateBody: '',
    preview: '',
  });

  useEffect(() => {
    if (automation) {
      setFormData({
        subject: automation.subject || '',
        templateBody: automation.templateBody || '',
        preview: automation.preview || '',
      });
      setIsEditing(false);
    }
  }, [automation, isOpen]);

  if (!isOpen || !automation) return null;

  // Realistic UK specimen data for live email preview
  const specimenData = {
    customer: 'Emma Watson',
    customerName: 'Emma Watson',
    clientName: 'Emma Watson',
    customerEmail: 'customer@demo.com',
    property: '14 Mayfair Gate, Mayfair, London W1K 2PB',
    propertyAddress: '14 Mayfair Gate, Mayfair, London W1K 2PB',
    surveyType: 'RICS Level 2 Home Survey',
    serviceName: 'RICS Level 2 Home Survey',
    quoteTotal: '650.00',
    totalAmount: '650.00',
    price: '650.00',
    jobNo: 'JOB-2026-080',
    reference: 'JOB-2026-080',
    surveyor: 'David Thorne MRICS',
    surveyorName: 'David Thorne MRICS',
    date: 'Wednesday, 28 October 2026',
    inspectionDate: 'Wednesday, 28 October 2026',
    timeSlot: '09:30 AM - 12:00 PM',
    arrivalWindow: '09:30 AM - 12:00 PM',
    actionLink: 'https://njspropertygroup.com/customer/portal',
    bookingLink: 'https://njspropertygroup.com/customer/portal',
    portalLink: 'https://njspropertygroup.com/customer/portal',
  };

  const currentSubject = renderTemplate ? renderTemplate(formData.subject, specimenData) : formData.subject;
  const currentBody = renderTemplate ? renderTemplate(formData.templateBody, specimenData) : formData.templateBody;

  const insertVariable = (varCode) => {
    setFormData((prev) => ({
      ...prev,
      templateBody: prev.templateBody + ` {{${varCode}}}`,
    }));
    addToast({
      type: 'info',
      title: 'Tag Inserted',
      message: `Added {{${varCode}}} to email body.`,
    });
  };

  const handleSave = (e) => {
    e?.preventDefault();
    if (onSave) {
      onSave(automation.id, formData);
    }
    setIsEditing(false);
    addToast({
      type: 'success',
      title: 'Email Automation Template Saved',
      message: `Changes applied for ${automation.stageLabel}.`,
    });
  };

  const handleSendTest = () => {
    addToast({
      type: 'success',
      title: 'Specimen Test Email Dispatched',
      message: `Formatted test email dispatched with official NJS logo to info@njspropertygroup.com.`,
    });
  };

  const availableVariables = [
    { label: 'Client Name', code: 'customer_name', tag: '{{customer_name}}' },
    { label: 'Property Address', code: 'property_address', tag: '{{property_address}}' },
    { label: 'Survey Type', code: 'survey_type', tag: '{{survey_type}}' },
    { label: 'Total Fee (£)', code: 'quote_total', tag: '{{quote_total}}' },
    { label: 'Job Ref No', code: 'job_no', tag: '{{job_no}}' },
    { label: 'Surveyor Name', code: 'surveyor_name', tag: '{{surveyor_name}}' },
    { label: 'Inspection Date', code: 'inspection_date', tag: '{{inspection_date}}' },
    { label: 'Arrival Window', code: 'time_slot', tag: '{{time_slot}}' },
    { label: 'Portal / Booking Link', code: 'action_link', tag: '{{action_link}}' },
    { label: 'Company Phone', code: 'company_phone', tag: '{{company_phone}}' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-[#0B1F4D] text-white p-5 sm:p-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-sky-300">
                  {automation.stageLabel}
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-300">Auto-Trigger: {automation.triggerEvent}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">{automation.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isEditing
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
              }`}
            >
              {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Live Preview' : 'Edit Template'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/50">
          {isEditing ? (
            /* EDIT FORM MODE */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-[#0B1F4D]">SurveyBooker Template Editor</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Paste your existing Survey Booker wording directly below
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Dynamic tags supported: &#123;&#123;property_address&#125;&#125;, &#123;&#123;job_no&#125;&#125;, &#123;&#123;customer_name&#125;&#125;
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Notification Short Preview / Preheader
                  </label>
                  <input
                    type="text"
                    value={formData.preview}
                    onChange={(e) => setFormData({ ...formData, preview: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Short summary visible in customer email inbox before opening"
                  />
                </div>

                {/* Variable inserter chips */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Click to Insert Dynamic Merge Tag:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableVariables.map((v) => (
                      <button
                        type="button"
                        key={v.code}
                        onClick={() => insertVariable(v.code)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-[11px] font-semibold border border-blue-200/80 transition-colors cursor-pointer"
                        title={`Insert ${v.tag}`}
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>{v.label}</span>
                        <span className="text-[10px] opacity-75 font-mono">{v.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Body Content (Plain Text & Formatting) *
                  </label>
                  <textarea
                    rows="10"
                    required
                    value={formData.templateBody}
                    onChange={(e) => setFormData({ ...formData, templateBody: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  {onReset && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Reset this template to standard SurveyBooker default?')) {
                          onReset(automation.id);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Template to Default</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Template Changes</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* LIVE EMAIL INBOX PREVIEW MODE */
            <div className="space-y-4">
              {/* Mailbox Header Simulation */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 font-mono text-[11px] text-slate-500">Customer Mailbox Preview</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Recipient: customer@demo.com</span>
                </div>

                <div className="p-4 space-y-2 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-16 text-slate-400 font-semibold">From:</span>
                    <strong className="text-slate-900">NJS Property Group</strong>
                    <span className="font-mono text-slate-400 text-[11px]">&lt;notifications@njspropertygroup.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-16 text-slate-400 font-semibold">To:</span>
                    <span>Emma Watson &lt;customer@demo.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-16 text-slate-400 font-semibold">Subject:</span>
                    <span className="font-bold text-[#0B1F4D]">{currentSubject}</span>
                  </div>
                </div>

                {/* Branded Email Envelope Body */}
                <div className="p-6 sm:p-8 bg-slate-50/60 flex justify-center">
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md max-w-xl w-full overflow-hidden">
                    {/* Brand Banner with Official NJS Logo */}
                    <div className="bg-[#0B1F4D] text-white p-5 flex items-center justify-between border-b-2 border-amber-500/40">
                      <div className="flex items-center gap-3">
                        <img
                          src="/images/njs-logo-white.png"
                          alt="NJS Property Group"
                          className="h-10 w-auto object-contain drop-shadow-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = document.getElementById('email-brand-fallback');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div id="email-brand-fallback" style={{ display: 'none' }} className="items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                            NJS
                          </div>
                          <div>
                            <div className="font-black text-xs tracking-tight uppercase">
                              NJS Property Group
                            </div>
                            <div className="text-[10px] text-slate-300">
                              Independent RICS-Aligned Chartered Surveyors
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400 text-[11px] font-bold bg-white/10 px-2.5 py-1 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>4.8 Trustpilot</span>
                      </div>
                    </div>

                    {/* Email Content Container */}
                    <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
                      <div className="whitespace-pre-line font-sans">{currentBody}</div>

                      {/* Interactive Button in Email */}
                      <div className="pt-3 pb-1 text-center">
                        <span className="inline-block px-5 py-2.5 rounded-xl bg-[#2563EB] text-white font-bold text-xs shadow-md">
                          Access Secure Client Portal
                        </span>
                      </div>

                      {/* Trust Assurance in Email Footer */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Regulated by RICS Firm #089421</span>
                        </div>
                        <div className="font-mono">Helpline: 0800 169 9661</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${automation.active ? 'bg-emerald-500' : 'bg-slate-400'}`}
            />
            <span>
              Automation Status: <strong>{automation.active ? 'Active & Auto-Sending' : 'Paused by Admin'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendTest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Send Specimen Test Email</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
