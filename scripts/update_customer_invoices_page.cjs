const fs = require('fs');
const path = require('path');

const modPath = path.join(__dirname, '../src/pages/customer/CustomerModules.jsx');
let content = fs.readFileSync(modPath, 'utf8');

const startMarker = "export const CustomerInvoicesPage = () => {";
const endMarker = "// ==========================================\n// 5. REPORTS PAGE";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not locate CustomerInvoicesPage boundaries in CustomerModules.jsx');
  process.exit(1);
}

const newInvoicesComponent = `export const CustomerInvoicesPage = () => {
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
      invNo: \`INV-2026-\${j.id.replace('JOB-2026-', '90')}\`,
      jobRef: j.id,
      property: \`\${j.property}, \${j.location || ''}\`,
      service: j.surveyType,
      date: j.date || '26/10/2026',
      netAmount: net,
      vatAmount: vat,
      grossTotal: total,
      net: \`£\${net.toFixed(2)}\`,
      vat: \`£\${vat.toFixed(2)}\`,
      total: \`£\${total.toFixed(2)}\`,
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
      paymentDate: \`\${inv.date}, 11:20\`,
      paymentMethod: inv.status === 'Paid' ? inv.method : 'Pending Settlement',
      baseFee: inv.netAmount,
      vatAmount: inv.vatAmount,
      totalAmount: inv.grossTotal,
    });

    addToast({
      type: 'success',
      title: 'HMRC VAT Receipt Downloaded',
      message: \`Official invoice PDF \${inv.invNo} has been downloaded.\`,
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
            time: \`\${new Date().toLocaleDateString('en-GB')}, \${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}\`,
            text: \`Customer \${user?.name || 'Client'} settled invoice \${settlingInvoice.invNo} (£\${settlingInvoice.grossTotal.toFixed(2)}) via \${paymentMethod === 'card' ? 'Stripe Card' : paymentMethod === 'apple' ? 'Apple Pay' : 'BACS'}.\`,
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
        paymentDate: \`\${new Date().toLocaleDateString('en-GB')}, \${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}\`,
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
        message: \`\${settlingInvoice.total} received in full. Official VAT invoice receipt downloaded.\`,
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
                    className={\`text-[10px] font-bold px-2.5 py-0.5 rounded-full border \${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }\`}
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
          subtitle={\`Advance payment settlement for \${settlingInvoice.invNo} (\${settlingInvoice.property})\`}
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
                className={\`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 \${
                  paymentMethod === 'card'
                    ? 'border-[#0B1F4D] bg-blue-50/50 text-[#0B1F4D]'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }\`}
              >
                <CreditCard className="w-4 h-4 text-[#2563EB]" />
                <span>Credit / Debit Card</span>
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
                  {isProcessing ? 'Confirming Settlement...' : \`Confirm Settlement (\${settlingInvoice.total})\`}
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
          subtitle={\`HMRC VAT Compliance Record • \${viewingReceipt.invNo}\`}
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
`;

content = content.substring(0, startIndex) + newInvoicesComponent + '\n' + content.substring(endIndex);
fs.writeFileSync(modPath, content, 'utf8');
console.log('Successfully updated CustomerInvoicesPage with Payment Settlement modal, VAT metrics, and real PDF download!');
