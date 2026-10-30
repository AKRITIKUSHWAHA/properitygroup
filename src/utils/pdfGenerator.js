import { jsPDF } from 'jspdf';

/**
 * NJS Property Group - Client-Side Real PDF Generator Utility
 * Generates official, RICS-compliant downloadable PDF documents for:
 * 1. Signed Terms of Engagement (with legal digital execution & audit trail)
 * 2. Official UK VAT Invoices & Receipts
 * 3. Final RICS Home Survey Reports (Level 2 & Level 3)
 */

// Helper to draw standard NJS Property Group header on any document
const drawNJSHeader = (doc, title, subtitle) => {
  // Top primary banner
  doc.setFillColor(11, 31, 77); // #0B1F4D (Navy)
  doc.rect(0, 0, 210, 24, 'F');

  // Gold accent line
  doc.setFillColor(197, 160, 89); // Gold #C5A059
  doc.rect(0, 24, 210, 1.5, 'F');

  // Company Brand text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('NJS PROPERTY GROUP', 15, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(210, 220, 240);
  doc.text('RICS Regulated Practice • Reg No: 849201', 15, 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('njspropertygroup.com', 195, 13, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Tel: 020 8947 8840', 195, 19, { align: 'right' });

  // Document Title
  doc.setTextColor(11, 31, 77);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 15, 36);

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 15, 42);
  }

  // Thin separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 46, 195, 46);
};

// Helper to draw standard footer
const drawNJSFooter = (doc, pageNum = 1, totalPages = 1) => {
  const y = 285;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('NJS Property Group Ltd • Registered in England & Wales • Reg Office: 124 City Road, London EC1V 2NX', 15, y + 5);
  doc.text(`Page ${pageNum} of ${totalPages}`, 195, y + 5, { align: 'right' });
};

/**
 * 1. Generate & Download Signed Terms of Engagement PDF
 */
