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
  Eye,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/ToastContext';
import { Modal } from '../../components/common/Modal';
import { useJobs, SURVEYORS } from '../../mock/jobs';
import { SurveyProgressTracker } from '../../components/customer/SurveyProgressTracker';
import { downloadTermsPDF, downloadInvoicePDF, downloadReportPDF } from '../../utils/pdfGenerator';
import { useMessages } from '../../mock/messages';
import { useTerms, TERMS_TEMPLATES } from '../../mock/terms';

// ==========================================
// 1. TERMS TO SIGN (Document + Typed/Drawn Signature + Payment Screen UI)
// ==========================================

// Strict customer isolation helper
const isJobForCustomer = (job, user) => {
  if (!job || !user) return false;
  const uEmail = (user.email || '').toLowerCase().trim();
  const uName = (user.name || '').toLowerCase().trim();
  const jEmail = (job.customerEmail || '').toLowerCase().trim();
  const jAlt = (job.customerAltEmail || '').toLowerCase().trim();
  const jDemo = (job.customerDemoEmail || '').toLowerCase().trim();
  const jName = (job.customer || '').toLowerCase().trim();

  if (uEmail === 'customer@demo.com' || uName.includes('emma')) {
    return jEmail === 'customer@demo.com' || jName.includes('emma');
  }

  if (uEmail.includes('harrison') || uEmail === 'customer2@demo.com' || uName.includes('harrison')) {
    return jEmail.includes('harrison') || jAlt.includes('harrison') || jDemo.includes('customer2') || jName.includes('harrison');
  }

  return (
    (jEmail && jEmail === uEmail) ||
    (jAlt && jAlt === uEmail) ||
    (jDemo && jDemo === uEmail) ||
    (jName && uName && jName === uName)
  );
};

