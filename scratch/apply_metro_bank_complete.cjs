const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../frontend/src/pages/customer/CustomerModules.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. In handlePaymentSubmit: Update the toast message for BACS
const oldToast = `      addToast({
        type: 'success',
        title: 'Advance Payment Successful',
        message: \`Stripe transaction of £\${grossTotal.toFixed(2)} authorized. Terms of engagement recorded.\`,
      });`;

const newToast = `      addToast({
        type: 'success',
        title: paymentMethod === 'bacs' ? 'Metro Bank Transfer Confirmed' : 'Advance Payment Successful',
        message: paymentMethod === 'bacs'
          ? \`Direct bank transfer of £\${grossTotal.toFixed(2)} registered to Metro Bank PLC. Terms of engagement recorded.\`
          : \`Stripe transaction of £\${grossTotal.toFixed(2)} authorized. Terms of engagement recorded.\`,
      });`;

if (content.includes(oldToast)) {
  content = content.replace(oldToast, newToast);
  console.log('1. Updated handlePaymentSubmit toast message');
} else {
  console.log('1. Warning: oldToast target not found directly');
}

// 2. In CustomerBookingPaymentPage: Update the payment method selector and conditional forms
const oldPaymentSelectorBlock = `              {/* Payment Method Selector */}
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
              <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">`;

const newPaymentSelectorBlock = `              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bacs')}
                  className={\`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 \${
                    paymentMethod === 'bacs'
                      ? 'border-[#0B1F4D] bg-blue-50/50 text-[#0B1F4D]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }\`}
                >
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4 text-emerald-700" />
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">Zero Fee</span>
                  </div>
                  <span>BACS Transfer</span>
                </button>
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
              </div>

              {/* BACS Form */}
              {paymentMethod === 'bacs' ? (
                <div className="p-5 bg-gradient-to-br from-emerald-50/70 to-blue-50/60 rounded-2xl border border-emerald-200/90 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#0B1F4D] flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-700" />
                      <span>Direct Bank Transfer (Metro Bank Faster Payments)</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Zero Merchant Fee
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    Please transfer the advance instruction fee directly to our practice business account via UK Faster Payments / Online Banking:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-white rounded-xl border border-emerald-100 shadow-2xs text-slate-800">
                    <div>Bank: <strong className="text-slate-900">Metro Bank PLC</strong></div>
                    <div>Beneficiary: <strong className="text-slate-900">NJS Property Group Ltd</strong></div>
                    <div>Sort Code: <strong className="text-slate-900 font-mono text-sm">23-05-80</strong></div>
                    <div>Account No: <strong className="text-slate-900 font-mono text-sm">18920412</strong></div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-[11px]">
                    <div>Payment Reference: <strong className="font-mono text-[#0B1F4D] text-xs">{jobNo || 'NJS-JOB-2026'}</strong></div>
                    <div className="text-right">Total Payable: <strong className="text-emerald-700 font-extrabold text-sm">£{grossTotal.toFixed(2)}</strong></div>
                  </div>

                  <div className="text-[11px] text-slate-500 italic">
                    Once transferred from your bank app, click below to confirm your booking instruction.
                  </div>

                  <button
                    type="button"
                    onClick={handlePaymentSubmit}
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Confirming Metro Bank Transfer...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm Metro Bank Transfer (£{grossTotal.toFixed(2)}) &amp; Confirm Booking</span>
                      </>
                    )}
                  </button>
                </div>
              ) : paymentMethod === 'apple' ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                  <div className="text-sm font-semibold text-slate-700">Apple Pay Express Checkout</div>
                  <button
                    type="button"
                    onClick={handlePaymentSubmit}
                    disabled={isProcessingPayment}
                    className="w-full max-w-sm mx-auto py-3 bg-black hover:bg-slate-900 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"
                  >
                    <span className="font-sans text-base"> Pay £{grossTotal.toFixed(2)}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">`;

if (content.includes(oldPaymentSelectorBlock)) {
  content = content.replace(oldPaymentSelectorBlock, newPaymentSelectorBlock);
  console.log('2. Replaced CustomerBookingPaymentPage selector & added BACS block');
} else {
  console.log('2. Warning: oldPaymentSelectorBlock target not found');
}

// 3. Make sure the closing </form> in CustomerBookingPaymentPage matches closing parenthesis
// Let's check where the card form closes:
const oldCardFormClose = `                  <button
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
              </form>`;

const newCardFormClose = `                  <button
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
              )}`;

if (content.includes(oldCardFormClose)) {
  content = content.replace(oldCardFormClose, newCardFormClose);
  console.log('3. Closed the ternary in CustomerBookingPaymentPage');
} else {
  console.log('3. Warning: oldCardFormClose target not found');
}

// 4. In CustomerInvoicesPage, reorder buttons so BACS is first
const oldInvoiceButtons = `            {/* Payment Method Selector */}
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
            </div>`;

const newInvoiceButtons = `            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('bacs')}
                className={\`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 \${
                  paymentMethod === 'bacs'
                    ? 'border-[#0B1F4D] bg-blue-50/50 text-[#0B1F4D]'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }\`}
              >
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">Zero Fee</span>
                </div>
                <span>BACS Transfer</span>
              </button>
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
            </div>`;

if (content.includes(oldInvoiceButtons)) {
  content = content.replace(oldInvoiceButtons, newInvoiceButtons);
  console.log('4. Reordered CustomerInvoicesPage payment selector to put BACS first');
} else {
  console.log('4. Warning: oldInvoiceButtons target not found');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('CustomerModules.jsx fully updated for Metro Bank BACS flow!');