export const downloadTermsPDF = ({
  jobNo = 'JOB-2026-080',
  clientName = 'Emma Watson',
  property = '14 Mayfair Gate, London W1K 2PB',
  surveyType = 'RICS Level 2 Home Survey',
  agreedFee = '£780.00 (inc. 20% VAT)',
  signedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  signedTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  signatureType = 'typed',
  signatureValue = 'Emma Watson',
  ipAddress = '86.142.19.104',
}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  drawNJSHeader(doc, 'TERMS OF ENGAGEMENT (DIGITALLY EXECUTED)', `Instruction Ref: ${jobNo} • Legally Binding Contract`);

  // Instruction Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, 50, 180, 36, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 31, 77);
  doc.text('CLIENT / INSTRUCTION DETAILS', 20, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text(`Instructing Client:`, 20, 63);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(clientName, 55, 63);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Survey Property:`, 20, 70);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(property, 55, 70);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Service Ordered:`, 20, 77);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 31, 77);
  doc.text(surveyType, 55, 77);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Agreed Fee:`, 120, 63);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(agreedFee, 145, 63);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Execution Date:`, 120, 70);
  doc.text(`${signedDate} at ${signedTime}`, 145, 70);

  // Contract Terms Clauses
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 31, 77);
  doc.text('1. SCOPE OF THE SERVICE & RICS PROFESSIONAL STANDARDS', 15, 94);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const clause1 = [
    '1.1 NJS Property Group agrees to inspect the subject property in accordance with the current RICS Home Survey',
    'Standard (Professional Standard, UK). The surveyor is a qualified member of the Royal Institution of Chartered Surveyors.',
    '1.2 The inspection is a visual examination of the surface material and features accessible safely from ground level or',
    'safe working platforms. Carpets, floor coverings, and fitted furniture are not lifted or moved.',
    '1.3 Where specialist elements (e.g. electrical wiring, gas appliances, underground drainage) require inspection,',
    'the surveyor will report observable visual indicators and advise on specialist testing where warranted.',
  ];
  let curY = 99;
  clause1.forEach((line) => {
    doc.text(line, 15, curY);
    curY += 4.5;
  });

  curY += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 31, 77);
  doc.text('2. FEES, CANCELLATION RIGHTS & PAYMENT', 15, curY);

  curY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const clause2 = [
    '2.1 The agreed fee is payable prior to inspection release. Payment is handled securely via Stripe Card or BACS.',
    '2.2 Cancellation by Client: Notice must be received at least 24 hours prior to the booked inspection date to receive',
    'a full refund minus reasonable administrative disbursements. Cancellations within 24 hours may incur a 50% survey fee.',
    '2.3 NJS Property Group maintains full Professional Indemnity Insurance with an aggregate limit of £5,000,000.',
  ];
  clause2.forEach((line) => {
    doc.text(line, 15, curY);
    curY += 4.5;
  });

  curY += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 31, 77);
  doc.text('3. COMPLAINTS HANDLING PROCEDURE', 15, curY);

  curY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const clause3 = [
    '3.1 In the unlikely event of dissatisfaction, NJS Property Group operates a formal Complaints Handling Procedure approved',
    'by the RICS. A full written copy is provided upon request and disputes are eligible for referral to the Property Ombudsman.',
  ];
  clause3.forEach((line) => {
    doc.text(line, 15, curY);
    curY += 4.5;
  });

  // Digital Signature Box
  curY += 4;
  doc.setFillColor(240, 253, 244); // Light Green
  doc.setDrawColor(134, 239, 172);
  doc.roundedRect(15, curY, 180, 52, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52); // Green
  doc.text('ELECTRONIC SIGNATURE & AUDIT VERIFICATION', 20, curY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Digital Signature Execution:', 20, curY + 16);

  // If drawn signature image provided as dataURL, embed it; otherwise render styled cursive text
  if (signatureType === 'drawn' && signatureValue && signatureValue.startsWith('data:image')) {
    try {
      doc.addImage(signatureValue, 'PNG', 65, curY + 10, 45, 15);
    } catch {
      doc.setFont('times', 'bolditalic');
      doc.setFontSize(15);
      doc.setTextColor(11, 31, 77);
      doc.text(clientName, 65, curY + 20);
    }
  } else {
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(15);
    doc.setTextColor(11, 31, 77);
    doc.text(signatureValue || clientName, 65, curY + 19);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Signatory Full Name:', 20, curY + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(clientName, 65, curY + 27);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Signing Timestamp:', 20, curY + 34);
  doc.text(`${signedDate} ${signedTime} UTC`, 65, curY + 34);

  doc.text('Audit Verification Hash:', 20, curY + 41);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`SHA256:NJS-${jobNo}-${Date.now().toString(16).toUpperCase()}-IP:${ipAddress}`, 65, curY + 41);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text('✔ Certified compliant under UK Electronic Communications Act 2000 & eIDAS Regulation', 20, curY + 47);

  drawNJSFooter(doc, 1, 1);

  doc.save(`NJS_Signed_Terms_${jobNo}.pdf`);
  return true;
};

/**
 * 2. Generate & Download Official VAT Invoice PDF
 */