export const CustomerTermsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const { jobs, updateJob } = useJobs();
  const { agreements, setAgreements, markAgreementSigned } = useTerms();

  // 1. Strict customer job isolation
  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const currentJob = myJobs[0] || null;

  // 2. Locate linked agreement in terms repository
  const currentAgreement = agreements.find((a) => {
    if (currentJob?.id && a.jobNo === currentJob.id) return true;
    const uEmail = (user?.email || '').toLowerCase().trim();
    const aEmail = (a.signerEmail || '').toLowerCase().trim();
    if (uEmail && aEmail && uEmail === aEmail) return true;
    if (uEmail.includes('harrison') && aEmail.includes('harrison')) return true;
    return false;
  });

  const isAlreadySigned =
    currentAgreement?.status === 'Signed' || currentJob?.termsStatus === 'Signed';

  // 3. Dynamic property and fee values
  const propertyAddress = currentJob?.property
    ? `${currentJob.property}, ${currentJob.location || ''}`
    : '14 Mayfair Gate, Mayfair, London W1K 2PB';
  const surveyType = currentJob?.surveyType || 'RICS Level 2 Home Survey';
  const surveyorName = currentJob?.surveyor || 'David Thorne MRICS';
  const appointmentSlot = currentJob?.date
    ? `${currentJob.date}, ${currentJob.timeSlot || '10:00 - 13:00'}`
    : '27 Oct, 10:00 - 13:00';
  const jobNo = currentJob?.id || 'JOB-2026-080';

  const baseFee = currentJob?.quote?.baseFee || (surveyType.includes('Level 3') ? 1450 : 770);
  const vatAmount = Math.round(baseFee * 0.2);
  const grossTotal = baseFee + vatAmount;

  // 4. Match service-specific clauses from TERMS_TEMPLATES
  const activeTemplate = React.useMemo(() => {
    const st = surveyType.toLowerCase();
    if (st.includes('level 3') || st.includes('building')) {
      return TERMS_TEMPLATES.find((t) => t.id === 'tmpl-l3') || TERMS_TEMPLATES[1];
    }
    if (st.includes('valuation')) {
      return TERMS_TEMPLATES.find((t) => t.id === 'tmpl-valuation') || TERMS_TEMPLATES[3];
    }
    if (st.includes('snagging')) {
      return TERMS_TEMPLATES.find((t) => t.id === 'tmpl-snagging') || TERMS_TEMPLATES[2];
    }
    if (st.includes('damp')) {
      return TERMS_TEMPLATES.find((t) => t.id === 'tmpl-damp') || TERMS_TEMPLATES[4];
    }
    if (st.includes('expert')) {
      return TERMS_TEMPLATES.find((t) => t.id === 'tmpl-expert-witness') || TERMS_TEMPLATES[5];
    }
    return TERMS_TEMPLATES.find((t) => t.id === 'tmpl-l2') || TERMS_TEMPLATES[0];
  }, [surveyType]);

  // Workflow state: 'sign' | 'payment' | 'confirmed'
  const [stage, setStage] = useState('sign');
  const [showClausesAccordion, setShowClausesAccordion] = useState(false);

  // Sign Form State
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signatureType, setSignatureType] = useState('typed'); // 'typed' | 'drawn'
  const [typedName, setTypedName] = useState(user?.name || currentJob?.customer || 'Emma Watson');

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
    name: user?.name || currentJob?.customer || 'Customer Account',
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
    const x = (e.clientX || (e.touches && e.touches[0]?.clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0]?.clientY)) - rect.top;
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
    const x = (e.clientX || (e.touches && e.touches[0]?.clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0]?.clientY)) - rect.top;
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
      message: 'Your Terms of Engagement have been cryptographically stamped. Proceeding to payment.',
    });
    setStage('payment');
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    let signatureVal = typedName;
    if (signatureType === 'drawn' && canvasRef.current) {
      try {
        signatureVal = canvasRef.current.toDataURL('image/png');
      } catch {
        signatureVal = typedName;
      }
    }

    setTimeout(() => {
      const nowString = `${new Date().toLocaleDateString('en-GB')}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
      const generatedAuditCode = `DOC-ESIGN-${Math.floor(10000 + Math.random() * 89999)}-VERIFIED`;

      // 1. Update in useTerms store
      if (currentAgreement?.id) {
        markAgreementSigned(currentAgreement.id, {
          signedDate: nowString,
          signerIp: '86.142.19.42 (London, UK)',
          auditCode: generatedAuditCode,
          signatureType,
          signatureValue: signatureVal,
        });
      } else if (currentJob?.id) {
        // Create new executed agreement in store
        setAgreements((prev) => [
          {
            id: `AGR-2026-${Math.floor(100 + Math.random() * 899)}`,
            refNo: `AGR-2026-${Math.floor(100 + Math.random() * 899)}`,
            jobNo: currentJob.id,
            client: user?.name || currentJob.customer || 'Customer',
            signerEmail: user?.email || currentJob.customerEmail,
            property: propertyAddress,
            location: currentJob.location || 'London, UK',
            serviceKey: activeTemplate.serviceKey,
            templateName: activeTemplate.name,
            versionYear: `${activeTemplate.version} / ${activeTemplate.year}`,
            status: 'Signed',
            sentDate: new Date().toLocaleDateString('en-GB'),
            signedDate: nowString,
            signerIp: '86.142.19.42 (London, UK)',
            auditCode: generatedAuditCode,
            downloadUrl: '#download-signed-pdf',
          },
          ...prev,
        ]);
      }

      // 2. Update in useJobs store
      if (currentJob?.id) {
        updateJob(currentJob.id, {
          termsStatus: 'Signed',
          paymentStatus: 'Paid',
          canBook: true,
          timelineStep: 4,
          tasks: (currentJob.tasks || []).map((t) => ({ ...t, done: true })),
          activityLog: [
            {
              id: Date.now(),
              time: nowString,
              text: `Client ${user?.name || 'Customer'} digitally executed Terms of Engagement & settled invoice (£${grossTotal}).`,
            },
            ...(currentJob.activityLog || []),
          ],
        });
      }

      setIsProcessingPayment(false);
      setStage('confirmed');

      addToast({
        type: 'success',
        title: 'Advance Payment Successful',
        message: `Stripe transaction of £${grossTotal.toFixed(2)} authorized. Terms of engagement recorded.`,
      });
    }, 1000);
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
      jobNo: jobNo,
      clientName: user?.name || currentJob?.customer || typedName,
      property: propertyAddress,
      surveyType: surveyType,
      agreedFee: `£${grossTotal.toFixed(2)} (inc. 20% VAT)`,
      signedDate: currentAgreement?.signedDate || new Date().toLocaleDateString('en-GB'),
      signedTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      signatureType,
      signatureValue: signatureVal,
      ipAddress: currentAgreement?.signerIp || '86.142.19.104',
    });

    addToast({
      type: 'success',
      title: 'Downloading Signed PDF',
      message: 'Generating your executed Terms of Engagement with audit seal.',
    });
  };

  // ==========================================
  // CASE A: AGREEMENT ALREADY SIGNED & EXECUTED
  // ==========================================
  if (isAlreadySigned && stage !== 'confirmed') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <PageHeader
          title="Terms of Engagement & Digital Signature"
          subtitle="Your legally binding RICS contractual agreement has been executed and securely registered in practice audit archives."
          breadcrumb={['Customer Portal', 'Terms to Sign']}
        />

        {/* Executed Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Top Verification Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  RICS Mandated Contract • Digitally Executed
                </div>
                <h3 className="text-xl font-black tracking-tight">Terms of Engagement Signed</h3>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-white/90 space-y-0.5 font-mono">
              <div>Ref: <strong>{currentAgreement?.refNo || 'AGR-2026-081'}</strong></div>
              <div>Audit Code: <strong>{currentAgreement?.auditCode || 'DOC-ESIGN-VERIFIED'}</strong></div>
              <div>Executed: <strong>{currentAgreement?.signedDate || '26/10/2026, 11:15'}</strong></div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Instruction Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Instructing Client</span>
                <strong className="text-slate-900 font-extrabold text-sm">{user?.name || currentJob?.customer}</strong>
                <span className="text-[11px] text-slate-500 block truncate">{user?.email || currentJob?.customerEmail}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Subject Property</span>
                <strong className="text-slate-900 font-extrabold text-xs block truncate">{propertyAddress.split(',')[0]}</strong>
                <span className="text-[11px] text-slate-500 block truncate">{propertyAddress}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Agreed Fee Status</span>
                <strong className="text-emerald-700 font-extrabold text-sm block">£{grossTotal.toFixed(2)}</strong>
                <span className="text-[10px] font-semibold text-emerald-600 block">Advance Settlement Cleared ✓</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Assigned Surveyor</span>
                <strong className="text-slate-900 font-extrabold text-xs block truncate">{surveyorName}</strong>
                <span className="text-[10px] font-semibold text-amber-700 block">Confirmed Appointment</span>
              </div>
            </div>

            {/* Digital Signature Seal */}
            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#0B1F4D]">Digital Signature on Record:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Legally Binding (ECA 2000)
                  </span>
                </div>
                <div className="font-serif italic text-2xl text-[#0B1F4D] font-bold tracking-wide">
                  {user?.name || currentJob?.customer}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Signer IP: {currentAgreement?.signerIp || '86.142.19.42 (London, UK)'} • Cryptographic Checksum Verified
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadSignedPDF}
                  className="px-5 py-3 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Signed PDF</span>
                </button>
              </div>
            </div>

            {/* Contract Clauses Accordion */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowClausesAccordion(!showClausesAccordion)}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#0B1F4D]" />
                  <span className="text-xs font-bold text-slate-900">
                    View Executed Agreement Terms ({activeTemplate.shortName})
                  </span>
                </div>
                <span className="text-xs font-bold text-[#0B1F4D]">
                  {showClausesAccordion ? 'Hide Clauses' : 'Show Clauses'}
                </span>
              </button>

              {showClausesAccordion && (
                <div className="p-5 bg-white text-xs text-slate-600 space-y-3.5 border-t border-slate-200">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Template: {activeTemplate.name} • Version: {activeTemplate.version} ({activeTemplate.year})
                  </div>
                  {activeTemplate.keyClauses?.map((clause, idx) => (
                    <div key={idx} className="space-y-1">
                      <strong className="text-slate-900 block font-bold">
                        Clause {clause.num}: {clause.title}
                      </strong>
                      <p className="leading-relaxed">{clause.text}</p>
                    </div>
                  ))}
                  <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100">
                    Governing Body: {activeTemplate.governingBody} • Professional Indemnity Cap: {activeTemplate.piiCap}
                  </div>
                </div>
              )}
            </div>

            {/* Portal Action Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/customer/track-my-survey')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#0B1F4D]" />
                <span>Track Live Survey Progress</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/customer/invoices-and-payments')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>View Invoices & Payments</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE B: PENDING SIGNING & ADVANCE PAYMENT FLOW
  // ==========================================
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
                  Private Client Instruction • Ref #{jobNo}
                </span>
                <h3 className="text-lg font-black text-[#0B1F4D] mt-1">
                  {propertyAddress}
                </h3>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-xs text-slate-500 block">Agreed Survey Fee</span>
                <span className="text-xl font-black text-[#0B1F4D]">£{grossTotal.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block">(£{baseFee.toFixed(2)} + 20% UK VAT)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Service Level</span>
                <strong className="text-slate-900 font-extrabold">{surveyType}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Lead Surveyor</span>
                <strong className="text-slate-900 font-extrabold">{surveyorName}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Appointment Slot</span>
                <strong className="text-slate-900 font-extrabold">{appointmentSlot}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Turnaround Time</span>
                <strong className="text-slate-900 font-extrabold">48 Hours post-visit</strong>
              </div>
            </div>
          </div>

          {/* Legal Scrollable Contract Box with Service-Specific Clauses */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#2563EB]" />
                <span>{activeTemplate.name}</span>
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {activeTemplate.version} / {activeTemplate.year}
              </span>
            </div>

            <div className="h-64 overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-3 leading-relaxed font-sans">
              <p className="font-bold text-slate-900">
                1. Scope of the {surveyType}
              </p>
              <p>
                NJS Property Group agrees to carry out a physical visual inspection of {propertyAddress} in accordance with {activeTemplate.governingBody}. The surveyor is a qualified Chartered Surveyor (MRICS) registered with the Royal Institution of Chartered Surveyors.
              </p>
              {activeTemplate.keyClauses?.map((c, i) => (
                <div key={i} className="space-y-1">
                  <p className="font-bold text-slate-900">
                    {c.num}. {c.title}
                  </p>
                  <p>{c.text}</p>
                </div>
              ))}
              <p className="font-bold text-slate-900">
                Fees, Cancellation & Refunds
              </p>
              <p>
                The total fixed fee of £{grossTotal.toFixed(2)} (inclusive of 20% VAT) is payable upon execution of these terms. Under the Consumer Contracts Regulations 2013, you hold a 14-day statutory right of cancellation.
              </p>
              <p className="font-bold text-slate-900">
                Professional Indemnity Cover
              </p>
              <p>
                NJS Property Group maintains comprehensive Professional Indemnity Insurance backed by RSA with indemnity cover up to {activeTemplate.piiCap}.
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
                I confirm that I am the instructing client ({user?.name || currentJob?.customer}), have read the full RICS Letter of Engagement clauses above, and agree to be legally bound by these terms.
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
                  placeholder="e.g. Harrison Croft"
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
                        <span>Pay £{grossTotal.toFixed(2)} & Confirm Booking</span>
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
                  <span>{surveyType}:</span>
                  <span>£{baseFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Direct Telephone Debrief:</span>
                  <span className="text-emerald-700 font-bold">Included</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                  <span>Subtotal ex VAT:</span>
                  <span>£{baseFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>UK VAT (20%):</span>
                  <span>£{vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#0B1F4D] pt-2 border-t border-slate-300">
                  <span>Gross Total Due:</span>
                  <span className="text-emerald-700">£{grossTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 text-[10px] text-slate-400 space-y-1">
                <div>• Merchant: NJS Property Group Ltd</div>
                <div>• 256-bit SSL Encrypted Payment</div>
                <div>• Official VAT receipt dispatched to {user?.email || 'customer@demo.com'}</div>
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
              Your Terms of Engagement are executed and advance payment of £{grossTotal.toFixed(2)} has been received in full.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Subject Property:</span>
              <span className="font-bold text-slate-900">{propertyAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Inspection Slot:</span>
              <span className="font-bold text-slate-900">{appointmentSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Surveyor:</span>
              <span className="font-bold text-slate-900">{surveyorName}</span>
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
  const { user } = useAuth();
  const { jobs } = useJobs();

  const myBookings = jobs.filter((j) => isJobForCustomer(j, user));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Booked Surveys"
        subtitle="View your confirmed property appointments, assigned surveyors, and active inspections."
        breadcrumb={['Customer Portal', 'My Bookings']}
      />

      <div className="space-y-4">
        {myBookings.map((b) => (
          <div
            key={b.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  b.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : b.termsStatus === 'Pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-[#2563EB] border-blue-200'
                }`}>
                  {b.status}
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">
                  {b.id}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900">{b.property}</h4>
              <p className="text-xs text-slate-500">{b.location}</p>
              <div className="text-xs text-[#2563EB] font-semibold">{b.surveyType}</div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <span className="text-xs text-slate-400 block font-mono">Date & Slot</span>
                <span className="text-xs font-bold text-slate-800 block">{b.date} • {b.timeSlot}</span>
                <span className="text-xs font-semibold text-slate-600">Surveyor: {b.surveyor || 'Pending Allocation'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/customer/track-my-survey')}
                  className="px-3.5 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Track Live Progress
                </button>
                <button
                  onClick={() => navigate('/customer/appointment-details')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Appointment Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {myBookings.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            No survey bookings found under your client account.
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. QUOTATIONS PAGE
// ==========================================
export const CustomerQuotationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const quotes = myJobs.map((j) => {
    const net = j.quote?.baseFee || (j.surveyType?.includes('Level 3') ? 1450.0 : 650.0);
    const vat = net * 0.2;
    const total = net + vat;
    return {
      id: `QUO-${j.id.replace('JOB-2026-', '')}`,
      jobId: j.id,
      property: `${j.property}, ${j.location}`,
      surveyType: j.surveyType,
      net: `£${net.toFixed(2)}`,
      vat: `£${vat.toFixed(2)}`,
      total: `£${total.toFixed(2)}`,
      date: j.date || '28/10/2026',
      status: j.termsStatus === 'Signed' ? 'Accepted & Executed' : 'Open Proposal',
      termsStatus: j.termsStatus,
      validUntil: j.termsStatus === 'Signed' ? 'Confirmed' : '14 Days Remaining',
    };
  });

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
                  q.termsStatus === 'Signed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-[#0B1F4D]'
                }`}>
                  {q.status}
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">{q.id}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{q.property}</h4>
              <p className="text-xs text-[#2563EB] font-semibold mt-0.5">{q.surveyType}</p>
              <div className="text-xs text-slate-400 mt-2">
                Valid: <strong>{q.validUntil}</strong> • Issued on {q.date}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <div className="text-xs text-slate-400 font-mono">Net: {q.net} + 20% VAT</div>
                <div className="text-xl font-black text-[#0B1F4D] font-mono">{q.total}</div>
                <span className="text-[11px] text-emerald-600 font-bold block">Fixed Fee Guaranteed</span>
              </div>

              {q.termsStatus === 'Signed' ? (
                <button
                  onClick={() => navigate('/customer/terms-to-sign')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  View Signed Terms
                </button>
              ) : (
                <button
                  onClick={() => navigate('/customer/terms-to-sign')}
                  className="px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  Review & Sign Terms
                </button>
              )}
            </div>
          </div>
        ))}

        {quotes.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            No quotations found under your account.
          </div>
        )}
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
  const { jobs, updateJob } = useJobs();

  const [settlingInvoice, setSettlingInvoice] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'apple' | 'bacs'
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    name: user?.name || 'Customer Account',
    number: '•••• •••• •••• 4242',
    expiry: '12/28',
    cvc: '892',
    postcode: 'W1K 2PB',
  });

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));

  const invoices = myJobs.map((j) => {
    const net = j.quote?.baseFee || (j.surveyType?.includes('Level 3') ? 1450.0 : 770.0);
    const vat = Math.round(net * 0.2);
    const total = net + vat;
    const isPaid = j.paymentStatus === 'Paid';

    return {
      invNo: `INV-2026-${j.id.replace('JOB-2026-', '90')}`,
      jobRef: j.id,
      property: `${j.property}, ${j.location || ''}`,
      service: j.surveyType,
      date: j.date || '26/10/2026',
      netAmount: net,
      vatAmount: vat,
      grossTotal: total,
      net: `£${net.toFixed(2)}`,
      vat: `£${vat.toFixed(2)}`,
      total: `£${total.toFixed(2)}`,
      status: isPaid ? 'Paid' : 'Unpaid',
      method: isPaid ? 'Stripe Card (•••• 4242)' : 'Pending Settlement',
    };
  });

  // Calculate Metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.grossTotal, 0);
  const totalSettled = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.grossTotal, 0);
  const balanceDue = totalInvoiced - totalSettled;

  const handleDownloadInvoice = (inv) => {
    downloadInvoicePDF({
      invoiceNo: inv.invNo,
      jobNo: inv.jobRef,
      clientName: user?.name || 'Customer',
      property: inv.property,
      surveyType: inv.service,
      invoiceDate: inv.date,
      paymentDate: `${inv.date}, 11:20`,
      paymentMethod: inv.status === 'Paid' ? inv.method : 'Pending Settlement',
      baseFee: inv.netAmount,
      vatAmount: inv.vatAmount,
      totalAmount: inv.grossTotal,
    });

    addToast({
      type: 'success',
      title: 'HMRC VAT Receipt Downloaded',
      message: `Official invoice PDF ${inv.invNo} has been downloaded.`,
    });
  };

  const handleProcessSettlement = (e) => {
    e.preventDefault();
    if (!settlingInvoice) return;

    setIsProcessing(true);

    setTimeout(() => {
      // 1. Update job in store
      updateJob(settlingInvoice.jobRef, {
        paymentStatus: 'Paid',
        canBook: true,
        timelineStep: 4,
        activityLog: [
          {
            id: Date.now(),
            time: `${new Date().toLocaleDateString('en-GB')}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
            text: `Customer ${user?.name || 'Client'} settled invoice ${settlingInvoice.invNo} (£${settlingInvoice.grossTotal.toFixed(2)}) via ${paymentMethod === 'card' ? 'Stripe Card' : paymentMethod === 'apple' ? 'Apple Pay' : 'BACS'}.`,
          },
        ],
      });

      // 2. Automatically generate and download the VAT invoice receipt
      downloadInvoicePDF({
        invoiceNo: settlingInvoice.invNo,
        jobNo: settlingInvoice.jobRef,
        clientName: user?.name || 'Customer',
        property: settlingInvoice.property,
        surveyType: settlingInvoice.service,
        invoiceDate: new Date().toLocaleDateString('en-GB'),
        paymentDate: `${new Date().toLocaleDateString('en-GB')}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
        paymentMethod:
          paymentMethod === 'card'
            ? 'Stripe Credit Card (•••• 4242)'
            : paymentMethod === 'apple'
            ? 'Apple Pay (Biometric Settled)'
            : 'BACS Faster Payments',
        baseFee: settlingInvoice.netAmount,
        vatAmount: settlingInvoice.vatAmount,
        totalAmount: settlingInvoice.grossTotal,
      });

      setIsProcessing(false);
      setSettlingInvoice(null);

      addToast({
        type: 'success',
        title: 'Payment Cleared & Settled',
        message: `${settlingInvoice.total} received in full. Official VAT invoice receipt downloaded.`,
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Invoices & VAT Receipts"
        subtitle="Download official HMRC-compliant VAT receipts, inspect payment audit logs, and settle outstanding balances."
        breadcrumb={['Customer Portal', 'Invoices & Payments']}
      />

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B1F4D] flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5 text-[#0B1F4D]" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Invoiced</div>
            <div className="text-lg font-black text-slate-900 font-mono">£{totalInvoiced.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Settled & Cleared</div>
            <div className="text-lg font-black text-emerald-700 font-mono">£{totalSettled.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Outstanding Balance</div>
            <div className="text-lg font-black text-slate-900 font-mono">£{balanceDue.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-900">VAT Reg: GB 384 9281 92</div>
            <div className="text-[10px] font-semibold text-slate-500">20% UK Standard VAT</div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {invoices.map((inv) => {
          const isPaid = inv.status === 'Paid';

          return (
            <div
              key={inv.invNo}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {isPaid ? 'Paid & Settled ✓' : 'Payment Outstanding'}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">{inv.invNo}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    Ref #{inv.jobRef}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-[#0B1F4D] truncate">{inv.property}</h4>
                <p className="text-xs text-slate-600 font-medium">{inv.service}</p>

                <div className="text-xs text-slate-500 flex items-center gap-2 pt-1 font-medium">
                  {isPaid ? (
                    <span>
                      Settled on {inv.date} via <strong className="text-slate-700">{inv.method}</strong>
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold">
                      Awaiting Advance Payment Settlement prior to site visit
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <div className="text-xs text-slate-400 font-mono">
                    Net: {inv.net} + 20% VAT: {inv.vat}
                  </div>
                  <div className="text-2xl font-black text-[#0B1F4D] font-mono">{inv.total}</div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isPaid ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setViewingReceipt(inv)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        title="View itemized breakdown"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(inv)}
                        className="px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Download official HMRC PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                        <span>Download VAT Receipt</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSettlingInvoice(inv)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Settle Invoice Now ({inv.total})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {invoices.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            No invoices generated yet.
          </div>
        )}
      </div>

      {/* MODAL 1: SETTLE PAYMENT MODAL */}
      {settlingInvoice && (
        <Modal
          isOpen={Boolean(settlingInvoice)}
          onClose={() => setSettlingInvoice(null)}
          title="Settle Invoice & Lock Inspection"
          subtitle={`Advance payment settlement for ${settlingInvoice.invNo} (${settlingInvoice.property})`}
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-500 font-medium">
                Encrypted 256-bit SSL session • Merchant: NJS Property Group Ltd
              </span>
              <button
                type="button"
                onClick={() => setSettlingInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Amount Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Due</span>
                <span className="text-xl font-black text-[#0B1F4D] font-mono">{settlingInvoice.total}</span>
                <span className="text-[10.5px] text-slate-500 block">
                  Net: {settlingInvoice.net} + UK VAT (20%): {settlingInvoice.vat}
                </span>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Instant VAT Receipt
                </span>
              </div>
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
                <span>Credit / Debit Card</span>
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

            {/* Payment Form */}
            {paymentMethod === 'bacs' ? (
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-2 text-xs">
                <div className="font-bold text-[#0B1F4D]">Direct Bank Transfer Instructions:</div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>Bank: <strong>Barclays Bank UK</strong></div>
                  <div>Sort Code: <strong>20-45-77</strong></div>
                  <div>Account No: <strong>83920194</strong></div>
                  <div>Beneficiary: <strong>NJS Property Group Escrow</strong></div>
                </div>
                <div className="pt-2 text-[11px] text-slate-500 font-mono">
                  Mandatory Reference: <strong>{settlingInvoice.invNo}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleProcessSettlement}
                  disabled={isProcessing}
                  className="w-full mt-3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? 'Confirming Settlement...' : `Confirm Settlement (${settlingInvoice.total})`}
                </button>
              </div>
            ) : (
              <form onSubmit={handleProcessSettlement} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      placeholder="MM/YY"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">CVC Code</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                      placeholder="892"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authorizing with Bank...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay {settlingInvoice.total} & Download VAT Receipt</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 2: VIEW ITEMIZED RECEIPT MODAL */}
      {viewingReceipt && (
        <Modal
          isOpen={Boolean(viewingReceipt)}
          onClose={() => setViewingReceipt(null)}
          title="Official VAT Invoice Receipt"
          subtitle={`HMRC VAT Compliance Record • ${viewingReceipt.invNo}`}
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => handleDownloadInvoice(viewingReceipt)}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Header / Brand */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between">
              <div>
                <span className="font-extrabold text-[#0B1F4D] text-sm block">NJS PROPERTY GROUP</span>
                <span className="text-[10px] text-slate-400 block">RICS Regulated Firm #084920</span>
                <span className="text-[10px] text-slate-400 block">VAT Reg: GB 384 9281 92</span>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Status: PAID
                </span>
                <span className="font-mono text-xs text-slate-600 block mt-1 font-bold">{viewingReceipt.invNo}</span>
              </div>
            </div>

            {/* Billed to */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Billed To</span>
                <span className="font-bold text-slate-900 block">{user?.name}</span>
                <span className="text-slate-500 block truncate">{viewingReceipt.property}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Settlement Details</span>
                <span className="font-medium text-slate-700 block">{viewingReceipt.method}</span>
                <span className="text-slate-400 block font-mono text-[10.5px]">Paid on {viewingReceipt.date}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              <div className="p-3 bg-slate-100 font-bold text-slate-700 flex justify-between">
                <span>Service Description</span>
                <span>Amount</span>
              </div>
              <div className="p-3 flex justify-between">
                <div>
                  <div className="font-bold text-slate-900">{viewingReceipt.service}</div>
                  <div className="text-[11px] text-slate-500">Physical inspection, defect diagnosis & RICS report</div>
                </div>
                <div className="font-mono font-bold text-slate-800">{viewingReceipt.net}</div>
              </div>
              <div className="p-3 flex justify-between bg-slate-50/50">
                <span className="text-slate-600">Subtotal ex. VAT</span>
                <span className="font-mono font-bold text-slate-800">{viewingReceipt.net}</span>
              </div>
              <div className="p-3 flex justify-between bg-slate-50/50">
                <span className="text-slate-600">UK Standard VAT (20%)</span>
                <span className="font-mono font-bold text-slate-800">{viewingReceipt.vat}</span>
              </div>
              <div className="p-3 flex justify-between bg-[#0B1F4D] text-white font-bold text-sm">
                <span>Total Settled in Full</span>
                <span className="font-mono">{viewingReceipt.total}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ==========================================
// 5. REPORTS PAGE (Real PDF + Sample Reports)
// ==========================================
export const CustomerReportsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { jobs } = useJobs();

  const myCompletedJobs = jobs.filter(
    (j) => isJobForCustomer(j, user) && (j.status === 'Completed' || j.timelineStep >= 7)
  );

  const reports = myCompletedJobs.map((j) => ({
    id: `RPT-${j.id.replace('JOB-2026-', '')}`,
    title: `RICS_${j.surveyType?.replace(/[^a-zA-Z0-9]/g, '_')}_${j.property?.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
    property: `${j.property}, ${j.location}`,
    date: j.date || '27/10/2026',
    size: '14.2 MB',
    surveyor: j.surveyor || 'David Thorne MRICS',
    conditionRating: 'Condition 1 & 2 (Official RICS Traffic-Light Audit)',
  }));

  const handleDownloadReport = (r) => {
    downloadReportPDF({
      jobNo: r.id,
      clientName: user?.name || 'Client',
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
        title="Completed Survey Reports"
        subtitle="Download accredited RICS condition & building survey reports with cryptographic watermark."
        breadcrumb={['Customer Portal', 'Reports']}
      />

      <div className="space-y-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{r.id}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Certified Report
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{r.property}</h4>
                <div className="text-xs text-slate-500 font-mono">
                  {r.title} • {r.size} • Uploaded {r.date}
                </div>
                <div className="text-xs text-slate-700 font-medium pt-1">
                  Surveyor: <strong>{r.surveyor}</strong> • {r.conditionRating}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownloadReport(r)}
              className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Report</span>
            </button>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            No completed reports released yet for your properties. Reports are uploaded within 48h-72h following inspection.
          </div>
        )}

        {/* Specimen / Sample Reports */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Reference RICS Sample Reports
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => handleDownloadSample(2)}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-left cursor-pointer transition-all"
            >
              <div>
                <div className="font-bold text-slate-800">Sample Level 2 Home Survey</div>
                <div className="text-slate-400 text-[11px]">Specimen PDF with condition ratings</div>
              </div>
              <Download className="w-4 h-4 text-slate-600" />
            </button>

            <button
              onClick={() => handleDownloadSample(3)}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-left cursor-pointer transition-all"
            >
              <div>
                <div className="font-bold text-slate-800">Sample Level 3 Building Survey</div>
                <div className="text-slate-400 text-[11px]">Full structural defect analysis template</div>
              </div>
              <Download className="w-4 h-4 text-slate-600" />
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
  const { user } = useAuth();
  const { jobs } = useJobs();

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const currentJob = myJobs[0] || null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Appointment Details"
        subtitle="Specific timing, inspection window, and surveyor details for your survey."
        breadcrumb={['Customer Portal', 'Appointment Details']}
      />

      {currentJob ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#2563EB]" />
              <h3 className="text-sm font-bold text-[#0B1F4D]">Confirmed Time Slot</h3>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-xs space-y-2">
              <div className="text-lg font-black text-[#0B1F4D]">{currentJob.date || 'Confirmed Schedule'}</div>
              <div className="text-slate-700 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2563EB]" />
                <span>{currentJob.timeSlot || '10:00 AM – 13:00 PM'}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                The surveyor conducts a meticulous 2 to 3 hour inspection including loft voids, subfloors, and grounds.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">{currentJob.surveyType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Surveyor:</span>
                <span className="font-bold text-[#0B1F4D]">{currentJob.surveyor || 'Pending Allocation'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Booking Status:</span>
                <span className="font-bold text-emerald-700">{currentJob.status}</span>
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
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
          No scheduled survey appointment found for your account.
        </div>
      )}
    </div>
  );
};

