import React, { useState } from 'react';
import { CreditCard, PoundSterling, Building, Calendar, CheckCircle2, FileText, Download } from 'lucide-react';
import { Modal } from '../common/Modal';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';
import { useToast } from '../ToastContext';

export const RecordBacsPaymentModal = ({
  isOpen,
  onClose,
  record, // can be a quote or a job
  onPaymentRecorded,
}) => {
  const { addToast } = useToast();

  const clientName = record?.client || record?.customer || 'Client';
  const property = record?.property || 'UK Property';
  const totalAmount = record?.totalAmount || (record?.quote?.baseFee ? record.quote.baseFee * 1.2 : 924.0);
  const vatAmount = record?.vatAmount || totalAmount * (0.2 / 1.2);
  const baseFee = totalAmount - vatAmount;
  const invoiceNo = record?.invoiceNo || `INV-2026-${Math.floor(100 + Math.random() * 900)}`;

  const [reference, setReference] = useState(
    `BACS-${Math.floor(10000 + Math.random() * 90000)}-${clientName.split(' ')[0].toUpperCase()}`
  );
  const [bankAccount, setBankAccount] = useState('Barclays NJS Client Escrow (20-45-77 / 83920194)');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [notes, setNotes] = useState('Direct bank transfer verified on online banking. Cleared in full.');

  if (!isOpen || !record) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Generate real HMRC VAT Invoice PDF
    downloadInvoicePDF({
      invoiceNo: invoiceNo,
      date: date,
      clientName: clientName,
      property: property,
      surveyType: record?.surveyType || 'RICS Level 2 Home Survey',
      baseFee: baseFee,
      vatAmount: vatAmount,
      totalAmount: totalAmount,
      paymentMethod: `BACS Faster Payments (${reference})`,
    });

    // 2. Call parent callback
    if (onPaymentRecorded) {
      onPaymentRecorded({
        reference,
        bankAccount,
        date,
        amount: totalAmount,
        notes,
      });
    }

    addToast({
      type: 'success',
      title: 'BACS Payment Confirmed',
      message: `£${totalAmount.toFixed(2)} recorded for ${clientName}. HMRC VAT Receipt downloaded.`,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Offline BACS Bank Settlement"
      subtitle="Manually confirm incoming direct bank transfer / BACS payment and generate official HMRC VAT receipt."
      maxWidth="max-w-lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="bacs-payment-form"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Settlement (£{totalAmount.toFixed(2)})</span>
          </button>
        </>
      }
    >
      <form id="bacs-payment-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Instruction Summary */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">{clientName}</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              £{totalAmount.toFixed(2)} (inc VAT)
            </span>
          </div>
          <p className="text-slate-500 text-[11px] truncate">{property}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
            <span>Net: £{baseFee.toFixed(2)} + 20% VAT: £{vatAmount.toFixed(2)}</span>
            <span className="font-mono">{invoiceNo}</span>
          </div>
        </div>

        {/* Bank Account Selection */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Receiving Bank Account
          </label>
          <select
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="Barclays NJS Client Escrow (20-45-77 / 83920194)">
              Barclays NJS Client Escrow (20-45-77 / 83920194)
            </option>
            <option value="NatWest Operations (60-12-34 / 19482012)">
              NatWest Operations (60-12-34 / 19482012)
            </option>
          </select>
        </div>

        {/* BACS Reference & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              BACS / Faster Pay Reference *
            </label>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Payment Cleared Date
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        {/* Internal Audit Note */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Settlement Audit Note
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Real PDF receipt notice */}
        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-[11px]">
          <Download className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Clicking confirm will automatically generate and download an authentic HMRC VAT receipt PDF.</span>
        </div>
      </form>
    </Modal>
  );
};