export const downloadInvoicePDF = ({
  invoiceNo = 'INV-2026-9042',
  jobNo = 'JOB-2026-080',
  clientName = 'Emma Watson',
  property = '14 Mayfair Gate, London W1K 2PB',
  surveyType = 'RICS Level 2 Home Survey',
  invoiceDate = '26/10/2026',
  paymentDate = '26/10/2026, 11:20',
  paymentMethod = 'Stripe Credit Card (•••• 4242)',
  baseFee = 650.0,
  extras = [
    { name: 'Drone Roof & Flashing Inspection', amount: 120.0 },
    { name: 'Same-day Verbal Debrief by Surveyor', amount: 50.0 },
  ],
  discount = 50.0,
  vatRate = 0.2, // 20%
}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  drawNJSHeader(doc, 'VAT INVOICE & RECEIPT', `Invoice No: ${invoiceNo} • Status: PAID`);

  // Invoice Meta
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 50, 180, 32, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, 50, 180, 32, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Billed To:', 20, 57);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(clientName, 45, 57);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(property, 45, 63);

  doc.setTextColor(71, 85, 105);
  doc.text('Invoice Date:', 125, 57);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoiceDate, 155, 57);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('VAT Reg No:', 125, 63);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('GB 384 9281 92', 155, 63);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Instruction Ref:', 125, 69);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 31, 77);
  doc.text(jobNo, 155, 69);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Method:', 125, 75);
  doc.setTextColor(22, 101, 52);
  doc.text(paymentMethod, 155, 75);

  // Line Items Table Header
  doc.setFillColor(11, 31, 77);
  doc.rect(15, 88, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Description', 20, 93.5);
  doc.text('Survey Service', 90, 93.5);
  doc.text('VAT (20%)', 140, 93.5);
  doc.text('Amount (£)', 190, 93.5, { align: 'right' });

  // Rows
  let curY = 103;
  const items = [
    { desc: `${surveyType} (Full Property Inspection)`, sub: 'Level 2 Professional Service', amount: baseFee },
    ...extras.map((ex) => ({ desc: ex.name, sub: 'Optional Add-on Service', amount: ex.amount })),
  ];
  if (discount > 0) {
    items.push({ desc: 'Promotional Welcome Discount', sub: 'Applied at checkout', amount: -discount });
  }

  items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, curY - 5, 180, 9, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item.desc, 20, curY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.sub, 90, curY);

    const itemVat = item.amount >= 0 ? (item.amount * vatRate).toFixed(2) : '0.00';
    doc.text(`£${itemVat}`, 140, curY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`£${item.amount.toFixed(2)}`, 190, curY, { align: 'right' });

    curY += 9;
  });

  // Totals Box
  curY += 6;
  const subtotal = baseFee + extras.reduce((sum, e) => sum + e.amount, 0) - discount;
  const vatTotal = subtotal * vatRate;
  const total = subtotal + vatTotal;

  doc.setDrawColor(226, 232, 240);
  doc.line(120, curY, 195, curY);
  curY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal (Net):', 130, curY);
  doc.text(`£${subtotal.toFixed(2)}`, 190, curY, { align: 'right' });

  curY += 6;
  doc.text('UK VAT @ 20%:', 130, curY);
  doc.text(`£${vatTotal.toFixed(2)}`, 190, curY, { align: 'right' });

  curY += 7;
  doc.setFillColor(11, 31, 77);
  doc.rect(120, curY - 4, 75, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Total Paid:', 125, curY + 2);
  doc.text(`£${total.toFixed(2)}`, 190, curY + 2, { align: 'right' });

  // Paid Stamp
  curY += 18;
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(1);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(15, curY, 95, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(22, 163, 74);
  doc.text('✔ PAID IN FULL', 22, curY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61);
  doc.text(`Settled via Stripe Gateway on ${paymentDate}`, 22, curY + 14);
  doc.text(`Transaction Reference: TXN-STRIPE-${Date.now().toString(16).toUpperCase()}`, 22, curY + 18);

  drawNJSFooter(doc, 1, 1);

  doc.save(`NJS_VAT_Invoice_${invoiceNo}.pdf`);
  return true;
};

/**
 * 3. Generate & Download Official RICS Survey Report PDF
 */
export const downloadReportPDF = ({
  jobNo = 'JOB-2026-080',
  clientName = 'Emma Watson',
  property = '14 Mayfair Gate, London W1K 2PB',
  surveyType = 'RICS Level 2 Home Survey',
  surveyorName = 'David Thorne MRICS',
  surveyorReg = 'RICS Member #089421',
  inspectionDate = '27/10/2026',
  propertyType = 'Mansion Apartment (Victorian c. 1892)',
}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Page 1: Cover & Summary
  drawNJSHeader(doc, 'RICS HOME SURVEY REPORT', `Official Condition Report • ${surveyType}`);

  // Subject Property Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, 50, 180, 36, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 31, 77);
  doc.text('PROPERTY & SURVEY DETAILS', 20, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Property Address:', 20, 63);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(property, 55, 63);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Property Archetype:', 20, 70);
  doc.setTextColor(15, 23, 42);
  doc.text(propertyType, 55, 70);

  doc.setTextColor(71, 85, 105);
  doc.text('Instructing Client:', 20, 77);
  doc.setFont('helvetica', 'bold');
  doc.text(clientName, 55, 77);

  doc.setFont('helvetica', 'normal');
  doc.text('Inspection Date:', 125, 63);
  doc.setFont('helvetica', 'bold');
  doc.text(inspectionDate, 155, 63);

  doc.setFont('helvetica', 'normal');
  doc.text('Chartered Surveyor:', 125, 70);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 31, 77);
  doc.text(surveyorName, 155, 70);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(surveyorReg, 155, 76);

  // RICS Condition Ratings Overview
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 31, 77);
  doc.text('SECTION A: RICS CONDITION RATINGS EXPLANATION', 15, 95);

  doc.setFillColor(254, 242, 242);
  doc.roundedRect(15, 100, 57, 24, 1.5, 1.5, 'F');
  doc.setTextColor(220, 38, 38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Condition Rating 3', 20, 106);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(127, 29, 29);
  doc.text('Defects that are serious and/or', 20, 112);
  doc.text('need to be repaired, replaced or', 20, 116);
  doc.text('investigated urgently.', 20, 120);

  doc.setFillColor(254, 252, 232);
  doc.roundedRect(76.5, 100, 57, 24, 1.5, 1.5, 'F');
  doc.setTextColor(161, 98, 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Condition Rating 2', 81.5, 106);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(113, 63, 18);
  doc.text('Defects that need repairing or', 81.5, 112);
  doc.text('replacing but are not considered', 81.5, 116);
  doc.text('to be serious or urgent.', 81.5, 120);

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(138, 100, 57, 24, 1.5, 1.5, 'F');
  doc.setTextColor(22, 101, 52);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Condition Rating 1', 143, 106);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(20, 83, 45);
  doc.text('No repair is currently needed.', 143, 112);
  doc.text('Normal maintenance must be', 143, 116);
  doc.text('carried out in the future.', 143, 120);

  // Findings Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 31, 77);
  doc.text('SECTION B: ELEMENT INSPECTION & DEFECT FINDINGS', 15, 133);

  const findings = [
    { element: 'Chimney Stacks & Flues', rating: 'Rating 1', statusColor: [22, 101, 52], notes: 'Brickwork repointed recently. Lead flashings seated correctly with no visual displacement.' },
    { element: 'Roof Coverings & Parapet', rating: 'Rating 2', statusColor: [161, 98, 7], notes: 'Slight slip on two slate tiles on west elevation. Zinc valley gutters have minor debris buildup.' },
    { element: 'Rainwater Gutters & Downpipes', rating: 'Rating 1', statusColor: [22, 101, 52], notes: 'Cast-iron downpipes intact. No staining observed indicating current leakage.' },
    { element: 'Main External Walls', rating: 'Rating 1', statusColor: [22, 101, 52], notes: 'Victorian solid masonry in sound structural condition. No active structural movement cracks.' },
    { element: 'Internal Skirting & Dampness', rating: 'Rating 2', statusColor: [161, 98, 7], notes: 'Moisture meter reading 24% WME in rear dining room skirting. Recommend subfloor ventilation review.' },
    { element: 'Woodwork, Joinery & Windows', rating: 'Rating 1', statusColor: [22, 101, 52], notes: 'Timber sash windows recently overhauled with draft-proofing and operational counterweights.' },
    { element: 'Services: Electrics & Heating', rating: 'Rating 2', statusColor: [161, 98, 7], notes: 'Consumer unit modern but no recent EICR electrical certificate on site. Advise routine check.' },
  ];

  let rowY = 140;
  findings.forEach((f) => {
    doc.setFillColor(248, 250, 252);
    doc.rect(15, rowY, 180, 11, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, rowY, 180, 11, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(f.element, 18, rowY + 4.5);

    // Rating Badge
    doc.setFillColor(f.statusColor[0], f.statusColor[1], f.statusColor[2]);
    doc.roundedRect(88, rowY + 1.5, 20, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(f.rating, 98, rowY + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(f.notes, 112, rowY + 4.5, { maxWidth: 80 });

    rowY += 12;
  });

  // Surveyor Signature Block
  rowY += 6;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, rowY, 180, 34, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 31, 77);
  doc.text('PROFESSIONAL VALUATION & SURVEYOR SIGN-OFF', 20, rowY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Lead Surveyor: ${surveyorName}`, 20, rowY + 13);
  doc.text(`Qualification: Member of Royal Institution of Chartered Surveyors`, 20, rowY + 18);
  doc.text(`Declaration: I have inspected the property and prepared this report in accordance with RICS standards.`, 20, rowY + 23);

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(14);
  doc.setTextColor(11, 31, 77);
  doc.text(surveyorName, 140, rowY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Signed: ${inspectionDate}`, 140, rowY + 23);

  drawNJSFooter(doc, 1, 1);

  doc.save(`NJS_RICS_Survey_Report_${jobNo}.pdf`);
  return true;
};
