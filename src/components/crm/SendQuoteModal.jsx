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
} from 'lucide-react';
import { useToast } from '../ToastContext';
import { useQuotes } from '../../mock/quotes';
import { useClientProfiles } from '../../mock/clientProfiles';

export const SendQuoteModal = ({ isOpen, onClose, lead, onQuoteSent }) => {
  const { addToast } = useToast();
  const { addQuote } = useQuotes();
  const { addCallLog } = useClientProfiles();

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

  const handleSendQuote = (e) => {
    e.preventDefault();

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
                Lead: <strong className="text-white">{lead.id}</strong> • Source:{' '}
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

        {/* Form Body */}
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
              <label className="block font-bold text-slate-700 mb-1">Base Survey Fee (£ ex. VAT) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                <input
                  type="number"
                  step="10"
                  min="100"
                  required
                  value={baseFee}
                  onChange={(e) => setBaseFee(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Courtesy Discount (£)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                <input
                  type="number"
                  step="5"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Optional Extras */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Surveyor Add-Ons &amp; Extras
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300">
                <input
                  type="checkbox"
                  checked={droneInspection}
                  onChange={(e) => setDroneInspection(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB]"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Drone Roof Inspection (+£120)
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300">
                <input
                  type="checkbox"
                  checked={verbalDebrief}
                  onChange={(e) => setVerbalDebrief(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB]"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Same-Day Verbal Debrief (+£50)
                </span>
              </label>
            </div>
          </div>

          {/* SLA Turnaround */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Report Delivery SLA</label>
            <input
              type="text"
              value={turnaround}
              onChange={(e) => setTurnaround(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
            />
          </div>

          {/* Proposal Narrative */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Fee Proposal Notes</label>
            <textarea
              rows="2"
              value={proposalNotes}
              onChange={(e) => setProposalNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white"
            />
          </div>

          {/* Real-time Calculation Card */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-[#0B1F4D] text-white rounded-2xl space-y-1.5 shadow-md">
            <div className="flex justify-between text-slate-300 text-xs">
              <span>Net Survey Fee (ex. VAT):</span>
              <span className="font-mono">£{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300 text-xs">
              <span>UK VAT (20%):</span>
              <span className="font-mono">£{vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-white/20">
              <span className="text-white">Total Quoted Amount (inc. VAT):</span>
              <span className="font-mono text-amber-300 text-base">£{totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-slate-300 pt-1">
              • Submitting this proposal will automatically mark lead <strong className="text-white">{lead.id}</strong> as{' '}
              <strong className="text-amber-300">&quot;Quoted&quot;</strong> and create an active deal in the pipeline.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="send-quote-form"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Quote &amp; Mark as Quoted</span>
          </button>
        </div>
      </div>
    </div>
  );
};

