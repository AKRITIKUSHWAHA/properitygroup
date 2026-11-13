const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../frontend/src/pages/customer/CustomerModules.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. In CustomerBookingPaymentPage, set default to 'bacs'
content = content.replace(
  "const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'apple' | 'bacs'",
  "const [paymentMethod, setPaymentMethod] = useState('bacs'); // 'bacs' | 'card' | 'apple'"
);

// 2. In CustomerInvoicesPage, set default to 'bacs'
content = content.replace(
  "const [settlingInvoice, setSettlingInvoice] = useState(null);\n  const [viewingReceipt, setViewingReceipt] = useState(null);\n  const [paymentMethod, setPaymentMethod] = useState('card');",
  "const [settlingInvoice, setSettlingInvoice] = useState(null);\n  const [viewingReceipt, setViewingReceipt] = useState(null);\n  const [paymentMethod, setPaymentMethod] = useState('bacs');"
);

// 3. Update Barclays to Metro Bank in CustomerInvoicesPage
content = content.replace(
  `<div>Bank: <strong>Barclays Bank UK</strong></div>
                  <div>Sort Code: <strong>20-45-77</strong></div>
                  <div>Account No: <strong>83920194</strong></div>
                  <div>Beneficiary: <strong>NJS Property Group Escrow</strong></div>`,
  `<div>Bank: <strong>Metro Bank PLC</strong></div>
                  <div>Sort Code: <strong>23-05-80</strong></div>
                  <div>Account No: <strong>18920412</strong></div>
                  <div>Beneficiary: <strong>NJS Property Group Ltd</strong></div>`
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully updated default payment method and Barclays to Metro Bank in CustomerInvoicesPage');

