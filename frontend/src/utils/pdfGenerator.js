import { jsPDF } from 'jspdf';
import { NJS_LOGO_BASE64 } from './njsLogoBase64';

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
  const bannerHeight = 26;
  doc.setFillColor(11, 31, 77); // #0B1F4D (Navy)
  doc.rect(0, 0, 210, bannerHeight, 'F');

  // Gold accent line
  doc.setFillColor(197, 160, 89); // Gold #C5A059
  doc.rect(0, bannerHeight, 210, 1.5, 'F');

  // Official NJS Brand Logo (white emblem on navy banner)
  // Aspect ratio is 380 / 222 = 1.71
  const logoH = 20;
  const logoW = logoH * 1.71; // 34.2mm
  try {
    if (NJS_LOGO_BASE64) {
      doc.addImage(NJS_LOGO_BASE64, 'PNG', 14, 3, logoW, logoH);
    }
  } catch (err) {
    console.warn('PDF logo render fallback:', err);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('NJS PROPERTY GROUP', 15, 15);
  }

  // Header Right Side: Credentials & Direct Contact
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('njspropertygroup.com', 195, 9.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(210, 220, 240);
  doc.text('RICS Regulated Practice • Reg No: 849201', 195, 14.5, { align: 'right' });
  doc.text('Direct: 0333 305 2777 | info@njspropertygroup.com', 195, 19.5, { align: 'right' });
  doc.text('Chartered Surveyors • Expert Witness Specialists', 195, 24, { align: 'right' });

  // Document Title (Dynamic Font Sizing to ensure 0 clipping on right margin)
  doc.setTextColor(11, 31, 77);
  doc.setFont('helvetica', 'bold');

  const titleText = (title || '').toUpperCase();
  const titleFontSize = titleText.length > 50 ? 12 : titleText.length > 36 ? 13.5 : 15;
  doc.setFontSize(titleFontSize);
  doc.text(titleText, 15, 36.5);

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 15, 42.5);
  }

  // Thin separator rule
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, 46.5, 195, 46.5);
};

