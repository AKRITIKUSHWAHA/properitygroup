import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileSignature,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  PoundSterling,
  Building,
  User,
  MapPin,
  Mail,
  Scale,
  Calendar,
  Gavel,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { useToast } from '../ToastContext';
import { TERMS_TEMPLATES, getTemplateForService, createAutoFilledAgreement, useTerms } from '../../mock/terms';
import { useJobs, SURVEYORS } from '../../mock/jobs';

export const SendTermsModal = ({
  isOpen,
  onClose,
  job = null,
  initialTemplateKey = null,
  onTermsSent = null,
}) => {
  const { addToast } = useToast();
  const { jobs, updateJob } = useJobs();
  const { addAgreement } = useTerms();

  const [activeTab, setActiveTab] = useState('particulars'); // 'particulars' | 'expert-witness' | 'preview'
  const [selectedJobId, setSelectedJobId] = useState(job ? job.id : '');

  // Active job reference (either passed via prop or picked from dropdown)
  const currentJob = useMemo(() => {
    if (job) return job;
    return jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;
  }, [job, selectedJobId, jobs]);

  // Selected Service Template
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(() => {
    if (initialTemplateKey) return initialTemplateKey;
    if (currentJob?.surveyType) return getTemplateForService(currentJob.surveyType).serviceKey;
    return 'Homebuyer L2';
  });

  const selectedTemplate = useMemo(() => {
    return TERMS_TEMPLATES.find((t) => t.serviceKey === selectedTemplateKey) || TERMS_TEMPLATES[0];
  }, [selectedTemplateKey]);

  // Form Particulars
  const [clientName, setClientName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [property, setProperty] = useState('');
  const [location, setLocation] = useState('');
  const [postcode, setPostcode] = useState('');
  const [baseFee, setBaseFee] = useState(700.0);
  const [selectedSurveyor, setSelectedSurveyor] = useState(SURVEYORS[0].name);
  const [notes, setNotes] = useState('');

  // Expert Witness Editable Blanks
  const [hourlyRate, setHourlyRate] = useState(250.0);
  const [courtDailyFee, setCourtDailyFee] = useState(1500.0);
  const [instructingSolicitor, setInstructingSolicitor] = useState('');
  const [courtClaimNumber, setCourtClaimNumber] = useState('');
  const [courtForum, setCourtForum] = useState('County Court at Central London');
  const [appointmentRoute, setAppointmentRoute] = useState('Single Joint Expert (SJE)');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever currentJob or initialTemplateKey changes
  useEffect(() => {
    if (currentJob) {
      setSelectedJobId(currentJob.id);
      setClientName(currentJob.customer || currentJob.clientName || 'Private Client');
      setSignerEmail(currentJob.customerEmail || currentJob.clientEmail || 'client@example.co.uk');
      setClientPhone(currentJob.customerPhone || currentJob.clientPhone || '+44 7700 900000');
      setProperty(currentJob.property || currentJob.propertyAddress || '14 Mayfair Gate, London');
      setLocation(currentJob.location || 'London, UK');
      setPostcode(currentJob.postcode || 'W1K 2PB');
      setBaseFee(Number(currentJob.quote?.baseFee || (currentJob.surveyType?.includes('Level 3') ? 1450 : 700)));
      setSelectedSurveyor(currentJob.surveyor || SURVEYORS[0].name);

      const matchedTmpl = getTemplateForService(currentJob.surveyType);
      setSelectedTemplateKey(initialTemplateKey || matchedTmpl.serviceKey);

      // Pre-fill Expert Witness defaults if relevant
      if (currentJob.contacts?.solicitor?.firm) {
        setInstructingSolicitor(`${currentJob.contacts.solicitor.firm} (Lead: ${currentJob.contacts.solicitor.name || 'Partner'})`);
      }
      if (currentJob.contacts?.solicitor?.ref) {
        setCourtClaimNumber(`Ref: ${currentJob.contacts.solicitor.ref}`);
      }
    }
  }, [currentJob, initialTemplateKey]);

  if (!isOpen) return null;

  const vatAmount = Math.round(baseFee * 0.2);
  const totalAmount = baseFee + vatAmount;

  const isEW = selectedTemplate.isExpertWitness;

  const handleSend = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    if (!signerEmail.trim()) {
      addToast({
        type: 'error',
        title: 'Signer Email Required',
        message: 'Please provide the client email address for digital terms delivery.',
      });
      setActiveTab('particulars');
      return;
    }

    if (!clientName.trim()) {
      addToast({
        type: 'error',
        title: 'Client Name Required',
        message: 'Please enter the client / purchaser full legal name.',
      });
      setActiveTab('particulars');
      return;
    }

    if (isEW && !instructingSolicitor.trim()) {
      addToast({
        type: 'error',
        title: 'Instructing Solicitor Required',
        message: 'CPR Part 35 Expert Witness Mandate requires the Instructing Solicitor Firm name.',
      });
      setActiveTab('expert-witness');
      return;
    }

    setIsSubmitting(true);

    // Build complete agreement object
    const agreement = createAutoFilledAgreement({
      job: {
        id: currentJob?.id || `JOB-2026-${Math.floor(100 + Math.random() * 900)}`,
        jobNo: currentJob?.jobNo || currentJob?.id || 'JOB-2026-088',
        customer: clientName,
        customerEmail: signerEmail,
        customerPhone: clientPhone,
        property,
        location,
        postcode,
        surveyor: selectedSurveyor,
        surveyType: selectedTemplate.serviceKey,
        quote: { baseFee },
      },
      templateKey: selectedTemplate.serviceKey,
      customFields: {
        hourlyRate: Number(hourlyRate),
        courtDailyFee: Number(courtDailyFee),
        instructingSolicitor,
        courtClaimNumber,
        courtForum,
        appointmentRoute,
        notes,
      },
    });

    // 1. Save in agreements state / localStorage
    addAgreement(agreement);

    // 2. Update linked job status to 'Sent' if job exists
    if (currentJob?.id) {
      updateJob(currentJob.id, {
        termsStatus: 'Sent',
        activityLog: [
          {
            id: Date.now(),
            time: `${new Date().toLocaleDateString('en-GB')}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
            text: `📄 Digital Terms of Engagement (${selectedTemplate.name}) dispatched to ${signerEmail}. Mandate Ref: ${agreement.refNo}.`,
          },
          ...(currentJob.activityLog || []),
        ],
      });
    }

    // 3. Dispatch simulated backend sync
    const token = localStorage.getItem('property_group_auth_token');
    if (token && currentJob?.id) {
      fetch(`/api/v1/terms-and-documents/terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: currentJob.dbId || currentJob.id,
          documentTitle: selectedTemplate.name,
          clientEmail: signerEmail,
          clientName,
        }),
      }).catch(() => {});
    }

    addToast({
      type: 'success',
      title: 'Terms of Engagement Dispatched',
      message: `Agreement ${agreement.refNo} (${selectedTemplate.shortName}) sent to ${signerEmail}.`,
    });

    if (onTermsSent) {
      onTermsSent(agreement);
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#0B1F4D] text-white p-5 sm:p-6 shrink-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0">
              <FileSignature className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">Dispatch Terms of Engagement</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-400 text-[#0B1F4D]">
                  {selectedTemplate.shortName}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedTemplate.governingBody} &bull; {selectedTemplate.version}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100/80 px-6 pt-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('particulars')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all -mb-px flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'particulars'
                ? 'border-[#2563EB] text-[#0B1F4D] bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>1. Contract Particulars &amp; Auto-Fill</span>
          </button>

          {isEW && (
            <button
              type="button"
              onClick={() => setActiveTab('expert-witness')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all -mb-px flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'expert-witness'
                  ? 'border-amber-500 text-amber-900 bg-white rounded-t-xl'
                  : 'border-transparent text-amber-700 hover:text-amber-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              <span>2. CPR Part 35 Blanks &amp; Court Rates</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all -mb-px flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'border-[#2563EB] text-[#0B1F4D] bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>3. Full Legal Contract Preview</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: CONTRACT PARTICULARS & AUTO-FILL */}
          {activeTab === 'particulars' && (
            <form onSubmit={handleSend} className="space-y-4">
              {/* Linked Job Selection (if not locked to a specific job) */}
              {!job && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Auto-Fill from Survey Job Record
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.jobNo} &bull; {j.customer} &bull; {j.property} ({j.surveyType})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Service Template Selector */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl">
                <label className="block font-bold text-[#0B1F4D] mb-1">
                  Active Legal Template (Exact Terms from Client Word Documents)
                </label>
                <select
                  value={selectedTemplateKey}
                  onChange={(e) => setSelectedTemplateKey(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 cursor-pointer"
                >
                  {TERMS_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.serviceKey}>
                      {tmpl.name} — {tmpl.version}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-700 mt-1">
                  Governed by {selectedTemplate.governingBody}. Backed by {selectedTemplate.piiCap}.
                </p>
              </div>

              {/* Client & Signer Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Client Full Legal Name * (Auto-filled)
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Signer Email Address * (Receives e-sign link)
                  </label>
                  <input
                    type="email"
                    required
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Subject Property Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={property}
                    onChange={(e) => setProperty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    required
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 uppercase"
                  />
                </div>
              </div>

              {/* Fee Breakdown & Surveyor Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Base Professional Fee (£ excl. VAT) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">£</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={baseFee}
                      onChange={(e) => setBaseFee(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                    />
                  </div>

                  {/* Live 20% VAT box */}
                  <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] flex items-center justify-between">
                    <span className="text-slate-500">+20% UK VAT: £{vatAmount.toFixed(2)}</span>
                    <span className="font-bold text-emerald-700">Gross Total: £{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Assigned Chartered Surveyor *
                  </label>
                  <select
                    value={selectedSurveyor}
                    onChange={(e) => setSelectedSurveyor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
                  >
                    {SURVEYORS.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.credentials})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Specific Inspection Instructions &amp; Caveats (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sub-floor void access subject to vendor clearance. Report delivered within 48h."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 resize-none"
                />
              </div>

              {isEW && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="text-amber-900 font-bold text-[11px]">
                      Expert Witness Mandate selected: Please complete CPR Part 35 Court rates and Solicitor blanks.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('expert-witness')}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    Edit CPR Blanks &rarr;
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: CPR PART 35 EXPERT WITNESS EDITABLE BLANKS */}
          {activeTab === 'expert-witness' && isEW && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-xs">
                  <Gavel className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Civil Procedure Rules (CPR Part 35) Mandate Blanks</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  As required by the client’s legal mandate, complete the litigation rates, instructing solicitor firm, and court claim details prior to issuing this contract.
                </p>
              </div>

              {/* Hourly Rate & Court Daily Refresher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Expert Witness Hourly Rate (£/hr excl. VAT) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">£</span>
                    <input
                      type="number"
                      step="1"
                      required
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Default scale: £250.00/hr</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Court Attendance Daily Refresher (£/day excl. VAT) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">£</span>
                    <input
                      type="number"
                      step="1"
                      required
                      value={courtDailyFee}
                      onChange={(e) => setCourtDailyFee(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Default scale: £1,500.00/day</span>
                </div>
              </div>

              {/* Instructing Solicitor & Claim Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Instructing Solicitor Firm &amp; Lead Solicitor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Herbert Smith Freehills LLP (Lead: Sarah Jenkins)"
                    value={instructingSolicitor}
                    onChange={(e) => setInstructingSolicitor(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Court &amp; Claim / Case Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. County Court at Central London, Claim No. F00CL891"
                    value={courtClaimNumber}
                    onChange={(e) => setCourtClaimNumber(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              {/* Court Forum & Appointment Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Court / Judicial Forum
                  </label>
                  <input
                    type="text"
                    value={courtForum}
                    onChange={(e) => setCourtForum(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Appointment Route (CPR 35.7 / 35.8)
                  </label>
                  <select
                    value={appointmentRoute}
                    onChange={(e) => setAppointmentRoute(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    <option value="Single Joint Expert (SJE)">Single Joint Expert (SJE) — Joint appointment</option>
                    <option value="Party-Appointed Expert">Party-Appointed Expert (Instructed on behalf of Claimant/Defendant)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <span className="font-bold text-[#0B1F4D] block mb-0.5">CPR 35.3 Statutory Overriding Duty:</span>
                The expert witness’s overriding duty is to the Court and supersedes any private instruction or fee payment. By issuing this mandate, both NJS Property Group Ltd and the instructing solicitor confirm compliance.
              </div>
            </div>
          )}

          {/* TAB 3: FULL LEGAL CONTRACT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              {/* Document Header */}
              <div className="text-center pb-3 border-b border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Official NJS Property Group Ltd Legal Document
                </span>
                <h3 className="text-base font-extrabold text-[#0B1F4D]">
                  {selectedTemplate.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Company No. 14367377 &bull; 203 West Street, Fareham, PO16 0EN &bull; Phone: 07444 918809 / 0333 305 2777
                </p>
              </div>

              {/* Auto-filled Order Particulars Table */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-[#0B1F4D] uppercase tracking-wider block border-b border-slate-100 pb-1">
                  1. Order Particulars &amp; Instruction Schedule
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Client / Instructing Party:</span>
                    <span className="font-bold text-slate-900">{clientName || '[Client Name]'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Signer Email:</span>
                    <span className="font-mono text-slate-800 font-semibold truncate block">{signerEmail || '[Email]'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Contact Telephone:</span>
                    <span className="text-slate-800">{clientPhone || '[Phone]'}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase">Subject Property Address:</span>
                    <span className="font-bold text-slate-900">{property}, {postcode}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Agreed Professional Fee:</span>
                    <span className="font-bold text-emerald-700 font-mono">£{totalAmount.toFixed(2)} (inc. 20% VAT)</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Responsible Surveyor:</span>
                    <span className="font-bold text-[#0B1F4D]">{selectedSurveyor}</span>
                  </div>

                  {isEW && (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Instructing Solicitor:</span>
                        <span className="font-bold text-amber-900">{instructingSolicitor || '[Solicitor Firm]'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Court &amp; Claim Number:</span>
                        <span className="font-mono font-bold text-slate-800">{courtClaimNumber || '[Claim Number]'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Hourly / Daily Rates:</span>
                        <span className="font-mono font-bold text-slate-900">£{hourlyRate}/hr &bull; £{courtDailyFee}/day</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Appointment Route:</span>
                        <span className="font-bold text-slate-900">{appointmentRoute}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Exact Clauses List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#0B1F4D] uppercase tracking-wider block">
                  2. Terms of Engagement &amp; Statutory Clauses
                </span>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedTemplate.clauses.map((clause) => (
                    <div key={clause.num} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          Clause {clause.num}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{clause.title}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {clause.text
                          .replace('[HOURLY_RATE]', String(hourlyRate))
                          .replace('[COURT_DAILY_FEE]', String(courtDailyFee))
                          .replace('[COURT_HALF_DAY]', String(Math.round(courtDailyFee / 2)))
                          .replace('[INSTRUCTING_SOLICITOR]', instructingSolicitor || '[Instructing Solicitor Firm]')
                          .replace('[COURT_CLAIM_NUMBER]', courtClaimNumber || '[Court Claim No.]')
                          .replace('[COURT_FORUM]', courtForum)
                          .replace('[APPOINTMENT_ROUTE]', appointmentRoute)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Execution & Certificate Note */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Upon dispatch, {signerEmail} will receive a secure digital signature link. Full IP address, timestamp, and audit hash will be appended to the Certificate of Digital Execution.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {activeTab !== 'preview' ? (
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Legal Terms</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('particulars')}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Edit Particulars</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSend}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#0B1F4D]/20 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>{isSubmitting ? 'Dispatching Terms...' : 'Dispatch Agreement Now'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
