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
  Compass,
  CalendarDays,
  UserCheck,
  Star,
  History,
  Paperclip,
  Image,
  Award,
  CheckCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/ToastContext';
import { Modal } from '../../components/common/Modal';
import { SurveyProgressTracker } from '../../components/customer/SurveyProgressTracker';
import { downloadTermsPDF, downloadInvoicePDF, downloadReportPDF } from '../../utils/pdfGenerator';
import { useMessages } from '../../mock/messages';

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

  const handleSignSubmit = (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      addToast({
        type: 'error',
        title: 'Consent Required',
        message: 'Please confirm you have read and agreed to the RICS terms of engagement.',
      });
      return;
    }

    if (signatureType === 'typed' && !typedName.trim()) {
      addToast({
        type: 'error',
        title: 'Signature Required',
        message: 'Please type your full legal name to execute the agreement.',
      });
      return;
    }

    if (signatureType === 'drawn' && !hasDrawn) {
      addToast({
        type: 'error',
        title: 'Signature Required',
        message: 'Please draw your digital signature in the box provided.',
      });
      return;
    }

    addToast({
      type: 'success',
      title: 'Agreement Digitally Executed',
      message: 'Your Terms of Engagement have been cryptographically stamped and registered.',
    });
    setStage('payment');
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setStage('confirmed');
      addToast({
        type: 'success',
        title: 'Advance Payment Successful',
        message: 'Stripe transaction authorized. Your inspection slot is officially locked.',
      });
    }, 1200);
  };

  const handleDownloadSignedPDF = () => {
    let signatureVal = typedName;
    if (signatureType === 'drawn' && canvasRef.current) {
      try {
        signatureVal = canvasRef.current.toDataURL('image/png');
      } catch {
        signatureVal = typedName;
      }
    }

    downloadTermsPDF({
      jobNo: 'JOB-2026-080',
      clientName: user?.name || typedName,
      property: '14 Mayfair Gate, London W1K 2PB',
      surveyType: 'RICS Level 2 Home Survey',
      signatureType,
      signatureValue: signatureVal,
    });

    addToast({
      type: 'success',
      title: 'Downloading PDF',
      message: 'Generating your signed Terms of Engagement agreement.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Terms of Engagement & Digital Signature"
        subtitle="Review your RICS survey instruction contract, digitally execute your agreement, and settle your booking deposit."
        breadcrumb={['Customer Portal', 'Terms to Sign']}
      />

      {/* Progress Stepper for Stage */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs text-xs font-semibold">
        <div className={`flex items-center gap-2 ${stage === 'sign' ? 'text-[#0B1F4D] font-bold' : 'text-emerald-700'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${stage === 'sign' ? 'bg-[#0B1F4D] text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            {stage === 'sign' ? '1' : <Check className="w-3.5 h-3.5" />}
          </div>
          <span>1. Review & Sign Terms</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-2 ${stage === 'payment' ? 'text-[#0B1F4D] font-bold' : stage === 'confirmed' ? 'text-emerald-700' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${stage === 'payment' ? 'bg-[#0B1F4D] text-white' : stage === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
            {stage === 'confirmed' ? <Check className="w-3.5 h-3.5" /> : '2'}
          </div>
          <span>2. Payment & Invoice</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-2 ${stage === 'confirmed' ? 'text-[#0B1F4D] font-bold' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${stage === 'confirmed' ? 'bg-[#0B1F4D] text-white' : 'bg-slate-100 text-slate-500'}`}>
            3
          </div>
          <span>3. Booking Locked</span>
        </div>
      </div>

      {/* STAGE 1: SIGN */}
      {stage === 'sign' && (
        <form onSubmit={handleSignSubmit} className="space-y-6">
          {/* Instruction Summary */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">
                  Private Client Instruction
                </span>
                <h3 className="text-lg font-black text-[#0B1F4D] mt-1">
                  14 Mayfair Gate, Mayfair, London W1K 2PB
                </h3>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-xs text-slate-500 block">Agreed Survey Fee</span>
                <span className="text-xl font-black text-[#0B1F4D]">£924.00</span>
                <span className="text-[10px] text-slate-400 block">(£770.00 + 20% UK VAT)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Service Level</span>
                <strong className="text-slate-900">RICS Level 2 Survey</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Lead Surveyor</span>
                <strong className="text-slate-900">David Thorne MRICS</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Appointment Slot</span>
                <strong className="text-slate-900">27 Oct, 10:00 - 13:00</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Turnaround Time</span>
                <strong className="text-slate-900">48 Hours post-visit</strong>
              </div>
            </div>
          </div>

          {/* Legal Scrollable Contract Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <h4 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#2563EB]" />
              <span>RICS Standard Letter of Engagement (Professional Standard)</span>
            </h4>

            <div className="h-64 overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-3 leading-relaxed font-sans">
              <p className="font-bold text-slate-900">
                1. Scope of the RICS Home Survey (Level 2)
              </p>
              <p>
                NJS Property Group agrees to carry out a physical visual inspection of 14 Mayfair Gate, London W1K 2PB in accordance with the current RICS Home Survey Standard (Professional Standard, UK). The surveyor is a qualified Chartered Surveyor (MRICS) registered with the Royal Institution of Chartered Surveyors.
              </p>
              <p>
                The inspection examines accessible internal and external surfaces. We do not lift fitted carpets, remove floorboards, or force entry into sealed roof voids. Specialist services (gas, electrics, drainage) are inspected visually for observable signs of defects and appropriate testing will be recommended where warranted.
              </p>
              <p className="font-bold text-slate-900">
                2. Fees, Cancellation & Refunds
              </p>
              <p>
                The total fixed fee of £924.00 (inclusive of VAT) is payable upon execution of these terms. Under the Consumer Contracts Regulations 2013, you hold a 14-day statutory right of cancellation. If the inspection takes place within this period with your agreement, cancellation within 24 hours of the booked slot will incur a 50% survey cancellation charge.
              </p>
              <p className="font-bold text-slate-900">
                3. Liability & Professional Indemnity
              </p>
              <p>
                NJS Property Group maintains comprehensive Professional Indemnity Insurance with an aggregate indemnity limit of £5,000,000. Our liability is restricted to the instructing client and cannot be relied upon by third parties or mortgage lenders without written consent.
              </p>
              <p className="font-bold text-slate-900">
                4. Complaints Handling & RICS Regulation
              </p>
              <p>
                We operate a formal Complaints Handling Procedure approved by the RICS. In the event of an unresolved dispute, clients are entitled to refer the matter to the Property Ombudsman.
              </p>
            </div>

            {/* Agreement Checkbox */}
            <label className="flex items-start gap-3 p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#0B1F4D] focus:ring-[#0B1F4D]"
              />
              <span className="text-xs text-slate-700 leading-normal">
                I confirm that I am the instructing client, have read the full RICS Letter of Engagement clauses above, and agree to be legally bound by these terms.
              </span>
            </label>
          </div>

          {/* Signature Selection Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#2563EB]" />
                <span>Execute Digital Signature</span>
              </h4>

              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setSignatureType('typed')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    signatureType === 'typed'
                      ? 'bg-white text-[#0B1F4D] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Type Full Name
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureType('drawn')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    signatureType === 'drawn'
                      ? 'bg-white text-[#0B1F4D] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Draw Signature
                </button>
              </div>
            </div>

            {signatureType === 'typed' ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600">
                  Type your full legal name below:
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. Emma Watson"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-serif text-lg text-[#0B1F4D] focus:ring-2 focus:ring-[#0B1F4D] focus:border-transparent"
                />
                <span className="text-[11px] text-slate-400 block">
                  Preview: <span className="font-serif italic font-bold text-slate-800">{typedName}</span> (Legally binding under Electronic Communications Act 2000)
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600">
                    Use mouse, trackpad, or finger to sign in the box below:
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear Box
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-white overflow-hidden touch-none relative">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-36 cursor-crosshair"
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs italic">
                      Sign here ✍️
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Timestamp: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="font-mono text-slate-400">IP: 86.142.19.104 (Audit Logged)</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Sign Agreement & Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STAGE 2: PAYMENT */}
      {stage === 'payment' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-[#0B1F4D] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#2563EB]" />
                  <span>Secure Payment Gateway (Stripe)</span>
                </h3>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                  256-Bit SSL Encrypted
                </span>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === 'card'
                      ? 'border-[#0B1F4D] bg-blue-50/50 text-[#0B1F4D]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#2563EB]" />
                  <span>Debit / Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === 'apple'
                      ? 'border-[#0B1F4D] bg-blue-50/50 text-[#0B1F4D]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-sans font-black text-sm"> Pay</span>
                  <span>Apple Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bacs')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === 'bacs'
                      ? 'border-[#0B1F4D] bg-blue-50/50 text-[#0B1F4D]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>BACS Transfer</span>
                </button>
              </div>

              {/* Card Form */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">CVC Code</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                      placeholder="892"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Postcode</label>
                  <input
                    type="text"
                    value={cardDetails.postcode}
                    onChange={(e) => setCardDetails({ ...cardDetails, postcode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authorizing with Bank...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay £924.00 & Confirm Booking</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Summary */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4 text-xs">
              <h4 className="font-bold text-[#0B1F4D] pb-2 border-b border-slate-100">
                Order Breakdown
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>RICS Level 2 Survey:</span>
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
                <div>• Merchant: NJS Property Group Ltd</div>
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
              <span className="font-bold text-emerald-700">Arranged Directly with Estate Agent</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={handleDownloadSignedPDF}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-[#0B1F4D]" />
              <span>Download Signed Terms (PDF)</span>
            </button>

            <button
              onClick={() => navigate('/customer/track-my-survey')}
              className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              Track Live Survey Progress
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
      statusClass: 'bg-blue-50 text-[#2563EB] border-blue-200',
    },
    {
      id: 'JOB-2026-082',
      property: '12 Pembroke Square',
      location: 'Kensington, London W8 6PA',
      type: 'RICS Building Survey - Level 3',
      surveyor: 'Oliver Hughes MRICS',
      date: '29/10/2026',
      timeSlot: '09:30 - 13:00',
      fee: '£1,450.00 (Pending)',
      status: 'Awaiting Signature & Payment',
      statusClass: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Booked Surveys"
        subtitle="View your confirmed property appointments, assigned surveyors, and active inspections."
        breadcrumb={['Customer Portal', 'My Bookings']}
      />

      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${b.statusClass}`}>
                  {b.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">Ref: {b.id}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{b.property}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{b.location}</span>
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                <span>Service: <strong>{b.type}</strong></span>
                <span>Surveyor: <strong>{b.surveyor}</strong></span>
                <span>Date: <strong>{b.date} ({b.timeSlot})</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                onClick={() => navigate('/customer/appointment-details')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Access Details
              </button>

              {/* Fix for Point 7: View Status properly navigates to 10-Stage Tracker */}
              <button
                onClick={() => navigate('/customer/track-my-survey')}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold hover:bg-[#162E6E] transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>View Status (Tracker)</span>
              </button>
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

  const quotes = [
    {
      id: 'QUO-802',
      property: '12 Pembroke Square, Kensington W8',
      surveyType: 'RICS Building Survey (Level 3)',
      net: '£1,450.00',
      vat: '£290.00',
      total: '£1,740.00',
      date: '28/10/2026',
      status: 'Open Proposal',
      validUntil: '14 Days Remaining',
    },
    {
      id: 'QUO-791',
      property: '14 Mayfair Gate, London W1K 2PB',
      surveyType: 'RICS Home Survey (Level 2)',
      net: '£770.00',
      vat: '£154.00',
      total: '£924.00',
      date: '24/10/2026',
      status: 'Accepted & Executed',
      validUntil: 'Confirmed',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Quotations & Fixed Fee Proposals"
        subtitle="Review official transparent quotations issued under the NJS Property Group rate cards."
        breadcrumb={['Customer Portal', 'Quotations']}
      />

      <div className="space-y-4">
        {quotes.map((q) => (
          <div
            key={q.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  q.status === 'Accepted & Executed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-[#2563EB]'
                }`}>
                  {q.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">Ref: {q.id}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{q.property}</h4>
              <p className="text-xs text-slate-500">{q.surveyType} • Issued {q.date} • {q.validUntil}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xl font-black text-[#0B1F4D] block">{q.total}</span>
                <span className="text-[10px] text-slate-400">Net {q.net} + VAT</span>
              </div>

              {q.status === 'Open Proposal' ? (
                <button
                  onClick={() => navigate('/customer/terms-to-sign')}
                  className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Accept & Sign Terms
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  Accepted
                </span>
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
  const { user } = useAuth();
  const { addToast } = useToast();

  const invoices = [
    {
      invNo: 'INV-2026-9042',
      jobRef: 'JOB-2026-080',
      property: '14 Mayfair Gate, London W1K 2PB',
      service: 'RICS Home Survey - Level 2',
      date: '26/10/2026',
      net: '£770.00',
      vat: '£154.00',
      total: '£924.00',
      status: 'Paid',
      method: 'Stripe Card (•••• 4242)',
    },
  ];

  const handleDownloadInvoice = (inv) => {
    downloadInvoicePDF({
      invoiceNo: inv.invNo,
      jobNo: inv.jobRef,
      clientName: user?.name || 'Emma Watson',
      property: inv.property,
      paymentMethod: inv.method,
    });
    addToast({
      type: 'success',
      title: 'Invoice Downloaded',
      message: `Downloaded VAT invoice ${inv.invNo}.`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Invoices & VAT Receipts"
        subtitle="Download official HMRC-compliant VAT receipts and inspect settled client payments."
        breadcrumb={['Customer Portal', 'Invoices & Payments']}
      />

      <div className="space-y-4">
        {invoices.map((inv) => (
          <div
            key={inv.invNo}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Status: {inv.status}
                </span>
                <span className="text-xs font-mono font-bold text-slate-800">{inv.invNo}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{inv.property}</h4>
              <div className="text-xs text-slate-500">
                {inv.service} • Method: {inv.method} • Date: {inv.date}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right font-mono">
                <span className="text-lg font-black text-[#0B1F4D] block">{inv.total}</span>
                <span className="text-[10px] text-slate-400">Net {inv.net} + VAT {inv.vat}</span>
              </div>

              {/* Real PDF Download trigger */}
              <button
                onClick={() => handleDownloadInvoice(inv)}
                className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                title="Download VAT Invoice PDF"
              >
                <Download className="w-4 h-4" />
                <span>Download VAT Invoice</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 5. REPORTS PAGE (Real PDF + Sample Reports)
// ==========================================
export const CustomerReportsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const reports = [
    {
      id: 'RPT-80',
      title: 'RICS_Level_2_Home_Survey_14_Mayfair_Gate.pdf',
      property: '14 Mayfair Gate, London W1K 2PB',
      date: '27/10/2026',
      size: '14.2 MB',
      surveyor: 'David Thorne MRICS',
      conditionRating: 'Condition 1 & 2 (Minor skirting dampness noted)',
    },
  ];

  const handleDownloadReport = (r) => {
    downloadReportPDF({
      jobNo: 'JOB-2026-080',
      clientName: user?.name || 'Emma Watson',
      property: r.property,
      surveyorName: r.surveyor,
    });
    addToast({
      type: 'success',
      title: 'Report Downloaded',
      message: `Downloaded official RICS report for ${r.property}`,
    });
  };

  const handleDownloadSample = (level) => {
    downloadReportPDF({
      jobNo: `SAMPLE-LVL-${level}`,
      clientName: 'Sample Client (Anonymised)',
      property: level === 2 ? '14 Mayfair Gate, London W1K' : '24 Kensington Palace Gardens, London W8',
      surveyType: level === 2 ? 'RICS Level 2 Home Survey' : 'RICS Level 3 Building Survey',
      surveyorName: level === 2 ? 'David Thorne MRICS' : 'Oliver Hughes MRICS',
    });
    addToast({
      type: 'success',
      title: 'Sample Downloaded',
      message: `Downloaded anonymised RICS Level ${level} Sample Survey Report.`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Survey Reports"
        subtitle="Access your finalized, peer-reviewed RICS home survey and valuation documents."
        breadcrumb={['Customer Portal', 'My Reports']}
      />

      <div className="space-y-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 shrink-0">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Certified Final RICS Report
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">{r.property}</h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  Lead Surveyor: <strong>{r.surveyor}</strong> • Inspected: {r.date}
                </div>
                <div className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  Rating Summary: <strong>{r.conditionRating}</strong>
                </div>
              </div>
            </div>

            {/* Real PDF Download trigger */}
            <button
              onClick={() => handleDownloadReport(r)}
              className="px-5 py-3 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Report (PDF)</span>
            </button>
          </div>
        ))}
      </div>

      {/* Point 23 from Client PDF: Sample Survey Reports Section */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wider">
            Sample RICS Reports for Reference
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Want to see how our comprehensive condition ratings and defect descriptions look? Download anonymised sample reports below.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Sample Level 2 Home Survey</h4>
              <p className="text-[11px] text-slate-500">Standard residential condition report with condition ratings</p>
            </div>
            <button
              onClick={() => handleDownloadSample(2)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#0B1F4D]" />
              <span>PDF</span>
            </button>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Sample Level 3 Building Survey</h4>
              <p className="text-[11px] text-slate-500">In-depth structural appraisal for period or altered properties</p>
            </div>
            <button
              onClick={() => handleDownloadSample(3)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#0B1F4D]" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. TRACK MY SURVEY PAGE (Dedicated 10-Stage Tracker)
// ==========================================
export const CustomerTrackSurveyPage = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Track My Survey Progress"
        subtitle="Follow the step-by-step lifecycle of your property survey from booking to report delivery."
        breadcrumb={['Customer Portal', 'Track My Survey']}
      />

      <SurveyProgressTracker currentStep={7} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            <span>Inspection Diary & Milestones</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950 block">Stage 7: On-Site Inspection Completed</strong>
                <span className="text-emerald-800 text-[11px]">
                  David Thorne MRICS concluded physical inspection at 14 Mayfair Gate on 27/10/2026, 12:45. Key access concluded and site secured.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-950 block">Stage 8: Report Drafting & Analysis (Current)</strong>
                <span className="text-blue-800 text-[11px]">
                  Surveyor is presently compiling defect findings, calculating rebuild costs, and preparing condition ratings 1 to 3.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl opacity-75">
              <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Stage 9: Quality Assurance & Lead Surveyor Sign-off</strong>
                <span className="text-slate-600 text-[11px]">
                  Expected completion by 28/10/2026, 10:30.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-[#0B1F4D]">Property Reference</h4>
            <div className="space-y-1.5 text-slate-600">
              <div className="text-slate-900 font-bold">14 Mayfair Gate</div>
              <div>Mayfair, London W1K 2PB</div>
              <div className="pt-2 border-t border-slate-100 text-[11px]">
                Ref: <strong>JOB-2026-080</strong>
              </div>
              <div className="text-[11px]">
                Surveyor: <strong>David Thorne MRICS</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. APPOINTMENT DETAILS PAGE
// ==========================================
export const CustomerAppointmentDetailsPage = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Appointment Details"
        subtitle="Specific timing, inspection window, and surveyor details for your survey."
        breadcrumb={['Customer Portal', 'Appointment Details']}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#0B1F4D]">Confirmed Time Slot</h3>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-xs space-y-2">
            <div className="text-lg font-black text-[#0B1F4D]">Tuesday, 27 October 2026</div>
            <div className="text-slate-700 font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span>10:00 AM – 13:00 PM</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              The surveyor conducts a meticulous 2 to 3 hour inspection including loft voids, subfloors, and grounds.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Service:</span>
              <span className="font-bold text-slate-900">RICS Level 2 Home Survey</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Surveyor:</span>
              <span className="font-bold text-[#0B1F4D]">David Thorne MRICS</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Booking Status:</span>
              <span className="font-bold text-emerald-700">Confirmed & Scheduled</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-[#0B1F4D]">Property Access Coordination</h3>
          </div>

          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-emerald-950">Arranged Directly with Selling Agent</span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-relaxed pt-1">
              Our chartered surveyor coordinates access logistics directly with the estate agency and keyholder prior to arrival.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Access Arrangement:</span>
              <span className="font-bold text-slate-800">Direct Surveyor Coordination</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Client Attendance:</span>
              <span className="font-bold text-emerald-700">Not Required (Zero Hassle)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Key & Entry Protocols:</span>
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Restricted to Surveyor & Selling Agent</span>
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
            <strong>Security Notice:</strong> In compliance with UK property vendor security standards, internal key tags and private building entry codes are restricted exclusively to the assigned RICS surveyor. You do not need to attend in person.
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. ASSIGNED SURVEYOR PAGE
// ==========================================
export const CustomerAssignedSurveyorPage = () => {
  const { addToast } = useToast();

  const handleRequestCall = () => {
    addToast({
      type: 'success',
      title: 'Call Request Logged',
      message: 'David Thorne MRICS will contact you today between 16:00 and 17:30.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Assigned Chartered Surveyor"
        subtitle="Meet the certified RICS professional conducting your inspection."
        breadcrumb={['Customer Portal', 'Assigned Surveyor']}
      />

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
            alt="David Thorne MRICS"
            className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
          />

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B1F4D] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                RICS Regulated Member #089421
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Verified Credentials
              </span>
            </div>

            <h3 className="text-xl font-black text-[#0B1F4D]">David Thorne MRICS</h3>
            <p className="text-xs text-slate-500">Chartered Valuation & Residential Building Surveyor</p>
            <p className="text-xs text-slate-600 pt-1">
              18+ years experience in central London residential properties, Victorian conversions, and period defect diagnoses.
            </p>
          </div>

          <button
            onClick={handleRequestCall}
            className="px-4 py-2.5 bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Request Surveyor Call
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Accreditation</span>
            <strong className="text-slate-900 block mt-0.5">MRICS Chartered Surveyor</strong>
            <span className="text-[11px] text-slate-500">Royal Institution of Chartered Surveyors</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Insurance Cover</span>
            <strong className="text-slate-900 block mt-0.5">£5,000,000 PII Cover</strong>
            <span className="text-[11px] text-slate-500">Full Professional Indemnity</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Territory Focus</span>
            <strong className="text-slate-900 block mt-0.5">London (West End, Mayfair, SW)</strong>
            <span className="text-[11px] text-slate-500">Local Area Specialist</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. MESSAGES PAGE (Direct 2-Way Chat with Admin)
// ==========================================
export const CustomerMessagesPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { conversations, sendMessage, markAsRead } = useMessages();

  // Find active conversation for current customer
  const currentConv = conversations.find(
    (c) => c.clientEmail === user?.email || c.id === 'conv-1'
  ) || conversations[0];

  const messages = currentConv?.messages || [];
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    if (currentConv?.id) {
      markAsRead(currentConv.id, 'client');
    }
  }, [currentConv?.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const textToSend = inputMessage;
    setInputMessage('');

    sendMessage(
      currentConv?.id || 'conv-1',
      textToSend,
      user?.name || 'Emma Watson',
      'client'
    );

    addToast({
      type: 'success',
      title: 'Message Sent to NJS Desk',
      message: 'Your query has been dispatched to operations (info@njspropertygroup.com).',
    });

    // Point 20 Messaging Automation: Simulated auto-acknowledgement if it was first customer response
    if (messages.filter(m => m.role === 'client').length === 0) {
      setTimeout(() => {
        sendMessage(
          currentConv?.id || 'conv-1',
          'Thank you for your message. An NJS property coordinator has received your query and will respond shortly.',
          'NJS Automated Coordinator',
          'admin'
        );
      }, 1200);
    }
  };

  const handleAttach = () => {
    addToast({
      type: 'info',
      title: 'Attachment Upload',
      message: 'Photograph / document attached to your enquiry.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Direct Messages"
        subtitle="Chat directly with the NJS Property Group administration desk regarding your instruction."
        breadcrumb={['Customer Portal', 'Messages']}
      />

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0B1F4D] text-white flex items-center justify-center font-bold text-xs">
              NJS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">NJS Operations Desk</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-700 font-semibold">Online</span>
              </div>
              <p className="text-[10px] text-slate-500">Instruction: 14 Mayfair Gate (JOB-2026-080)</p>
            </div>
          </div>

          <span className="text-[11px] text-slate-400">Replies within ~15 mins</span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          {messages.map((m) => {
            const isMe = m.role === 'client';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 mb-0.5 px-1">{m.sender}</span>
                <div
                  className={`max-w-[78%] p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#0B1F4D] text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.time}</span>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <button
            type="button"
            onClick={handleAttach}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
            title="Attach property photograph or document"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message or special instruction for our team..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B1F4D] focus:outline-none"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-[#0B1F4D] hover:bg-[#162E6E] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 10. LEAVE A REVIEW PAGE (Trustpilot Integration)
// ==========================================
export const CustomerReviewPage = () => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const { addToast } = useToast();

  const handleOpenTrustpilot = () => {
    addToast({
      type: 'success',
      title: 'Opening Trustpilot',
      message: 'Redirecting to the verified NJS Property Group Trustpilot profile.',
    });
    window.open('https://www.trustpilot.com/review/njspropertygroup.com', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <PageHeader
        title="Leave Us a Review"
        subtitle="Share your genuine feedback on our surveying service to help fellow home buyers."
        breadcrumb={['Customer Portal', 'Leave a Review']}
      />

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
          <span>Trustpilot Verified Partner • Rated 4.9 / 5.0</span>
        </div>

        <div>
          <h3 className="text-xl font-black text-[#0B1F4D]">
            How was your experience with NJS Property Group?
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Your review regarding the Level 2 Survey at 14 Mayfair Gate helps us maintain our high RICS quality standards.
          </p>
        </div>

        {/* Interactive Star Picker */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
            >
              <Star
                className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
              />
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-600 font-bold">
          {rating === 5 ? 'Excellent ★★★★★' : `${rating} Stars Selected`}
        </div>

        <textarea
          rows={3}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Briefly describe the turnaround speed, surveyor thoroughness, or report clarity..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800"
        />

        <div className="pt-2">
          <button
            onClick={handleOpenTrustpilot}
            className="px-6 py-3.5 bg-[#00B67A] hover:bg-[#009E6B] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-white" />
            <span>Submit Review on Trustpilot</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-slate-400 block mt-2">
            Opens genuine NJS Property Group review page: trustpilot.com/review/njspropertygroup.com
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 11. PREVIOUS SURVEYS PAGE (Archived History)
// ==========================================
export const CustomerPreviousSurveysPage = () => {
  const { addToast } = useToast();

  const pastSurveys = [
    {
      id: 'JOB-2025-042',
      property: '22 Richmond Green, Richmond TW9 1LX',
      type: 'RICS Level 2 Home Survey',
      date: '14/09/2025',
      surveyor: 'Claire Bennet AssocRICS',
      fee: '£650.00',
      status: 'Completed & Archived',
    },
  ];

  const handleDownloadOldReport = (s) => {
    downloadReportPDF({
      jobNo: s.id,
      clientName: 'Emma Watson',
      property: s.property,
      surveyType: s.type,
      surveyorName: s.surveyor,
      inspectionDate: s.date,
    });
    addToast({
      type: 'success',
      title: 'Historical Report Downloaded',
      message: `Downloaded archived survey for ${s.property}`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Previous Surveys & Archives"
        subtitle="Historical property inspections and past reports associated with your client account."
        breadcrumb={['Customer Portal', 'Previous Surveys']}
      />

      <div className="space-y-4">
        {pastSurveys.map((s) => (
          <div
            key={s.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {s.status}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{s.property}</h4>
              <p className="text-xs text-slate-500">
                {s.type} • Surveyor: {s.surveyor} • Completed {s.date}
              </p>
            </div>

            <button
              onClick={() => handleDownloadOldReport(s)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-[#0B1F4D] text-slate-800 hover:text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Archive PDF</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 12. MY DETAILS PAGE
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
// 13. SUPPORT PAGE
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
                <span className="font-bold text-slate-900">020 8947 8840</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Mon–Fri, 08:30 – 18:00</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Email</span>
                <span className="font-bold text-[#2563EB]">info@njspropertygroup.com</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">RICS Regulated Office</span>
                <span className="font-bold text-slate-900 block">NJS Property Group</span>
                <span className="text-slate-500">124 City Road, London EC1V 2NX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
