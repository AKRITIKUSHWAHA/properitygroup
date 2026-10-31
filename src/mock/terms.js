import { useState, useEffect } from 'react';

// The exact 6 Service Templates required:
// Homebuyer L2, Building L3, Snagging, Valuation, Damp, Expert Witness with version/year
export const TERMS_TEMPLATES = [
  {
    id: 'tmpl-l2',
    serviceKey: 'Homebuyer L2',
    name: 'RICS Home Survey Standard (Level 2) Terms of Engagement',
    shortName: 'Homebuyer L2 Terms',
    version: 'v2026.2',
    year: '2026',
    governingBody: 'Royal Institution of Chartered Surveyors (RICS Mandated)',
    piiCap: '£250,000 Professional Indemnity Cover',
    summary: 'Standard terms for residential properties in reasonable condition. Outlines building fabric visual inspection, moisture meter protocols, and condition ratings 1–3.',
    keyClauses: [
      { num: '1.1', title: 'Scope of Service', text: 'Visual inspection of surface fabric, accessible roofs from 3m ladders, and damp testing. Does not involve opening up concealed structures or testing electrical circuits.' },
      { num: '2.4', title: 'Advance Settlement Requirement', text: 'In accordance with RICS mandates, inspection dates remain tentative until both digital execution of terms and fee payment have been settled.' },
      { num: '3.1', title: 'Liability Cap', text: 'NJS Property Group’s liability arising from this inspection is limited to £250,000 or the market valuation of the subject property, whichever is lower.' },
      { num: '4.2', title: 'Consumer Cancellation Rights', text: 'Client maintains statutory 14-day cancellation right unless express consent is provided to conduct the site survey within this timeframe.' },
    ],
  },
  {
    id: 'tmpl-l3',
    serviceKey: 'Building L3',
    name: 'Comprehensive Building Survey (Level 3) Structural Terms',
    shortName: 'Building L3 Terms',
    version: 'v2026.1',
    year: '2026',
    governingBody: 'RICS Technical Guidelines & Consumer Rights Act 2015',
    piiCap: '£1,000,000 Full Structural Indemnity Cover',
    summary: 'Exhaustive structural investigation terms for older, altered, period, or listed properties. Covers invasive inspection rights, loft access, sub-floors, and remediation costings.',
    keyClauses: [
      { num: '1.1', title: 'Comprehensive Scope', text: 'Thorough investigation of external/internal structural members, chimney breasts, roof trusses, basement tanking, and structural movement analysis.' },
      { num: '2.2', title: 'Safe Access Provisions', text: 'Vendor or agent must ensure unobstructed access to the main roof void, cellars, and boundary retainers.' },
      { num: '3.5', title: 'Sub-Consultant Specialist Diagnostics', text: 'Where high-risk structural settlement or drainage collapse is suspected, formal referral to geotechnical or CCTV drainage engineers will be specified.' },
      { num: '4.0', title: 'Limitation of Liability', text: 'Maximum liability capped at £1,000,000 backed by RSA Chartered Surveyor Professional Indemnity Insurance.' },
    ],
  },
  {
    id: 'tmpl-snagging',
    serviceKey: 'Snagging',
    name: 'New Build Snagging & Quality Defect Inspection Mandate',
    shortName: 'Snagging Terms',
    version: 'v2026.3',
    year: '2026',
    governingBody: 'New Homes Quality Board (NHQB) & Consumer Code for Home Builders',
    piiCap: '£250,000 Defect Warranty Indemnity',
    summary: 'Specialized pre-completion and warranty snagging mandate. Covers decorative finishes, NHBC tolerances, thermal bridging checks, and builder rectification schedules.',
    keyClauses: [
      { num: '1.2', title: 'NHBC & LABC Technical Standards', text: 'All snagging items are referenced directly against British Standard tolerances and developer warranty guidelines for rapid developer dispute resolution.' },
      { num: '2.1', title: 'Site Authorization', text: 'Client must obtain written site access permission from developer site manager if survey occurs prior to legal completion.' },
      { num: '3.3', title: 'Digital Punchlist Delivery', text: 'Interactive photographic defect register delivered within 24 hours to client and developer customer care.' },
    ],
  },
  {
    id: 'tmpl-valuation',
    serviceKey: 'Valuation',
    name: 'RICS Red Book Global Residential & Commercial Valuation Terms',
    shortName: 'Valuation Terms',
    version: 'v2026.2',
    year: '2026',
    governingBody: 'RICS Valuation – Global Standards (Red Book 2026 Edition)',
    piiCap: '£2,000,000 Lending & Probate Indemnity',
    summary: 'Legally compliant terms for mortgage lending, probate (Inheritance Tax), Help-to-Buy redemption, capital gains tax, and matrimonial property division.',
    keyClauses: [
      { num: '1.0', title: 'Valuation Basis', text: 'Valuation prepared under RICS VPS 4 Market Value standards as at the agreed valuation date, utilizing verified Land Registry comparables.' },
      { num: '2.4', title: 'Third Party Restriction', text: 'The valuation certificate is strictly confidential to the instructed client and designated lender/solicitor.' },
      { num: '3.1', title: 'Special Assumptions', text: 'Assumes unencumbered freehold or leasehold title without undisclosed restrictive covenants or non-standard construction liabilities.' },
    ],
  },
  {
    id: 'tmpl-damp',
    serviceKey: 'Damp',
    name: 'Specialist Moisture, Timber & Structural Dampness Terms',
    shortName: 'Damp Survey Terms',
    version: 'v2026.1',
    year: '2026',
    governingBody: 'Property Care Association (PCA) & Historic England Damp Guidelines',
    piiCap: '£500,000 Diagnostic Indemnity',
    summary: 'Independent diagnostic investigation of rising damp, penetrating damp, condensation, black mould, and timber decay (dry rot / wet rot) without contractor sales bias.',
    keyClauses: [
      { num: '1.1', title: 'Independent Non-Contractor Status', text: 'NJS Property Group does not sell chemical damp proofing or timber treatments. All diagnostic advice is completely independent and objective.' },
      { num: '2.3', title: 'Instrument Calibration', text: 'Use of electronic electrical resistance meters, carbide testing, and thermal imaging cameras in conformity with BS 6576.' },
      { num: '3.2', title: 'Historic Fabric Protection', text: 'For pre-1919 properties, lime plaster and breathable construction methodologies are strictly mandated.' },
    ],
  },
  {
    id: 'tmpl-expert-witness',
    serviceKey: 'Expert Witness',
    name: 'Civil Procedure Rules (CPR Part 35) Expert Witness Mandate',
    shortName: 'Expert Witness Terms',
    version: 'v2026.1',
    year: '2026',
    governingBody: 'Ministry of Justice Civil Procedure Rules (CPR Part 35) & RICS Practice Statement',
    piiCap: '£2,000,000 Forensic Litigation Cover',
    summary: 'Formal terms of instruction for boundary disputes, housing disrepair claims, defective construction litigation, and Court expert testimony in England & Wales.',
    keyClauses: [
      { num: '1.1', title: 'Overriding Duty to the Court', text: 'The Expert’s overriding and primary duty is to the Court, superseding any obligation to the appointing party or solicitor.' },
      { num: '2.2', title: 'Court Attendance & Daily Refreshers', text: 'Specific fees apply to courtroom appearances, expert conferencing, and Joint Statements under CPR 35.12.' },
      { num: '3.4', title: 'Statement of Truth', text: 'Expert report incorporates the mandatory declaration confirming truthfulness and compliance with CPR Part 35 and PD 35.' },
    ],
  },
];

