import { useState, useEffect } from 'react';

// Mock data for Survey Jobs, Booking Calendar and Job Details
export const SURVEYORS = [
  {
    id: 'srv-1',
    name: 'David Thorne MRICS',
    credentials: 'Chartered Valuation Surveyor',
    color: '#2563EB', // Blue
    bgLight: 'bg-blue-50 border-blue-200 text-blue-900',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
    postcodes: 'GU, KT, SW',
  },
  {
    id: 'srv-2',
    name: 'Oliver Hughes MRICS',
    credentials: 'Senior Building Surveyor',
    color: '#7C3AED', // Purple
    bgLight: 'bg-purple-50 border-purple-200 text-purple-900',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
    postcodes: 'W, NW, WC',
  },
  {
    id: 'srv-3',
    name: 'Claire Bennet AssocRICS',
    credentials: 'Residential Defect Specialist',
    color: '#059669', // Emerald
    bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80',
    postcodes: 'TW, UB, SL',
  },
  {
    id: 'srv-4',
    name: 'Jonathan Cross FRICS',
    credentials: 'Fellow Chartered Surveyor',
    color: '#D97706', // Amber
    bgLight: 'bg-amber-50 border-amber-200 text-amber-900',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80',
    postcodes: 'EC, SE, E',
  },
  {
    id: 'srv-5',
    name: 'Fiona Macintyre MRICS',
    credentials: 'Historic Buildings Consultant',
    color: '#E11D48', // Rose
    bgLight: 'bg-rose-50 border-rose-200 text-rose-900',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80',
    postcodes: 'OX, RG, HP',
  },
];

