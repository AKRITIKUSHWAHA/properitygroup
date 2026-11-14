import { useState, useEffect } from 'react';

/**
 * Service-Specific Legal Terms of Engagement Templates
 * Extracted directly from Client Word Documents & Agreements:
 * 1. 07_Level_2_and_Valuation.docx & NJS_Level_2_With_Valuation_Terms.docx (Level 2 Home Survey)
 * 2. NJS_Level_3_With_Valuation_Terms.docx & TERMS OF ENGAGEMENT - L2_ L3 - NOV 2024.docx (Level 3 Building Survey)
 * 3. RICS Standard Valuation Terms and Conditions.docx (Red Book Valuation)
 * 4. Damp And Timber Survey T_Cs (1).docx (Specialist Damp & Timber)
 * 5. Defect Report Terms - Google Docs.html (Specific Defect & Snagging)
 * 6. NJS_CPR_Part_35_Expert_Witness_Mandate.docx (CPR Part 35 Expert Witness Mandate with editable blanks)
 */
export const TERMS_TEMPLATES = [
  {
    id: 'tmpl-l2',
    serviceKey: 'Homebuyer L2',
    aliases: ['level 2', 'homebuyer', 'home survey', 'rics level 2'],
    name: 'RICS Home Survey Standard (Level 2) Terms of Engagement',
    shortName: 'Level 2 Home Survey Terms',
    version: 'v2026.2 (10 November 2026 Edition)',
    year: '2026',
    governingBody: 'Royal Institution of Chartered Surveyors (RICS Home Survey Standard 1st Edition)',
    piiCap: '£250,000 Professional Indemnity Cover (£1m firm policy)',
    summary: 'Visual condition inspection for residential properties in reasonable condition. Outlines building fabric visual inspection, moisture meter protocols, and condition ratings 1–3.',
    isExpertWitness: false,
    orderFormDefaults: {
      serviceTitle: 'Service Level 2 and Red Book Valuation | Version 10 November 2026',
      liabilityLimit: '£250,000 per claim or subject property market valuation',
      cancellationPeriod: '14-day statutory consumer cancellation right',
      complaintsContact: 'Natasha Shergill (info@njspropertygroup.com / 07444 918809 / 0333 305 2777)',
      adrEntity: 'CEDR (Centre for Effective Dispute Resolution) - 100 St Paul’s Churchyard, London EC4M 8BU',
    },
    clauses: [
      {
        num: '1',
        title: 'Our Agreement & Supplier Accountability',
        text: 'These terms and the completed Order describe the service, fee and intended use. NJS Property Group Ltd (Company number 14367377, 203 West Street, Fareham, PO16 0EN) is your contracting supplier and remains responsible for work it delegates. Agreed changes must be recorded in writing. Nothing removes information or promises that are binding under consumer law. We use reasonable care and skill.',
      },
      {
        num: '2',
        title: 'The Service (RICS Home Survey Standard Level 2)',
        text: 'Level 2 is a visual condition survey for a conventional home in reasonable condition. We inspect accessible inside and outside areas, permanent outbuildings and grounds, identify significant defects and risks, give condition ratings (1-3) and recommend necessary action and further investigations. It does not provide the detailed diagnosis, repair options or repair budgets of Level 3. The service follows the RICS Home survey standard, 1st edition (effective March 2021).',
      },
      {
        num: '3',
        title: 'Your Surveyor & Competence Verification',
        text: 'A suitably competent AssocRICS, MRICS or FRICS member is responsible for each RICS home survey. Experienced non-RICS surveyors may attend or assist under a named RICS member’s appropriate supervision; supervision does not make them RICS members or permit them to independently deliver or sign a RICS service. We retain experience, competence and supervision records.',
      },
      {
        num: '4',
        title: 'Inspection & Investigation Protocol',
        text: 'We enter safe accessible roof spaces and inspect visible structure. We sample windows and doors; inspect accessible subfloor voids through suitable unfixed hatches by a head-and-shoulders inspection without entering the void; and view roofs from safe available positions. We do not lift fitted coverings, floorboards or move heavy contents. Drainage covers are lifted where safe and reasonably accessible; drains are not tested.',
      },
      {
        num: '5',
        title: 'Access, Keys & Site Safety',
        text: 'Client must arrange owner/occupier consent, keys and safe access; disclose hazards, alterations and known defects. We do not force entry, disturb hazardous materials or take unsafe access. Any pin-probe damp testing that may mark surfaces needs owner/occupier permission. We record inaccessible areas and their significance; inaccessible does not mean defect-free.',
      },
      {
        num: '6',
        title: 'Exclusions & Specialized Diagnostics',
        text: 'Unless expressly commissioned, there is no destructive investigation, structural engineering design, services safety testing (gas, electrical, water pressure), asbestos sampling, contamination testing, fire risk assessment, EWS1 certification, or legal title investigation. We report visible concerns within scope and recommend specialist testing where needed.',
      },
      {
        num: '7',
        title: 'Valuation Conditions (Where Ordered)',
        text: 'Where market valuation is included, it is prepared under RICS Valuation – Global Standards (effective 31 January 2025) and UK National Supplement. Market Value is the IVS basis for an arm’s-length exchange between willing, informed parties after proper marketing. Values can change; no sale price or future capital appreciation is guaranteed.',
      },
      {
        num: '8',
        title: 'Fees & Advance Settlement Requirement',
        text: 'The Order gives the total price, VAT treatment (standard 20% UK VAT) and any agreed additional charges. Payment is due in full before inspection unless stated otherwise. On-site inspection slots remain tentative until both digital execution of terms and fee payment have been settled. There are no consumer card surcharges.',
      },
      {
        num: '9',
        title: 'Statutory 14-Day Cancellation & Optional Early Start',
        text: 'For a consumer distance or off-premises service contract, you may cancel without reason within 14 days after the day the contract is made. Work starts during that period only on your express request. If you then cancel, you pay only the lawful proportion of work supplied. The right ends on full performance with your prior acknowledgement.',
      },
      {
        num: '10',
        title: 'Later Cancellation & Disruption Rules',
        text: 'Outside a statutory cancellation right, cancellation or failed access may attract only reasonable, evidenced net losses caused by it, after savings and reasonable mitigation, never a penalty or automatic full fee. We notify delays promptly, take reasonable steps to reduce them and agree revised dates.',
      },
      {
        num: '11',
        title: 'Reliance, Confidentiality & Copyright',
        text: 'Only the named clients and any expressly agreed intended users may rely on the report for its agreed purpose. You may share it with your professional advisers (conveyancers, mortgage lenders) for that purpose. We retain copyright and allow the clients to use the paid-for report for the agreed transaction.',
      },
      {
        num: '12',
        title: 'Professional Liability & Foreseeable Loss',
        text: 'We are responsible for loss caused by our breach that is reasonably foreseeable under English law. We do not guarantee detection of concealed defects beyond the agreed visual inspection, but remain responsible for following up relevant signs within scope. No term excludes death or personal injury caused by negligence or fraud.',
      },
      {
        num: '13',
        title: 'Protection of Individuals & Insurance',
        text: 'No employee, director or assisting surveyor assumes a separate personal contractual duty to you; claims under this service contract are against NJS Property Group Ltd, which remains accountable. All surveyors engaged for this work carry £1 million professional indemnity and £1 million public liability cover.',
      },
      {
        num: '14',
        title: 'Complaints Handling & CEDR Independent Redress',
        text: 'Contact Natasha Shergill, Complaints Manager, at info@njspropertygroup.com or 203 West Street, Fareham, PO16 0EN (07444 918809 / 0333 305 2777). We acknowledge within 7 days and respond within 28 days. Eligible consumer disputes may proceed to CEDR (Centre for Effective Dispute Resolution - surveyors@cedr.com / 020 7536 6116) after our final response or 8 weeks from complaint.',
      },
      {
        num: '15',
        title: 'Governing Law & Jurisdiction',
        text: 'English law applies to this agreement for services in England and Wales. Mandatory protections of a consumer’s home jurisdiction remain. Consumers may bring proceedings in the courts available to them by law in the UK.',
      },
    ],
  },
  {
    id: 'tmpl-l3',
    serviceKey: 'Building L3',
    aliases: ['level 3', 'building survey', 'structural', 'full structural', 'comprehensive'],
    name: 'Comprehensive Building Survey (Level 3) Structural Terms',
    shortName: 'Level 3 Building Survey Terms',
    version: 'v2026.1 (10 November 2026 Edition)',
    year: '2026',
    governingBody: 'RICS Technical Guidelines & Consumer Rights Act 2015',
    piiCap: '£1,000,000 Full Structural Indemnity Cover',
    summary: 'Exhaustive structural investigation terms for older, altered, period, or listed properties. Covers invasive inspection rights, loft access, sub-floors, structural movement analysis, and remediation costings.',
    isExpertWitness: false,
    orderFormDefaults: {
      serviceTitle: 'Service Level 3 Comprehensive Building Survey & Structural Audit | Version 10 November 2026',
      liabilityLimit: '£1,000,000 Full Structural Indemnity',
      cancellationPeriod: '14-day statutory consumer cancellation right',
      complaintsContact: 'Natasha Shergill (info@njspropertygroup.com / 07444 918809 / 0333 305 2777)',
      adrEntity: 'CEDR (Centre for Effective Dispute Resolution)',
    },
    clauses: [
      {
        num: '1',
        title: 'Comprehensive Structural Scope & Objective',
        text: 'Level 3 provides an exhaustive technical and structural audit tailored for older (pre-1919), complex, heavily altered, timber-framed or listed properties. We examine load-bearing masonry, chimney breasts, roof trusses, purlins, lintels, basement tanking, retaining walls, and timber pathology.',
      },
      {
        num: '2',
        title: 'Invasive Inspection Rights & Sub-floor Assessment',
        text: 'Where unfixed floorboards, perimeter carpet edges, or crawl-space trapdoors permit safe access without causing damage, the surveyor conducts a sub-floor void inspection. Main roof voids are accessed up to 3m working ladder heights with high-powered lighting.',
      },
      {
        num: '3',
        title: 'Defect Diagnosis & Remedial Action Estimates',
        text: 'The report provides detailed cause determination for structural movement, differential settlement, thermal bridging, interstitial condensation, and wood-boring infestation, accompanied by indicative budget ranges and prioritization categories for remedial repairs.',
      },
      {
        num: '4',
        title: 'Specialist Sub-Consultant Referrals',
        text: 'Where complex structural subsidence, boundary retaining wall instability, or sub-surface drainage collapse is identified, the surveyor specifies formal referral to structural engineers, arboricultural consultants (tree root desiccation), or CCTV drainage contractors.',
      },
      {
        num: '5',
        title: 'Full Structural Liability & Indemnity',
        text: 'NJS Property Group maintains £1,000,000 professional indemnity cover for Level 3 instructions under RSA and Lloyd’s syndicates. Liability is governed by English law and the Consumer Rights Act 2015.',
      },
      {
        num: '6',
        title: 'Advance Fee & Scheduling Protocol',
        text: 'Full survey fees including 20% UK VAT must be settled in advance of site attendance. Inspection booking dates are confirmed only upon receipt of both signed electronic terms and cleared settlement funds.',
      },
      {
        num: '7',
        title: 'Statutory 14-Day Cancellation & Early Performance',
        text: 'Clients retain statutory 14-day cancellation rights under consumer regulations. Express consent to commence the inspection within the 14-day window waives cancellation rights once the on-site inspection and reporting have been performed.',
      },
      {
        num: '8',
        title: 'Complaints Redress & Ombudsman',
        text: 'Complaints must be submitted in writing to Natasha Shergill at info@njspropertygroup.com. Unresolved disputes may be escalated to CEDR under its independent RICS adjudication scheme.',
      },
    ],
  },
  {
    id: 'tmpl-valuation',
    serviceKey: 'Valuation',
    aliases: ['valuation', 'red book', 'help to buy', 'probate', 'capital gains', 'shared ownership'],
    name: 'RICS Red Book Global Residential & Commercial Valuation Terms',
    shortName: 'RICS Red Book Valuation Terms',
    version: 'v2026.2 (RICS Red Book Edition)',
    year: '2026',
    governingBody: 'RICS Valuation – Global Standards (incorporating IVS) & UK National Supplement',
    piiCap: '£2,000,000 Lending & Probate Indemnity',
    summary: 'Legally compliant terms for mortgage lending, probate (Inheritance Tax), Help-to-Buy redemption, capital gains tax, and matrimonial property division.',
    isExpertWitness: false,
    orderFormDefaults: {
      serviceTitle: 'RICS Red Book Independent Valuation Mandate | VPS 4 Market Value',
      liabilityLimit: '£2,000,000 Lending & Statutory Valuation Indemnity',
      cancellationPeriod: '14-day statutory consumer cancellation right',
      complaintsContact: 'Natasha Shergill (info@njspropertygroup.com / 07444 918809)',
      adrEntity: 'CEDR (Centre for Effective Dispute Resolution)',
    },
    clauses: [
      {
        num: '1',
        title: 'Valuation Basis (VPS 4 Market Value)',
        text: 'The valuation is prepared by a qualified RICS Registered Valuer under RICS Valuation – Global Standards (Red Book). The basis of value is Market Value (IVS) as at the agreed valuation date, derived from verified Land Registry and local comparable transactions.',
      },
      {
        num: '2',
        title: 'Mandated Valuation Purpose & Intended Users',
        text: 'The valuation is prepared strictly for the declared purpose (e.g. Help-to-Buy equity loan redemption, Homes England, probate / HMRC Inheritance Tax, Capital Gains Tax, or shared ownership resale). Third party reliance is strictly prohibited without prior written consent.',
      },
      {
        num: '3',
        title: 'Assumptions & Title Verification',
        text: 'Unless stated otherwise, the valuer assumes good and marketable freehold or long leasehold title, unencumbered by onerous restrictive covenants, easements, environmental contamination, or Japanese knotweed infestation.',
      },
      {
        num: '4',
        title: 'Physical Inspection Limitations',
        text: 'The valuation inspection is non-invasive and does not constitute a full condition survey. Visible defects that materially impact market value will be reflected in the appraisal, but building fabric is not tested.',
      },
      {
        num: '5',
        title: 'Payment & Validity Duration',
        text: 'Valuation fees must be paid in full prior to report release. Standard RICS Red Book valuation certificates remain valid for 3 months from the date of inspection.',
      },
    ],
  },
  {
    id: 'tmpl-damp',
    serviceKey: 'Damp',
    aliases: ['damp', 'timber', 'damp and timber', 'moisture', 'woodworm', 'dry rot'],
    name: 'Specialist Moisture, Timber & Structural Dampness Terms',
    shortName: 'Damp & Timber Survey Terms',
    version: 'v2026.1 (PCA Independent Standard)',
    year: '2026',
    governingBody: 'Property Care Association (PCA) & Historic England Traditional Building Guidelines',
    piiCap: '£500,000 Diagnostic Indemnity',
    summary: 'Independent diagnostic investigation of rising damp, penetrating damp, condensation, black mould, and timber decay (dry rot / wet rot) without contractor sales bias.',
    isExpertWitness: false,
    orderFormDefaults: {
      serviceTitle: 'Specialist Independent Dampness & Timber Pathology Survey Mandate',
      liabilityLimit: '£500,000 Independent Diagnostic Indemnity',
      cancellationPeriod: '14-day statutory consumer cancellation right',
      complaintsContact: 'Natasha Shergill (info@njspropertygroup.com / 07444 918809)',
      adrEntity: 'CEDR (Centre for Effective Dispute Resolution)',
    },
    clauses: [
      {
        num: '1',
        title: 'Zero Contractor Bias & Independent Status',
        text: 'NJS Property Group operates with absolute independence and does not sell chemical damp proofing injections, tanking slurries, or timber treatments. All diagnostic advice is completely unbiased and focused on addressing root causes.',
      },
      {
        num: '2',
        title: 'Scientific Instrumentation & Moisture Meter Testing',
        text: 'Testing is conducted using calibrated electronic electrical resistance meters (Protimeter), thermo-hygrometers for relative humidity (RH) analysis, and thermal imaging cameras in conformity with British Standard BS 6576.',
      },
      {
        num: '3',
        title: 'Timber Decay & Woodworm Investigation',
        text: 'Accessible structural timbers in ground floor joists, wall plates, and roof timbers are inspected for active Common Furniture Beetle (Anobium punctatum), Death Watch Beetle, wet rot (Coniophora puteana), and True Dry Rot (Serpula lacrymans).',
      },
      {
        num: '4',
        title: 'Historic Building Breathability Protocol',
        text: 'For solid-wall properties constructed before 1919, moisture assessments prioritize traditional breathability, vapor-permeable lime plasters, sub-floor cross-ventilation, and external ground level drainage over destructive chemical barriers.',
      },
    ],
  },
  {
    id: 'tmpl-snagging',
    serviceKey: 'Snagging',
    aliases: ['snagging', 'defect', 'new build', 'snagging report', 'specific defect'],
    name: 'Specific Defect Report & New Build Snagging Mandate',
    shortName: 'Snagging & Defect Terms',
    version: 'v2026.3 (NHQB & NHBC Tolerances)',
    year: '2026',
    governingBody: 'New Homes Quality Board (NHQB) & Consumer Code for Home Builders',
    piiCap: '£250,000 Defect Warranty Indemnity',
    summary: 'Specialized defect inspection mandate. Covers decorative finishes, NHBC tolerances, thermal bridging checks, and builder rectification schedules.',
    isExpertWitness: false,
    orderFormDefaults: {
      serviceTitle: 'Specific Defect & Pre-Completion Snagging Inspection Mandate',
      liabilityLimit: '£250,000 Warranty & Defect Indemnity',
      cancellationPeriod: '14-day statutory consumer cancellation right',
      complaintsContact: 'Natasha Shergill (info@njspropertygroup.com / 07444 918809)',
      adrEntity: 'CEDR (Centre for Effective Dispute Resolution)',
    },
    clauses: [
      {
        num: '1',
        title: 'Specific Defect & Snagging Scope',
        text: 'Investigation covers agreed specific defects (e.g. wall cracking, roof leakage, floor deflection) or comprehensive new-build snagging across joinery, plaster finishes, window alignment, plumbing fixtures, and external envelope.',
      },
      {
        num: '2',
        title: 'NHBC & British Standard Tolerances',
        text: 'All defect items are referenced directly against British Standards and warranty provider tolerances (NHBC, Premier Guarantee, LABC) to provide developers and clients with an objective rectification list.',
      },
      {
        num: '3',
        title: 'Site Access & Developer Authorization',
        text: 'For pre-completion snagging, the purchaser must secure developer site manager access permissions. The surveyor adheres strictly to CSCS site safety protocols.',
      },
      {
        num: '4',
        title: 'Punchlist Delivery SLA',
        text: 'The photographic snagging punchlist is delivered in high-resolution PDF within 24–48 hours of site completion for immediate submission to developer customer care.',
      },
    ],
  },
  {
    id: 'tmpl-expert-witness',
    serviceKey: 'Expert Witness',
    aliases: ['expert witness', 'cpr', 'cpr 35', 'cpr part 35', 'dispute', 'litigation', 'court'],
    name: 'Civil Procedure Rules (CPR Part 35) Expert Witness Mandate',
    shortName: 'CPR Part 35 Expert Witness Mandate',
    version: 'v2026.1 (13 November 2026 Edition)',
    year: '2026',
    governingBody: 'Ministry of Justice Civil Procedure Rules (CPR Part 35) & RICS Practice Statement',
    piiCap: '£2,000,000 Forensic Litigation Cover',
    summary: 'Formal terms of appointment for property and surveying expert evidence in civil proceedings in England and Wales. Incorporates editable blanks for Hourly Rate, Court Attendance Daily Fee, Instructing Solicitor, and Case Claim Number.',
    isExpertWitness: true,
    // Client-specified editable blanks defaults:
    expertWitnessDefaults: {
      hourlyRate: 250.0,
      courtDailyFee: 1500.0,
      instructingSolicitor: '',
      courtClaimNumber: '',
      courtForum: 'County Court at Central London',
      appointmentRoute: 'Single Joint Expert (SJE)', // 'Party-Appointed Expert' | 'Single Joint Expert (SJE)'
      initialReviewEstimate: 750.0,
      reportPreparationEstimate: 1250.0,
      statementOfTruthIncluded: true,
    },
    orderFormDefaults: {
      serviceTitle: 'Expert Witness Mandate Civil Procedure Rules Part 35 | Version 13 November 2026',
      liabilityLimit: '£2,000,000 Forensic Litigation Indemnity',
      cancellationPeriod: '14-day statutory consumer cancellation right',
      complaintsContact: 'Natasha Shergill (info@njspropertygroup.com / 07444 918809)',
      adrEntity: 'CEDR / Appropriate Court Process',
    },
    clauses: [
      {
        num: '1',
        title: 'Overriding Duty to the Court (CPR 35.3)',
        text: 'The Expert’s overriding and primary duty is to the Court, superseding any obligation to the instructing party, solicitor, or fee payer. The Expert is an independent witness and not an advocate for either party. Payment is for professional forensic work, never for a favourable opinion or litigation outcome.',
      },
      {
        num: '2',
        title: 'Personal Appointment & Competence Verification',
        text: 'This mandate records the named expert’s personal appointment. The named individual remains personally responsible for their expert evidence and signs their own report. Assistants, tests, and evidence-gathering contributions must be transparently disclosed in the report.',
      },
      {
        num: '3',
        title: 'Fee Structure & Editable Blanks (Hourly & Court Attendance)',
        text: 'Fees are calculated strictly on the agreed professional scale: Hourly Rate: £[HOURLY_RATE]/hr + VAT for site inspections, document review, and report drafting. Court Attendance Daily Refresher: £[COURT_DAILY_FEE]/day + VAT (or £[COURT_HALF_DAY]/half-day) for courtroom appearances, cross-examination, and judicial hearings.',
      },
      {
        num: '4',
        title: 'Instructing Solicitor & Court Claim Particulars',
        text: 'Instructing Solicitor: [INSTRUCTING_SOLICITOR]. Court & Claim Reference: [COURT_CLAIM_NUMBER]. Forum: [COURT_FORUM]. Appointment Route: [APPOINTMENT_ROUTE]. A common document register and version-controlled instruction schedule must be maintained.',
      },
      {
        num: '5',
        title: 'Statement of Truth & Compliance with PD 35',
        text: 'The final expert report must incorporate the mandatory declaration confirming truthfulness and compliance with CPR Part 35, Practice Direction 35, and the RICS Practice Statement for Surveyors Acting as Expert Witnesses.',
      },
      {
        num: '6',
        title: 'Expert Discussions & Joint Statements (CPR 35.12)',
        text: 'The expert participates independently in ordered discussions with the opposing party’s expert and records points of agreement, disagreement, and reasons in a Joint Statement. Instructing parties or solicitors may not veto professional consensus.',
      },
      {
        num: '7',
        title: 'Single Joint Expert (SJE) Rules (Where Appointed)',
        text: 'Where appointed jointly under CPR 35.7/35.8, the expert serves both parties equally. Substantive instructions, materials, and questions must be copied simultaneously to all parties. Under CPR 35.8, instructing parties remain jointly and severally liable for expert fees.',
      },
      {
        num: '8',
        title: 'Advance Payment & Non-Contingency Rule',
        text: 'Expert witness fees are payable regardless of litigation outcome, judicial acceptance of opinions, settlement, or costs recovery. Conditional fee arrangements, percentage cuts of damages, or success fees are strictly prohibited.',
      },
      {
        num: '9',
        title: 'Reserved Hearing Time & Cancellation Bandings',
        text: 'Where courtroom hearing dates are formally booked and reserved, postponement or settlement within 14 days of the listed trial may attract reasonable evidenced net loss from unavoidable reserved calendar days, after mitigation.',
      },
      {
        num: '10',
        title: 'Complaints, Immunity & Court Jurisdiction',
        text: 'Questions about the expert’s professional evidence or conduct in civil proceedings must be raised through the instructing representative and the appropriate court process. English law and the jurisdiction of England and Wales apply.',
      },
    ],
  },
];