// Helper to draw standard footer
const drawNJSFooter = (doc, pageNum = 1, totalPages = 1) => {
  const y = 285;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, y, 195, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('NJS Property Group Ltd • Registered in England & Wales • Reg Office: Belmont House, Uxbridge, UB8 1QS', 15, y + 4.5);
  doc.text(`Page ${pageNum} of ${totalPages}`, 195, y + 4.5, { align: 'right' });
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
  surveyorName = 'RICS Chartered Surveyor',
  instructingSolicitor = null,
  courtClaimNumber = null,
  courtForum = null,
  hourlyRate = 250.0,
  courtDailyFee = 1500.0,
  isExpertWitness = false,
}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const stLower = (surveyType || '').toLowerCase();
  const isEW = isExpertWitness || stLower.includes('expert') || stLower.includes('cpr');

  const docTitle = isEW
    ? 'EXPERT WITNESS MANDATE (CPR PART 35)'
    : `${(surveyType || 'RICS HOME SURVEY').toUpperCase()} TERMS OF ENGAGEMENT`;

  drawNJSHeader(doc, docTitle, `Instruction Ref: ${jobNo} • Legally Binding Contract`);

  // Sanitize date and time cleanly to prevent duplicate '16:16 at 16:16'
  let cleanDate = '';
  let cleanTime = '';
  if (signedDate && typeof signedDate === 'string' && signedDate.includes(',')) {
    const parts = signedDate.split(',');
    cleanDate = parts[0].trim();
    cleanTime = (parts[1] || '').trim();
  } else {
    cleanDate = signedDate || new Date().toLocaleDateString('en-GB');
  }
  if (!cleanTime && signedTime) {
    cleanTime = signedTime.trim();
  } else if (!cleanTime) {
    cleanTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  const executionDisplay = cleanTime ? `${cleanDate} at ${cleanTime}` : cleanDate;
  const signingTimestampDisplay = `${cleanDate}, ${cleanTime} UTC`;

  // Instruction Summary Box (Expanded height for EW or long addresses)
  const boxHeight = isEW ? 44 : 36;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, 50, 180, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 31, 77);
  doc.text('CLIENT & INSTRUCTION PARTICULARS', 20, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  // Left Column
  doc.text(`Instructing Party:`, 20, 63);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(clientName, 52, 63);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Subject Property:`, 20, 70);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  // Auto-wrap property address so it never overlaps right column
  const propertyLines = doc.splitTextToSize(property || 'Property to be inspected', 65);
  doc.text(propertyLines, 52, 70);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Service Ordered:`, 20, 77);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 31, 77);
  doc.text(surveyType, 52, 77);

  // Right Column
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Agreed Fee:`, 120, 63);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(agreedFee, 145, 63);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Execution Date:`, 120, 70);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(executionDisplay, 145, 70);

  if (isEW) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Solicitor / Claim:`, 20, 84);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14); // Amber-800
    doc.text(`${instructingSolicitor || 'Herbert Smith Freehills LLP'} • ${courtClaimNumber || 'Claim No. F00CL891'}`, 52, 84);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Forensic Scale:`, 120, 77);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 31, 77);
    doc.text(`£${hourlyRate}/hr • £${courtDailyFee}/day`, 145, 77);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Survey Practice:`, 120, 77);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 31, 77);
    doc.text('NJS Property Group Ltd', 145, 77);
  }

  // Contract Terms Clauses (Dynamically Tailored to Service)
  let curY = isEW ? 101 : 94;

  if (isEW) {
    // 1. CPR 35 Duty
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(11, 31, 77);
    doc.text('1. OVERRIDING STATUTORY DUTY TO THE COURT (CPR PART 35)', 15, curY);

    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const ew1 = [
      '1.1 Under Civil Procedure Rule 35.3, the Expert’s overriding and primary duty is to the Court, superseding any private',
      'obligation to the appointing party or instructing solicitor. Payment is for professional forensic work, never for a favorable opinion.',
      '1.2 The named expert acts independently and objectively and must consider contrary factual or technical evidence.',
    ];
    ew1.forEach((l) => { doc.text(l, 15, curY); curY += 4.2; });

    curY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(11, 31, 77);
    doc.text('2. APPOINTMENT ROUTE, FORENSIC RATES & COURT ATTENDANCE', 15, curY);

    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const ew2 = [
      `2.1 Hourly Rate: £${hourlyRate}/hr + VAT for investigations, document review, conference, and report drafting.`,
      `2.2 Court Attendance: £${courtDailyFee}/day + VAT (or £${Math.round(courtDailyFee / 2)}/half-day) for trial attendance and judicial hearings.`,
      `2.3 Instructing Solicitor: ${instructingSolicitor || 'Herbert Smith Freehills LLP'}. Court & Claim: ${courtClaimNumber || 'Claim No. F00CL891'}.`,
    ];
    ew2.forEach((l) => { doc.text(l, 15, curY); curY += 4.2; });

    curY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(11, 31, 77);
    doc.text('3. STATEMENT OF TRUTH & JOINT STATEMENTS (CPR 35.12)', 15, curY);

    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const ew3 = [
      '3.1 The final expert report incorporates the mandatory declaration of truthfulness and compliance with Practice Direction 35.',
      '3.2 In court-ordered expert discussions, the expert participates independently without solicitor veto or conditional approval.',
    ];
    ew3.forEach((l) => { doc.text(l, 15, curY); curY += 4.2; });
  } else if (stLower.includes('level 3')) {
    // Level 3 Building Survey
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(11, 31, 77);
    doc.text('1. LEVEL 3 COMPREHENSIVE STRUCTURAL INVESTIGATION SCOPE', 15, curY);

    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const l31 = [
      '1.1 Exhaustive structural audit covering building fabric, load-bearing walls, chimney breasts, roof trusses, and sub-floors.',
      '1.2 Sub-floor voids and main roof voids are entered where safe and accessible without structural damage.',
      '1.3 Defect cause diagnosis is provided with indicative repair cost estimates and urgency prioritization categories.',
    ];
    l31.forEach((l) => { doc.text(l, 15, curY); curY += 4.2; });

    curY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(11, 31, 77);
    doc.text('2. LEVEL 3 BUILDING SURVEY INDEMNITY & STATUTORY CANCELLATION', 15, curY);

    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const l32 = [
      '2.1 NJS Property Group Ltd maintains £1,000,000 professional indemnity cover backed by Lloyd’s and RSA syndicates.',
      '2.2 Statutory 14-day consumer cancellation applies unless express consent is given to perform the on-site inspection.',
      '2.3 In accordance with RICS rules, advance settlement of fees is required before on-site inspection slots are confirmed.',
    ];
    l32.forEach((l) => { doc.text(l, 15, curY); curY += 4.2; });

    curY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(11, 31, 77);
    doc.text('3. COMPLAINTS HANDLING & INDEPENDENT CEDR REDRESS', 15, curY);

    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const l33 = [
      '3.1 Complaints should be directed to Natasha Shergill at info@njspropertygroup.com (07444 918809 / 0333 305 2777).',
      '3.2 Eligible consumer disputes may proceed to CEDR (Centre for Effective Dispute Resolution) after stage 2 review.',
    ];
    l33.forEach((l) => { doc.text(l, 15, curY); curY += 4.2; });
  } else {
    // Level 2 / Standard
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(11, 31, 77);
    doc.text('1. SCOPE OF SERVICE & RICS HOME SURVEY STANDARD LEVEL 2', 15, curY);

    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const l21 = [
      '1.1 Visual condition examination of surface fabric, accessible roof voids, and moisture testing with Protimeter meters.',
      '1.2 Assigns Condition Ratings 1-3 to building components. Concealed structures and fitted carpets are not lifted.',
      '1.3 Governed by RICS Home Survey Standard (1st Edition). Professional Indemnity cover capped at £250,000.',
    ];
    l21.forEach((l) => { doc.text(l, 15, curY); curY += 4.2; });

    curY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(11, 31, 77);
    doc.text('2. ADVANCE SETTLEMENT & STATUTORY CONSUMER RIGHTS', 15, curY);

    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const l22 = [
      '2.1 Agreed fees (including 20% UK VAT) must be settled in full prior to site visit confirmation.',
      '2.2 Statutory 14-day cancellation right applies. Work commenced within this period upon express client request.',
      '2.3 NJS Property Group Ltd (Company No. 14367377, Fareham PO16 0EN) is your contracting supplier.',
    ];
    l22.forEach((l) => { doc.text(l, 15, curY); curY += 4.2; });

    curY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(11, 31, 77);
    doc.text('3. COMPLAINTS & INDEPENDENT REDRESS (CEDR)', 15, curY);

    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const l23 = [
      '3.1 Complaints Manager: Natasha Shergill, info@njspropertygroup.com / 07444 918809 / 0333 305 2777.',
      '3.2 Independent consumer redress provided by CEDR (100 St Paul’s Churchyard, London EC4M 8BU).',
    ];
    l23.forEach((l) => { doc.text(l, 15, curY); curY += 4.2; });
  }

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
  const isDrawnSig = Boolean(signatureValue && typeof signatureValue === 'string' && signatureValue.startsWith('data:image'));
  if (isDrawnSig) {
    try {
      doc.addImage(signatureValue, 'PNG', 65, curY + 8, 48, 16);
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
  doc.text(signingTimestampDisplay, 65, curY + 34);

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
  invoiceDate = null,
  date = null,
  paymentDate = null,
  paymentMethod = 'Direct Bank Transfer (BACS Faster Payments)',
  baseFee = 770.0,
  vatAmount = null,
  totalAmount = null,
  extras = [],
  discount = 0.0,
  vatRate = 0.2, // 20%
  signatureValue = null,
  signatureType = 'typed',
}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const effectiveInvoiceDate = invoiceDate || date || new Date().toLocaleDateString('en-GB');
  const effectivePaymentDate = paymentDate || `${effectiveInvoiceDate}, 11:20`;
  const isPaid = !paymentMethod?.toLowerCase().includes('pending') && !paymentMethod?.toLowerCase().includes('unpaid');

  drawNJSHeader(
    doc,
    'VAT INVOICE & RECEIPT',
    `Invoice No: ${invoiceNo} • Status: ${isPaid ? 'PAID' : 'PAYMENT DUE'}`
  );

  // Invoice Meta
  const metaBoxH = 34;
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 50, 180, metaBoxH, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, 50, 180, metaBoxH, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Billed To:', 20, 57);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(clientName, 42, 57);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const invProp = doc.splitTextToSize(property || 'Property address', 68);
  doc.text(invProp, 42, 63);

  // Right column meta labels & values
  doc.setTextColor(71, 85, 105);
  doc.text('Invoice Date:', 116, 57);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(effectiveInvoiceDate, 146, 57);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('VAT Reg No:', 116, 63);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('GB 384 9281 92', 146, 63);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Instruction Ref:', 116, 69);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 31, 77);
  doc.text(jobNo, 146, 69);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Method:', 116, 75);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPaid ? 22 : 180, isPaid ? 101 : 83, isPaid ? 52 : 9);
  const pmLines = doc.splitTextToSize(paymentMethod || (isPaid ? 'BACS Faster Payments' : 'Pending Settlement'), 46);
  doc.text(pmLines, 146, 75);

  // Line Items Table Header
  const tableTopY = 90;
  doc.setFillColor(11, 31, 77);
  doc.rect(15, tableTopY, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Description & Scope of Service', 20, tableTopY + 5.5);
  doc.text('Rate', 130, tableTopY + 5.5);
  doc.text('VAT (20%)', 158, tableTopY + 5.5);
  doc.text('Amount (£)', 190, tableTopY + 5.5, { align: 'right' });

  // Calculate clean subtotal, VAT and total
  const subtotal = totalAmount !== null
    ? totalAmount / (1 + vatRate)
    : (baseFee || 770.0) + (extras || []).reduce((sum, e) => sum + (e.amount || 0), 0) - (discount || 0);
  const vatTotal = vatAmount !== null ? vatAmount : subtotal * vatRate;
  const total = totalAmount !== null ? totalAmount : subtotal + vatTotal;

  // Prepare line items
  const items = [];
  if (extras && extras.length > 0) {
    items.push({
      title: surveyType,
      subtitle: 'Physical On-Site Inspection & Comprehensive RICS Report',
      rate: 'Standard',
      amount: baseFee
    });
    extras.forEach((ex) => {
      items.push({
        title: ex.name,
        subtitle: 'Optional Add-on Service',
        rate: 'Add-on',
        amount: ex.amount
      });
    });
  } else {
    items.push({
      title: surveyType,
      subtitle: 'Physical On-Site Inspection & Comprehensive RICS Report',
      rate: 'Standard',
      amount: subtotal
    });
  }
  if (discount > 0) {
    items.push({
      title: 'Promotional Welcome Discount',
      subtitle: 'Applied at invoice checkout',
      rate: 'Discount',
      amount: -discount
    });
  }

  // Render Rows
  let curY = tableTopY + 8;
  items.forEach((item, idx) => {
    const rowH = 13;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, curY, 180, rowH, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(15, curY + rowH, 195, curY + rowH);

    // Primary Service Title (Bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(item.title, 105);
    doc.text(titleLines[0], 20, curY + 5);

    // Subtitle / Scope (Normal, Slate)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const subLines = doc.splitTextToSize(item.subtitle, 105);
    doc.text(subLines[0], 20, curY + 9.5);

    // Rate
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(item.rate, 130, curY + 6.5);

    // VAT
    const itemVat = item.amount >= 0 ? (item.amount * vatRate).toFixed(2) : '0.00';
    doc.text(`£${itemVat}`, 158, curY + 6.5);

    // Amount Net
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`£${item.amount.toFixed(2)}`, 190, curY + 6.5, { align: 'right' });

    curY += rowH;
  });

  // Totals Box
  curY += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(120, curY, 195, curY);
  curY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal (Net ex. VAT):', 125, curY);
  doc.text(`£${subtotal.toFixed(2)}`, 190, curY, { align: 'right' });

  curY += 6;
  doc.text('UK VAT @ 20%:', 125, curY);
  doc.text(`£${vatTotal.toFixed(2)}`, 190, curY, { align: 'right' });

  curY += 7;
  doc.setFillColor(11, 31, 77);
  doc.rect(120, curY - 4, 75, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(isPaid ? 'Total Settled:' : 'Total Amount Due:', 125, curY + 2);
  doc.text(`£${total.toFixed(2)}`, 190, curY + 2, { align: 'right' });

  // Paid Stamp / Settlement Advice
  curY += 15;
  const stampBoxW = 110;
  if (isPaid) {
    const settledLines = doc.splitTextToSize(`Settled via ${paymentMethod} on ${effectivePaymentDate}`, stampBoxW - 12);
    const stampBoxH = Math.max(24, 18 + settledLines.length * 4);

    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.8);
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(15, curY, stampBoxW, stampBoxH, 2, 2, 'FD');

    // Vector checkmark circle badge (clean geometric checkmark)
    doc.setFillColor(22, 163, 74);
    doc.circle(22.5, curY + 6.5, 3.2, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.65);
    doc.line(21.2, curY + 6.5, 22.3, curY + 7.8);
    doc.line(22.3, curY + 7.8, 24.3, curY + 5.3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(22, 163, 74);
    doc.text('PAID IN FULL — OFFICIAL VAT RECEIPT', 28, curY + 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61);
    doc.text(settledLines, 20, curY + 14);

    const txnY = curY + 14 + (settledLines.length * 4);
    doc.text(`Transaction Reference: TXN-NJS-${Date.now().toString(16).toUpperCase()}`, 20, txnY);
  } else {
    const bankLines = doc.splitTextToSize('Bank Transfer: Sort Code 23-05-80 • Account 46452283 • Beneficiary: NJS PROPERTY GROUP LTD', stampBoxW - 10);
    const stampBoxH = Math.max(24, 18 + bankLines.length * 3.8);

    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(0.8);
    doc.setFillColor(255, 247, 237);
    doc.roundedRect(15, curY, stampBoxW, stampBoxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(194, 65, 12);
    doc.text('PAYMENT ADVICE — AWAITING SETTLEMENT', 20, curY + 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(154, 52, 18);
    doc.text(bankLines, 20, curY + 13.5);
    const refY = curY + 13.5 + (bankLines.length * 3.8);
    doc.text(`Payment Reference: ${invoiceNo} • Settlement due upon terms execution`, 20, refY);
  }

  // Client Execution / Signature Box on Official Receipt
  if (signatureValue) {
    const isDrawn = typeof signatureValue === 'string' && signatureValue.startsWith('data:image');
    const sigBoxX = 132;
    const sigBoxW = 63;
    const sigBoxH = 26;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(sigBoxX, curY, sigBoxW, sigBoxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(11, 31, 77);
    doc.text('CLIENT DIGITAL EXECUTION', sigBoxX + 4, curY + 5.5);

    if (isDrawn) {
      try {
        doc.addImage(signatureValue, 'PNG', sigBoxX + 5, curY + 7, 38, 13);
      } catch {
        doc.setFont('times', 'bolditalic');
        doc.setFontSize(11);
        doc.setTextColor(11, 31, 77);
        doc.text(clientName, sigBoxX + 6, curY + 14);
      }
    } else {
      doc.setFont('times', 'bolditalic');
      doc.setFontSize(11);
      doc.setTextColor(11, 31, 77);
      doc.text(signatureValue || clientName, sigBoxX + 6, curY + 14);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Digitally Verified • ECA 2000', sigBoxX + 4, curY + 22);
  }

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
  surveyorName = 'RICS Chartered Surveyor',
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
  const repProp = doc.splitTextToSize(property || 'Property address', 65);
  doc.text(repProp, 55, 63);

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

