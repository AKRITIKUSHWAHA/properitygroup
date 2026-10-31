// NJS Property Group - Estate Agent & Referral Partner Mock Store (Client Point 29 & Point 26)

export const PARTNER_AGENCIES = [
  {
    id: 'ptr-foxtons',
    name: 'Foxtons Mayfair Branch',
    code: 'NJS-PTR-402',
    contactName: 'Sarah Croft',
    role: 'Senior Sales Negotiator',
    email: 'sarah.croft@foxtons.co.uk',
    phone: '020 7946 0888',
    address: '92 Park Lane, Mayfair, London W1K 7TA',
    commissionRate: 50, // £50 per completed survey
    bankDetails: 'Barclays 20-04-15 / 83921049',
  },
  {
    id: 'ptr-savills',
    name: 'Savills Richmond',
    code: 'NJS-PTR-108',
    contactName: 'Marcus Vance',
    role: 'Associate Director',
    email: 'm.vance@savills.com',
    phone: '020 8940 2266',
    address: '4 The Green, Richmond TW9 1PL',
    commissionRate: 50,
    bankDetails: 'HSBC 40-12-30 / 11094821',
  },
  {
    id: 'ptr-dexters',
    name: 'Dexters Kensington',
    code: 'NJS-PTR-205',
    contactName: 'Helena Hughes',
    role: 'Branch Manager',
    email: 'h.hughes@dexters.co.uk',
    phone: '020 7590 9590',
    address: '160 Kensington Church St, London W8 4BN',
    commissionRate: 50,
    bankDetails: 'NatWest 60-00-01 / 44928104',
  },
];

export const INITIAL_PARTNER_REFERRALS = [
  {
    id: 'REF-2026-001',
    partnerId: 'ptr-foxtons',
    buyerName: 'David & Caroline Sterling',
    buyerPhone: '07700 900812',
    buyerEmail: 'david.sterling@example.co.uk',
    propertyAddress: '14 Mayfair Gate, South Audley Street, London W1K 2PB',
    surveyLevel: 'RICS Level 2 Homebuyer Survey',
    estimatedFee: 425,
    commissionAmount: 50,
    commissionStatus: 'Paid',
    bacsRef: 'NJS-COMM-OCT-01',
    paymentDate: '28/10/2026',
    stage: 'Completed & Report Delivered',
    stageCode: 'completed',
    dateSubmitted: '15/10/2026',
    epcRating: 'Band C (72)',
    lastSoldPrice: '£425,000 (2021)',
  },
  {
    id: 'REF-2026-002',
    partnerId: 'ptr-foxtons',
    buyerName: 'Oliver Jenkins',
    buyerPhone: '07700 900344',
    buyerEmail: 'o.jenkins@investments.co.uk',
    propertyAddress: '28 Cadogan Square, Knightsbridge, London SW1X 0JH',
    surveyLevel: 'RICS Level 3 Building Survey',
    estimatedFee: 650,
    commissionAmount: 50,
    commissionStatus: 'Approved & Pending Payout',
    bacsRef: 'Pending Nov 1st Run',
    paymentDate: null,
    stage: 'Inspection Completed (QA Review)',
    stageCode: 'inspection_complete',
    dateSubmitted: '22/10/2026',
    epcRating: 'Band D (64)',
    lastSoldPrice: '£1,150,000 (2018)',
  },
  {
    id: 'REF-2026-003',
    partnerId: 'ptr-foxtons',
    buyerName: 'Sophia Montgomery',
    buyerPhone: '07700 900599',
    buyerEmail: 'sophia.m@gmail.com',
    propertyAddress: '88 Onslow Gardens, South Kensington, London SW7 3AE',
    surveyLevel: 'RICS Level 2 Homebuyer Survey',
    estimatedFee: 425,
    commissionAmount: 50,
    commissionStatus: 'Pending Survey Completion',
    bacsRef: null,
    paymentDate: null,
    stage: 'Appointment Booked (3 Nov)',
    stageCode: 'booked',
    dateSubmitted: '28/10/2026',
    epcRating: 'Band B (82)',
    lastSoldPrice: '£820,000 (2020)',
  },
  {
    id: 'REF-2026-004',
    partnerId: 'ptr-foxtons',
    buyerName: 'Harriet Bell',
    buyerPhone: '07700 900721',
    buyerEmail: 'harriet.bell@techfirm.co.uk',
    propertyAddress: '12 Holland Park Avenue, Notting Hill, London W11 3QU',
    surveyLevel: 'RICS Level 3 Building Survey',
    estimatedFee: 650,
    commissionAmount: 50,
    commissionStatus: 'Pending Survey Completion',
    bacsRef: null,
    paymentDate: null,
    stage: 'Quote Issued (Awaiting Acceptance)',
    stageCode: 'quoted',
    dateSubmitted: '29/10/2026',
    epcRating: 'Band E (51)',
    lastSoldPrice: '£1,450,000 (2016)',
  },
  {
    id: 'REF-2026-005',
    partnerId: 'ptr-savills',
    buyerName: 'Alistair Campbell',
    buyerPhone: '07700 900118',
    buyerEmail: 'alistair.c@richmondlaw.co.uk',
    propertyAddress: '15 Richmond Hill, Richmond, TW10 6RE',
    surveyLevel: 'RICS Level 3 Building Survey',
    estimatedFee: 750,
    commissionAmount: 50,
    commissionStatus: 'Paid',
    bacsRef: 'NJS-COMM-OCT-02',
    paymentDate: '25/10/2026',
    stage: 'Completed & Report Delivered',
    stageCode: 'completed',
    dateSubmitted: '12/10/2026',
    epcRating: 'Band C (69)',
    lastSoldPrice: '£950,000 (2019)',
  },
];

