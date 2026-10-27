import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CalendarCheck,
  CreditCard,
  PenTool,
  CheckCircle2,
  Clock,
  MapPin,
  Download,
  Plus,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Phone,
  ArrowRight,
  Sparkles,
  Receipt,
  FileSpreadsheet,
  User,
  Building,
  Mail,
  AlertCircle,
  Check,
  Lock,
  ChevronRight,
  Send,
  MessageSquare,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/ToastContext';
import { Modal } from '../../components/common/Modal';

// ==========================================
// 1. TERMS TO SIGN (Document + Typed/Drawn Signature + Payment Screen UI)
// ==========================================
export const CustomerTermsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  // Workflow state: 'sign' | 'payment' | 'confirmed'
  const [stage, setStage] = useState('sign');

  // Sign Form State
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signatureType, setSignatureType] = useState('typed'); // 'typed' | 'drawn'
  const [typedName, setTypedName] = useState(user?.name || 'Emma Watson');

  // Canvas ref for drawn signature
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'apple' | 'bacs'
  const [cardDetails, setCardDetails] = useState({
    number: '•••• •••• •••• 4242',
    expiry: '12/28',
    cvc: '892',
    name: user?.name || 'Emma Watson',
    postcode: 'W1K 2PB',
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Canvas drawing handlers
  useEffect(() => {
    if (signatureType === 'drawn' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0B1F4D';
    }
  }, [signatureType]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const canSubmitSignature =
    agreedToTerms &&
    ((signatureType === 'typed' && typedName.trim().length > 2) ||
      (signatureType === 'drawn' && hasDrawn));

  // Handle "Sign & Continue" to Payment
  const handleSignAndContinue = () => {
    if (!canSubmitSignature) return;
    setStage('payment');
    addToast({
      type: 'success',
      title: 'Terms Digitally Signed',
      message: 'Signature recorded. Proceed to secure advance fee payment to confirm inspection slot.',
    });
  };

  // Handle Payment settlement
  const handleProcessPayment = (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setStage('confirmed');
      addToast({
        type: 'success',
        title: 'Payment Successful (£924.00)',
        message: 'Advance fee captured. Booking for 14 Mayfair Gate is officially confirmed & locked!',
      });
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Terms of Engagement & Fee Settlement"
        subtitle="Review statutory RICS Level 2 contract terms, digitally sign mandate, and settle advance invoice."
        breadcrumb={['Customer Portal', 'Terms to Sign']}
      />

      {/* STAGE 1: TERMS TO SIGN */}
      {stage === 'sign' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Document Header */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Contract Reference
              </span>
              <span className="font-mono text-sm font-black text-[#0B1F4D]">
                AGR-2026-081 • JOB-2026-080
              </span>
              <div className="text-xs text-slate-600 mt-1">
                Property: <strong>14 Mayfair Gate, London W1K 2PB</strong>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#0B1F4D] text-white">
                RICS Home Survey Level 2
              </span>
              <span className="text-[11px] font-mono text-slate-500 block mt-1">
                Version 2026.2 (RICS Mandated)
              </span>
            </div>
          </div>

          {/* Legal Document View Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Standard Terms of Engagement Document
            </h4>
            <div className="h-64 overflow-y-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed scrollbar-thin">
              <p className="font-bold text-slate-900">
                1. Scope of the RICS Home Survey Level 2 (with Valuation)
              </p>
              <p>
                1.1 The Chartered Surveyor will conduct a thorough visual inspection of the accessible interior and exterior building fabric, roof voids from safely placed 3-metre ladders, services, and grounds. Concealed or inaccessible areas cannot be examined without specialist opening up works.
              </p>
              <p>
                1.2 Dampness testing will be carried out using calibrated electrical resistance protimeters (WME %) across all accessible ground floor and basement perimeter walls.
              </p>
              <p className="font-bold text-slate-900">
                2. Professional Indemnity & Limitation of Liability
              </p>
              <p>
                2.1 UK Property Surveying Practice maintains full professional indemnity insurance cover underwritten by Royal & Sun Alliance plc, with a single-claim liability cap of £250,000 or the open-market property purchase price, whichever is lower.
              </p>
              <p className="font-bold text-slate-900">
                3. Gating Requirement & Payment Terms
              </p>
              <p>
                3.1 Pursuant to UK RICS regulatory compliance, on-site inspections remain in provisional hold and cannot be dispatched to field surveyors until both: (a) this digital agreement is executed, and (b) advance inspection fee is cleared in full.
              </p>
              <p className="font-bold text-slate-900">
                4. Statutory Cancellation Rights (Consumer Contracts Regulations 2013)
              </p>
              <p>
                4.1 You have a statutory right to cancel within 14 calendar days. By executing this agreement and requesting an inspection date within this period, you expressly request immediate performance of survey services.
              </p>
            </div>
          </div>

          {/* Tick-to-agree Box (Required by Prompt) */}
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-xs text-blue-950 font-medium leading-relaxed">
              <strong>I have read, understood, and accept</strong> the UK Property Surveying Practice Terms of Engagement (RICS Level 2 Standard v2026.2). I authorize UK Property Surveying Practice to proceed with key collection and on-site inspection.
            </span>
          </label>

          {/* Signature Method: Typed or Drawn (Required by Prompt) */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Digital Signature
              </span>
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSignatureType('typed')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    signatureType === 'typed'
                      ? 'bg-[#0B1F4D] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Type Signature
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureType('drawn')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    signatureType === 'drawn'
                      ? 'bg-[#0B1F4D] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Draw Signature
                </button>
              </div>
            </div>

            {/* Typed Signature */}
            {signatureType === 'typed' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Signer Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="e.g. Emma Watson"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:bg-white"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">Generated Digital Signature Style</span>
                  <div className="text-2xl font-serif italic font-bold text-[#0B1F4D] tracking-wide py-2">
                    {typedName || 'Your Name'}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Verified Digital Stamp • {new Date().toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            )}

            {/* Drawn Signature */}
            {signatureType === 'drawn' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Sign below with your mouse, trackpad, or stylus:</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear Signature
                  </button>
                </div>

                <div className="border border-slate-300 rounded-2xl bg-slate-50 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={160}
                    className="w-full h-40 bg-white cursor-crosshair touch-none"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky "Agree & Sign" Bar on Mobile */}
          <div className="sticky bottom-14 md:static z-20 bg-white/95 backdrop-blur-md p-3.5 -mx-6 -mb-6 sm:mx-0 sm:mb-0 sm:p-0 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
            <span className="text-xs text-slate-400 text-center sm:text-left">
              Step 1 of 2: Digital Execution
            </span>

            <button
              onClick={handleSignAndContinue}
              disabled={!canSubmitSignature}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] cursor-pointer ${
                canSubmitSignature
                  ? 'bg-[#0B1F4D] hover:bg-[#162E6E] text-white shadow-md shadow-[#0B1F4D]/25'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Sign & Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: PAYMENT SCREEN (UI ONLY) */}
      {stage === 'payment' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
                Step 2 of 2: Secure Fee Settlement
              </span>
              <h3 className="text-lg font-black text-[#0B1F4D]">
                Complete Advance Inspection Payment
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Terms Executed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Payment Form */}
            <div className="md:col-span-2 space-y-4">
              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-[#2563EB] bg-blue-50/60 text-[#0B1F4D] ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#2563EB]" />
                  <span>Debit / Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'apple'
                      ? 'border-[#2563EB] bg-blue-50/60 text-[#0B1F4D] ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>Apple / Google Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bacs')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'bacs'
                      ? 'border-[#2563EB] bg-blue-50/60 text-[#0B1F4D] ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-5 h-5 text-slate-600" />
                  <span>BACS Transfer</span>
                </button>
              </div>

              {/* Card inputs */}
              <form onSubmit={handleProcessPayment} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Name on Card</label>
                  <input
                    type="text"
                    required
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Card Number (Stripe UK)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">CVC / CVV</label>
                    <input
                      type="text"
                      required
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Billing Postcode</label>
                    <input
                      type="text"
                      required
                      value={cardDetails.postcode}
                      onChange={(e) => setCardDetails({ ...cardDetails, postcode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {isProcessingPayment ? 'Authorizing Payment...' : 'Pay £924.00 & Lock Inspection Slot'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right 1 Col: Order Summary */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <h5 className="font-bold text-[#0B1F4D] uppercase tracking-wider text-[11px]">
                Payment Invoice Summary
              </h5>

              <div className="space-y-1.5 font-mono text-[11px] pt-1">
                <div className="flex justify-between text-slate-600">
                  <span>Base Fee (Level 2):</span>
                  <span>£650.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Drone Roof Inspection:</span>
                  <span>+£120.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Same-Day Verbal Debrief:</span>
                  <span>+£50.00</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount Applied:</span>
                  <span>-£50.00</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                  <span>Subtotal ex VAT:</span>
                  <span>£770.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>UK VAT (20%):</span>
                  <span>£154.00</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#0B1F4D] pt-2 border-t border-slate-300">
                  <span>Gross Total Due:</span>
                  <span className="text-emerald-700">£924.00</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 text-[10px] text-slate-400 space-y-1">
                <div>• Merchant: UK Property Surveying Practice Ltd</div>
                <div>• 256-bit SSL Encrypted Payment</div>
                <div>• Instant VAT receipt dispatched to {user?.email || 'customer@demo.com'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: CONFIRMED */}
      {stage === 'confirmed' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-[#0B1F4D]">
              Inspection Confirmed & Locked!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your Terms of Engagement are executed and advance payment of £924.00 has been received in full.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Inspection Slot:</span>
              <span className="font-bold text-slate-900">Tuesday, 27 October 2026 (10:00 - 13:00)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Surveyor:</span>
              <span className="font-bold text-slate-900">David Thorne MRICS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Access Arrangement:</span>
              <span className="font-bold text-slate-900">Keys with Foxtons Mayfair</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => addToast({ type: 'success', title: 'Downloading PDF', message: 'Downloading executed terms PDF.' })}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Signed Terms (PDF)</span>
            </button>

            <button
              onClick={() => navigate('/customer/my-dashboard')}
              className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Return to My Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. MY BOOKINGS PAGE
// ==========================================
export const CustomerBookingsPage = () => {
  const navigate = useNavigate();

  const bookings = [
    {
      id: 'JOB-2026-080',
      property: '14 Mayfair Gate',
      location: 'Mayfair, London W1K 2PB',
      type: 'RICS Home Survey - Level 2 (with Valuation)',
      surveyor: 'David Thorne MRICS',
      date: '27/10/2026',
      timeSlot: '10:00 - 13:00',
      fee: '£924.00 (Paid)',
      status: 'In Progress',
      access: 'Keys with Foxtons Mayfair (Branch Ref #FX-402)',
    },
    {
      id: 'JOB-2025-412',
      property: '9 Chelsea Manor St',
      location: 'London SW3 5PU',
      type: 'Specific Structural Defect Survey',
      surveyor: 'Claire Bennet AssocRICS',
      date: '14/09/2025',
      timeSlot: '14:00 - 16:30',
      fee: '£550.00 (Paid)',
      status: 'Completed',
      access: 'Vendor present on site',
    },
    {
      id: 'JOB-2024-190',
      property: '22 Richmond Green',
      location: 'Richmond TW9 1LX',
      type: 'RICS Level 2 Survey',
      surveyor: 'David Thorne MRICS',
      date: '05/03/2024',
      timeSlot: '11:00 - 13:30',
      fee: '£595.00 (Paid)',
      status: 'Completed',
      access: 'Keys collected from Hamptons',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Survey Bookings"
        subtitle="Manage your property inspections, view surveyor access instructions, and review completed reports."
        breadcrumb={['Customer Portal', 'My Bookings']}
      />

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#2563EB] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0B1F4D]">
                  {booking.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    booking.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-[#2563EB]'
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900">
                {booking.property}, {booking.location}
              </h4>

              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                <span>Standard: <strong>{booking.type}</strong></span>
                <span>•</span>
                <span>Surveyor: <strong>{booking.surveyor}</strong></span>
                <span>•</span>
                <span>Fee: <strong>{booking.fee}</strong></span>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Access: {booking.access}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 shrink-0">
              <div className="text-right font-mono text-xs">
                <span className="font-bold text-slate-900 block">{booking.date}</span>
                <span className="text-slate-400">{booking.timeSlot}</span>
              </div>

              {booking.status === 'Completed' ? (
                <button
                  onClick={() => navigate('/customer/reports')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] cursor-pointer"
                >
                  View Final Report
                </button>
              ) : (
                <button
                  onClick={() => navigate('/customer/terms-to-sign')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#2563EB] text-xs font-bold hover:bg-blue-100 cursor-pointer"
                >
                  View Status
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. QUOTATIONS PAGE
// ==========================================
export const CustomerQuotationsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const quotes = [
    {
      ref: 'KQ-9042',
      property: '14 Mayfair Gate, London W1K 2PB',
      scope: 'RICS Level 2 Home Survey with Valuation',
      net: '£770.00',
      vat: '£154.00',
      total: '£924.00',
      validUntil: '20/11/2026',
      state: 'Accepted & Paid',
      isPaid: true,
    },
    {
      ref: 'KQ-9102',
      property: '33 Eaton Mews South, London SW1W',
      scope: 'RICS Level 3 Comprehensive Building Survey',
      net: '£1,450.00',
      vat: '£290.00',
      total: '£1,740.00',
      validUntil: '27/11/2026',
      state: 'Awaiting Decision',
      isPaid: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Survey Quotations"
        subtitle="Review transparent fixed-fee proposals in GBP, breakdown of inspection scope, and instant acceptance."
        breadcrumb={['Customer Portal', 'Quotations']}
      />

      <div className="space-y-4">
        {quotes.map((q) => (
          <div
            key={q.ref}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0B1F4D]">
                  {q.ref}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">{q.property}</h4>
                <span className="text-xs text-[#2563EB] font-semibold">{q.scope}</span>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-[#0B1F4D] font-mono block">
                  {q.total}
                </span>
                <span className="text-[11px] text-slate-400">Net {q.net} + 20% VAT</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">Quote valid until: <strong>{q.validUntil}</strong></span>

              {q.isPaid ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  ✓ {q.state}
                </span>
              ) : (
                <button
                  onClick={() => {
                    navigate('/customer/terms-to-sign');
                    addToast({ type: 'info', title: 'Quote Accepted', message: 'Proceed to sign terms.' });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Accept Quote & Proceed to Terms
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 4. INVOICES & PAYMENTS PAGE
// ==========================================
export const CustomerInvoicesPage = () => {
  const { addToast } = useToast();

  const invoices = [
    {
      invNo: 'INV-2026-904',
      date: '26/10/2026',
      property: '14 Mayfair Gate, London W1K',
      service: 'RICS Level 2 Home Survey',
      net: '£770.00',
      vat: '£154.00',
      total: '£924.00',
      status: 'Paid in Full',
      method: 'Stripe UK Card Settlement',
    },
    {
      invNo: 'INV-2025-412',
      date: '14/09/2025',
      property: '9 Chelsea Manor St, SW3',
      service: 'Specific Defect Survey',
      net: '£458.33',
      vat: '£91.67',
      total: '£550.00',
      status: 'Paid in Full',
      method: 'BACS Direct Debit',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Invoices & VAT Receipts"
        subtitle="Download official HMRC-compliant VAT invoices and view payment histories."
        breadcrumb={['Customer Portal', 'Invoices & Payments']}
      />

      <div className="space-y-4">
        {invoices.map((inv) => (
          <div
            key={inv.invNo}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#0B1F4D] bg-slate-100 px-2 py-0.5 rounded">
                  {inv.invNo}
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {inv.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{inv.property}</h4>
              <div className="text-xs text-slate-500 mt-0.5">
                {inv.service} • Method: {inv.method} • Date: {inv.date}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right font-mono">
                <span className="text-lg font-black text-[#0B1F4D] block">{inv.total}</span>
                <span className="text-[10px] text-slate-400">Net {inv.net} + VAT {inv.vat}</span>
              </div>

              <button
                onClick={() => addToast({ type: 'success', title: 'Receipt Download', message: `Downloaded VAT invoice ${inv.invNo}.` })}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#0B1F4D] text-slate-700 hover:text-white transition-colors cursor-pointer"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 5. REPORTS PAGE
// ==========================================
export const CustomerReportsPage = () => {
  const { addToast } = useToast();

  const reports = [
    {
      id: 'RPT-80',
      title: 'RICS_Level_2_Home_Survey_14_Mayfair_Gate.pdf',
      property: '14 Mayfair Gate, London W1K 2PB',
      date: '27/10/2026',
      size: '14.2 MB',
      surveyor: 'David Thorne MRICS',
      conditionRating: 'Green / Amber (Minor dampness identified)',
    },
    {
      id: 'RPT-79',
      title: 'RICS_Level_2_Survey_22_Richmond_Green.pdf',
      property: '22 Richmond Green, Richmond TW9 1LX',
      date: '14/09/2025',
      size: '12.8 MB',
      surveyor: 'Claire Bennet AssocRICS',
      conditionRating: 'Clean Bill of Health',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Survey Reports"
        subtitle="Access your finalized, peer-reviewed RICS home survey and valuation documents."
        breadcrumb={['Customer Portal', 'Reports']}
      />

      <div className="space-y-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{r.property}</h4>
                <span className="text-xs text-slate-500 font-mono block mt-0.5">{r.title}</span>
                <div className="text-[11px] text-slate-500 mt-1">
                  Surveyor: <strong>{r.surveyor}</strong> • Date: {r.date} • Size: {r.size}
                </div>
              </div>
            </div>

            <button
              onClick={() => addToast({ type: 'success', title: 'Downloading Report', message: `Downloading ${r.title}` })}
              className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 6. MY DETAILS PAGE
// ==========================================
export const CustomerDetailsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState({
    name: user?.name || 'Emma Watson',
    email: user?.email || 'customer@demo.com',
    phone: '+44 7700 900147',
    address: 'Flat 4, 12 Gloucester Road',
    city: 'London',
    postcode: 'SW7 4RB',
  });

  const handleSave = (e) => {
    e.preventDefault();
    addToast({ type: 'success', title: 'Details Updated', message: 'Your contact and billing details have been saved.' });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <PageHeader
        title="My Client Details"
        subtitle="Manage your personal contact info, telephone, and invoice billing address."
        breadcrumb={['Customer Portal', 'My Details']}
      />

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={profile.email}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">City</label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Postcode</label>
            <input
              type="text"
              value={profile.postcode}
              onChange={(e) => setProfile({ ...profile, postcode: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase text-slate-900"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0B1F4D] text-white text-xs font-bold rounded-xl hover:bg-[#162E6E] cursor-pointer"
          >
            Save Profile Details
          </button>
        </div>
      </form>
    </div>
  );
};

// ==========================================
// 7. SUPPORT PAGE
// ==========================================
export const CustomerSupportPage = () => {
  const { addToast } = useToast();
  const [ticketMessage, setTicketMessage] = useState('');

  const handleSendTicket = (e) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;
    addToast({ type: 'success', title: 'Support Ticket Dispatched', message: 'Our operations team has received your inquiry.' });
    setTicketMessage('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Customer Support & Survey Inquiries"
        subtitle="Speak directly with our survey dispatch desk or message your assigned chartered surveyor."
        breadcrumb={['Customer Portal', 'Support']}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2563EB]" />
              <span>Send a Message to Support</span>
            </h4>

            <form onSubmit={handleSendTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <option>Query regarding 14 Mayfair Gate inspection</option>
                  <option>Request update on report delivery ETA</option>
                  <option>Request phone call with David Thorne MRICS</option>
                  <option>Billing / VAT receipt inquiry</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Details</label>
                <textarea
                  rows="4"
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Type your question or specific instructions for our surveying team..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] text-white font-bold text-xs hover:bg-[#162E6E] cursor-pointer"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <h4 className="font-bold text-[#0B1F4D]">Direct Contact</h4>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Telephone</span>
                <span className="font-bold text-slate-900">+44 20 7946 0900</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Mon–Fri, 08:30 – 18:00</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Email</span>
                <span className="font-bold text-[#2563EB]">support@propertygroup.co.uk</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Office</span>
                <span className="font-bold text-slate-900 block">UK Property Surveying Practice</span>
                <span className="text-slate-500">45 Berkeley Square, Mayfair, London W1J 5AS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
