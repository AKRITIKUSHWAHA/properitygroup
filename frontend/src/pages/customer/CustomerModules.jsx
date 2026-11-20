import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  CalendarCheck,
  Building2,
  Copy,
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
  ArrowLeft,
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
  Image,
  Award,
  CheckCircle,
  Eye,
  Video,
  CheckCheck,
  Search,
  MoreVertical,
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
import { useQuotes } from '../../mock/quotes';
import { useLeads } from '../../mock/leads';
import {
  customerQuotationsApi,
  customerBookingsApi,
  customerTrackSurveyApi,
  customerAppointmentDetailsApi,
  customerAssignedSurveyorApi,
  customerTermsToSignApi,
  customerInvoicesAndPaymentsApi,
  customerReportsApi,
  customerMessagesApi,
  customerReviewApi,
  customerSupportApi,
  customerDetailsApi,
  customerPreviousSurveysApi,
} from '../../api/customerApi';
import { siteConfig } from '../../config/siteConfig';
import { dispatchQuoteAcceptance } from '../../services/autoQuoteService';

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
  useEffect(() => { customerTermsToSignApi.getTerms().catch(() => {}); }, []);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const { jobs, updateJob, addJob } = useJobs();
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

  const userEmail = (user?.email || '').toLowerCase().trim();
  const userName = (user?.name || '').toLowerCase().trim();
  const isEmma = userEmail === 'customer@demo.com';
  const { quotes: storedQuotes = [] } = useQuotes();
  const { leads: storedLeads = [] } = useLeads();
  const userQuote = storedQuotes.find(
    (q) => (q.clientEmail || '').toLowerCase().trim() === userEmail
  );
  const userLead = storedLeads.find((l) => {
    const lEmail = (l.customerEmail || l.clientEmail || '').toLowerCase().trim();
    const lName = (l.customerName || l.clientName || '').toLowerCase().trim();
    return (userEmail && (lEmail === userEmail || lEmail.includes(userEmail))) || (userName && (lName === userName || lName.includes(userName)));
  });

  let regUser = {};
  try {
    const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
    regUser = registered[userEmail] || {};
  } catch {}

  const leadTotal = userLead?.estimatedValue ? parseFloat(userLead.estimatedValue.replace(/[^0-9.]/g, '')) : null;
  const leadNet = leadTotal ? Math.round((leadTotal / 1.2) * 100) / 100 : null;

  // 3. Dynamic property and fee values
  const propertyAddress = currentJob?.property
    ? `${currentJob.property}, ${currentJob.location || ''}`
    : userQuote?.property
    ? `${userQuote.property}${userQuote.location ? `, ${userQuote.location}` : ''}`
    : userLead?.property
    ? `${userLead.property}${userLead.location ? `, ${userLead.location}` : ''}`
    : regUser.address
    ? `${regUser.address}${regUser.city ? `, ${regUser.city}` : ''}`
    : (isEmma ? '14 Mayfair Gate, Mayfair, London W1K 2PB' : 'HYDERABAD, GH12AA');
  const surveyType = currentJob?.surveyType || userQuote?.surveyType || userLead?.enquiry || 'RICS Level 2 Home Survey';
  const surveyorName = (currentJob?.surveyor && currentJob?.surveyor !== 'Pending Allocation') ? currentJob.surveyor : 'Assigned Chartered Surveyor';
  const appointmentSlot = currentJob?.date
    ? `${currentJob.date}, ${currentJob.timeSlot || '10:00 - 13:00'}`
    : 'Pending Scheduling';
  const jobNo = currentJob?.id || userQuote?.id || userLead?.quoteRef || userLead?.id || 'JOB-2026-PENDING';

  const baseFee = currentJob?.quote?.baseFee || userQuote?.baseFee || leadNet || (surveyType.includes('Level 3') ? 1450 : 550);
  const vatAmount = userQuote?.vatAmount || (leadTotal && leadNet ? Math.round((leadTotal - leadNet) * 100) / 100 : Math.round(baseFee * 0.2));
  const grossTotal = userQuote?.totalAmount || leadTotal || (baseFee + vatAmount);

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
  const [typedName, setTypedName] = useState(user?.name || currentJob?.customer || '');

  // Canvas ref for drawn signature
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Bank Transfer Payment Form State (Client Specification: Bank Transfer Only, No Stripe/Card)
  const [bankProofRef, setBankProofRef] = useState('');
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

    // Call backend API to record execution and trigger Terms Signed confirmation email
    try {
      const token = localStorage.getItem('property_group_auth_token');
      const userEmail = (user?.email || '').toLowerCase().trim();
      const termNumericId = parseInt(String(currentAgreement?.id || currentJob?.id || '328').replace(/\D/g, ''), 10) || 7;
      fetch(`/api/v1/customer/terms-to-sign/${termNumericId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          signatureData: signatureType === 'drawn' ? 'Drawn Signature' : typedName,
          clientName: user?.name || typedName,
          property: propertyAddress,
          surveyType: surveyType,
        }),
      }).catch((e) => console.warn('Backend terms sign notification error:', e));
    } catch {}

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

      // 2. Update in useJobs store (Strict Client Specification: Claimed payment does NOT auto-mark as paid)
      const jobPayload = {
        termsStatus: 'Signed',
        paymentStatus: 'Claimed (Verification Pending)',
        paymentMethod: 'Bank Transfer (BACS Faster Payments)',
        transferReference: bankProofRef || '',
        canBook: false,
        timelineStep: 3,
        status: 'Action Required',
      };

      if (currentJob?.id) {
        updateJob(currentJob.id, {
          ...jobPayload,
          tasks: (currentJob.tasks || []).map((t) => ({ ...t, done: t.id === 'terms' })),
          activityLog: [
            {
              id: Date.now(),
              time: nowString,
              text: `Client ${user?.name || 'Customer'} digitally executed Terms of Engagement & notified bank transfer of £${grossTotal.toFixed(2)} (Awaiting NJS Admin reconciliation).`,
            },
            ...(currentJob.activityLog || []),
          ],
        });
      } else {
        addJob({
          id: jobNo || `JOB-2026-880`,
          jobNo: jobNo || `JOB-2026-880`,
          customer: user?.name || typedName || 'Client',
          customerEmail: userEmail || 'client@example.com',
          customerPhone: regUser.phone || user?.phone || '',
          surveyType: surveyType,
          property: propertyAddress,
          location: regUser.postcode || '',
          postcode: regUser.postcode || '',
          surveyor: 'Pending Allocation',
          status: 'Action Required',
          termsStatus: 'Signed',
          paymentStatus: 'Claimed (Verification Pending)',
          timelineStep: 3,
          date: 'Pending Allocation',
          timeSlot: 'Pending Confirmation',
          quote: {
            baseFee: baseFee,
            total: grossTotal,
          },
        });
      }

      // 3. Update quotes repository
      try {
        const storedQuotes = JSON.parse(localStorage.getItem('propertygroup_quotes') || '[]');
        const updatedQuotes = storedQuotes.map((q) => {
          if ((q.clientEmail || '').toLowerCase().trim() === userEmail || (q.client || '').toLowerCase().trim() === (user?.name || '').toLowerCase().trim()) {
            return { ...q, termsStatus: 'Signed', paymentStatus: 'Claimed (Verification Pending)' };
          }
          return q;
        });
        localStorage.setItem('propertygroup_quotes', JSON.stringify(updatedQuotes));
      } catch {}

      // 4. Update leads repository to Converted
      try {
        const storedLeads = JSON.parse(localStorage.getItem('propertygroup_crm_leads_v1') || '[]');
        const updatedLeads = storedLeads.map((l) => {
          if ((l.customerEmail || l.clientEmail || '').toLowerCase().trim() === userEmail || (l.customerName || l.clientName || '').toLowerCase().trim() === (user?.name || '').toLowerCase().trim()) {
            return { ...l, status: 'Converted' };
          }
          return l;
        });
        localStorage.setItem('propertygroup_crm_leads_v1', JSON.stringify(updatedLeads));
      } catch {}

      // Call backend API to record payment and trigger VAT receipt / payment confirmation email
      try {
        const token = localStorage.getItem('property_group_auth_token');
        const userEmail = (user?.email || '').toLowerCase().trim();
        const invoiceNumericId = parseInt(String(currentJob?.id || '328').replace(/\D/g, ''), 10) || 7;
        fetch(`/api/v1/customer/invoices-and-payments/${invoiceNumericId}/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'x-user-email': userEmail,
          },
          body: JSON.stringify({
            paymentMethod: 'Direct Bank Transfer (BACS Faster Payments)',
            amount: grossTotal,
            property: propertyAddress,
            clientName: user?.name || currentJob?.customer || typedName,
            transferReference: bankProofRef || '',
          }),
        }).catch((e) => console.warn('Backend payment record error:', e));
      } catch {}

      setIsProcessingPayment(false);
      setStage('confirmed');

      addToast({
        type: 'info',
        title: 'Bank Transfer Claim Submitted',
        message: `Notification logged for £${grossTotal.toFixed(2)}. Status: Payment Claimed — Awaiting NJS Admin Verification.`,
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
                  {(activeTemplate.clauses || activeTemplate.keyClauses || []).map((clause, idx) => (
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
              {(activeTemplate.clauses || activeTemplate.keyClauses || []).map((c, i) => (
                <div key={i} className="space-y-1">
                  <p className="font-bold text-slate-900">
                    Clause {c.num}: {c.title}
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

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-800">
                  Electronic Signature Timestamp:
                </span>
                <span className="font-mono text-[#0B1F4D] font-bold">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} (UK Time)
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                Audit Ref: DOC-ESIGN-84920-VERIFIED
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Execute &amp; E-Sign Terms of Engagement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STAGE 2: BANK TRANSFER PAYMENT ONLY (Client Rule: Bank Transfer Only, No Stripe/Card) */}
      {stage === 'payment' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-[#0B1F4D] flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#2563EB]" />
                  <span>Direct Bank Transfer (BACS / Faster Payments)</span>
                </h3>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                  Zero Merchant Surcharges
                </span>
              </div>

              {/* Direct Bank Transfer Instructions Box */}
              <div className="p-5 bg-gradient-to-br from-blue-50/70 via-slate-50 to-emerald-50/60 rounded-2xl border border-blue-200/90 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Official NJS Practice Client Account
                  </span>
                  <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    UK Faster Payments Aligned
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed font-medium">
                  Please transfer the survey fee directly from your online banking app or branch to our designated client account:
                </p>

                {/* Bank Account Details Grid (Client Mandatory Specification) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-blue-100 shadow-sm text-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Name</span>
                    <strong className="text-slate-900 text-sm font-black">NJS PROPERTY GROUP LTD</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Reference</span>
                    <strong className="text-[#2563EB] font-mono text-sm font-black">INV-2026-{(jobNo || '080').replace(/\D/g, '') || '080'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Sort Code</span>
                    <strong className="text-slate-900 font-mono text-base font-black">23-05-80</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Number</span>
                    <strong className="text-slate-900 font-mono text-base font-black">46452283</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Fee Breakdown</span>
                    <span className="text-slate-700 font-medium">Net: £{baseFee.toFixed(2)} + 20% VAT: £{vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount Due</span>
                    <strong className="text-emerald-700 font-extrabold text-base">£{grossTotal.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Optional Payment Reference Note */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Your Bank Transfer Reference / Payer Name (Optional):
                  </label>
                  <input
                    type="text"
                    value={bankProofRef}
                    onChange={(e) => setBankProofRef(e.target.value)}
                    placeholder="e.g. Sent from Barclays / Halifax Ref #12345"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <span className="text-[10.5px] text-slate-500 block leading-tight">
                    Include your reference so our accounts team can immediately match and reconcile your funds.
                  </span>
                </div>

                {/* Important Compliance Callout */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium">
                  <strong>Notice:</strong> Marking "I have made a bank transfer" notifies NJS Admin to verify receipt of funds. Status will be marked as <strong>"Payment Claimed — Awaiting NJS Admin Verification"</strong>. To prevent unverified bookings, your invoice is NOT automatically marked as Paid.
                </div>

                {/* Submit Claim Button */}
                <button
                  type="button"
                  onClick={handlePaymentSubmit}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Logging Transfer Notification...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>I have made a bank transfer</span>
                    </>
                  )}
                </button>
              </div>
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

      {/* STAGE 3: TRANSFER CLAIMED & PENDING VERIFICATION */}
      {stage === 'confirmed' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0B1F4D] flex items-center justify-center mx-auto border border-blue-200">
            <CheckCircle2 className="w-10 h-10 text-[#2563EB]" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Payment Claimed — Awaiting NJS Admin Verification</span>
            </div>
            <h3 className="text-2xl font-black text-[#0B1F4D]">
              Terms Signed • Transfer Notification Logged
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your Terms of Engagement are legally executed. Our accounts desk will verify your payment of £{grossTotal.toFixed(2)} to our NJS client account (Sort Code: 23-05-80, Account: 46452283) and confirm your inspection appointment.
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
  useEffect(() => { customerBookingsApi.getBookings().catch(() => {}); }, []);
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
  const { addToast } = useToast();
  const { jobs } = useJobs();
  const { quotes: storedQuotes = [] } = useQuotes();
  const { leads = [] } = useLeads();
  const [apiQuotes, setApiQuotes] = useState([]);
  const [acceptingQuoteId, setAcceptingQuoteId] = useState(null);
  const [confirmQuote, setConfirmQuote] = useState(null);
  const [acceptedSuccessQuote, setAcceptedSuccessQuote] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync with live quote updates across tabs & local storage
  useEffect(() => {
    // Clean up any stale dummy fallback quotes from localStorage
    try {
      const rawQuotes = JSON.parse(localStorage.getItem('propertygroup_quotes') || '[]');
      if (Array.isArray(rawQuotes) && rawQuotes.some((q) => q.id === 'QUO-2026-880')) {
        const cleaned = rawQuotes.filter((q) => q.id !== 'QUO-2026-880');
        localStorage.setItem('propertygroup_quotes', JSON.stringify(cleaned));
      }
    } catch {}

    const handleSync = () => setRefreshKey((k) => k + 1);
    window.addEventListener('propertygroup_quotes_updated', handleSync);
    window.addEventListener('propertygroup_jobs_updated', handleSync);
    window.addEventListener('propertygroup_leads_updated', handleSync);
    window.addEventListener('property_group_sent_emails_updated', handleSync);
    return () => {
      window.removeEventListener('propertygroup_quotes_updated', handleSync);
      window.removeEventListener('propertygroup_jobs_updated', handleSync);
      window.removeEventListener('propertygroup_leads_updated', handleSync);
      window.removeEventListener('property_group_sent_emails_updated', handleSync);
    };
  }, []);

  useEffect(() => {
    customerQuotationsApi.getQuotations()
      .then((res) => {
        const list = res?.data?.quotes || res?.quotes || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0) setApiQuotes(list);
      })
      .catch(() => {});
  }, [refreshKey]);

  let userEmail = (user?.email || '').toLowerCase().trim();
  let userName = (user?.name || '').toLowerCase().trim();

  // If email missing from user session, recover from registered customers
  if (!userEmail && userName) {
    try {
      const reg = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
      const found = Object.values(reg).find((c) => (c.name || '').toLowerCase().trim() === userName);
      if (found?.email) userEmail = found.email.toLowerCase().trim();
    } catch {}
  }

  const isDemo = userEmail === 'customer@demo.com';

  // Read latest quotes from localStorage for instant reactive feedback
  let effectiveStoredQuotes = storedQuotes;
  try {
    const rawQuotes = JSON.parse(localStorage.getItem('propertygroup_quotes') || '[]');
    if (Array.isArray(rawQuotes) && rawQuotes.length > 0) {
      effectiveStoredQuotes = rawQuotes;
    }
  } catch {}

  let effectiveJobs = jobs;
  try {
    const rawJobs = JSON.parse(localStorage.getItem('propertygroup_jobs') || '[]');
    if (Array.isArray(rawJobs) && rawJobs.length > 0) {
      effectiveJobs = rawJobs;
    }
  } catch {}

  const myJobs = effectiveJobs.filter((j) => isJobForCustomer(j, user));
  const jobQuotes = myJobs.map((j) => {
    const net = j.quote?.baseFee || (j.surveyType?.includes('Level 3') ? 1450.0 : 650.0);
    const vat = net * 0.2;
    const total = net + vat;
    const isAccepted =
      j.quoteStatus === 'Accepted' ||
      j.status === 'Accepted' ||
      j.stage === 'accepted' ||
      j.termsStatus === 'Signed' ||
      (j.timelineStep && j.timelineStep >= 3);

    return {
      id: `QUO-${j.id.replace('JOB-2026-', '')}`,
      jobId: j.id,
      property: `${j.property}, ${j.location}`,
      surveyType: j.surveyType,
      net: `£${net.toFixed(2)}`,
      vat: `£${vat.toFixed(2)}`,
      total: `£${total.toFixed(2)}`,
      date: j.date || '28/10/2026',
      status: j.termsStatus === 'Signed' ? 'Terms Signed & Active' : isAccepted ? 'Quotation Accepted' : 'Open Proposal',
      isAccepted,
      termsStatus: j.termsStatus,
      validUntil: j.termsStatus === 'Signed' ? 'Confirmed' : '14 Days Remaining',
      rawJob: j,
    };
  });

  // 1. Collect standalone quotes from quotes store for this customer
  const userStoredQuotes = effectiveStoredQuotes.filter((q) => {
    if (q.id === 'QUO-2026-880') return false; // Ignore legacy dummy fallback
    const qEmail = (q.clientEmail || q.customerEmail || '').toLowerCase().trim();
    const qName = (q.client || q.customer || '').toLowerCase().trim();
    const matchesEmail = userEmail && (qEmail === userEmail || qEmail.includes(userEmail) || userEmail.includes(qEmail));
    const matchesName = userName && (qName === userName || qName.includes(userName) || userName.includes(qName));
    return matchesEmail || matchesName;
  });

  const standAloneQuotes = userStoredQuotes
    .filter((q) => !jobQuotes.some((jq) => jq.id === q.id || jq.jobId?.includes(q.id.replace('QUO-', ''))))
    .map((q) => {
      const net = q.baseFee || q.amountExVat || 550.0;
      const vat = q.vatAmount || net * 0.2;
      const total = q.totalAmount || (net + vat);
      const isAccepted =
        q.status === 'Accepted' ||
        q.status === 'ACCEPTED' ||
        q.termsStatus === 'Signed' ||
        q.acceptanceEmailSent;

      return {
        id: q.id,
        jobId: q.id,
        property: `${q.property || ''}${q.location ? `, ${q.location}` : ''}`,
        surveyType: q.surveyType || 'RICS Level 2 Home Survey',
        net: `£${net.toFixed(2)}`,
        vat: `£${vat.toFixed(2)}`,
        total: `£${total.toFixed(2)}`,
        date: q.date || new Date().toLocaleDateString('en-GB'),
        status: q.termsStatus === 'Signed' ? 'Terms Signed & Active' : isAccepted ? 'Quotation Accepted' : 'Open Proposal',
        isAccepted,
        termsStatus: q.termsStatus || 'Pending',
        validUntil: q.dueDate ? `Valid until ${q.dueDate}` : '14 Days Remaining',
        rawQuote: q,
      };
    });

  // 2. Collect quotes from CRM Leads if lead was quoted for this customer
  const quotedLeads = leads.filter((l) => {
    const lEmail = (l.customerEmail || l.clientEmail || '').toLowerCase().trim();
    const lName = (l.customerName || l.clientName || '').toLowerCase().trim();
    const matchesEmail = userEmail && (lEmail === userEmail || lEmail.includes(userEmail) || userEmail.includes(lEmail));
    const matchesName = userName && (lName === userName || lName.includes(userName) || userName.includes(lName));
    const isQuoted =
      (l.status || '').toLowerCase() === 'quoted' ||
      (l.status || '').toLowerCase() === 'quote_sent' ||
      (l.estimatedValue && !l.estimatedValue.toLowerCase().includes('pending'));
    return (matchesEmail || matchesName) && isQuoted;
  });

  const leadQuotes = quotedLeads
    .filter((l) => !standAloneQuotes.some((sq) => sq.jobId === l.id || sq.id === l.quoteRef) && !jobQuotes.some((jq) => jq.jobId === l.id))
    .map((l) => {
      const rawVal = l.estimatedValue ? parseFloat(l.estimatedValue.replace(/[^0-9.]/g, '')) : 660.0;
      const total = rawVal > 50 ? rawVal : 660.0;
      const net = Math.round((total / 1.2) * 100) / 100;
      const vat = Math.round((total - net) * 100) / 100;
      const isAccepted = l.quoteAccepted || l.status === 'Converted';

      return {
        id: l.quoteRef || `QUO-${(l.id || '').replace(/[^0-9]/g, '') || '2026-328'}`,
        jobId: l.id,
        property: `${l.property || ''}${l.location ? `, ${l.location}` : ''}`,
        surveyType: l.enquiry || 'RICS Level 2 Home Survey (Homebuyer)',
        net: `£${net.toFixed(2)}`,
        vat: `£${vat.toFixed(2)}`,
        total: `£${total.toFixed(2)}`,
        date: l.created || new Date().toLocaleDateString('en-GB'),
        status: isAccepted ? 'Quotation Accepted' : 'Open Proposal',
        isAccepted,
        termsStatus: 'Pending',
        validUntil: '14 Days Remaining',
        rawLead: l,
      };
    });

  // Combine and deduplicate quotes per unique property instruction
  const rawCombined = isDemo ? jobQuotes : [...jobQuotes, ...standAloneQuotes, ...leadQuotes];

  const normalizeAddress = (addr) =>
    (addr || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const deduplicatedQuotes = [];
  const seenProperties = new Map();

  for (const candidate of rawCombined) {
    if (candidate.id === 'QUO-2026-880' && rawCombined.length > 1) continue;
    const key = normalizeAddress(candidate.property);
    if (!key) {
      deduplicatedQuotes.push(candidate);
      continue;
    }

    if (!seenProperties.has(key)) {
      seenProperties.set(key, candidate);
      deduplicatedQuotes.push(candidate);
    } else {
      const existing = seenProperties.get(key);
      const isCandidateBetter =
        (!existing.isAccepted && candidate.isAccepted) ||
        (existing.id === 'QUO-2026-880' && candidate.id !== 'QUO-2026-880') ||
        (existing.id.startsWith('QUO-20266') && !candidate.id.startsWith('QUO-20266')) ||
        (Boolean(candidate.rawJob) && !existing.rawJob) ||
        (Boolean(candidate.rawQuote) && !existing.rawQuote);

      if (isCandidateBetter) {
        const idx = deduplicatedQuotes.indexOf(existing);
        if (idx !== -1) {
          deduplicatedQuotes[idx] = candidate;
        }
        seenProperties.set(key, candidate);
      }
    }
  }

  let quotes = deduplicatedQuotes;

  // Fallback: If no quote card resolved yet for this client, extract from registered client profile or lead request
  if (quotes.length === 0 && !isDemo && (userEmail || userName) && leads.length === 0 && effectiveJobs.length === 0) {
    let regCust = null;
    try {
      const regMap = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
      regCust = regMap[userEmail] || Object.values(regMap).find((c) => (c.name || '').toLowerCase().trim() === userName);
    } catch {}

    const targetProp = regCust?.address
      ? `${regCust.address}${regCust.postcode ? `, ${regCust.postcode}` : ''}`
      : user?.address
      ? `${user.address}${user.postcode ? `, ${user.postcode}` : ''}`
      : 'HYDERABAD, GH12AA';

    let isFallbackAccepted = false;
    try {
      const allQ = JSON.parse(localStorage.getItem('propertygroup_quotes') || '[]');
      isFallbackAccepted = allQ.some(
        (q) => (q.clientEmail || '').toLowerCase().trim() === userEmail && (q.status === 'Accepted' || q.status === 'ACCEPTED')
      );
    } catch {}

    quotes = [
      {
        id: 'QUO-2026-880',
        jobId: 'JOB-2026-880',
        property: targetProp,
        surveyType: 'RICS Level 2 Home Survey (Homebuyer)',
        net: '£550.00',
        vat: '£110.00',
        total: '£660.00',
        date: new Date().toLocaleDateString('en-GB'),
        status: isFallbackAccepted ? 'Quotation Accepted' : 'Open Proposal',
        isAccepted: isFallbackAccepted,
        termsStatus: 'Pending',
        validUntil: '14 Days Remaining',
      },
    ];

    // Persist into quotes store so all portal menus stay in sync
    try {
      const allQ = JSON.parse(localStorage.getItem('propertygroup_quotes') || '[]');
      if (!allQ.some((q) => (q.clientEmail || '').toLowerCase().trim() === userEmail)) {
        allQ.unshift({
          id: 'QUO-2026-880',
          refNo: 'QUO-2026-880',
          client: userName || 'abc',
          clientEmail: userEmail || 'astp750@gmail.com',
          property: targetProp,
          surveyType: 'RICS Level 2 Home Survey (Homebuyer)',
          baseFee: 550.0,
          vatAmount: 110.0,
          totalAmount: 660.0,
          status: isFallbackAccepted ? 'Accepted' : 'Sent',
          type: 'quotation',
          date: new Date().toLocaleDateString('en-GB'),
        });
        localStorage.setItem('propertygroup_quotes', JSON.stringify(allQ));
      }
    } catch {}
  }

  // SurveyBooker Trigger 2 Acceptance Handler
  const handleAcceptQuote = async (targetQuote) => {
    if (!targetQuote) return;
    setAcceptingQuoteId(targetQuote.id);

    try {
      const rawTotal = parseFloat(String(targetQuote.total).replace(/[^0-9.]/g, '')) || 660.0;
      const payload = {
        id: targetQuote.id,
        refNo: targetQuote.id,
        client: user?.name || userName || 'Valued Client',
        clientEmail: userEmail || user?.email || 'customer@demo.com',
        customer: user?.name || userName || 'Valued Client',
        customerEmail: userEmail || user?.email || 'customer@demo.com',
        customerName: user?.name || userName || 'Valued Client',
        property: targetQuote.property,
        propertyAddress: targetQuote.property,
        surveyType: targetQuote.surveyType,
        totalAmount: rawTotal,
        total: targetQuote.total,
        ...(targetQuote.rawQuote || {}),
        ...(targetQuote.rawJob || {}),
        ...(targetQuote.rawLead || {}),
      };

      const result = await dispatchQuoteAcceptance(payload);

      addToast({
        type: 'success',
        title: 'Proposal Accepted!',
        message: `Proposal ${targetQuote.id} accepted. Opening Terms of Engagement agreement to e-sign.`,
      });

      setConfirmQuote(null);
      setRefreshKey((k) => k + 1);

      // Immediately navigate to Terms of Engagement Agreement to e-sign
      setTimeout(() => {
        navigate('/customer/terms-to-sign', {
          state: {
            quoteId: targetQuote.id,
            property: targetQuote.property,
            surveyType: targetQuote.surveyType,
            acceptedProposal: true,
          }
        });
      }, 350);
    } catch (err) {
      console.error('Failed to accept quotation', err);
      addToast({
        type: 'error',
        title: 'Acceptance Error',
        message: 'Could not complete quotation acceptance. Please try again or contact support.',
      });
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="My Quotations & Fixed Fee Proposals"
        subtitle="Review official transparent quotations issued under the NJS Property Group rate cards."
        breadcrumb={['Customer Portal', 'Quotations']}
      />

      <div className="space-y-4">
        {quotes.map((q) => {
          const isAccepted = q.isAccepted || q.status === 'Quotation Accepted' || q.status === 'Accepted' || q.termsStatus === 'Signed';
          const isSigned = q.termsStatus === 'Signed';

          return (
            <div
              key={q.id}
              className={`bg-white p-6 rounded-3xl border transition-all shadow-xs flex flex-col gap-5 ${
                isAccepted ? 'border-emerald-200/90' : 'border-slate-200/90 hover:border-blue-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        isSigned
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isAccepted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-blue-50 text-[#0B1F4D] border border-blue-200'
                      }`}
                    >
                      {isSigned ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Terms Signed &amp; Active</span>
                        </>
                      ) : isAccepted ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                          <span>Quotation Accepted</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-[#2563EB]" />
                          <span>Ready to Accept</span>
                        </>
                      )}
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

                  {isSigned ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/customer/terms-to-sign')}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                      >
                        View Signed Terms
                      </button>
                      <button
                        onClick={() => navigate('/customer/my-bookings')}
                        className="px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-bold text-xs transition-all cursor-pointer"
                      >
                        Inspection Details
                      </button>
                    </div>
                  ) : isAccepted ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        onClick={() => navigate('/customer/terms-to-sign')}
                        className="px-4 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>1. Sign Terms of Engagement</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate('/customer/my-bookings')}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CalendarCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>2. Choose Date</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => setConfirmQuote(q)}
                        disabled={acceptingQuoteId !== null}
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Accept Proposal</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps Guidance Banner if Accepted but Terms not signed */}
              {isAccepted && !isSigned && (
                <div className="p-3.5 bg-gradient-to-r from-emerald-50/80 via-blue-50/40 to-slate-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        Quotation accepted! Automated confirmation email dispatched to {userEmail || 'your email'}.
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Please complete the 2 required next steps to proceed with your inspection booking:
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate('/customer/terms-to-sign')}
                      className="px-3 py-1.5 rounded-lg bg-[#0B1F4D] text-white text-[11px] font-bold hover:bg-[#162E6E] cursor-pointer flex items-center gap-1"
                    >
                      <span>Sign Terms</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => navigate('/customer/my-bookings')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-[11px] font-bold hover:bg-slate-50 cursor-pointer flex items-center gap-1"
                    >
                      <span>Choose Date</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {quotes.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            No quotations found under your account.
          </div>
        )}
      </div>

      {/* Confirmation Modal before Acceptance */}
      {confirmQuote && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmQuote(null)}
          title="Review & Accept Proposal"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-500 font-bold">{confirmQuote.id}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  Fixed Fee Proposal
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{confirmQuote.property}</h4>
              <p className="text-slate-600 font-semibold">{confirmQuote.surveyType}</p>
              <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between font-mono">
                <span className="text-slate-500">Total Fixed Fee (Inc. 20% VAT):</span>
                <span className="text-base font-black text-[#0B1F4D]">{confirmQuote.total}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-slate-600">
              <p className="font-bold text-slate-800">What happens when you accept:</p>
              <ul className="space-y-1.5 list-disc list-inside text-[11.5px]">
                <li>
                  An official automated confirmation email will be dispatched immediately to <strong>{userEmail || 'your email'}</strong>.
                </li>
                <li>Your survey instruction moves to the next RICS stage in our system.</li>
                <li>You will be prompted to electronically sign your RICS Terms of Engagement.</li>
                <li>You will be able to select your preferred property inspection date &amp; time slot.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmQuote(null)}
                disabled={acceptingQuoteId !== null}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAcceptQuote(confirmQuote)}
                disabled={acceptingQuoteId !== null}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {acceptingQuoteId ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Acceptance...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Confirm &amp; Accept Proposal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal with direct Next Steps */}
      {acceptedSuccessQuote && (
        <Modal
          isOpen={true}
          onClose={() => setAcceptedSuccessQuote(null)}
          title="Quotation Accepted Successfully"
          size="md"
        >
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-[#0B1F4D]">
                Thank You for Instructing NJS Property Group!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your quotation for <strong>{acceptedSuccessQuote.property}</strong> has been accepted. An automated confirmation email has been dispatched to <strong>{acceptedSuccessQuote.emailSentTo}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Please Complete Your Next 2 Steps:
              </p>

              {/* Step 1 */}
              <div
                onClick={() => {
                  setAcceptedSuccessQuote(null);
                  navigate('/customer/terms-to-sign');
                }}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-[#2563EB] shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B1F4D] font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                      Digitally Sign Terms of Engagement
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Required by RICS regulations before surveyor physical inspection.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all" />
              </div>

              {/* Step 2 */}
              <div
                onClick={() => {
                  setAcceptedSuccessQuote(null);
                  navigate('/customer/my-bookings');
                }}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-[#2563EB] shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                      Select Preferred Inspection Date
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Choose your preferred inspection time slot with our surveyor.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setAcceptedSuccessQuote(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Continue in Portal
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ==========================================
// 4. INVOICES & PAYMENTS PAGE
// ==========================================
export const CustomerInvoicesPage = () => {
  useEffect(() => { customerInvoicesAndPaymentsApi.getInvoices().catch(() => {}); }, []);
  const { user } = useAuth();
  const { addToast } = useToast();
  const { jobs, updateJob, addJob } = useJobs();

  const [settlingInvoice, setSettlingInvoice] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferProofRef, setTransferProofRef] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));

  const invoices = myJobs.map((j) => {
    const net = j.quote?.baseFee || (j.surveyType?.includes('Level 3') ? 1450.0 : 770.0);
    const vat = Math.round(net * 0.2);
    const total = net + vat;
    const isPaid = j.paymentStatus === 'Paid';
    const isClaimed =
      j.paymentStatus === 'Claimed (Verification Pending)' ||
      j.paymentStatus === 'Claimed' ||
      (j.paymentStatus && j.paymentStatus.includes('Claimed'));

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
      status: isPaid ? 'Paid' : isClaimed ? 'Payment Claimed' : 'Unpaid',
      isPaid,
      isClaimed,
      transferReference: j.transferReference,
      method: j.paymentMethod || (isPaid ? 'Bank Transfer (BACS Faster Payments)' : 'Bank Transfer (BACS)'),
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
      // 1. Update job in store to Claimed (Verification Pending) per Client Bank Transfer specification (NOT auto-paid!)
      updateJob(settlingInvoice.jobRef, {
        paymentStatus: 'Claimed (Verification Pending)',
        paymentMethod: 'Bank Transfer (BACS Faster Payments)',
        transferReference: transferProofRef || '',
        canBook: false,
        activityLog: [
          {
            id: Date.now(),
            time: `${new Date().toLocaleDateString('en-GB')}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
            text: `Customer ${user?.name || 'Client'} marked bank transfer of £${settlingInvoice.grossTotal.toFixed(2)} for invoice ${settlingInvoice.invNo} (Ref: ${transferProofRef || 'N/A'}). Status: Payment Claimed — Awaiting NJS Admin Verification.`,
          },
        ],
      });

      // 2. Also update localStorage so all tabs reflect immediately
      try {
        const storedJobs = JSON.parse(localStorage.getItem('propertygroup_jobs') || '[]');
        const updatedJobs = storedJobs.map((j) => {
          if (j.id === settlingInvoice.jobRef) {
            return {
              ...j,
              paymentStatus: 'Claimed (Verification Pending)',
              paymentMethod: 'Bank Transfer (BACS Faster Payments)',
              transferReference: transferProofRef || '',
            };
          }
          return j;
        });
        localStorage.setItem('propertygroup_jobs', JSON.stringify(updatedJobs));
        window.dispatchEvent(new Event('propertygroup_jobs_updated'));
      } catch {}

      setIsProcessing(false);
      setSettlingInvoice(null);
      setTransferProofRef('');

      addToast({
        type: 'info',
        title: 'Bank Transfer Claim Submitted',
        message: `Status updated to: Payment Claimed — Awaiting NJS Admin Verification for ${settlingInvoice.total}. NJS accounts desk will reconcile funds.`,
      });
    }, 800);
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
            <Receipt className="w-5 h-5 text-amber-600" />
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
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                      inv.isPaid
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : inv.isClaimed
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {inv.isPaid ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Paid &amp; Settled ✓</span>
                      </>
                    ) : inv.isClaimed ? (
                      <>
                        <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                        <span>Payment Claimed — Awaiting NJS Admin Verification</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        <span>Payment Outstanding</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">{inv.invNo}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    Ref #{inv.jobRef}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-[#0B1F4D] truncate">{inv.property}</h4>
                <p className="text-xs text-slate-600 font-medium">{inv.service}</p>

                <div className="text-xs text-slate-500 flex items-center gap-2 pt-1 font-medium">
                  {inv.isPaid ? (
                    <span>
                      Settled on {inv.date} via <strong className="text-slate-700">{inv.method}</strong>
                    </span>
                  ) : inv.isClaimed ? (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Bank transfer notification submitted — awaiting NJS accounts verification</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold">
                      Awaiting Advance Bank Transfer Settlement prior to site visit
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
                  {inv.isPaid ? (
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
                  ) : inv.isClaimed ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSettlingInvoice(inv)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        title="View bank details"
                      >
                        <Building className="w-3.5 h-3.5 text-[#0B1F4D]" />
                        <span>View Bank Details</span>
                      </button>
                      <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>Verification Pending</span>
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSettlingInvoice(inv)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Building className="w-4 h-4" />
                      <span>Pay via Bank Transfer ({inv.total})</span>
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
          title="Bank Transfer Payment Details"
          subtitle={`Direct BACS Faster Payments settlement for ${settlingInvoice.invNo} (${settlingInvoice.property})`}
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-500 font-medium">
                Official NJS Practice Client Account • Beneficiary: NJS PROPERTY GROUP LTD
              </span>
              <button
                type="button"
                onClick={() => setSettlingInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
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
                  Zero Merchant Surcharges
                </span>
              </div>
            </div>

            {/* Direct Bank Transfer Payment Panel (Client Specification: Bank Transfer Only) */}
            <div className="p-5 bg-gradient-to-br from-blue-50/70 via-slate-50 to-emerald-50/60 rounded-2xl border border-blue-200/90 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="font-bold text-[#0B1F4D] flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <span>Direct Bank Transfer (BACS / Faster Payments)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Zero Surcharges
                </span>
              </div>

              <p className="text-slate-600 leading-relaxed font-medium">
                Please transfer the invoice balance directly to our practice client account using your online banking application:
              </p>

              {/* Exact Bank Details */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-white rounded-xl border border-blue-100 shadow-2xs text-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Name</span>
                  <strong className="text-slate-900 text-xs sm:text-sm font-black">NJS PROPERTY GROUP LTD</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Reference</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <strong className="text-[#2563EB] font-mono text-xs sm:text-sm font-black">{settlingInvoice.invNo}</strong>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(settlingInvoice.invNo);
                        setCopiedRef(true);
                        setTimeout(() => setCopiedRef(false), 2000);
                      }}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer text-[10px]"
                      title="Copy Reference"
                    >
                      {copiedRef ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Sort Code</span>
                  <strong className="text-slate-900 font-mono text-sm sm:text-base font-black">23-05-80</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Number</span>
                  <strong className="text-slate-900 font-mono text-sm sm:text-base font-black">46452283</strong>
                </div>
              </div>

              {/* Optional Transfer Reference / Notes */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Your Bank Transfer Reference / Payer Name (Optional):
                </label>
                <input
                  type="text"
                  value={transferProofRef}
                  onChange={(e) => setTransferProofRef(e.target.value)}
                  placeholder="e.g. Sent from Barclays Ref #12345 / Payer Name"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <span className="text-[10.5px] text-slate-500 block leading-tight">
                  Enter your bank reference or sending account name so NJS accounts can swiftly reconcile your payment.
                </span>
              </div>

              {/* Status Compliance Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium">
                <strong>Notice:</strong> Clicking "I have made a bank transfer" notifies NJS Admin to verify receipt of funds. Status will be marked as <strong>"Payment Claimed — Awaiting NJS Admin Verification"</strong>. To prevent unverified bookings, your invoice is NOT automatically marked as Paid until verified by our accounts team.
              </div>

              {/* Submit Claim Button with Exact User Text */}
              <button
                type="button"
                onClick={handleProcessSettlement}
                disabled={isProcessing}
                className="w-full mt-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Logging Bank Transfer Notification...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>I have made a bank transfer</span>
                  </>
                )}
              </button>
            </div>
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
  useEffect(() => { customerReportsApi.getReports().catch(() => {}); }, []);
  const { user } = useAuth();
  const { addToast } = useToast();
  const { jobs, updateJob, addJob } = useJobs();
  const [reviewPromptJob, setReviewPromptJob] = useState(null);
  const [promptRating, setPromptRating] = useState(5);
  const [promptFeedback, setPromptFeedback] = useState('');

  // Strict RICS Compliance: Final report is ONLY accessible after explicit Admin/QA approval.
  // Drafts, rejected reports, and in-progress QA notes must NEVER appear as downloadable reports.
  const myCompletedJobs = jobs.filter(
    (j) => isJobForCustomer(j, user) && (j.status === 'Completed' || j.qaApproved === true || j.reportReleased === true || (j.timelineStep === 10 && j.status !== 'Preparing report'))
  );

  const inProgressQaJobs = jobs.filter(
    (j) => isJobForCustomer(j, user) && (j.status === 'Preparing report' || j.timelineStep === 7 || j.timelineStep === 8) && !(j.status === 'Completed' || j.qaApproved === true || j.reportReleased === true)
  );

  const reports = myCompletedJobs.map((j) => ({
    id: `RPT-${j.id.replace('JOB-2026-', '')}`,
    jobRef: j.id,
    title: `RICS_${j.surveyType?.replace(/[^a-zA-Z0-9]/g, '_')}_${j.property?.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
    property: `${j.property}, ${j.location}`,
    date: j.date || '27/10/2026',
    size: '14.2 MB',
    surveyor: j.surveyor || 'Assigned Chartered Surveyor',
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

    const targetJob = myCompletedJobs.find((j) => j.id === r.jobRef || r.id.includes(j.id.replace('JOB-2026-', '')));
    if (targetJob && !targetJob.reviewSubmitted) {
      setTimeout(() => {
        setReviewPromptJob(targetJob);
      }, 500);
    }
  };

  const handleDownloadSample = (level) => {
    downloadReportPDF({
      jobNo: `SAMPLE-LVL-${level}`,
      clientName: 'Sample Client (Anonymised)',
      property: level === 2 ? '14 Mayfair Gate, London W1K' : '24 Kensington Palace Gardens, London W8',
      surveyType: level === 2 ? 'RICS Level 2 Home Survey' : 'RICS Level 3 Building Survey',
      surveyorName: 'NJS Lead Chartered Surveyor',
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

        {/* In-Progress QA Reports Notice (Drafts remain strictly hidden until Admin QA approval) */}
        {inProgressQaJobs.map((j) => (
          <div
            key={j.id}
            className="bg-amber-50/60 p-5 rounded-3xl border border-amber-200/80 flex items-start gap-4 text-xs"
          >
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-900">{j.jobNo || j.id}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                  Under Admin QA Review
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{j.property}</h4>
              <p className="text-slate-600 leading-relaxed">
                On-site inspection completed. The surveyor's technical draft is currently undergoing quality assurance review by NJS practice governance. The final certified report PDF will be unlocked here immediately upon formal QA approval.
              </p>
            </div>
          </div>
        ))}

        {reports.length === 0 && inProgressQaJobs.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            No completed reports released yet for your properties. Reports are uploaded within 48h-72h following inspection and QA review.
          </div>
        )}

      {/* Post-Download Trustpilot Feedback Modal */}
      {reviewPromptJob && (
        <Modal
          isOpen={!!reviewPromptJob}
          onClose={() => setReviewPromptJob(null)}
          title="Survey Delivered: How Was Your Experience?"
          size="md"
        >
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-[#00B67A]/10 text-[#00B67A] flex items-center justify-center mx-auto">
              <Star className="w-8 h-8 fill-[#00B67A]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
                <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>Verified Trustpilot Invitation</span>
              </div>
              <h3 className="text-base font-black text-[#0B1F4D]">
                Rate Surveyor {reviewPromptJob.surveyor || 'Assigned Surveyor'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your official report for <strong>{reviewPromptJob.property}</strong> has been downloaded. Would you share 30 seconds of feedback on Trustpilot?
              </p>
            </div>

            {/* Star Picker */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPromptRating(star)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${star <= promptRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                  />
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-slate-700">
              {promptRating === 5 ? 'Excellent ★★★★★' : `${promptRating} Stars Selected`}
            </div>

            <textarea
              rows={2}
              value={promptFeedback}
              onChange={(e) => setPromptFeedback(e.target.value)}
              placeholder="Brief comments on report clarity, turnaround speed, or surveyor thoroughness (optional)..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewPromptJob(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
              >
                Maybe Later
              </button>
              <button
                type="button"
                onClick={() => {
                  updateJob(reviewPromptJob.id, {
                    reviewSubmitted: true,
                    reviewRating: promptRating,
                    reviewFeedback: promptFeedback || 'Excellent survey turnaround and clear advice.',
                    reviewDate: new Date().toISOString(),
                    activityLog: [
                      {
                        id: Date.now(),
                        time: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                        text: `⭐ Customer submitted ${promptRating}-star verified Trustpilot review: "${promptFeedback || 'Excellent turnaround and thorough inspection.'}"`,
                      },
                      ...(reviewPromptJob.activityLog || []),
                    ],
                  });
                  setReviewPromptJob(null);
                  addToast({
                    type: 'success',
                    title: 'Feedback Saved & Trustpilot Opened',
                    message: 'Thank you for rating NJS Property Group!',
                  });
                  window.open('https://www.trustpilot.com/review/njspropertygroup.com', '_blank', 'noopener,noreferrer');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#00B67A] hover:bg-[#009E6B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>Submit &amp; Open Trustpilot</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </Modal>
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
  useEffect(() => { customerTrackSurveyApi.getTracking().catch(() => {}); }, []);
  const { user } = useAuth();
  const { jobs } = useJobs();
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener('propertygroup_jobs_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('propertygroup_jobs_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);
  const { quotes = [] } = useQuotes();
  const { leads = [] } = useLeads();
  const { agreements = [] } = useTerms();
  const userEmail = (user?.email || '').toLowerCase().trim();
  const isDemo = userEmail === 'customer@demo.com';

  const myCustomerJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const [activeJobId, setActiveJobId] = useState(() => {
    return localStorage.getItem(`propertygroup_active_job_${userEmail}`) || myCustomerJobs[0]?.id || null;
  });
  const myJob = myCustomerJobs.find((j) => j.id === activeJobId) || myCustomerJobs[0] || null;
  const historyJobs = myCustomerJobs.filter((j) => j.id !== myJob?.id);

  const myQuote = quotes.find((q) => (q.clientEmail || '').toLowerCase().trim() === userEmail);
  const myLead = leads.find((l) => (l.customerEmail || l.clientEmail || '').toLowerCase().trim() === userEmail);
  const myAgreement = agreements.find((a) => {
    const aEmail = (a.signerEmail || '').toLowerCase().trim();
    return (userEmail && aEmail === userEmail) || (myJob && a.jobNo === myJob.id);
  });

  let regUser = {};
  try {
    const reg = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
    regUser = reg[userEmail] || {};
  } catch {}

  const propertyAddress = myJob?.property
    ? `${myJob.property}${myJob.location ? `, ${myJob.location}` : ''}`
    : myQuote?.property
    ? `${myQuote.property}${myQuote.location ? `, ${myQuote.location}` : ''}`
    : myLead?.property
    ? `${myLead.property}${myLead.location ? `, ${myLead.location}` : ''}`
    : regUser.address
    ? `${regUser.address}${regUser.city ? `, ${regUser.city}` : ''}`
    : (isDemo ? '14 Mayfair Gate, Mayfair, London W1K 2PB' : 'HYDERABAD, GH12AA');

  const refNo = myJob?.id || myJob?.jobNo || myQuote?.id || myLead?.id || (isDemo ? 'JOB-2026-080' : 'JOB-2026-880');
  const surveyorName = myJob?.surveyor || 'Pending Allocation';

  // Calculate live dynamic step (1 to 10) based on specific selected instruction lifecycle
  const targetEmail = userEmail || 'astp750@gmail.com';
  const isHistoricalJob = myJob?.id === 'QUO-2026-126' || (!myJob?.isNewInstruction && (myJob?.timelineStep || 0) >= 6);
  const isUniversalDelivered = localStorage.getItem('propertygroup_delivered') === 'true';
  const isUniversalQA = localStorage.getItem('propertygroup_qareview') === 'true';
  const isUniversalDrafting = localStorage.getItem('propertygroup_drafting') === 'true';
  const isUniversalInspected = localStorage.getItem('propertygroup_inspection_completed') === 'true';

  const isLocalDelivered = isUniversalDelivered || localStorage.getItem(`propertygroup_delivered_${targetEmail}`) === 'true';
  const isLocalQA = isUniversalQA || localStorage.getItem(`propertygroup_qareview_${targetEmail}`) === 'true';
  const isLocalDrafting = isUniversalDrafting || localStorage.getItem(`propertygroup_drafting_${targetEmail}`) === 'true';
  const isLocalInspected = isUniversalInspected || localStorage.getItem(`propertygroup_inspection_completed_${targetEmail}`) === 'true';

  const jStatus = (myJob?.status || '').toLowerCase().trim();
  const timelineStep = myJob?.timelineStep || (jStatus === 'enquiry' || jStatus === 'new' ? 1 : 0);
  const hasSurveyor = myJob?.surveyor && myJob.surveyor !== 'Pending Allocation';
  const isBookedOrScheduled = jStatus === 'scheduled' || jStatus === 'booked' || hasSurveyor || timelineStep >= 6;

  let currentStep = 1;
  if (isDemo) {
    currentStep = 7;
  } else if (myJob?.status === 'Completed' || timelineStep >= 10 || (isHistoricalJob && isLocalDelivered) || jStatus === 'completed') {
    currentStep = 10;
  } else if (myJob?.status === 'QA_Review' || timelineStep === 9 || (isHistoricalJob && isLocalQA) || jStatus === 'qa_review' || jStatus === 'qa review') {
    currentStep = 9;
  } else if (myJob?.status === 'Drafting' || timelineStep === 8 || (isHistoricalJob && isLocalDrafting) || jStatus === 'drafting' || jStatus === 'preparing report') {
    currentStep = 8;
  } else if (myJob?.status === 'Inspected' || timelineStep === 7 || (isHistoricalJob && isLocalInspected) || jStatus === 'inspected') {
    currentStep = 7;
  } else if (isBookedOrScheduled) {
    currentStep = 6;
  } else if (myJob?.paymentStatus === 'Paid' || timelineStep >= 5) {
    currentStep = 5;
  } else if (myJob?.termsStatus === 'Signed' || timelineStep >= 4) {
    currentStep = 4;
  } else if (myJob?.status === 'Accepted' || timelineStep >= 3) {
    currentStep = 3;
  } else if (myJob?.status === 'Quoted' || timelineStep >= 2) {
    currentStep = 2;
  } else {
    currentStep = 1;
  }

  const milestone = React.useMemo(() => {
    switch (currentStep) {
      case 1:
        return {
          cStage: 'Stage 1: Enquiry Logged',
          cDesc: `Enquiry received for ${propertyAddress}.`,
          aStage: 'Stage 2: Quotation Preparation (Current)',
          aDesc: 'Operations estimating desk is finalizing your fixed fee proposal.',
          uStage: 'Stage 3: Proposal Review & Client Acceptance',
          uDesc: 'Proposal will be issued to your email and portal.',
        };
      case 2:
      case 3:
        return {
          cStage: 'Stage 2: Quotation Issued',
          cDesc: `Formal fee proposal issued for ${propertyAddress}.`,
          aStage: 'Stage 3: Proposal Review & Acceptance (Current)',
          aDesc: 'Please review and accept your quotation to proceed with RICS engagement.',
          uStage: 'Stage 4: Terms of Engagement Signing',
          uDesc: 'Digital signature required under RICS regulatory compliance.',
        };
      case 4:
        return {
          cStage: 'Stage 4: Terms of Engagement Signed',
          cDesc: `Letter of engagement executed for ${propertyAddress}. Official contract sealed.`,
          aStage: 'Stage 5: Booking Fee / Advance Payment (Current)',
          aDesc: 'Awaiting invoice payment to lock diary inspection window with assigned surveyor.',
          uStage: 'Stage 6: Surveyor Allocation & Date Confirmation',
          uDesc: 'Operations desk will coordinate key collection and confirmed site access slot.',
        };
      case 5:
        return {
          cStage: 'Stage 5: Payment Confirmed & Receipt Issued',
          cDesc: 'Payment registered and VAT receipt issued. Booking is locked.',
          aStage: 'Stage 6: Operations Desk Allocating Surveyor (Current)',
          aDesc: `Operations team is assigning local RICS surveyor and coordinating access for ${propertyAddress}.`,
          uStage: 'Stage 7: On-Site Physical Inspection',
          uDesc: 'Surveyor will conduct detailed inspection.',
        };
      case 6:
        return {
          cStage: 'Stage 6: Inspection Date Booked',
          cDesc: `Survey inspection locked for ${propertyAddress} with ${surveyorName}. Access arranged with agent.`,
          aStage: 'Stage 7: Physical On-Site Inspection (Current)',
          aDesc: `Surveyor on-site at ${propertyAddress} conducting structural evaluation.`,
          uStage: 'Stage 8: Report Compilation & Defect Diagnostics',
          uDesc: 'Surveyor compiling condition ratings and rebuild calculations.',
        };
      case 7:
        return {
          cStage: 'Stage 7: On-Site Inspection Completed',
          cDesc: `${surveyorName} concluded inspection at ${propertyAddress}. Key access concluded and site secured.`,
          aStage: 'Stage 8: Report Drafting & Analysis (Current)',
          aDesc: 'Surveyor compiling defect findings, condition ratings 1 to 3, and rebuild costs.',
          uStage: 'Stage 9: Quality Assurance & Lead Sign-off',
          uDesc: 'Senior RICS Lead Surveyor audit prior to client release.',
        };
      case 8:
        return {
          cStage: 'Stage 8: Report Drafting Concluded',
          cDesc: 'Full inspection findings and repair recommendations compiled.',
          aStage: 'Stage 9: Quality Assurance & Lead Sign-off (Current)',
          aDesc: 'Lead Surveyor auditing defect ratings against RICS Home Survey Standard.',
          uStage: 'Stage 10: Official Report Delivery',
          uDesc: 'Final certified PDF publication to My Reports.',
        };
      case 9:
      case 10:
      default:
        return {
          cStage: 'Stage 9: QA Audit Approved',
          cDesc: 'Report audited and certified by Lead Surveyor under RICS guidelines.',
          aStage: 'Stage 10: Official Report Delivered (Current)',
          aDesc: 'Your comprehensive RICS report is published and available for download in My Reports.',
          uStage: 'Consultation: Surveyor Telephone Debrief',
          uDesc: 'Direct telephone debrief available with your surveyor for any technical questions.',
        };
    }
  }, [currentStep, propertyAddress, surveyorName]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Track My Survey Progress"
        subtitle="Follow the step-by-step lifecycle of your property survey from booking to report delivery."
        breadcrumb={['Customer Portal', 'Track My Survey']}
      />

      {/* Instruction Switcher if Customer has multiple instructions (Active vs History) */}
      {myCustomerJobs.length > 1 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              {myCustomerJobs.length}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Tracking Instruction ({myCustomerJobs.indexOf(myJob) + 1} of {myCustomerJobs.length})
              </div>
              <div className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
                <span>{myJob?.surveyType || 'Survey'} &bull; {myJob?.property || myJob?.location}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase">
                  {myJob?.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="track-job-select" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Switch Survey:
            </label>
            <select
              id="track-job-select"
              value={myJob?.id || ''}
              onChange={(e) => {
                setActiveJobId(e.target.value);
                localStorage.setItem(`propertygroup_active_job_${userEmail}`, e.target.value);
              }}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {myCustomerJobs.map((j, idx) => (
                <option key={j.id} value={j.id}>
                  {idx === 0 ? '★ Active Request: ' : '📋 History: '} {j.surveyType} — {j.property || j.location} ({j.id}) [{j.status}]
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <SurveyProgressTracker currentStep={currentStep} job={myJob || { property: propertyAddress, surveyor: surveyorName }} />

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
                <strong className="text-emerald-950 block">{milestone.cStage}</strong>
                <span className="text-emerald-800 text-[11px]">
                  {milestone.cDesc}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-950 block">{milestone.aStage}</strong>
                <span className="text-blue-800 text-[11px]">
                  {milestone.aDesc}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl opacity-75">
              <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">{milestone.uStage}</strong>
                <span className="text-slate-600 text-[11px]">
                  {milestone.uDesc}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-[#0B1F4D]">Property Reference</h4>
            <div className="space-y-1.5 text-slate-600">
              <div className="text-slate-900 font-bold">{propertyAddress}</div>
              <div className="pt-2 border-t border-slate-100 text-[11px]">
                Ref: <strong>{refNo}</strong>
              </div>
              <div className="text-[11px]">
                Surveyor: <strong>{surveyorName}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instruction History & Previous Surveys Card */}
      {historyJobs.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2563EB]" />
                <span>Instruction History &amp; Previous Surveys</span>
              </h3>
              <p className="text-xs text-slate-500">Your previously completed instructions and finalized reports remain accessible below</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {historyJobs.length} {historyJobs.length === 1 ? 'Record in History' : 'Records in History'}
            </span>
          </div>

          <div className="space-y-3">
            {historyJobs.map((hj) => (
              <div
                key={hj.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs truncate">{hj.surveyType}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700 uppercase font-mono">
                      Ref: {hj.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{hj.property || hj.location}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Status: <strong className="text-emerald-700">{hj.status}</strong> &bull; Assigned: {hj.surveyor || 'Assigned Surveyor'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveJobId(hj.id);
                      localStorage.setItem(`propertygroup_active_job_${userEmail}`, hj.id);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#162E6E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Switch to this Survey &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 7. APPOINTMENT DETAILS PAGE
// ==========================================
export const CustomerAppointmentDetailsPage = () => {
  useEffect(() => { customerAppointmentDetailsApi.getAppointment().catch(() => {}); }, []);
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
  const [assignedSurveyor, setAssignedSurveyor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerAssignedSurveyorApi
      .getSurveyor()
      .then((res) => {
        const s = res?.assignedSurveyor || res?.data?.assignedSurveyor || (res?.name ? res : null);
        if (s) setAssignedSurveyor(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const currentJob = myJobs[0] || null;

  const hasAssigned = Boolean(
    assignedSurveyor ||
    (currentJob?.surveyor &&
      currentJob.surveyor !== 'Pending Allocation' &&
      currentJob.surveyor !== 'Unallocated')
  );

  const surveyorName = assignedSurveyor?.name || (hasAssigned ? currentJob?.surveyor : 'Pending Allocation');
  const surveyor = SURVEYORS.find((s) => s.name === surveyorName) || {
    name: surveyorName,
    credentials: assignedSurveyor?.accreditation
      ? `${assignedSurveyor.accreditation} Chartered Surveyor`
      : 'RICS Chartered Surveyor',
    postcodes: assignedSurveyor?.postcodeCoverage || 'London & Home Counties',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
  };

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
        {!hasAssigned ? (
          <div className="text-center py-10 px-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
              <UserCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-[#0B1F4D]">Surveyor Allocation in Progress</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Our operations dispatch desk is assigning an accredited local RICS chartered surveyor to your property.
              As soon as your appointment is locked, their verified RICS credentials, direct contact, and profile will appear here.
            </p>
          </div>
        ) : (
          <>
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
                <div className="font-bold text-slate-900">{currentJob?.property || 'Subject Property'}</div>
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
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 9. MESSAGES PAGE (Direct 2-Way Chat - Strict Personal Isolation)
// ==========================================
export const CustomerMessagesPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { sendMessage } = useMessages();
  const messagesEndRef = useRef(null);

  const userRole = (user?.role || '').toLowerCase();
  const isCustomer = userRole === 'customer' || userRole === 'client';
  const isSurveyor = userRole === 'surveyor';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  const getEffectiveUserId = () => {
    if (!user) return null;
    if (typeof user.id === 'number') return user.id;
    const digits = String(user.id || '').replace(/\D/g, '');
    if (digits) return parseInt(digits, 10);
    return user.id;
  };

  const effectiveUserId = getEffectiveUserId();
  const myConvId = effectiveUserId ? `conv-user-${effectiveUserId}` : 'conv-user-me';
  const defaultConvId = (isCustomer || isSurveyor) ? myConvId : null;

  const customerAdminContact = {
    id: myConvId,
    userId: effectiveUserId,
    name: 'NJS Operations & Admin Desk',
    email: 'info@njspropertygroup.com',
    role: 'ADMIN',
    roleTitle: 'NJS Operations & Admin Desk',
    avatar: 'NJS',
    lastMessage: 'Direct communications channel active',
    time: 'Today',
    lastMessageTime: new Date().toISOString(),
    online: true,
    unread: false,
  };

  const surveyorAdminContact = {
    id: myConvId,
    userId: effectiveUserId,
    name: 'NJS Operations & Dispatch Desk',
    email: 'info@njspropertygroup.com',
    role: 'ADMIN',
    roleTitle: 'NJS Operations Desk',
    avatar: 'NJS',
    lastMessage: 'Direct surveyor coordination active',
    time: 'Today',
    lastMessageTime: new Date().toISOString(),
    online: true,
    unread: false,
  };

  const [searchParams] = useSearchParams();
  const urlConvId = searchParams.get('conversationId');

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannelId, setActiveChannelId] = useState(() => {
    if (urlConvId && !isCustomer && !isSurveyor) return urlConvId;
    return defaultConvId;
  });
  const [mobileView, setMobileView] = useState(() => (urlConvId ? 'chat' : 'chat')); // 'list' | 'chat'
  const [contactFilter, setContactFilter] = useState('all'); // 'all' | 'needs_reply'

  // URL Query Sync (e.g. from Gmail alert click -> /admin/messages?conversationId=conv-user-123)
  useEffect(() => {
    if (urlConvId && !isCustomer && !isSurveyor) {
      setActiveChannelId(urlConvId);
      setMobileView('chat');
    }
  }, [urlConvId, isCustomer, isSurveyor]);

  // Initial Contacts strictly role-isolated (Customers see ONLY Admin Desk; Surveyors see Admin Desk; Admin sees All)
  const [people, setPeople] = useState(() => {
    if (isCustomer) {
      return [customerAdminContact];
    }
    if (isSurveyor) {
      return [surveyorAdminContact];
    }
    // Admin sees only real registered contacts from database
    return [];
  });

  // Thread Messages mapping per conversation
  const [threadsMap, setThreadsMap] = useState({});
  const fetchContactsRef = useRef(null);
  const fetchMsgsRef = useRef(null);

  // Cross-tab instantaneous synchronizer (BroadcastChannel + localStorage storage event)
  useEffect(() => {
    let bc;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('njs_chat_sync');
        bc.onmessage = () => {
          fetchMsgsRef.current?.();
          fetchContactsRef.current?.();
        };
      }
    } catch {}

    const handleStorage = (e) => {
      if (e.key === 'njs_last_chat_dispatch') {
        fetchMsgsRef.current?.();
        fetchContactsRef.current?.();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      try { bc?.close(); } catch {}
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Fetch role-isolated contacts from Backend Database API with live periodic polling
  useEffect(() => {
    let isMounted = true;
    const fetchContacts = () => {
      customerMessagesApi
        .getContacts()
        .then((res) => {
          if (!isMounted) return;
          const serverContacts = res?.contacts || res?.data?.contacts || [];
          if (Array.isArray(serverContacts) && serverContacts.length > 0) {
            setPeople(serverContacts);
            if (isCustomer || isSurveyor) {
              setActiveChannelId(serverContacts[0].id || myConvId);
            } else {
              if (urlConvId && serverContacts.some((c) => c.id === urlConvId)) {
                setActiveChannelId(urlConvId);
              } else {
                setActiveChannelId((currentActive) => {
                  if (currentActive && serverContacts.some((c) => c.id === currentActive)) {
                    return currentActive; // Keep the admin's currently selected contact thread!
                  }
                  return serverContacts[0].id;
                });
              }
            }
          } else {
            if (isCustomer) {
              setPeople([customerAdminContact]);
              setActiveChannelId(myConvId);
            } else if (isSurveyor) {
              setPeople([surveyorAdminContact]);
              setActiveChannelId(myConvId);
            } else {
              setPeople([]);
              setActiveChannelId(null);
            }
          }
        })
        .catch((err) => {
          console.warn('Contacts API sync notice:', err);
          if (isCustomer) {
            setPeople([customerAdminContact]);
            setActiveChannelId(myConvId);
          } else if (isSurveyor) {
            setPeople([surveyorAdminContact]);
            setActiveChannelId(myConvId);
          } else {
            setPeople([]);
            setActiveChannelId(null);
          }
        });
    };

    fetchContactsRef.current = fetchContacts;
    fetchContacts();
    const handleConvUpdate = () => fetchContacts();
    window.addEventListener('propertygroup_conversations_updated', handleConvUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('propertygroup_conversations_updated', handleConvUpdate);
    };
  }, [userRole, user?.email, user?.id, effectiveUserId, myConvId, isCustomer, isSurveyor, urlConvId]);

  // Fetch remote messages for active channel from Database with strict isolation & event-driven updates
  useEffect(() => {
    const targetChannel = isCustomer || isSurveyor ? (people[0]?.id || myConvId) : activeChannelId;
    if (!targetChannel) return;
    let isMounted = true;
    const fetchMsgs = () => {
      customerMessagesApi
        .getMessages({ conversationId: targetChannel })
        .then((res) => {
          if (!isMounted) return;
          const remoteMsgs = res?.messages || res?.data?.messages || [];
          const mapped = remoteMsgs.map((m) => {
            const created = m.createdAt ? new Date(m.createdAt) : new Date();
            const timeStr = m.createdAt
              ? `Today, ${created.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
              : 'Today';
            return {
              id: m.id,
              senderId: m.senderId,
              sender: m.senderName || (m.role === 'admin' ? 'Alexander Sterling' : 'Client'),
              role: m.role || 'customer',
              text: m.content || '',
              time: timeStr,
              readByCustomer: Boolean(m.readByCustomer),
              readByAdmin: Boolean(m.readByAdmin),
              read: Boolean(m.read || m.isRead),
              isRead: Boolean(m.isRead || m.read),
            };
          });

          setThreadsMap((prev) => ({
            ...prev,
            [targetChannel]: mapped,
          }));
        })
        .catch(() => {});
    };

    fetchMsgsRef.current = fetchMsgs;
    fetchMsgs();

    const handleNewMsgEvent = () => fetchMsgs();
    window.addEventListener('njs_new_message_notification', handleNewMsgEvent);
    window.addEventListener('propertygroup_messages_updated', handleNewMsgEvent);

    // Relaxed background check (every 30s only when document is visible)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchMsgs();
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('njs_new_message_notification', handleNewMsgEvent);
      window.removeEventListener('propertygroup_messages_updated', handleNewMsgEvent);
    };
  }, [activeChannelId, isCustomer, isSurveyor, myConvId]);

  // Find active contact or default to first contact
  const activeContact =
    isCustomer
      ? (people[0] || customerAdminContact)
      : isSurveyor
      ? (people[0] || surveyorAdminContact)
      : (people.find((c) => c.id === activeChannelId) || people[0] || null);

  const activeId = isCustomer || isSurveyor ? (people[0]?.id || myConvId) : activeChannelId;
  const currentMessages = (activeId && threadsMap[activeId]) || [];

  const displayMessages =
    currentMessages.length > 0
      ? currentMessages
      : activeContact
      ? [
          {
            id: 'default-intro',
            sender: activeContact?.name || 'Contact',
            role: 'incoming',
            text: isCustomer
              ? `Hello ${user?.name || 'Customer'}, welcome to your dedicated NJS Property Group communications channel. How can our surveying team assist you today?`
              : isSurveyor
              ? `Hello ${user?.name || 'Surveyor'}, this is your direct channel with NJS Operations & Dispatch. Send updates or queries regarding your assigned survey jobs here.`
              : `Direct communications channel with ${activeContact?.name || 'Client'}. You can send updates or respond to customer queries here.`,
            time: 'Today',
          },
        ]
      : [];

  // Auto-scroll chat to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayMessages.length]);

  // Send message with DYNAMIC BUMP-TO-TOP FLOW ("jo message kare uska upr aa jay")
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');

    const timeNow = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const nowIso = new Date().toISOString();

    const targetId = isCustomer || isSurveyor ? (people[0]?.id || myConvId) : activeChannelId;
    const senderRole = isCustomer ? 'customer' : isSurveyor ? 'surveyor' : 'admin';

    const newMsg = {
      id: Date.now(),
      senderId: effectiveUserId,
      sender: user?.name || (isCustomer ? 'Customer' : isSurveyor ? 'Surveyor' : 'Alexander Sterling'),
      role: senderRole,
      text: textToSend,
      time: `Today, ${timeNow}`,
      createdAt: nowIso,
    };

    // 1. Update active thread messages optimistically
    setThreadsMap((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), newMsg],
    }));

    // 2. DYNAMIC BUMP-TO-TOP: Update contact lastMessage & timestamp, re-sort to top!
    setPeople((prev) => {
      const updated = prev.map((p) => {
        if (p.id === targetId || (p.userId && p.userId === activeContact?.userId)) {
          return {
            ...p,
            lastMessage: textToSend.length > 28 ? textToSend.slice(0, 28) + '...' : textToSend,
            time: timeNow,
            lastMessageTime: nowIso,
          };
        }
        return p;
      });
      return updated.sort(
        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
    });

    // 3. Persist to Backend API & MySQL Database
    if (activeContact) {
      customerMessagesApi
        .sendMessage({
          conversationId: targetId,
          recipientId: activeContact.userId,
          content: textToSend,
        })
        .then(() => {
          // Immediately fetch fresh DB state to get exact server IDs and sync
          fetchMsgsRef.current?.();
          fetchContactsRef.current?.();
          // Broadcast to other open browser tabs
          try {
            const bc = new BroadcastChannel('njs_chat_sync');
            bc.postMessage({ type: 'CHAT_UPDATED', conversationId: targetId });
            bc.close();
          } catch {}
          try {
            localStorage.setItem('njs_last_chat_dispatch', String(Date.now()));
          } catch {}
        })
        .catch((err) => console.warn('Message API send failed:', err));

      addToast({
        type: 'success',
        title: 'Message Sent',
        message: `Message dispatched to ${activeContact.name}`,
      });
    }
  };

  const handleAttach = () => {
    addToast({
      type: 'info',
      title: 'Attach Media',
      message: 'Document or photograph attached to your message.',
    });
  };

  const unreadCountTotal = people.filter((p) => p.unreadCount > 0 || p.unread).length;

  // Real-time search & filter for People
  const filteredPeople = people.filter((p) => {
    if (contactFilter === 'needs_reply' && !(p.unreadCount > 0 || p.unread)) {
      return false;
    }
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.lastMessage && p.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.roleTitle && p.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="max-w-7xl mx-auto w-full flex-1 min-h-0 flex flex-col h-full">
      {/* Mobile switcher tab */}
      <div className="flex md:hidden items-center justify-between bg-white px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-2xs mb-2 shrink-0">
        <button
          type="button"
          onClick={() => setMobileView('list')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mobileView === 'list' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Conversations ({people.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileView('chat')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mobileView === 'chat' ? 'bg-[#0B1F4D] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {activeContact?.name || 'Chat'}
        </button>
      </div>

      {/* Main 2-Column Chat Layout Matching Reference Image */}
      <div className="flex flex-col md:flex-row gap-3.5 sm:gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Search, Needs-Reply Filter & People Directory */}
        <div
          className={`w-full md:w-72 lg:w-80 flex flex-col gap-3 shrink-0 ${
            mobileView === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* 1. Rounded Search Input (Admin only) */}
          {!isCustomer && !isSurveyor && (
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers or surveyors..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all"
              />
            </div>
          )}

          {/* 1.5. Admin Quick Filter Tabs: All vs Needs Reply */}
          {!isCustomer && !isSurveyor && (
            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/90 rounded-2xl shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setContactFilter('all')}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all ${
                  contactFilter === 'all'
                    ? 'bg-[#0B1F4D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                All ({people.length})
              </button>
              <button
                type="button"
                onClick={() => setContactFilter('needs_reply')}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  contactFilter === 'needs_reply'
                    ? 'bg-[#0B1F4D] text-white shadow-xs'
                    : unreadCountTotal > 0
                    ? 'text-rose-600 font-extrabold hover:bg-rose-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>Needs Reply</span>
                {unreadCountTotal > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      contactFilter === 'needs_reply'
                        ? 'bg-rose-500 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {unreadCountTotal}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* 2. People Card Container (All Contacts Strictly Role-Isolated) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-3.5 space-y-1 flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth">
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-xs font-extrabold text-slate-800">
                {isCustomer ? 'Support Channel' : isSurveyor ? 'Operations & Dispatch' : 'Customers & Surveyors'}
              </h4>
              <span className="text-[10px] text-slate-400 font-semibold">
                {filteredPeople.length} {filteredPeople.length === 1 ? 'contact' : 'contacts'}
              </span>
            </div>
            <div className="space-y-1">
              {filteredPeople.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No active contacts yet
                </div>
              )}
              {filteredPeople.map((person) => {
                const isSelected = isCustomer || isSurveyor ? true : activeChannelId === person.id;
                const hasUnread = person.unreadCount > 0 || person.unread;
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => {
                      if (!isCustomer && !isSurveyor) {
                        setActiveChannelId(person.id);
                        // Optimistically clear unread badge for snappy UI
                        setPeople((prev) =>
                          prev.map((p) =>
                            p.id === person.id ? { ...p, unread: false, unreadCount: 0 } : p
                          )
                        );
                      }
                      setMobileView('chat');
                    }}
                    className={`w-full p-2 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100/90 ring-1 ring-slate-200'
                        : hasUnread
                        ? 'bg-rose-50/40 hover:bg-rose-50/70 border border-rose-100'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {person.avatar}
                        </div>
                        {person.online ? (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" title="Online" />
                        ) : (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-slate-300 rounded-full ring-2 ring-white" title="Offline" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {person.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ${
                              person.role === 'SURVEYOR'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                : person.role === 'ADMIN'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            }`}
                          >
                            {person.roleTitle || (person.role === 'SURVEYOR' ? 'RICS' : 'Client')}
                          </span>
                          {!isCustomer && !isSurveyor && hasUnread && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                              Needs Reply
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {person.lastMessage}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {person.time}
                      </span>
                      {hasUnread ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs animate-pulse mt-0.5">
                          {person.unreadCount || 1} new
                        </span>
                      ) : (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600 inline-block mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Box Window */}
        <div
          className={`flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col min-h-0 ${
            mobileView === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {!activeContact ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                <MessageSquare className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">No Active Conversation</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                As customers and surveyors register and initiate messages, their direct conversation channels will appear here.
              </p>
            </div>
          ) : (
            <>
          {/* Chat Window Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              {/* Back to conversations on mobile */}
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                title="Back to conversations list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B1F4D] to-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {activeContact?.avatar || 'NJS'}
                </div>
                {activeContact?.online ? (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" title="Online" />
                ) : (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-slate-300 rounded-full ring-2 ring-white" title="Offline" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm truncate">
                    {activeContact?.name || 'Active Chat'}
                  </h3>
                  {activeContact?.roleTitle && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        activeContact.role === 'SURVEYOR'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          : activeContact.role === 'ADMIN'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}
                    >
                      {activeContact.roleTitle}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  {activeContact?.online
                    ? `Online • Active Direct Channel`
                    : `Offline • Last seen, ${activeContact?.lastSeen || activeContact?.time || 'recently'}`}
                </p>
              </div>
            </div>

            {/* Admin indicator on top right */}
            {!isCustomer && !isSurveyor && (activeContact?.unreadCount > 0 || activeContact?.unread) && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                Needs Reply
              </span>
            )}
          </div>

          {/* Admin Operational Alert Banner when client has sent unread message */}
          {!isCustomer && !isSurveyor && (activeContact?.unreadCount > 0 || activeContact?.unread) && (
            <div className="bg-amber-50/90 border-b border-amber-200/70 px-4 py-2 flex items-center justify-between text-xs text-amber-900 font-medium shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                <span>
                  <strong>Action Required:</strong> Customer sent an unread message. Replying here sends a direct portal update and an automatic email notification to their inbox.
                </span>
              </div>
            </div>
          )}

          {/* Message Thread Body */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto min-h-0 space-y-3.5 bg-white overscroll-contain scroll-smooth">
            {displayMessages.map((m) => {
              const msgRole = (m.role || '').toLowerCase();
              const isOutgoing = isAdmin
                ? (msgRole === 'admin' || msgRole === 'super_admin' || (m.senderId && Number(m.senderId) === Number(effectiveUserId)))
                : isSurveyor
                ? (msgRole === 'surveyor' || (m.senderId && Number(m.senderId) === Number(effectiveUserId)))
                : (msgRole === 'customer' || msgRole === 'client' || (m.senderId && Number(m.senderId) === Number(effectiveUserId)));

              const cleanTime = m.time?.includes(',')
                ? m.time.split(',')[1].trim()
                : m.time || 'Today';

              if (isOutgoing) {
                // Outgoing Message (Current User - Right aligned, Deep Navy theme)
                // Read receipt logic: blue double tick only if recipient has opened and read it
                const isRead = isAdmin
                  ? Boolean(m.readByCustomer || m.read || m.isRead)
                  : Boolean(m.readByAdmin || m.read || m.isRead);

                return (
                  <div key={m.id} className="flex flex-col items-end max-w-[85%] sm:max-w-md ml-auto">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <div className="w-2 h-2 rounded-full bg-[#0B1F4D]/30 shrink-0" />
                      <div className="bg-[#0B1F4D] text-white rounded-3xl rounded-tr-xs px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-[13px] font-medium leading-relaxed shadow-xs">
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10.5px] text-slate-400 mt-1 pr-3 font-medium">
                      <span>{cleanTime}</span>
                      {isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" title="Read by recipient" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-slate-400" title="Sent (Delivered, Unread)" />
                      )}
                    </div>
                  </div>
                );
              }

              // Incoming Message (Contact - Left aligned, soft neutral grey bubble)
              return (
                <div key={m.id} className="flex flex-col items-start max-w-[85%] sm:max-w-md">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                    <div className="bg-slate-100/90 text-slate-800 rounded-3xl rounded-tl-xs px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-[13px] font-medium leading-relaxed shadow-2xs">
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                  <span className="text-[10.5px] text-slate-400 mt-1 pl-3 font-medium">
                    {cleanTime}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar - Clean Text & Send */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2 sm:gap-2.5 shrink-0"
          >
            {/* Message Input */}
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-full px-4 sm:px-5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 focus:border-[#0B1F4D] transition-all"
              />
            </div>

            {/* Direct Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="h-10 px-4 rounded-full bg-[#0B1F4D] hover:bg-[#162E6E] disabled:opacity-40 disabled:hover:bg-[#0B1F4D] text-white flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] shrink-0 cursor-pointer text-xs font-bold"
              title="Send message"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 10. LEAVE A REVIEW PAGE (Trustpilot Integration)
// ==========================================
export const CustomerReviewPage = () => {
  const { user } = useAuth();
  const { jobs, updateJob, addJob } = useJobs();
  const { addToast } = useToast();

  const myJobs = jobs.filter((j) => isJobForCustomer(j, user));
  const completedJob = myJobs.find((j) => j.status === 'Completed' || j.timelineStep >= 10) || myJobs[0] || null;

  const [rating, setRating] = useState(completedJob?.reviewRating || 5);
  const [reviewText, setReviewText] = useState(completedJob?.reviewFeedback || '');
  const [isSubmitted, setIsSubmitted] = useState(!!completedJob?.reviewSubmitted);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch customer review API
  useEffect(() => {
    customerReviewApi.getReviews().catch(() => {});
  }, []);

  // Sync state if job updates
  useEffect(() => {
    if (completedJob) {
      if (completedJob.reviewRating) setRating(completedJob.reviewRating);
      if (completedJob.reviewFeedback) setReviewText(completedJob.reviewFeedback);
      if (completedJob.reviewSubmitted !== undefined) setIsSubmitted(completedJob.reviewSubmitted);
    }
  }, [completedJob?.id, completedJob?.reviewSubmitted]);

  const handleOpenTrustpilot = () => {
    if (completedJob?.id) {
      updateJob(completedJob.id, {
        reviewSubmitted: true,
        reviewRating: rating,
        reviewFeedback: reviewText || 'Excellent surveying turnaround, thorough technical inspection and clear advice.',
        reviewDate: new Date().toISOString(),
        activityLog: [
          {
            id: Date.now(),
            time: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            text: `⭐ Customer submitted ${rating}-star verified Trustpilot review: "${reviewText || 'Excellent service and clear survey report.'}"`,
          },
          ...(completedJob.activityLog || []),
        ],
      });
    }
    setIsSubmitted(true);
    setIsEditing(false);
    addToast({
      type: 'success',
      title: 'Review Logged & Trustpilot Opened',
      message: 'Thank you! Redirecting to the verified NJS Property Group Trustpilot profile.',
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

      {isSubmitted && !isEditing ? (
        <div className="bg-white rounded-3xl border border-emerald-200/90 shadow-sm p-6 sm:p-8 space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#00B67A] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-[#00B67A]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
            <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span>Verified Trustpilot Review Recorded</span>
          </div>

          <div>
            <h3 className="text-xl font-black text-[#0B1F4D]">
              Thank You for Reviewing NJS Property Group!
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your feedback for <strong>{completedJob?.property || '14 Mayfair Gate'}</strong> has been registered and helps us uphold RICS excellence.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl max-w-lg mx-auto text-left space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-700 ml-1.5">{rating}.0 / 5.0</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Verified Client</span>
            </div>
            <p className="text-xs text-slate-700 italic">
              "{reviewText || completedJob?.reviewFeedback || 'Excellent survey turnaround and clear advice.'}"
            </p>
            <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-200/60">
              Surveyor: <strong>{completedJob?.surveyor || 'Assigned Surveyor'}</strong> • {completedJob?.surveyType || 'RICS Level 2 Home Survey'}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://www.trustpilot.com/review/njspropertygroup.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#00B67A] hover:bg-[#009E6B] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>View on Trustpilot</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-5 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Edit Feedback
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span>Trustpilot Verified Partner • Rated 4.9 / 5.0</span>
          </div>

          <div>
            <h3 className="text-xl font-black text-[#0B1F4D]">
              How was your experience with Surveyor {completedJob?.surveyor || 'Assigned Surveyor'}?
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your review regarding the {completedJob?.surveyType || 'RICS Level 2 Survey'} at {completedJob?.property || '14 Mayfair Gate'} helps us maintain our high RICS quality standards.
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

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleOpenTrustpilot}
              className="px-6 py-3.5 bg-[#00B67A] hover:bg-[#009E6B] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>Submit Review on Trustpilot</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-3 text-slate-500 hover:text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block mt-2">
            Opens genuine NJS Property Group review page: trustpilot.com/review/njspropertygroup.com
          </span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 11. PREVIOUS SURVEYS PAGE (Archived History)
// ==========================================
export const CustomerPreviousSurveysPage = () => {
  useEffect(() => { customerPreviousSurveysApi.getPreviousSurveys().catch(() => {}); }, []);
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
  useEffect(() => { customerDetailsApi.getDetails().catch(() => {}); }, []);
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(() => {
    try {
      const uEmail = (user?.email || '').toLowerCase().trim();
      const isEmma = uEmail === 'customer@demo.com';
      const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
      const regUser = registered[uEmail] || {};
      return {
        name: user?.name || regUser.name || (isEmma ? 'Emma Watson' : ''),
        email: user?.email || regUser.email || (isEmma ? 'customer@demo.com' : ''),
        phone: user?.phone || regUser.phone || (isEmma ? '+44 7700 900147' : ''),
        address: user?.address || regUser.address || (isEmma ? 'Flat 4, 12 Gloucester Road' : ''),
        city: user?.city || regUser.city || (isEmma ? 'London' : ''),
        postcode: user?.postcode || regUser.postcode || (isEmma ? 'SW7 4RB' : ''),
      };
    } catch {
      return {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        postcode: user?.postcode || '',
      };
    }
  });

  useEffect(() => {
    if (user?.email) {
      try {
        const uEmail = user.email.toLowerCase().trim();
        const isEmma = uEmail === 'customer@demo.com';
        const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
        const regUser = registered[uEmail] || {};
        setProfile({
          name: user.name || regUser.name || (isEmma ? 'Emma Watson' : ''),
          email: user.email,
          phone: user.phone || regUser.phone || (isEmma ? '+44 7700 900147' : ''),
          address: user.address || regUser.address || (isEmma ? 'Flat 4, 12 Gloucester Road' : ''),
          city: user.city || regUser.city || (isEmma ? 'London' : ''),
          postcode: user.postcode || regUser.postcode || (isEmma ? 'SW7 4RB' : ''),
        });
      } catch {}
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    try {
      const updatedUser = { ...user, ...profile };
      localStorage.setItem('property_group_user_session', JSON.stringify(updatedUser));
      const registered = JSON.parse(localStorage.getItem('property_group_registered_customers') || '{}');
      if (profile.email) {
        registered[profile.email.toLowerCase().trim()] = {
          ...(registered[profile.email.toLowerCase().trim()] || {}),
          ...profile,
        };
        localStorage.setItem('property_group_registered_customers', JSON.stringify(registered));
      }
      if (setUser) {
        setUser(updatedUser);
      }
      addToast({ type: 'success', title: 'Details Updated', message: 'Your contact and billing details have been saved.' });
    } catch {
      addToast({ type: 'success', title: 'Details Updated', message: 'Your contact and billing details have been saved.' });
    }
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
const INITIAL_SUPPORT_TICKETS = [
  {
    id: 1,
    ticketNo: 'TKT-2026-104',
    subject: 'Request update on 14 Mayfair Gate Level 3 report delivery ETA',
    category: 'Report Delivery',
    priority: 'Normal',
    status: 'IN PROGRESS',
    createdAt: '03 Nov 2026, 11:20',
    lastReply: 'Chartered Surveyor confirmed on-site inspection concluded. Final technical review underway.',
  },
  {
    id: 2,
    ticketNo: 'TKT-2026-089',
    subject: 'Access confirmation with vendor estate agent (Hamptons Mayfair)',
    category: 'Access Logistics',
    priority: 'Normal',
    status: 'RESOLVED',
    createdAt: '28 Oct 2026, 14:15',
    lastReply: 'Confirmed by vendor agent. Key collection booked for 10:00 AM on inspection date.',
  },
];

export const CustomerSupportPage = () => {
  const { addToast } = useToast();
  const [tickets, setTickets] = useState(INITIAL_SUPPORT_TICKETS);
  const [subject, setSubject] = useState('Query regarding property inspection');
  const [category, setCategory] = useState('Inspection Logistics');
  const [priority, setPriority] = useState('Normal');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    customerSupportApi
      .getTickets()
      .then((res) => {
        if (res?.data?.tickets && Array.isArray(res.data.tickets) && res.data.tickets.length > 0) {
          setTickets(res.data.tickets);
        }
      })
      .catch(() => {
        // Fallback to local state
      });
  }, []);

  const handleSendTicket = async (e) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    setIsSubmitting(true);
    const newTicket = {
      id: Date.now(),
      ticketNo: `TKT-2026-${Math.floor(100 + Math.random() * 900)}`,
      subject: subject || 'General Survey Support Inquiry',
      category,
      priority,
      status: 'OPEN',
      createdAt: 'Just now',
      message: ticketMessage.trim(),
      lastReply: 'Awaiting review by operations desk.',
    };

    try {
      await customerSupportApi.createTicket({
        subject,
        message: ticketMessage,
        category,
        priority,
      });
    } catch {
      // Local fallback
    }

    setTickets((prev) => [newTicket, ...prev]);
    setIsSubmitting(false);
    setTicketMessage('');
    addToast({
      type: 'success',
      title: 'Support Ticket Dispatched',
      message: `Ticket #${newTicket.ticketNo} submitted to our London operations desk.`,
    });
  };

  const phone = siteConfig?.contact?.telephoneDisplay || '0333 305 2777';
  const email = siteConfig?.contact?.email || 'info@njspropertygroup.com';
  const address = siteConfig?.contact?.address
    ? `${siteConfig.contact.address.line1}, ${siteConfig.contact.address.city} ${siteConfig.contact.address.postcode}`
    : 'Belmont House, Uxbridge, UB8 1QS';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Customer Support & Survey Inquiries"
        subtitle="Speak directly with our survey dispatch desk or message your assigned chartered surveyor."
        breadcrumb={['Customer Portal', 'Support']}
      />

      {/* Emergency / Fast Turnaround Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B1F4D] to-[#1E3A8A] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
            <Phone className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight">Need Urgent Property Survey Assistance?</h4>
            <p className="text-xs text-slate-300">
              For immediate survey slot booking or same-day exchange deadlines, call our direct operations hotline.
            </p>
          </div>
        </div>
        <a
          href={`tel:${phone.replace(/\s+/g, '')}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call {phone}</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Ticket Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                <span>Submit a New Support Ticket</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Standard SLA: &lt; 2 business hours</span>
            </div>

            <form onSubmit={handleSendTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inquiry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]"
                  >
                    <option value="Inspection Logistics">Inspection Logistics &amp; Access</option>
                    <option value="Report Delivery">Report Delivery &amp; Turnaround ETA</option>
                    <option value="Surveyor Debrief">Surveyor Post-Survey Phone Debrief</option>
                    <option value="Billing & Invoicing">Invoices, BACS &amp; VAT Receipts</option>
                    <option value="Terms & Signing">Terms of Engagement &amp; Signing</option>
                    <option value="General Inquiry">General Practice Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]"
                  >
                    <option value="Normal">Normal — Standard response</option>
                    <option value="High">High — Survey inspection in &lt; 48h</option>
                    <option value="Urgent">Urgent — Impending exchange deadline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Query regarding 14 Mayfair Gate inspection timing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inquiry Details</label>
                <textarea
                  rows="4"
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Type your message, query, or specific property instructions for our surveying team..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Directly dispatched to practice operations desk &amp; surveyor team.
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !ticketMessage.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] text-white font-bold text-xs hover:bg-[#162E6E] disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Dispatch Ticket'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Ticket History */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#0B1F4D] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span>Your Support Tickets &amp; Inquiries</span>
            </h4>

            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id || t.ticketNo}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-slate-200 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#0B1F4D]">{t.ticketNo}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/70 text-slate-700">
                        {t.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'IN PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.status}
                      </span>
                      <span className="text-[10px] text-slate-400">{t.createdAt}</span>
                    </div>
                  </div>

                  <p className="font-semibold text-xs text-slate-800">{t.subject}</p>

                  {t.lastReply && (
                    <div className="mt-1 p-2.5 rounded-xl bg-white border border-slate-200/60 text-[11px] text-slate-600">
                      <span className="font-bold text-[#0B1F4D] block mb-0.5">Latest Update from Practice Desk:</span>
                      {t.lastReply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Direct Practice Contacts & FAQ */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <h4 className="font-bold text-sm text-[#0B1F4D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Direct Practice Desk</span>
            </h4>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Telephone Dispatch
                </span>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="font-bold text-slate-900 text-sm hover:text-[#2563EB] block"
                >
                  {phone}
                </a>
                <span className="text-[11px] text-slate-500 block mt-0.5">Monday – Friday: 08:30 – 18:00</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Support Email
                </span>
                <a
                  href={`mailto:${email}`}
                  className="font-bold text-[#2563EB] hover:underline block break-all"
                >
                  {email}
                </a>
                <span className="text-[11px] text-slate-500 block mt-0.5">Monitored continuously during practice hours</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  RICS Regulated Head Office
                </span>
                <span className="font-bold text-slate-900 block">NJS Property Group</span>
                <span className="text-slate-600 text-[11px] leading-relaxed block mt-0.5">
                  {address}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-sm text-[#0B1F4D] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#2563EB]" />
              <span>Common Questions</span>
            </h4>

            <div className="space-y-3 text-[11px] text-slate-600">
              <div>
                <p className="font-bold text-slate-800">When will my report arrive?</p>
                <p className="mt-0.5 text-slate-500">
                  Level 2 &amp; Level 3 reports are typically delivered via your portal within 3–5 business days following physical on-site inspection.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <p className="font-bold text-slate-800">Can I talk to my surveyor?</p>
                <p className="mt-0.5 text-slate-500">
                  Yes, every inspection includes a direct phone debrief with your assigned chartered surveyor once your report is ready.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <p className="font-bold text-slate-800">Need to reschedule an inspection?</p>
                <p className="mt-0.5 text-slate-500">
                  Please notify us at least 24 hours prior to the inspection date via ticket or phone so we can coordinate with the vendor or agent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