/**
 * Intelligent Service-to-Template Mapper
 * Matches any input survey type string to the canonical 6 templates
 */
export const getTemplateForService = (serviceType = '') => {
  const st = String(serviceType).toLowerCase().trim();
  if (st.includes('expert') || st.includes('cpr') || st.includes('witness') || st.includes('dispute') || st.includes('litigation')) {
    return TERMS_TEMPLATES.find((t) => t.id === 'tmpl-expert-witness') || TERMS_TEMPLATES[5];
  }
  if (st.includes('level 3') || st.includes('l3') || st.includes('building survey') || st.includes('structural')) {
    return TERMS_TEMPLATES.find((t) => t.id === 'tmpl-l3') || TERMS_TEMPLATES[1];
  }
  if (st.includes('valuation') || st.includes('red book') || st.includes('help to buy') || st.includes('probate')) {
    return TERMS_TEMPLATES.find((t) => t.id === 'tmpl-valuation') || TERMS_TEMPLATES[3];
  }
  if (st.includes('damp') || st.includes('timber') || st.includes('moisture') || st.includes('woodworm') || st.includes('rot')) {
    return TERMS_TEMPLATES.find((t) => t.id === 'tmpl-damp') || TERMS_TEMPLATES[4];
  }
  if (st.includes('snagging') || st.includes('defect') || st.includes('new build')) {
    return TERMS_TEMPLATES.find((t) => t.id === 'tmpl-snagging') || TERMS_TEMPLATES[2];
  }
  // Default to Level 2
  return TERMS_TEMPLATES.find((t) => t.id === 'tmpl-l2') || TERMS_TEMPLATES[0];
};