// Point 26: NJS Property Intelligence Database (Sample UK Postcode Property Insights)
export const PROPERTY_INTELLIGENCE_DATA = {
  'W1K 2PB': {
    postcode: 'W1K 2PB',
    address: '14 Mayfair Gate, South Audley Street, London',
    propertyType: 'Mid-Terrace Victorian Townhouse',
    builtEra: 'Circa 1895 (Victorian)',
    conservationArea: 'Mayfair Conservation Area (Grade II Listed Proximity)',
    floorArea: '138 m² (1,485 sq ft)',
    rooms: '3 Bedrooms, 2 Bathrooms, 1 Reception, Vaulted Cellar',
    epcRating: 'Band C',
    epcScore: 72,
    epcExpiry: '14 March 2031',
    heatingType: 'Mains gas condensing boiler, radiator distribution',
    lastSoldPrice: '£425,000',
    lastSoldDate: '18 July 2021 (HM Land Registry Title NGL849201)',
    previousSoldPrice: '£310,000 (May 2012)',
    floodRiskSurface: 'Very Low Risk (Under 0.1% annual probability)',
    floodRiskRiver: 'Zero Risk (Outside Environment Agency zone 2/3)',
    radonClassification: 'Low risk area (under 1% of homes above action level)',
    tenure: 'Freehold (Absolute Title)',
  },
  'SW1X 0JH': {
    postcode: 'SW1X 0JH',
    address: '28 Cadogan Square, Knightsbridge, London',
    propertyType: 'Ground & Lower Ground Duplex Flat',
    builtEra: 'Circa 1888 (Queen Anne Revival)',
    conservationArea: 'Hans Town Conservation Area',
    floorArea: '192 m² (2,066 sq ft)',
    rooms: '4 Bedrooms, 3 Bathrooms, Double Drawing Room',
    epcRating: 'Band D',
    epcScore: 64,
    epcExpiry: '22 October 2030',
    heatingType: 'Gas central heating with wet underfloor heating manifold',
    lastSoldPrice: '£1,150,000',
    lastSoldDate: '04 November 2018 (HM Land Registry Title BGL49210)',
    previousSoldPrice: '£895,000 (June 2009)',
    floodRiskSurface: 'Very Low Risk',
    floodRiskRiver: 'Zero Risk',
    radonClassification: 'Low risk area',
    tenure: 'Leasehold (978 years unexpired with Share of Freehold)',
  },
  'SW1A 1AA': {
    postcode: 'SW1A 1AA',
    address: 'Palace Mews Residential, London SW1A',
    propertyType: 'Mews House with Integral Garage',
    builtEra: '1920s Edwardian Conversion',
    conservationArea: 'Royal Parks & Westminster Conservation Area',
    floorArea: '108 m² (1,162 sq ft)',
    rooms: '2 Bedrooms, 2 Bathrooms, Open Plan Living',
    epcRating: 'Band C',
    epcScore: 70,
    epcExpiry: '09 January 2032',
    heatingType: 'Electric air source heat pump with high-efficiency buffer',
    lastSoldPrice: '£780,000',
    lastSoldDate: '12 January 2020 (HM Land Registry)',
    previousSoldPrice: '£610,000 (March 2014)',
    floodRiskSurface: 'Very Low Risk',
    floodRiskRiver: 'Zero Risk',
    radonClassification: 'Low risk area',
    tenure: 'Freehold',
  },
};

const STORAGE_KEY = 'njs_partner_referrals_v1';

export const getPartnerReferrals = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_PARTNER_REFERRALS;
};

export const savePartnerReferrals = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
};

export const submitNewReferral = (referralData) => {
  const currentList = getPartnerReferrals();
  const newRef = {
    id: `REF-2026-${String(currentList.length + 1).padStart(3, '0')}`,
    dateSubmitted: new Date().toLocaleDateString('en-GB'),
    stage: 'Referral Received (Operations Review)',
    stageCode: 'new',
    commissionAmount: 50,
    commissionStatus: 'Pending Survey Completion',
    bacsRef: null,
    paymentDate: null,
    ...referralData,
  };
  const updated = [newRef, ...currentList];
  savePartnerReferrals(updated);
  return newRef;
};