// Initial Sent / Signed / Pending Agreements List
export const INITIAL_AGREEMENTS = [
  {
    id: 'AGR-2026-081',
    refNo: 'AGR-2026-081',
    jobNo: 'JOB-2026-080',
    client: 'Emma Watson',
    signerEmail: 'customer@demo.com',
    property: '14 Mayfair Gate',
    location: 'Mayfair, London W1K 2PB',
    serviceKey: 'Homebuyer L2',
    templateName: 'RICS Home Survey Standard (Level 2) Terms',
    versionYear: 'v2026.2 / 2026',
    status: 'Signed', // 'Signed' | 'Sent' | 'Pending'
    sentDate: '26/10/2026',
    signedDate: '26/10/2026, 11:15',
    signerIp: '86.142.19.42 (London, UK)',
    auditCode: 'DOC-ESIGN-84029-EMMAW',
    downloadUrl: '#download-signed-pdf',
  },
  {
    id: 'AGR-2026-082',
    refNo: 'AGR-2026-082',
    jobNo: 'JOB-2026-081',
    client: 'Kensington Estates PLC',
    signerEmail: 'acquisitions@kensingtonestates.co.uk',
    property: '24 Kensington Palace Gardens',
    location: 'Kensington, London W8 4QQ',
    serviceKey: 'Building L3',
    templateName: 'Comprehensive Building Survey (Level 3) Structural Terms',
    versionYear: 'v2026.1 / 2026',
    status: 'Signed',
    sentDate: '25/10/2026',
    signedDate: '25/10/2026, 16:40',
    signerIp: '194.73.104.12 (Westminster, UK)',
    auditCode: 'DOC-ESIGN-79102-KENEST',
    downloadUrl: '#download-signed-pdf',
  },
  {
    id: 'AGR-2026-083',
    refNo: 'AGR-2026-083',
    jobNo: 'JOB-2026-082',
    client: 'Harrison Croft',
    signerEmail: 'harrison.croft@example.co.uk',
    property: '12 Pembroke Square',
    location: 'Kensington, London W8 6PA',
    serviceKey: 'Building L3',
    templateName: 'Comprehensive Building Survey (Level 3) Structural Terms',
    versionYear: 'v2026.1 / 2026',
    status: 'Pending',
    sentDate: '26/10/2026',
    signedDate: null,
    signerIp: null,
    auditCode: 'DOC-PENDING-44910-HCROFT',
    downloadUrl: null,
  },
  {
    id: 'AGR-2026-084',
    refNo: 'AGR-2026-084',
    jobNo: 'JOB-2026-084',
    client: 'Apex Asset Holdings Ltd',
    signerEmail: 'investments@apexasset.com',
    property: '42 Belgrave Square',
    location: 'Belgravia, London SW1X 8NT',
    serviceKey: 'Valuation',
    templateName: 'RICS Red Book Global Valuation Engagement Terms',
    versionYear: 'v2026.2 / 2026',
    status: 'Signed',
    sentDate: '23/10/2026',
    signedDate: '24/10/2026, 09:20',
    signerIp: '82.35.191.10 (City of London, UK)',
    auditCode: 'DOC-ESIGN-51829-APEX',
    downloadUrl: '#download-signed-pdf',
  },
  {
    id: 'AGR-2026-085',
    refNo: 'AGR-2026-085',
    jobNo: 'JOB-2026-083',
    client: 'Richmond Borough Properties',
    signerEmail: 'estates@richmondborough.org.uk',
    property: '8 Chichester Road',
    location: 'Richmond, Surrey TW10 6RF',
    serviceKey: 'Damp',
    templateName: 'Specialist Moisture, Timber & Structural Dampness Terms',
    versionYear: 'v2026.1 / 2026',
    status: 'Signed',
    sentDate: '22/10/2026',
    signedDate: '22/10/2026, 14:10',
    signerIp: '158.43.12.8 (Richmond, UK)',
    auditCode: 'DOC-ESIGN-39184-RBC',
    downloadUrl: '#download-signed-pdf',
  },
  {
    id: 'AGR-2026-086',
    refNo: 'AGR-2026-086',
    jobNo: 'JOB-2026-085',
    client: 'Priya Sharma',
    signerEmail: 'priya.s@sharmainvest.com',
    property: '45 Park Mansions',
    location: 'Battersea, London SW11 4HG',
    serviceKey: 'Homebuyer L2',
    templateName: 'RICS Home Survey Standard (Level 2) Terms of Engagement',
    versionYear: 'v2026.2 / 2026',
    status: 'Sent',
    sentDate: '27/10/2026',
    signedDate: null,
    signerIp: null,
    auditCode: 'DOC-SENT-90184-PRIYA',
    downloadUrl: null,
  },
  {
    id: 'AGR-2026-087',
    refNo: 'AGR-2026-087',
    jobNo: null,
    client: 'Charlotte Montgomery',
    signerEmail: 'charlotte.m@montgomery.co.uk',
    property: '5 Elm Bank Gardens',
    location: 'Barnes, London SW13 0NT',
    serviceKey: 'Snagging',
    templateName: 'New Build Snagging & Quality Defect Inspection Mandate',
    versionYear: 'v2026.3 / 2026',
    status: 'Sent',
    sentDate: '27/10/2026',
    signedDate: null,
    signerIp: null,
    auditCode: 'DOC-SENT-28194-MONT',
    downloadUrl: null,
  },
  {
    id: 'AGR-2026-088',
    refNo: 'AGR-2026-088',
    jobNo: null,
    client: 'Lord Gregory Cavendish',
    signerEmail: 'cavendish.holdings@uknet.co.uk',
    property: '38 Eaton Place',
    location: 'Belgravia, London SW1X 8AL',
    serviceKey: 'Expert Witness',
    templateName: 'Civil Procedure Rules (CPR Part 35) Expert Witness Mandate',
    versionYear: 'v2026.1 / 2026',
    status: 'Pending',
    sentDate: '27/10/2026',
    signedDate: null,
    signerIp: null,
    auditCode: 'DOC-PENDING-19284-CAV',
    downloadUrl: null,
  },
];

export const getStoredAgreements = () => {
  try {
    const raw = localStorage.getItem('propertygroup_agreements');
    if (raw) return JSON.parse(raw);
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

  const markAgreementSigned = (id) => {
    setAgreements((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          status: 'Signed',
          signedDate: new Date().toLocaleDateString('en-GB') + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          signerIp: '86.142.19.42 (London, UK)',
          auditCode: `DOC-ESIGN-${Math.floor(10000 + Math.random() * 89999)}-VERIFIED`,
        };
      })
    );
  };

  return { agreements, setAgreements, addAgreement, markAgreementSigned };
};