/**
 * Auto-Fill Helper
 * Takes a job/quote and generates contract particulars ready for dispatch or e-signing
 */
export const createAutoFilledAgreement = ({
  job = {},
  templateKey = null,
  customFields = {},
}) => {
  const template = templateKey
    ? TERMS_TEMPLATES.find((t) => t.serviceKey === templateKey || t.id === templateKey) || getTemplateForService(job.surveyType)
    : getTemplateForService(job.surveyType);

  const baseFee = Number(job.quote?.baseFee || (job.surveyType?.includes('Level 3') ? 1450 : 770));
  const vatAmount = Math.round(baseFee * 0.2);
  const totalAmount = baseFee + vatAmount;

  const refNumber = `TRM-2026-${String(job.id || job.jobNo || Math.floor(100 + Math.random() * 900)).replace(/[^0-9]/g, '').slice(-3) || '085'}`;

  const isEW = template.isExpertWitness;
  const ewDefaults = template.expertWitnessDefaults || {};

  return {
    id: refNumber,
    refNo: refNumber,
    jobNo: job.jobNo || job.id || 'JOB-2026-085',
    client: job.customer || job.clientName || 'Private Client',
    signerEmail: job.customerEmail || job.clientEmail || 'client@example.co.uk',
    clientPhone: job.customerPhone || job.clientPhone || '+44 7700 900000',
    property: job.property || job.propertyAddress || '14 Mayfair Gate, London',
    location: job.location || 'London, UK',
    postcode: job.postcode || 'W1K 2PB',
    serviceKey: template.serviceKey,
    templateId: template.id,
    templateName: template.name,
    versionYear: `${template.version} / ${template.year}`,
    governingBody: template.governingBody,
    piiCap: template.piiCap,
    status: 'Sent',
    sentDate: new Date().toLocaleDateString('en-GB'),
    signedDate: null,
    signerIp: null,
    auditCode: `DOC-SENT-${Math.floor(10000 + Math.random() * 89999)}-DISPATCHED`,
    signatureType: 'pending',
    signatureValue: null,
    downloadUrl: null,
    // Financial Breakdown
    baseFee,
    vatAmount,
    totalAmount,
    surveyorName: job.surveyor || 'David Thorne MRICS',
    // Expert Witness editable blanks
    isExpertWitness: isEW,
    hourlyRate: customFields.hourlyRate !== undefined ? customFields.hourlyRate : (ewDefaults.hourlyRate || 250.0),
    courtDailyFee: customFields.courtDailyFee !== undefined ? customFields.courtDailyFee : (ewDefaults.courtDailyFee || 1500.0),
    instructingSolicitor: customFields.instructingSolicitor || ewDefaults.instructingSolicitor || '',
    courtClaimNumber: customFields.courtClaimNumber || ewDefaults.courtClaimNumber || '',
    courtForum: customFields.courtForum || ewDefaults.courtForum || 'County Court at Central London',
    appointmentRoute: customFields.appointmentRoute || ewDefaults.appointmentRoute || 'Single Joint Expert (SJE)',
    notes: customFields.notes || '',
  };
};

