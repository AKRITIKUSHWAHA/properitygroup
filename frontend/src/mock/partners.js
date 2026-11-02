// NJS Property Group - Estate Agent & Referral Partner Mock Store (Client Point 29 & Point 26)

export const PARTNER_AGENCIES = [];

export const INITIAL_PARTNER_REFERRALS = [];

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
    if (!localStorage.getItem('njs_fresh_partners_clean_v1')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem('njs_fresh_partners_clean_v1', 'true');
      return [];
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
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