// ==========================================
// 8. ASSIGNED SURVEYOR PAGE
// ==========================================
export const CustomerAssignedSurveyorPage = () => {
  const { user } = useAuth();
  const { jobs } = useJobs();
  const { addToast } = useToast();

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const currentJob = myJobs[0] || null;
  const surveyorName = currentJob?.surveyor || 'David Thorne MRICS';
  const surveyor = SURVEYORS.find((s) => s.name === surveyorName) || SURVEYORS[0];

  const handleRequestCall = () => {
    addToast({
      type: 'success',
      title: 'Call Request Logged',
      message: `${surveyor.name} will contact you today regarding your inspection at ${currentJob?.property || 'your property'}.`,
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
            src={surveyor.avatar}
            alt={surveyor.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
          />

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B1F4D] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                RICS Regulated Member
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Verified Credentials
              </span>
            </div>

            <h3 className="text-xl font-black text-[#0B1F4D]">{surveyor.name}</h3>
            <p className="text-xs text-slate-500">{surveyor.credentials}</p>
            <p className="text-xs text-slate-600 pt-1">
              Experienced RICS specialist covering London postcodes ({surveyor.postcodes}) for period conversions, defect diagnosis, and Red Book valuation.
            </p>
          </div>

          <button
            onClick={handleRequestCall}
            className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Request Call-Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Inspection</span>
            <div className="font-bold text-slate-900">{currentJob?.property || '14 Mayfair Gate'}</div>
            <div className="text-slate-500 font-mono">{currentJob?.surveyType || 'RICS Level 2'}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Turnaround SLA</span>
            <div className="font-bold text-slate-900">48h Delivery Window</div>
            <div className="text-slate-500">Delivered directly to your portal</div>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-1">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase">RICS Compliance</span>
            <div className="font-bold text-[#0B1F4D]">VRS Regulated</div>
            <div className="text-blue-900 text-[11px]">Strict valuation & safety standards</div>
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
  const { jobs } = useJobs();
  const { conversations, sendMessage, markAsRead } = useMessages();

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const currentJob = myJobs[0] || null;

  // Strict customer conversation isolation:
  const currentConv = conversations.find((c) => {
    const uEmail = (user?.email || '').toLowerCase().trim();
    const cEmail = (c.clientEmail || '').toLowerCase().trim();
    if (uEmail === 'customer@demo.com') return cEmail === 'customer@demo.com';
    if (uEmail.includes('harrison') || uEmail === 'customer2@demo.com') {
      return cEmail.includes('harrison') || c.id === 'conv-3';
    }
    return cEmail === uEmail;
  });

  // Effective conversation (isolated, never leaks another customer's thread)
  const effectiveConv = currentConv || {
    id: `conv-${user?.id || 'new'}`,
    jobId: currentJob?.id || 'ENQ-2026',
    clientEmail: user?.email,
    clientName: user?.name,
    property: currentJob?.property || 'Your Property',
    surveyType: currentJob?.surveyType || 'RICS Survey',
    messages: [
      {
        id: 1,
        sender: 'NJS Operations Desk',
        role: 'admin',
        text: `Hello ${user?.name || 'Client'}, welcome to your dedicated communications channel with NJS Property Group. How can our surveying team assist you today?`,
        time: 'Today',
      },
    ],
  };

  const messages = effectiveConv.messages || [];
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
      effectiveConv.id,
      textToSend,
      user?.name || 'Client',
      'client'
    );

    addToast({
      type: 'success',
      title: 'Message Sent to NJS Desk',
      message: 'Your query has been dispatched to operations (info@njspropertygroup.com).',
    });
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
        subtitle="Secure, direct communication with the NJS operations coordination desk."
        breadcrumb={['Customer Portal', 'Messages']}
      />

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B1F4D] text-white flex items-center justify-center font-bold text-sm">
              NJS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">NJS Operations & Surveyor Desk</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[11px] text-slate-400">
                Ref: {effectiveConv.jobId} • {effectiveConv.property}
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-xl">
            Active Thread
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((m) => {
            const isClient = m.role === 'client';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400">{m.sender}</span>
                  <span className="text-[9px] text-slate-300 font-mono">• {m.time}</span>
                </div>
                <div
                  className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isClient
                      ? 'bg-[#0B1F4D] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={handleAttach}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message to NJS coordination team..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D]"
          />

          <button
            type="submit"
            className="p-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
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