// Initial Sent / Signed / Pending Agreements List
export const INITIAL_AGREEMENTS = [
  {
    id: 'TRM-2026-080',
    refNo: 'TRM-2026-080',
    jobNo: 'JOB-2026-080',
    client: 'Emma Watson',
    signerEmail: 'customer@demo.com',
    clientPhone: '+44 7700 900111',
    property: '14 Mayfair Gate, Mayfair, London',
    location: 'Mayfair, London W1K 2PB',
    postcode: 'W1K 2PB',
    serviceKey: 'Homebuyer L2',
    templateName: 'RICS Home Survey Standard (Level 2) Terms of Engagement',
    versionYear: 'v2026.2 / 2026',
    status: 'Signed',
    sentDate: '02/11/2026',
    signedDate: '04/11/2026, 14:22',
    signerIp: '86.142.19.45 (London, UK)',
    auditCode: 'DOC-ESIGN-9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    signatureType: 'drawn',
    signatureValue: 'Emma Watson',
    baseFee: 700.0,
    vatAmount: 140.0,
    totalAmount: 840.0,
    surveyorName: 'David Thorne MRICS',
    isExpertWitness: false,
    downloadUrl: null,
  },
  {
    id: 'TRM-2026-081',
    refNo: 'TRM-2026-081',
    jobNo: 'JOB-2026-081',
    client: 'Emma Watson',
    signerEmail: 'customer@demo.com',
    clientPhone: '+44 7700 900111',
    property: '88 Belgrave Square, London',
    location: 'Belgravia, London SW1X 8PH',
    postcode: 'SW1X 8PH',
    serviceKey: 'Building L3',
    templateName: 'Comprehensive Building Survey (Level 3) Structural Terms',
    versionYear: 'v2026.1 / 2026',
    status: 'Signed',
    sentDate: '12/10/2026',
    signedDate: '14/10/2026, 11:05',
    signerIp: '86.142.19.45 (London, UK)',
    auditCode: 'DOC-ESIGN-8f7e6d5c4b3a210987654321fedcba0987654321',
    signatureType: 'typed',
    signatureValue: 'Emma Watson',
    baseFee: 1450.0,
    vatAmount: 290.0,
    totalAmount: 1740.0,
    surveyorName: 'David Thorne MRICS',
    isExpertWitness: false,
    downloadUrl: null,
  },
  {
    id: 'TRM-2026-082',
    refNo: 'TRM-2026-082',
    jobNo: 'JOB-2026-082',
    client: 'Harrison Sterling',
    signerEmail: 'customer2@demo.com',
    clientPhone: '+44 7700 900222',
    property: '27 Kensington Church St, London',
    location: 'Kensington, London W8 4LL',
    postcode: 'W8 4LL',
    serviceKey: 'Building L3',
    templateName: 'Comprehensive Building Survey (Level 3) Structural Terms',
    versionYear: 'v2026.1 / 2026',
    status: 'Sent',
    sentDate: '10/11/2026',
    signedDate: null,
    signerIp: null,
    auditCode: 'DOC-SENT-84920-DISPATCHED',
    signatureType: 'pending',
    signatureValue: null,
    baseFee: 1200.0,
    vatAmount: 240.0,
    totalAmount: 1440.0,
    surveyorName: 'Oliver Hughes MRICS',
    isExpertWitness: false,
    downloadUrl: null,
  },
  {
    id: 'TRM-2026-083',
    refNo: 'TRM-2026-083',
    jobNo: 'JOB-2026-083',
    client: 'Oliver Vance',
    signerEmail: 'oliver.vance@example.com',
    clientPhone: '+44 7700 900333',
    property: '12 Richmond Hill, Richmond',
    location: 'Richmond, London TW10 6QX',
    postcode: 'TW10 6QX',
    serviceKey: 'Valuation',
    templateName: 'RICS Red Book Global Residential & Commercial Valuation Terms',
    versionYear: 'v2026.2 / 2026',
    status: 'Pending',
    sentDate: '11/11/2026',
    signedDate: null,
    signerIp: null,
    auditCode: 'DOC-PENDING-33291-AWAITING-AUTH',
    signatureType: 'pending',
    signatureValue: null,
    baseFee: 650.0,
    vatAmount: 130.0,
    totalAmount: 780.0,
    surveyorName: 'Claire Bennet AssocRICS',
    isExpertWitness: false,
    downloadUrl: null,
  },
  {
    id: 'TRM-2026-084',
    refNo: 'TRM-2026-084',
    jobNo: 'JOB-2026-084',
    client: 'Charlotte Bronte',
    signerEmail: 'charlotte.b@outlook.com',
    clientPhone: '+44 7700 900444',
    property: '5 The Courtyard, Highgate',
    location: 'Highgate, London N6 4BA',
    postcode: 'N6 4BA',
    serviceKey: 'Snagging',
    templateName: 'Specific Defect Report & New Build Snagging Mandate',
    versionYear: 'v2026.3 / 2026',
    status: 'Signed',
    sentDate: '08/11/2026',
    signedDate: '09/11/2026, 09:45',
    signerIp: '82.34.112.98 (London, UK)',
    auditCode: 'DOC-ESIGN-33821-VERIFIED',
    signatureType: 'drawn',
    signatureValue: 'Charlotte Bronte',
    baseFee: 550.0,
    vatAmount: 110.0,
    totalAmount: 660.0,
    surveyorName: 'David Thorne MRICS',
    isExpertWitness: false,
    downloadUrl: null,
  },
  {
    id: 'TRM-2026-085',
    refNo: 'TRM-2026-085',
    jobNo: 'JOB-2026-085',
    client: 'Bespoke Property Holdings Ltd',
    signerEmail: 'litigation@bespokeproperty.co.uk',
    clientPhone: '+44 20 7946 0991',
    property: '45 Park Lane, Mayfair, London',
    location: 'Mayfair, London W1K 1PN',
    postcode: 'W1K 1PN',
    serviceKey: 'Expert Witness',
    templateName: 'Civil Procedure Rules (CPR Part 35) Expert Witness Mandate',
    versionYear: 'v2026.1 / 2026',
    status: 'Signed',
    sentDate: '05/11/2026',
    signedDate: '06/11/2026, 16:30',
    signerIp: '82.165.197.1 (London, UK)',
    auditCode: 'DOC-ESIGN-77192-CPR35-VERIFIED',
    signatureType: 'typed',
    signatureValue: 'Sarah Jenkins (Instructing Partner)',
    baseFee: 2500.0,
    vatAmount: 500.0,
    totalAmount: 3000.0,
    surveyorName: 'David Thorne MRICS',
    isExpertWitness: true,
    hourlyRate: 250.0,
    courtDailyFee: 1500.0,
    instructingSolicitor: 'Herbert Smith Freehills LLP (Lead: Sarah Jenkins)',
    courtClaimNumber: 'County Court at Central London, Claim No. F00CL891',
    courtForum: 'County Court at Central London',
    appointmentRoute: 'Single Joint Expert (SJE)',
    downloadUrl: null,
  },
];

