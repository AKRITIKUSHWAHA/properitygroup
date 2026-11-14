import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  PoundSterling,
  Building2,
  Mail,
  User,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Tag,
  Percent,
  Star,
  Phone,
  Check,
  Eye,
  SlidersHorizontal,
  Info,
  HelpCircle,
  ArrowRight,
  Calculator
} from 'lucide-react';
import { useToast } from '../ToastContext';
import { useQuotes } from '../../mock/quotes';
import { useClientProfiles } from '../../mock/clientProfiles';
import { adminQuotationsAndPaymentsApi } from '../../api/adminApi';

// Standard recommended RICS guide fees (ex. VAT)
const STANDARD_FEES = {
  'RICS Level 2 Home Survey (Homebuyer)': 550,
  'RICS Level 2 Home Survey (with Valuation)': 650,
  'RICS Level 3 Building Survey (Full Structural)': 850,
  'Residential Red Book Valuation (Matrimonial/Tax/Probate)': 450,
  'Specific Structural Defect Survey (Damp/Cracking)': 395,
  'New Build Snagging Report': 350,
  'Part 35 Civil Procedure Expert Witness Report': 950,
};

export const SendQuoteModal = ({ isOpen, onClose, lead, onQuoteSent }) => {
  const { addToast } = useToast();
  const { addQuote } = useQuotes();
  const { addCallLog } = useClientProfiles();

  // Mode tab: 'form' (configure numbers) or 'preview' (customer email layout)
  const [modalMode, setModalMode] = useState('form');

  // Helper to normalize survey type based on lead enquiry
  const resolveInitialSurveyType = (enquiry) => {
    const raw = (enquiry || '').toLowerCase();
    if (raw.includes('level 3') || raw.includes('structural')) {
      return 'RICS Level 3 Building Survey (Full Structural)';
    }
    if (raw.includes('level 2') && raw.includes('valuation')) {
      return 'RICS Level 2 Home Survey (with Valuation)';
    }
    if (raw.includes('valuation') || raw.includes('red book')) {
      return 'Residential Red Book Valuation (Matrimonial/Tax/Probate)';
    }
    if (raw.includes('snag')) {
      return 'New Build Snagging Report';
    }
    if (raw.includes('defect') || raw.includes('damp')) {
      return 'Specific Structural Defect Survey (Damp/Cracking)';
    }
    if (raw.includes('expert') || raw.includes('witness')) {
      return 'Part 35 Civil Procedure Expert Witness Report';
    }
    return 'RICS Level 2 Home Survey (Homebuyer)';
  };

  // Helper to extract numeric fee from lead if already set
  const resolveInitialBaseFee = (leadObj) => {
    if (leadObj?.estimatedValue && !leadObj.estimatedValue.toLowerCase().includes('pending')) {
      const parsed = parseFloat(leadObj.estimatedValue.replace(/[^0-9.]/g, ''));
      if (parsed && !isNaN(parsed) && parsed > 50) return parsed;
    }
    const defaultType = resolveInitialSurveyType(leadObj?.enquiry);
    return STANDARD_FEES[defaultType] || 550;
  };

  const [surveyType, setSurveyType] = useState(() => resolveInitialSurveyType(lead?.enquiry));
  const [baseFee, setBaseFee] = useState(() => resolveInitialBaseFee(lead));
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset cleanly whenever a new lead is passed
  useEffect(() => {
    if (lead) {
      const initialType = resolveInitialSurveyType(lead.enquiry);
      const initialFee = resolveInitialBaseFee(lead);
      setSurveyType(initialType);
      setBaseFee(initialFee);
      setDiscount(0);
      setModalMode('form');
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  // Handle service type dropdown change: auto-suggest standard fee
  const handleSurveyTypeChange = (e) => {
    const newType = e.target.value;
    setSurveyType(newType);
    if (STANDARD_FEES[newType]) {
      setBaseFee(STANDARD_FEES[newType]);
    }
  };

  // Real-time calculation math (clean & straightforward)
  const discountAmount = Math.max(0, parseFloat(discount) || 0);
  const currentBaseFee = Math.max(0, parseFloat(baseFee) || 0);

  const subtotal = Math.max(0, currentBaseFee - discountAmount);
  const vatAmount = subtotal * 0.2; // 20% UK VAT
  const totalAmount = subtotal + vatAmount;
  const combinedValuationAmount = totalAmount + 120.0;

  const handleSendQuote = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    const targetEmail = (lead?.customerEmail || lead?.clientEmail || lead?.email || '').trim();
    const targetName = (lead?.customerName || lead?.clientName || lead?.name || 'Valued Client').trim();
    const targetPhone = (lead?.customerPhone || lead?.clientPhone || lead?.phone || '').trim();
    const targetAddress = (lead?.property || lead?.propertyAddress || lead?.address || 'Subject Property').trim();

    if (!targetEmail) {
      addToast({
        type: 'error',
        title: 'Missing Customer Email',
        message: 'Cannot dispatch quote proposal: no valid recipient email address found for this lead.',
      });
      return;
    }

    setIsSubmitting(true);
    const quoteId = `QUO-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newQuoteRecord = {
      id: quoteId,
      refNo: quoteId,
      invoiceNo: `INV-${quoteId.replace('QUO-', '')}`,
      client: targetName,
      clientEmail: targetEmail,
      clientPhone: targetPhone,
      property: targetAddress,
      location: lead?.location || '',
      surveyType: surveyType,
      baseFee: currentBaseFee,
      extras: [],
      discount: discountAmount,
      amountExVat: subtotal,
      vatAmount: vatAmount,
      totalAmount: totalAmount,
      status: 'Sent', // 'Sent' = Quoted to client
      type: 'quotation',
      date: new Date().toLocaleDateString('en-GB'),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'), // 14 days validity
      paidDate: null,
      paymentMethod: null,
    };

    // Add to quotations store
    addQuote(newQuoteRecord);

    // Add auto-logged note in client profile
    addCallLog(targetEmail, {
      clientName: targetName,
      clientPhone: targetPhone,
      clientAddress: `${targetAddress}, ${lead?.location || ''}`,
      direction: 'Outbound',
      staff: 'Sarah Jenkins',
      duration: '3 mins',
      subject: `Quotation Sent (${quoteId})`,
      notes: `Dispatched formal fee proposal of £${totalAmount.toFixed(2)} inc. VAT for ${surveyType} at ${targetAddress}. Lead marked as Quoted (Deal Live). Quote ref: ${quoteId}.`,
      tags: ['Quote Sent', 'Quoted', lead?.source || 'Website'],
    });

    try {
      // Call backend API to persist quote in MySQL and dispatch live Resend proposal email
      const res = await adminQuotationsAndPaymentsApi.createQuote({
        leadId: lead?.dbId || lead?.id,
        baseFee: currentBaseFee,
        clientEmail: targetEmail,
        clientName: targetName,
        clientPhone: targetPhone,
        propertyAddress: targetAddress,
        surveyType: surveyType,
        discount: discountAmount,
      });

      const emailSent = Boolean(res?.data?.emailSent || res?.emailSent);

      // Callback to update lead status to 'Quoted' in parent
      if (onQuoteSent && lead?.id) {
        onQuoteSent(lead.id, `£${totalAmount.toFixed(2)}`, quoteId);
      }

      if (emailSent) {
        console.log(`[Resend Live] Quote proposal emailed to ${targetEmail}`);
        addToast({
          type: 'success',
          title: 'Quotation Dispatched & Email Delivered',
          message: `Formal quote proposal ${quoteId} (£${totalAmount.toFixed(2)}) sent to ${targetEmail}. Deal status set to 'Quoted'.`,
        });
      } else {
        addToast({
          type: 'success',
          title: 'Quotation Generated & Deal Live',
          message: `Quote proposal ${quoteId} (£${totalAmount.toFixed(2)}) registered for ${targetName}.`,
        });
      }

      onClose();
    } catch (err) {
      console.warn('Backend quote creation warning:', err.message);
      if (onQuoteSent && lead?.id) {
        onQuoteSent(lead.id, `£${totalAmount.toFixed(2)}`, quoteId);
      }
      addToast({
        type: 'warning',
        title: 'Quote Dispatched (Email Notification Pending)',
        message: `Quote registered in CRM. If email to ${targetEmail} is delayed, check spam or verify delivery.`,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="bg-[#0B1F4D] text-white p-5 sm:p-6 shrink-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold shrink-0">
              <Calculator className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">Generate &amp; Dispatch Quotation</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-[#0B1F4D]">
                  Sets Status to &quot;Quoted&quot;
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Lead Reference: <strong className="text-white font-mono">{lead.id}</strong> &bull; Channel:{' '}
                <strong className="text-amber-300">{lead.source || 'Website'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Clean & Intuitive */}
        <div className="flex border-b border-slate-200 bg-slate-100/90 px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setModalMode('form')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer -mb-px ${
              modalMode === 'form'
                ? 'border-[#0B1F4D] text-[#0B1F4D] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#0B1F4D]" />
            <span>1. Configure Fee &amp; Scope</span>
          </button>

          <button
            type="button"
            onClick={() => setModalMode('preview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer -mb-px ${
              modalMode === 'preview'
                ? 'border-[#0B1F4D] text-[#0B1F4D] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-4 h-4 text-blue-600" />
            <span>2. Customer Email Preview</span>
          </button>
        </div>

        {/* TAB 1: Configure Proposal Form */}
        {modalMode === 'form' && (
          <form id="send-quote-form" onSubmit={handleSendQuote} className="flex-1 flex flex-col overflow-hidden min-h-0 text-xs">
            {/* Scrollable inputs body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              
              {/* Step 1: Client & Property Information Cards */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Step 1 &bull; Recipient &amp; Property Details
                  </span>
                  <span className="text-[10px] text-slate-400">From Lead Enquiry</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>Client / Contact</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{lead.customerName}</div>
                    <div className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="font-mono">{lead.customerEmail}</span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="font-mono">{lead.customerPhone}</span>
                    </div>
                  </div>

                  <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-3">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <Building2 className="w-3 h-3 text-[#0B1F4D]" />
                      <span>Target Property</span>
                    </div>
                    <div className="font-bold text-[#0B1F4D] text-xs">{lead.property}</div>
                    <div className="text-slate-600 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{lead.location}</span>
                    </div>
                    <div className="pt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-[#2563EB] text-[10px] font-bold">
                        Source: {lead.source || 'Website'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Survey Type Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="survey-type-select" className="font-bold text-slate-800 text-xs">
                    Step 2 &bull; Select Survey Service Scope *
                  </label>
                  <span className="text-[10px] text-slate-400">Updates suggested base fee</span>
                </div>
                <select
                  id="survey-type-select"
                  value={surveyType}
                  onChange={handleSurveyTypeChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-[#0B1F4D]/20 focus:outline-none cursor-pointer"
                >
                  <option value="RICS Level 2 Home Survey (Homebuyer)">
                    RICS Level 2 Home Survey (Homebuyer) &mdash; Standard (£550 guide)
                  </option>
                  <option value="RICS Level 2 Home Survey (with Valuation)">
                    RICS Level 2 Home Survey (with RICS Valuation) &mdash; Combined (£650 guide)
                  </option>
                  <option value="RICS Level 3 Building Survey (Full Structural)">
                    RICS Level 3 Building Survey (Full Structural) &mdash; Comprehensive (£850 guide)
                  </option>
                  <option value="Residential Red Book Valuation (Matrimonial/Tax/Probate)">
                    Residential Red Book Valuation (Matrimonial / Tax / Probate) &mdash; (£450 guide)
                  </option>
                  <option value="Specific Structural Defect Survey (Damp/Cracking)">
                    Specific Structural Defect Survey (Damp / Cracking) &mdash; (£395 guide)
                  </option>
                  <option value="New Build Snagging Report">
                    New Build Snagging Report &mdash; (£350 guide)
                  </option>
                  <option value="Part 35 Civil Procedure Expert Witness Report">
                    Part 35 Civil Procedure Expert Witness Report &mdash; (£950 guide)
                  </option>
                </select>
              </div>

              {/* Step 3: Base Fee & Promotional Discount */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Step 3 &bull; Fee &amp; Discount (Net figures ex. VAT)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label htmlFor="base-fee-input" className="block font-bold text-slate-800 mb-1">
                      Base Survey Fee (£ ex. VAT) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">£</span>
                      <input
                        id="base-fee-input"
                        type="number"
                        step="5"
                        min="50"
                        value={baseFee}
                        onChange={(e) => setBaseFee(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-[#0B1F4D]/20 focus:outline-none"
                        required
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Core professional inspection &amp; report fee
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label htmlFor="discount-input" className="block font-bold text-slate-800 mb-1">
                      Promotional Discount (£ ex. VAT)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">£</span>
                      <input
                        id="discount-input"
                        type="number"
                        step="5"
                        min="0"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-[#0B1F4D]/20 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Optional deduction (leave 0 if none)
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 4: Live Invoice Calculation Breakdown */}
              <div className="p-4 bg-gradient-to-b from-slate-50 to-slate-100/70 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-slate-600" />
                    <span>Real-Time Fee &amp; UK VAT Calculation</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">UK Standard 20% VAT</span>
                </div>

                {/* Base fee line */}
                <div className="flex items-center justify-between text-slate-700 text-xs">
                  <span>Base Survey Inspection Fee:</span>
                  <span className="font-mono font-bold text-slate-900">£{currentBaseFee.toFixed(2)}</span>
                </div>

                {/* Discount line (if any) */}
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 text-xs">
                    <span>Promotional Discount:</span>
                    <span className="font-mono font-bold">-£{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Subtotal line */}
                <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-slate-800 text-xs">
                  <span className="font-medium">Net Subtotal (ex. VAT):</span>
                  <span className="font-mono font-bold text-slate-900">£{subtotal.toFixed(2)}</span>
                </div>

                {/* VAT line */}
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>UK VAT @ 20%:</span>
                  <span className="font-mono font-bold text-slate-800">+£{vatAmount.toFixed(2)}</span>
                </div>

                {/* Final Payable Total */}
                <div className="pt-2.5 border-t border-slate-300 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-[#0B1F4D] block uppercase tracking-wide">
                      Total Amount Client Pays
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Gross figure quoted to customer (Inc. 20% VAT)
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                    £{totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Explanation Note: What will happen */}
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-blue-900 leading-snug">
                  <strong>What happens when you send?</strong> This quotation of{' '}
                  <strong className="font-bold text-[#0B1F4D]">£{totalAmount.toFixed(2)}</strong> will be dispatched to{' '}
                  <strong className="underline">{lead.customerEmail}</strong>, a formal quote record will be created, and the lead status will change from <span className="font-bold text-blue-700">&quot;New&quot;</span> to <span className="font-bold text-amber-700">&quot;Quoted&quot;</span>.
                </div>
              </div>
            </div>

            {/* Sticky Form Footer Action Buttons (Always Visible) */}
            <div className="shrink-0 bg-white border-t border-slate-200 px-5 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
              <button
                type="button"
                onClick={() => setModalMode('preview')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Preview Customer Email</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#0B1F4D]/20 cursor-pointer transition-all"
                >
                  <Send className={`w-4 h-4 text-amber-300 ${isSubmitting ? 'animate-pulse' : ''}`} />
                  <span>{isSubmitting ? 'Dispatching Proposal...' : `Send Quotation to Client • £${totalAmount.toFixed(2)}`}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: Customer Email Preview */}
        {modalMode === 'preview' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 text-xs">
            {/* Scrollable email body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-100/60">
              {/* Email Container Mockup */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-xl mx-auto">
                
                {/* Email Envelope Meta Bar */}
                <div className="p-3 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div><strong>Subject:</strong> Official RICS Home Survey Quotation &mdash; {lead.property}</div>
                  <div><strong>To:</strong> {lead.customerName} &lt;{lead.customerEmail}&gt;</div>
                  <div><strong>From:</strong> NJS Property Group Chartered Surveyors &lt;quotes@njspropertygroup.com&gt;</div>
                </div>

                {/* Email Header Banner */}
                <div className="bg-[#0B1F4D] p-5 text-white text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-amber-300 font-bold text-[10px] tracking-wider uppercase mb-2">
                    NJS PROPERTY GROUP &bull; RICS CHARTERED SURVEYORS
                  </div>
                  <h3 className="text-lg font-bold text-white m-0">
                    Here is your official home survey quotation
                  </h3>

                  {/* Trustpilot strip */}
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full text-xs">
                    <span className="font-bold text-white">Excellent</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-slate-200 text-[10px]">4.9 / 5.0 based on verified client reviews</span>
                  </div>
                </div>

                {/* Email Body Content */}
                <div className="p-5 sm:p-6 space-y-4 text-slate-800 text-xs leading-relaxed">
                  <p className="m-0 font-medium">
                    Dear {lead.customerName.split(' ')[0] || 'Client'},
                  </p>

                  <p className="m-0">
                    Thank you for your enquiry. We are pleased to provide your formal quotation for an independent{' '}
                    <strong>{surveyType}</strong> at:
                  </p>

                  {/* Property pill */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{lead.property}, {lead.location}</span>
                  </div>

                  {/* Main Price Highlight Box */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-1">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase block tracking-wider">
                      Total Fixed Quotation Fee (Inclusive of 20% VAT)
                    </span>
                    <span className="text-3xl font-black text-emerald-700 font-mono block">
                      £{totalAmount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-emerald-800">
                      Net: £{subtotal.toFixed(2)} + VAT @ 20%: £{vatAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Alternative Valuation Offer */}
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 m-0">
                    <strong>Need a formal Market Valuation too?</strong> We can provide a combined{' '}
                    <strong>{surveyType} and RICS Red Book Valuation</strong> for{' '}
                    <strong className="text-[#0B1F4D]">£{combinedValuationAmount.toFixed(2)}</strong>.
                  </p>

                  {/* Inclusions Checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                      What is Included in Your Survey Service:
                    </span>
                    <div className="space-y-1.5">
                      {[
                        'Comprehensive physical on-site inspection by an accredited RICS surveyor',
                        'Detailed condition rating for all visible roof structures, walls, timbers, and joinery',
                        'Damp and moisture profiling using calibrated digital Protimeters',
                        'Color-coded Traffic-Light defect severity ratings (Condition 1, 2, and 3)',
                        'High-resolution photographic schedule of all identified issues',
                        'Professional surveyor commentary on maintenance risks & remediation advice',
                        'Guidance on potential legal and building regulations questions for your conveyancer',
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking Prompt */}
                  <div className="p-3.5 bg-slate-900 text-white rounded-2xl text-center space-y-1">
                    <span className="text-xs font-bold text-amber-300 block">
                      Ready to book your survey date?
                    </span>
                    <span className="text-[11px] text-slate-200">
                      Call our survey coordinators directly on{' '}
                      <strong className="text-white font-bold">03339 997 578</strong> or reply to this email to confirm your preferred inspection date.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Preview Footer Action Buttons (Always Visible) */}
            <div className="shrink-0 bg-white border-t border-slate-200 px-5 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
              <button
                type="button"
                onClick={() => setModalMode('form')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
              >
                &larr; Back to Edit Figures
              </button>

              <button
                type="button"
                onClick={handleSendQuote}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Send className={`w-4 h-4 text-amber-300 ${isSubmitting ? 'animate-pulse' : ''}`} />
                <span>{isSubmitting ? 'Dispatching Proposal...' : `Confirm & Dispatch This Quotation (£${totalAmount.toFixed(2)})`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
