const fs = require('fs');
const path = require('path');

const modPath = path.join(__dirname, '../src/pages/customer/CustomerModules.jsx');
let content = fs.readFileSync(modPath, 'utf8');

// 1. Ensure import of useTerms and TERMS_TEMPLATES
if (!content.includes("from '../../mock/terms'")) {
  content = content.replace(
    "import { useMessages } from '../../mock/messages';",
    "import { useMessages } from '../../mock/messages';\nimport { useTerms, TERMS_TEMPLATES } from '../../mock/terms';"
  );
}

// 2. Replace CustomerTermsPage component
const startMarker = "export const CustomerTermsPage = () => {";
const endMarker = "// ==========================================\n// 2. MY BOOKINGS PAGE";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not locate CustomerTermsPage boundaries in CustomerModules.jsx');
  process.exit(1);
}

const newTermsComponent = `export const CustomerTermsPage = () => {
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
    ? \`\${currentJob.property}, \${currentJob.location || ''}\`
    : '14 Mayfair Gate, Mayfair, London W1K 2PB';
  const surveyType = currentJob?.surveyType || 'RICS Level 2 Home Survey';
  const surveyorName = currentJob?.surveyor || 'David Thorne MRICS';
  const appointmentSlot = currentJob?.date
    ? \`\${currentJob.date}, \${currentJob.timeSlot || '10:00 - 13:00'}\`
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
      const nowString = \`\${new Date().toLocaleDateString('en-GB')}, \${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}\`;
      const generatedAuditCode = \`DOC-ESIGN-\${Math.floor(10000 + Math.random() * 89999)}-VERIFIED\`;

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
            id: \`AGR-2026-\${Math.floor(100 + Math.random() * 899)}\`,
            refNo: \`AGR-2026-\${Math.floor(100 + Math.random() * 899)}\`,
            jobNo: currentJob.id,
            client: user?.name || currentJob.customer || 'Customer',
            signerEmail: user?.email || currentJob.customerEmail,
            property: propertyAddress,
            location: currentJob.location || 'London, UK',
            serviceKey: activeTemplate.serviceKey,
            templateName: activeTemplate.name,
            versionYear: \`\${activeTemplate.version} / \${activeTemplate.year}\`,
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
              text: \`Client \${user?.name || 'Customer'} digitally executed Terms of Engagement & settled invoice (£\${grossTotal}).\`,
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
        message: \`Stripe transaction of £\${grossTotal.toFixed(2)} authorized. Terms of engagement recorded.\`,
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
      agreedFee: \`£\${grossTotal.toFixed(2)} (inc. 20% VAT)\`,
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
        <div className={\`flex items-center gap-2 \${stage === 'sign' ? 'text-[#0B1F4D] font-bold' : 'text-emerald-700'}\`}>
          <div className={\`w-6 h-6 rounded-full flex items-center justify-center text-xs \${stage === 'sign' ? 'bg-[#0B1F4D] text-white' : 'bg-emerald-100 text-emerald-800'}\`}>
            {stage === 'sign' ? '1' : <Check className="w-3.5 h-3.5" />}
          </div>
          <span>1. Review & Sign Terms</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={\`flex items-center gap-2 \${stage === 'payment' ? 'text-[#0B1F4D] font-bold' : stage === 'confirmed' ? 'text-emerald-700' : 'text-slate-400'}\`}>
          <div className={\`w-6 h-6 rounded-full flex items-center justify-center text-xs \${stage === 'payment' ? 'bg-[#0B1F4D] text-white' : stage === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}\`}>
            {stage === 'confirmed' ? <Check className="w-3.5 h-3.5" /> : '2'}
          </div>
          <span>2. Payment & Invoice</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={\`flex items-center gap-2 \${stage === 'confirmed' ? 'text-[#0B1F4D] font-bold' : 'text-slate-400'}\`}>
          <div className={\`w-6 h-6 rounded-full flex items-center justify-center text-xs \${stage === 'confirmed' ? 'bg-[#0B1F4D] text-white' : 'bg-slate-100 text-slate-500'}\`}>
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
                  className={\`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer \${
                    signatureType === 'typed'
                      ? 'bg-white text-[#0B1F4D] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }\`}
                >
                  Type Full Name
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureType('drawn')}
                  className={\`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer \${
                    signatureType === 'drawn'
                      ? 'bg-white text-[#0B1F4D] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }\`}
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
                  className={\`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 \${
                    paymentMethod === 'card'
                      ? 'border-[#0B1F4D] bg-blue-50/50 text-[#0B1F4D]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }\`}
                >
                  <CreditCard className="w-4 h-4 text-[#2563EB]" />
                  <span>Debit / Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple')}
                  className={\`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 \${
                    paymentMethod === 'apple'
                      ? 'border-[#0B1F4D] bg-blue-50/50 text-[#0B1F4D]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }\`}
                >
                  <span className="font-sans font-black text-sm"> Pay</span>
                  <span>Apple Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bacs')}
                  className={\`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 \${
                    paymentMethod === 'bacs'
                      ? 'border-[#0B1F4D] bg-blue-50/50 text-[#0B1F4D]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }\`}
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
`;

content = content.substring(0, startIndex) + newTermsComponent + '\n' + content.substring(endIndex);
fs.writeFileSync(modPath, content, 'utf8');
console.log('Successfully updated CustomerTermsPage with dynamic customer binding, legal clauses, and complete signing & save flow!');