export const getStoredAgreements = () => {
  try {
    if (!localStorage.getItem('njs_fresh_agreements_v3')) {
      localStorage.setItem('njs_fresh_agreements_v3', 'true');
      localStorage.setItem('propertygroup_agreements', JSON.stringify(INITIAL_AGREEMENTS));
      return INITIAL_AGREEMENTS;
    }
    const raw = localStorage.getItem('propertygroup_agreements');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_AGREEMENTS;
};

export const saveStoredAgreements = (agreements) => {
  try {
    localStorage.setItem('propertygroup_agreements', JSON.stringify(agreements));
    window.dispatchEvent(new Event('propertygroup_agreements_updated'));
  } catch (e) {
    console.error(e);
  }
};

export const useTerms = () => {
  const [agreements, setAgreementsState] = useState(getStoredAgreements);

  useEffect(() => {
    const onUpdate = () => {
      setAgreementsState(getStoredAgreements());
    };
    window.addEventListener('propertygroup_agreements_updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('propertygroup_agreements_updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const setAgreements = (updater) => {
    setAgreementsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveStoredAgreements(next);
      return next;
    });
  };

  const addAgreement = (newAgreement) => {
    setAgreements((prev) => [newAgreement, ...prev]);
  };

  const markAgreementSigned = (idOrJobNo, details = {}) => {
    setAgreements((prev) =>
      prev.map((a) => {
        if (a.id !== idOrJobNo && a.jobNo !== idOrJobNo && a.refNo !== idOrJobNo) return a;
        return {
          ...a,
          status: 'Signed',
          signedDate:
            details.signedDate ||
            `${new Date().toLocaleDateString('en-GB')}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
          signerIp: details.signerIp || '86.142.19.42 (London, UK)',
          auditCode: details.auditCode || `DOC-ESIGN-${Math.floor(10000 + Math.random() * 89999)}-VERIFIED`,
          signatureType: details.signatureType || 'typed',
          signatureValue: details.signatureValue || a.client,
        };
      })
    );
  };

  return { agreements, setAgreements, addAgreement, markAgreementSigned };
};
