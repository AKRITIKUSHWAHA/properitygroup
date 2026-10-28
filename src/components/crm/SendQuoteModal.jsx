import React, { useState } from 'react';
import {
  X,
  Send,
  PoundSterling,
  Building,
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
  PhoneCall,
  Check,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { useToast } from '../ToastContext';
import { useQuotes } from '../../mock/quotes';
import { useClientProfiles } from '../../mock/clientProfiles';

export const SendQuoteModal = ({ isOpen, onClose, lead, onQuoteSent }) => {
  const { addToast } = useToast();
  const { addQuote } = useQuotes();
  const { addCallLog } = useClientProfiles();

  // Mode tab: 'form' (configure numbers) or 'preview' (Video 2 customer email layout)
  const [modalMode, setModalMode] = useState('form');

  // Extract base fee numeric value from estimatedValue e.g. "£1,450.00" -> 1450
  const initialBaseFee = lead?.estimatedValue
    ? parseFloat(lead.estimatedValue.replace(/[^0-9.]/g, '')) || 650.0
    : 650.0;

  const [surveyType, setSurveyType] = useState(lead?.enquiry || 'RICS Level 2 Home Survey');
  const [baseFee, setBaseFee] = useState(initialBaseFee);
  const [discount, setDiscount] = useState(0);
  const [droneInspection, setDroneInspection] = useState(false);
  const [verbalDebrief, setVerbalDebrief] = useState(true);
  const [turnaround, setTurnaround] = useState('48 Hours Post-Site Inspection');
  const [proposalNotes, setProposalNotes] = useState(
    `Formal RICS fee proposal for ${lead?.property || 'the property'}. Includes full structural/condition inspection, damp testing with Protimeter, and post-inspection telephone debrief.`
  );

  if (!isOpen || !lead) return null;

  // Real-time calculation
  const droneFee = droneInspection ? 120.0 : 0.0;
  const debriefFee = verbalDebrief ? 50.0 : 0.0;
  const subtotal = Math.max(0, baseFee + droneFee + debriefFee - discount);
  const vatAmount = subtotal * 0.2; // 20% UK VAT
  const totalAmount = subtotal + vatAmount;
  const combinedValuationAmount = totalAmount + 120.0;

  const handleSendQuote = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const quoteId = `QUO-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newQuoteRecord = {
      id: quoteId,
      refNo: quoteId,
      invoiceNo: `INV-${quoteId.replace('QUO-', '')}`,
      client: lead.customerName,
      clientEmail: lead.customerEmail,
      clientPhone: lead.customerPhone,
      property: lead.property,
      location: lead.location,
      surveyType: surveyType,
      baseFee: parseFloat(baseFee),
      extras: [
        ...(droneInspection ? [{ name: 'Drone Roof & Flashing Inspection', amount: 120.0 }] : []),
        ...(verbalDebrief ? [{ name: 'Same-day Verbal Debrief by Surveyor', amount: 50.0 }] : []),
      ],
      discount: parseFloat(discount) || 0,
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
    addCallLog(lead.customerEmail, {
      clientName: lead.customerName,
      clientPhone: lead.customerPhone,
      clientAddress: `${lead.property}, ${lead.location}`,
      direction: 'Outbound',
      staff: 'Sarah Jenkins',
      duration: '3 mins',
      subject: `Quotation Sent (${quoteId})`,
      notes: `Dispatched formal fee proposal of £${totalAmount.toFixed(2)} inc. VAT for ${surveyType} at ${lead.property}. Lead marked as Quoted (Deal Live). Quote ref: ${quoteId}.`,
      tags: ['Quote Sent', 'Quoted', lead.source],
    });

    // Callback to update lead status to 'Quoted'
    if (onQuoteSent) {
      onQuoteSent(lead.id, `£${totalAmount.toFixed(2)}`, quoteId);
    }

    addToast({
      type: 'success',
      title: 'Quotation Dispatched & Deal Created',
      message: `Quote proposal ${quoteId} (£${totalAmount.toFixed(2)}) sent to ${lead.customerName}. Lead status updated to 'Quoted'.`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0B1F4D] text-white p-5 sm:p-6 shrink-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold shrink-0">
              <PoundSterling className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Generate &amp; Dispatch Quotation</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-[#0B1F4D]">
                  Sets Status to &quot;Quoted&quot;
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Lead: <strong className="text-white">{lead.id}</strong> &bull; Source:{' '}
                <strong className="text-amber-300">{lead.source}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Configure Proposal vs Customer Email Preview (Video 2 Template) */}
        <div className="flex border-b border-slate-200 bg-slate-100/80 px-6 pt-2">
          <button
            type="button"
            onClick={() => setModalMode('form')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer -mb-px ${
              modalMode === 'form'
                ? 'border-[#0B1F4D] text-[#0B1F4D] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>1. Quotation Figures &amp; Scope</span>
          </button>

          <button
            type="button"
            onClick={() => setModalMode('preview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer -mb-px ${
              modalMode === 'preview'
                ? 'border-[#0B1F4D] text-[#0B1F4D] bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Customer Email Preview (Video 2 Template)</span>
          </button>
        </div>

        {/* MODE 1: Configure Proposal Form */}
        {modalMode === 'form' && (
          <form id="send-quote-form" onSubmit={handleSendQuote} className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
            {/* Client & Property summary banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Client / Recipient
                </span>
                <div className="font-bold text-slate-900 text-sm">{lead.customerName}</div>
                <div className="text-slate-600 font-mono text-[11px] mt-0.5">{lead.customerEmail}</div>
                <div className="text-slate-500 font-mono text-[11px]">{lead.customerPhone}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Target Property
                </span>
                <div className="font-bold text-[#0B1F4D] text-xs">{lead.property}</div>
                <div className="text-slate-600 text-[11px] mt-0.5">{lead.location}</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 text-[#2563EB] text-[10px] font-bold">
                  Source: {lead.source}
                </span>
              </div>
            </div>

            {/* Survey Type */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Select Survey Type / Service Scope *
              </label>
              <select
                value={surveyType}
                onChange={(e) => setSurveyType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
              >
                <option value="RICS Level 2 Home Survey">RICS Level 2 Home Survey (Homebuyer)</option>
                <option value="RICS Level 2 Home Survey (with Valuation)">
                  RICS Level 2 Home Survey (with RICS Valuation)
                </option>
                <option value="RICS Level 3 Building Survey">
                  RICS Level 3 Building Survey (Full Structural)
                </option>
                <option value="Residential Red Book Valuation">
                  Residential Red Book Valuation (Matrimonial/Tax/Probate)
                </option>
                <option value="Specific Structural Defect Survey">
                  Specific Structural Defect Survey (Damp/Cracking)
                </option>
                <option value="New Build Snagging Report">New Build Snagging Report</option>
                <option value="Part 35 Civil Procedure Expert Witness Report">
                  Part 35 Civil Procedure Expert Witness Report
                </option>
              </select>
            </div>

            {/* Pricing Row: Base fee & Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Base Net Fee (£ ex. VAT) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">£</span>
                  <input
                    type="number"
                    step="5"
                    min="100"
                    value={baseFee}
                    onChange={(e) => setBaseFee(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Promotional Discount (£ ex. VAT)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">£</span>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Optional Extras */}
            <div>
              <span className="block font-bold text-slate-700 mb-1.5">
                Recommended Quotation Add-ons
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={droneInspection}
                    onChange={(e) => setDroneInspection(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">
                      Drone Roof Inspection (+£120)
                    </span>
                    <span className="text-[10px] text-slate-500">Chimney &amp; parapet aerial photos</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verbalDebrief}
                    onChange={(e) => setVerbalDebrief(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">
                      Same-day Phone Debrief (+£50)
                    </span>
                    <span className="text-[10px] text-slate-500">Direct call with surveyor after site visit</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Pricing Summary Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-600 text-xs">
                <span>Subtotal (Net ex. VAT):</span>
                <span className="font-mono font-bold text-slate-900">£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>UK VAT (20%):</span>
                <span className="font-mono font-bold text-slate-900">£{vatAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-[#0B1F4D] block">
                    Total Proposed Quote Fee
                  </span>
                  <span className="text-[10px] text-slate-400">Inclusive of 20% VAT</span>
                </div>
                <div className="text-xl font-black text-emerald-700 font-mono">
                  £{totalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setModalMode('preview')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Preview Customer Email</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#0B1F4D]/20 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>Send Quote &bull; Mark Deal Quoted (£{totalAmount.toFixed(2)})</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* MODE 2: Customer Email Preview (Exact Match to Video 2 - e.surv / NJS Template) */}
        {modalMode === 'preview' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs bg-slate-100/50">
            {/* Email Shell */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-xl mx-auto">
              {/* Email Client Header Bar */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div><strong>Subject:</strong> Your Quote is Here!</div>
                <div><strong>To:</strong> {lead.customerName} &lt;{lead.customerEmail}&gt;</div>
                <div><strong>From:</strong> NJS Property Group / e.surv &lt;quotes@njspropertygroup.com&gt;</div>
              </div>

              {/* Email Hero Banner (From Video 2) */}
              <div className="bg-[#78004B] p-5 text-white text-center">
                <div className="inline-block px-3 py-1 rounded bg-white/10 text-white font-bold text-xs tracking-wider uppercase mb-2">
                  NJS PROPERTY GROUP &bull; e.surv Chartered Surveyors
                </div>
                <h3 className="text-xl font-extrabold text-white m-0">
                  Here is your home survey quote...
                </h3>

                {/* Trustpilot strip */}
                <div className="mt-3 inline-flex items-center gap-1.5 bg-black/25 px-3 py-1 rounded-full text-xs">
                  <span className="font-bold">Excellent</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className="fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>
                  <span className="text-slate-200 text-[10px]">based on 15,308 reviews &bull; Trustpilot</span>
                </div>
              </div>

              {/* Email Body Content */}
              <div className="p-5 sm:p-6 space-y-4 text-slate-800 text-xs leading-relaxed">
                <p className="m-0 font-medium">
                  Dear {lead.customerName.split(' ')[0] || 'Client'},
                </p>

                <p className="m-0">
                  Thanks again for your enquiry. Your quote for a <strong>{surveyType}</strong> for your property at{' '}
                  <strong>{lead.property}, {lead.location}</strong> is:
                </p>

                {/* Main Price Highlight */}
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-center">
                  <span className="text-[11px] font-bold text-purple-900 uppercase block tracking-wider mb-1">
                    Fixed-Fee Quotation (Inc. VAT)
                  </span>
                  <span className="text-3xl font-black text-[#78004B] font-mono">
                    £{totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* Alternative Valuation Offer (From Video 2) */}
                <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 m-0">
                  <strong>Alternative Option:</strong> We can also offer you a combined{' '}
                  <strong>{surveyType} and formal RICS Market Valuation</strong> for{' '}
                  <strong className="text-[#0B1F4D]">£{combinedValuationAmount.toFixed(2)}</strong>.
                </p>

                {/* Inclusions Checklist (Matching Video 2) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                    What is Included in Your Inspection:
                  </span>
                  <div className="space-y-1.5">
                    {[
                      'Physical on-site inspection of the property by a local RICS-accredited surveyor',
                      'Comprehensive PDF report with defects and problems ranked in order of importance',
                      'Color-coded Traffic-Light Condition Ratings (Condition 1, 2, and 3)',
                      'Professional surveyor opinion and defect remediation advice',
                      'Recommendations where specialist intrusive investigations are required',
                      'High-resolution photographic schedule of all identified issues',
                      'Highlights potential legal and building regulation issues for conveyancer',
                      'A post-survey telephone follow up call directly with your surveyor',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                        <CheckCircle2 size={13} className="text-[#78004B] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Prompt */}
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold text-blue-950 block">
                    Ready to book your inspection?
                  </span>
                  <span className="text-[11px] text-blue-800">
                    Call our survey coordinators on{' '}
                    <strong className="text-blue-900 font-bold">03339 997 578 / 0800 169 9661</strong> or reply to this email.
                  </span>
                </div>

                {/* Review Snippet (From Video 2) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600">
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className="fill-emerald-500 text-emerald-500" />
                    ))}
                  </div>
                  <p className="italic m-0">
                    &quot;Excellent follow up call and surveyor made the report easy to understand.&quot; &bull;{' '}
                    <strong>Terri Davies (Verified Buyer)</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setModalMode('form')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                ← Back to Edit Figures
              </button>

              <button
                type="button"
                onClick={handleSendQuote}
                className="px-6 py-2.5 rounded-xl bg-[#78004B] hover:bg-[#5c0039] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Confirm &amp; Dispatch This Email (£{totalAmount.toFixed(2)})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