export const INITIAL_JOBS = [
  {
    id: 'JOB-2026-080',
    jobNo: 'JOB-2026-080',
    customer: 'Emma Watson',
    customerEmail: 'customer@demo.com',
    customerPhone: '+44 7700 900147',
    surveyType: 'RICS Level 2 Home Survey',
    property: '14 Mayfair Gate',
    location: 'Mayfair, London W1K 2PB',
    surveyor: 'David Thorne MRICS',
    surveyorId: 'srv-1',
    date: '27/10/2026',
    timeSlot: '10:00 - 13:00',
    status: 'In Progress',
    progress: 75,
    termsStatus: 'Signed',
    paymentStatus: 'Paid',
    canBook: true,
    timelineStep: 7, // Booked / Survey done
    propertyDetails: {
      value: '£1,450,000',
      bedrooms: '3 Bedrooms, 2 Bathrooms',
      tenure: 'Leasehold (982 yrs remaining, £150 ground rent)',
      listedBuilding: 'Grade II Listed (Ref #12248)',
      accessDetails: 'Keys with Foxtons Mayfair (Branch Ref #FX-402), concierge phone 020 7946 0888',
      yearBuilt: 'c. 1892 (Victorian)',
      propertyType: 'Mansion Apartment',
    },
    quote: {
      baseFee: 650.0,
      extras: [
        { name: 'Drone Roof & Flashing Inspection', amount: 120.0 },
        { name: 'Same-day Verbal Debrief by Surveyor', amount: 50.0 },
      ],
      discount: 50.0,
      vatRate: 0.2, // 20% UK VAT
    },
    contacts: {
      client: {
        name: 'Emma Watson',
        role: 'Purchaser / Client',
        phone: '+44 7700 900147',
        email: 'customer@demo.com',
      },
      solicitor: {
        name: 'David Kingsley',
        firm: 'Farrer & Co LLP',
        phone: '+44 20 7400 9000',
        email: 'd.kingsley@farrer.co.uk',
        ref: 'FC-9482/WATSON',
      },
      agent: {
        name: 'Sarah Croft',
        agency: 'Knight Frank Mayfair',
        phone: '+44 20 7629 8171',
        email: 'sarah.croft@knightfrank.com',
      },
    },
    notes: [
      { id: 1, author: 'David Thorne MRICS', date: '27/10/2026, 12:45', text: 'Inspection completed. Moisture meter readings in rear dining room showed 24% WME (dampness in skirting board). Roof void insulation is non-standard.' },
      { id: 2, author: 'Sarah Jenkins', date: '26/10/2026, 15:30', text: 'Spoke with vendor agent Sarah Croft. Access confirmed for 10am tomorrow morning.' },
      { id: 3, author: 'Alexander Sterling', date: '25/10/2026, 11:20', text: 'Advance invoice paid online via Stripe. RICS Terms validated.' },
    ],
    tasks: [
      { id: 1, text: 'Collect keys from Foxtons Mayfair', done: true },
      { id: 2, text: 'Inspect roof structure and loft space', done: true },
      { id: 3, text: 'Damp testing in basement & ground floor', done: true },
      { id: 4, text: 'Upload high-res photographic evidence to portal', done: false },
      { id: 5, text: 'Issue final RICS condition rating report to client', done: false },
    ],
    documents: [
      { id: 1, name: 'RICS_Level_2_Survey_Draft_v1.pdf', size: '14.2 MB', date: '27/10/2026', type: 'Report Draft' },
      { id: 2, name: 'Signed_Terms_of_Engagement.pdf', size: '1.4 MB', date: '26/10/2026', type: 'Legal' },
      { id: 3, name: 'VAT_Invoice_Paid_Receipt_INV904.pdf', size: '320 KB', date: '26/10/2026', type: 'Invoice' },
      { id: 4, name: 'Site_Inspection_Photos_Archive.zip', size: '48.6 MB', date: '27/10/2026', type: 'Photos' },
    ],
    emails: [
      { id: 1, subject: 'Inspection Confirmation: 14 Mayfair Gate', to: 'customer@demo.com', date: '26/10/2026, 16:00', status: 'Delivered' },
      { id: 2, subject: 'Your Survey Terms & Conditions for Digital Signature', to: 'customer@demo.com', date: '26/10/2026, 10:45', status: 'Opened & Signed' },
    ],
    activityLog: [
      { id: 1, time: '27/10/2026, 13:10', text: 'David Thorne MRICS checked out keys and concluded on-site survey.' },
      { id: 2, time: '27/10/2026, 10:00', text: 'Inspection began at 14 Mayfair Gate.' },
      { id: 3, time: '26/10/2026, 16:30', text: 'Inspection slot confirmed and locked in calendar.' },
      { id: 4, time: '26/10/2026, 11:15', text: 'Client Emma Watson digitally executed Terms of Engagement.' },
      { id: 5, time: '26/10/2026, 10:20', text: 'Payment of £770.00 received in full.' },
    ],
  },
  {
    id: 'JOB-2026-081',
    jobNo: 'JOB-2026-081',
    customer: 'Kensington Estates PLC',
    customerEmail: 'acquisitions@kensingtonestates.co.uk',
    customerPhone: '+44 20 7946 0841',
    surveyType: 'RICS Level 3 Building Survey',
    property: '24 Kensington Palace Gardens',
    location: 'Kensington, London W8 4QQ',
    surveyor: 'Oliver Hughes MRICS',
    surveyorId: 'srv-2',
    date: '28/10/2026',
    timeSlot: '14:30 - 17:00',
    status: 'Scheduled',
    progress: 40,
    termsStatus: 'Signed',
    paymentStatus: 'Paid',
    canBook: true,
    timelineStep: 6, // Payment received / Booked
    propertyDetails: {
      value: '£5,800,000',
      bedrooms: '6 Bedrooms, 5 Bathrooms',
      tenure: 'Freehold',
      listedBuilding: 'Grade II* Listed',
      accessDetails: 'Security gate concierge (access code 8492#)',
      yearBuilt: 'c. 1855',
      propertyType: 'Detached Stucco Villa',
    },
    quote: {
      baseFee: 1850.0,
      extras: [{ name: 'Basement Vault & Tanking Inspection', amount: 350.0 }],
      discount: 0.0,
      vatRate: 0.2,
    },
    contacts: {
      client: { name: 'Kensington Estates PLC', role: 'Commercial Client', phone: '+44 20 7946 0841', email: 'acquisitions@kensingtonestates.co.uk' },
      solicitor: { name: 'Cripps Pemberton Greenish', firm: 'Cripps LLP', phone: '+44 20 7591 3333', email: 'property@cripps.co.uk', ref: 'CR-904' },
      agent: { name: 'Savills Kensington', agency: 'Savills UK', phone: '+44 20 7535 3300', email: 'kensington@savills.com' },
    },
    notes: [{ id: 1, author: 'Oliver Hughes MRICS', date: '27/10/2026', text: 'Pre-inspection historical archives checked. Structural engineer notes requested.' }],
    tasks: [{ id: 1, text: 'Confirm basement security pass', done: true }, { id: 2, text: 'Conduct full level 3 structural survey', done: false }],
    documents: [{ id: 1, name: 'Signed_Terms_Level_3.pdf', size: '2.1 MB', date: '25/10/2026', type: 'Legal' }],
    emails: [{ id: 1, subject: 'Survey confirmation: 24 Kensington Palace Gdns', to: 'acquisitions@kensingtonestates.co.uk', date: '25/10/2026', status: 'Delivered' }],
    activityLog: [{ id: 1, time: '25/10/2026', text: 'Corporate mandate signed and full fee transferred.' }],
  },
  {
    id: 'JOB-2026-082',
    jobNo: 'JOB-2026-082',
    customer: 'Harrison Croft',
    customerEmail: 'harrison.croft@example.co.uk',
    customerPhone: '+44 7700 900512',
    surveyType: 'RICS Level 3 Building Survey',
    property: '12 Pembroke Square',
    location: 'Kensington, London W8 6PA',
    surveyor: 'David Thorne MRICS',
    surveyorId: 'srv-1',
    date: '29/10/2026',
    timeSlot: '09:30 - 13:00',
    status: 'Scheduled',
    progress: 25,
    termsStatus: 'Pending', // Awaiting terms!
    paymentStatus: 'Unpaid', // Awaiting payment!
    canBook: false, // Waiting for terms and payment!
    timelineStep: 3, // Accepted / Terms sent
    propertyDetails: {
      value: '£2,100,000',
      bedrooms: '4 Bedrooms, 2 Bathrooms',
      tenure: 'Freehold',
      listedBuilding: 'Conservation Area (Kensington)',
      accessDetails: 'Keys held by Dexters Kensington branch',
      yearBuilt: 'c. 1870',
      propertyType: 'Terraced Period House',
    },
    quote: {
      baseFee: 1450.0,
      extras: [{ name: 'Thermal Imaging Damp Survey', amount: 150.0 }],
      discount: 50.0,
      vatRate: 0.2,
    },
    contacts: {
      client: { name: 'Harrison Croft', role: 'Buyer', phone: '+44 7700 900512', email: 'harrison.croft@example.co.uk' },
      solicitor: { name: 'Bishop & Sewell LLP', firm: 'Bishop & Sewell', phone: '+44 20 7631 4141', email: 'mail@bishopsewell.com', ref: 'BS-841' },
      agent: { name: 'Dexters Kensington', agency: 'Dexters', phone: '+44 20 7590 9580', email: 'kensington@dexters.co.uk' },
    },
    notes: [{ id: 1, author: 'Sarah Jenkins', date: '26/10/2026', text: 'Terms sent via e-sign. Reminder dispatched for deposit payment.' }],
    tasks: [{ id: 1, text: 'Collect client signature on terms of engagement', done: false }, { id: 2, text: 'Process card payment', done: false }],
    documents: [{ id: 1, name: 'Quotation_Proposal_KQ9046.pdf', size: '1.2 MB', date: '26/10/2026', type: 'Quote' }],
    emails: [{ id: 1, subject: 'Your Quotation and Terms for 12 Pembroke Square', to: 'harrison.croft@example.co.uk', date: '26/10/2026', status: 'Sent' }],
    activityLog: [{ id: 1, time: '26/10/2026', text: 'Quotation accepted. Terms sent for client digital signature.' }],
  },
  {
    id: 'JOB-2026-083',
    jobNo: 'JOB-2026-083',
    customer: 'Richmond Borough Properties',
    customerEmail: 'estates@richmondborough.org.uk',
    customerPhone: '+44 20 8940 1289',
    surveyType: 'Specific Structural Defect Survey',
    property: '8 Chichester Road',
    location: 'Richmond, Surrey TW10 6RF',
    surveyor: 'Claire Bennet AssocRICS',
    surveyorId: 'srv-3',
    date: '25/10/2026',
    timeSlot: '14:00 - 16:30',
    status: 'Completed',
    progress: 100,
    termsStatus: 'Signed',
    paymentStatus: 'Paid',
    canBook: true,
    timelineStep: 10, // Closed
    propertyDetails: {
      value: '£950,000',
      bedrooms: '3 Bedrooms, 1 Bathroom',
      tenure: 'Freehold',
      listedBuilding: 'None',
      accessDetails: 'Council building officer present on site',
      yearBuilt: 'c. 1930',
      propertyType: 'Semi-Detached House',
    },
    quote: {
      baseFee: 920.0,
      extras: [],
      discount: 0.0,
      vatRate: 0.2,
    },
    contacts: {
      client: { name: 'Richmond Borough Properties', role: 'Local Authority', phone: '+44 20 8940 1289', email: 'estates@richmondborough.org.uk' },
      solicitor: { name: 'Council Legal Dept', firm: 'Richmond Civic Centre', phone: '+44 20 8891 1411', email: 'legal@richmond.gov.uk', ref: 'RBC-391' },
      agent: { name: 'Direct Council Officer', agency: 'Richmond Housing', phone: '+44 20 8940 1289', email: 'housing@richmond.gov.uk' },
    },
    notes: [{ id: 1, author: 'Claire Bennet AssocRICS', date: '25/10/2026', text: 'Cracking determined to be localized lintel movement. Full schedule delivered.' }],
    tasks: [{ id: 1, text: 'Deliver defect schedule', done: true }, { id: 2, text: 'Close file', done: true }],
    documents: [{ id: 1, name: 'Defect_Assessment_Chichester_Rd.pdf', size: '18.4 MB', date: '25/10/2026', type: 'Final Report' }],
    emails: [{ id: 1, subject: 'Completed Report: 8 Chichester Road', to: 'estates@richmondborough.org.uk', date: '25/10/2026', status: 'Delivered' }],
    activityLog: [{ id: 1, time: '25/10/2026', text: 'Final report dispatched and invoice closed.' }],
  },
  {
    id: 'JOB-2026-084',
    jobNo: 'JOB-2026-084',
    customer: 'Apex Asset Holdings Ltd',
    customerEmail: 'investments@apexasset.com',
    customerPhone: '+44 20 7946 0773',
    surveyType: 'Commercial Red Book Valuation',
    property: '42 Belgrave Square',
    location: 'Belgravia, London SW1X 8NT',
    surveyor: 'Jonathan Cross FRICS',
    surveyorId: 'srv-4',
    date: '24/10/2026',
    timeSlot: '11:00 - 15:00',
    status: 'Completed',
    progress: 100,
    termsStatus: 'Signed',
    paymentStatus: 'Paid',
    canBook: true,
    timelineStep: 10,
    propertyDetails: {
      value: '£8,500,000',
      bedrooms: 'Commercial Office 4-Storey',
      tenure: 'Long Leasehold (125 yrs)',
      listedBuilding: 'Grade I Listed Building',
      accessDetails: 'Concierge front desk',
      yearBuilt: 'c. 1830',
      propertyType: 'Commercial Headquarter',
    },
    quote: {
      baseFee: 3200.0,
      extras: [{ name: 'Tenancy Schedule Review', amount: 400.0 }],
      discount: 0.0,
      vatRate: 0.2,
    },
    contacts: {
      client: { name: 'Apex Asset Holdings Ltd', role: 'Institutional Investor', phone: '+44 20 7946 0773', email: 'investments@apexasset.com' },
      solicitor: { name: 'Macfarlanes LLP', firm: 'Macfarlanes', phone: '+44 20 7831 9222', email: 'commercial@macfarlanes.com', ref: 'MCF-2026' },
      agent: { name: 'CBRE West End', agency: 'CBRE', phone: '+44 20 7182 2000', email: 'westend@cbre.com' },
    },
    notes: [{ id: 1, author: 'Jonathan Cross FRICS', date: '24/10/2026', text: 'Red Book valuation certificate issued.' }],
    tasks: [{ id: 1, text: 'Issue signed valuation certificate', done: true }],
    documents: [{ id: 1, name: 'Valuation_Certificate_Belgrave_Sq.pdf', size: '8.4 MB', date: '24/10/2026', type: 'Certificate' }],
    emails: [{ id: 1, subject: 'Valuation Certificate: 42 Belgrave Square', to: 'investments@apexasset.com', date: '24/10/2026', status: 'Delivered' }],
    activityLog: [{ id: 1, time: '24/10/2026', text: 'Certificate released after fee clearance.' }],
  },
  {
    id: 'JOB-2026-085',
    jobNo: 'JOB-2026-085',
    customer: 'Priya Sharma',
    customerEmail: 'priya.s@sharmainvest.com',
    customerPhone: '+44 7700 900891',
    surveyType: 'RICS Level 2 Home Survey',
    property: '45 Park Mansions',
    location: 'Battersea, London SW11 4HG',
    surveyor: 'Fiona Macintyre MRICS',
    surveyorId: 'srv-5',
    date: '30/10/2026',
    timeSlot: '11:00 - 13:30',
    status: 'Scheduled',
    progress: 30,
    termsStatus: 'Signed',
    paymentStatus: 'Paid',
    canBook: true,
    timelineStep: 6,
    propertyDetails: {
      value: '£675,000',
      bedrooms: '2 Bedrooms, 1 Bathroom',
      tenure: 'Share of Freehold (990 yrs)',
      listedBuilding: 'None',
      accessDetails: 'Keys with Hamptons Battersea branch',
      yearBuilt: 'c. 1902 (Edwardian Block)',
      propertyType: 'Purpose-built Flat',
    },
    quote: {
      baseFee: 595.0,
      extras: [],
      discount: 0.0,
      vatRate: 0.2,
    },
    contacts: {
      client: { name: 'Priya Sharma', role: 'Buyer', phone: '+44 7700 900891', email: 'priya.s@sharmainvest.com' },
      solicitor: { name: 'Conveyancing Direct', firm: 'Conveyancing Direct', phone: '+44 1424 464900', email: 'info@conveyancingdirect.net', ref: 'CD-7721' },
      agent: { name: 'Hamptons Battersea', agency: 'Hamptons', phone: '+44 20 7498 8686', email: 'battersea@hamptons.co.uk' },
    },
    notes: [{ id: 1, author: 'Fiona Macintyre MRICS', date: '27/10/2026', text: 'Communal service charges and roof sinking fund documents to be reviewed.' }],
    tasks: [{ id: 1, text: 'Confirm key collection with Hamptons', done: true }],
    documents: [{ id: 1, name: 'Signed_Terms_L2_Park_Mansions.pdf', size: '1.1 MB', date: '26/10/2026', type: 'Legal' }],
    emails: [{ id: 1, subject: 'Booking Confirmed: 45 Park Mansions', to: 'priya.s@sharmainvest.com', date: '26/10/2026', status: 'Sent' }],
    activityLog: [{ id: 1, time: '26/10/2026', text: 'Payment cleared and inspection booked.' }],
  },
  {
    id: 'JOB-2026-086',
    jobNo: 'JOB-2026-086',
    customer: 'Arthur Pendelton',
    customerEmail: 'pendelton@btinternet.com',
    customerPhone: '+44 7700 900677',
    surveyType: 'Residential Red Book Valuation',
    property: '107 Queenstown Road',
    location: 'Battersea, London SW8 3RH',
    surveyor: 'David Thorne MRICS',
    surveyorId: 'srv-1',
    date: '31/10/2026',
    timeSlot: '09:00 - 11:30',
    status: 'On Hold',
    progress: 10,
    termsStatus: 'Pending',
    paymentStatus: 'Unpaid',
    canBook: false,
    timelineStep: 2, // Quote sent
    propertyDetails: {
      value: '£550,000',
      bedrooms: '2 Bedrooms, 1 Bathroom',
      tenure: 'Leasehold (84 yrs)',
      listedBuilding: 'None',
      accessDetails: 'Awaiting vendor contact',
      yearBuilt: 'c. 1955',
      propertyType: 'Maisonette',
    },
    quote: {
      baseFee: 550.0,
      extras: [],
      discount: 0.0,
      vatRate: 0.2,
    },
    contacts: {
      client: { name: 'Arthur Pendelton', role: 'Owner', phone: '+44 7700 900677', email: 'pendelton@btinternet.com' },
      solicitor: { name: 'Pending Instruction', firm: 'N/A', phone: '', email: '', ref: '' },
      agent: { name: 'Vendor direct', agency: 'Private', phone: '', email: '' },
    },
    notes: [{ id: 1, author: 'Sarah Jenkins', date: '27/10/2026', text: 'Client requested hold while reviewing lease extension figures.' }],
    tasks: [{ id: 1, text: 'Follow up on 02/11/2026', done: false }],
    documents: [],
    emails: [{ id: 1, subject: 'Quotation for Valuation: 107 Queenstown Rd', to: 'pendelton@btinternet.com', date: '23/10/2026', status: 'Sent' }],
    activityLog: [{ id: 1, time: '27/10/2026', text: 'Job placed On Hold at client request.' }],
  },
];

export const getStoredJobs = () => {
  try {
    const raw = localStorage.getItem('propertygroup_jobs');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_JOBS;
};

export const saveStoredJobs = (jobs) => {
  try {
    localStorage.setItem('propertygroup_jobs', JSON.stringify(jobs));
    window.dispatchEvent(new Event('propertygroup_jobs_updated'));
  } catch (e) {
    console.error(e);
  }
};

export const useJobs = () => {
  const [jobs, setJobsState] = useState(getStoredJobs);

  useEffect(() => {
    const onUpdate = () => {
      setJobsState(getStoredJobs());
    };
    window.addEventListener('propertygroup_jobs_updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('propertygroup_jobs_updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const setJobs = (updater) => {
    setJobsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveStoredJobs(next);
      return next;
    });
  };

  const updateJob = (id, updates) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...updates } : j))
    );
  };

  const addJob = (newJob) => {
    setJobs((prev) => [newJob, ...prev]);
  };

  return { jobs, setJobs, updateJob, addJob };
};

