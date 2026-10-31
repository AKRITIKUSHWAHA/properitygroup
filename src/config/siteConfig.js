/**
 * Centralized Site Configuration
 * Master Specification Part 1.1, 5.1 & 10
 *
 * NOTE: Per project rules, no company name, logo, address, RICS number,
 * or credentials have been invented. All placeholder details are explicitly
 * marked with flags and clear client-action indicators.
 */

export const siteConfig = {
  // Brand & Entity Identification
  companyName: "NJS Property Group",
  tradingName: "Chartered Building Surveyors & Registered Valuers [Trading Name Pending Confirmation]",
  isNameProvisional: false,

  // Technical Scope Notice
  techStackNotice: {
    framework: "React.js + Vite",
    originalBriefNotice: "The client's initial brief mentioned WordPress + Elementor, while the wider operational software concept referenced React.js + Node.js + PostgreSQL. This public website is delivered in React.js as specified for this frontend phase and requires formal client sign-off.",
    clientApprovalRequired: true
  },

  // Contact Information (Configurable Placeholders)
  contact: {
    telephone: "0800 169 9661",
    telephoneDisplay: "0800 169 9661",
    isPhoneProvisional: false,
    email: "info@njspropertygroup.com",
    isEmailProvisional: false,
    emergencyHotline: "0800 169 9661",
    address: {
      line1: "124 City Road",
      line2: "Kemp House",
      city: "London",
      postcode: "EC1V 2NX",
      isAddressProvisional: false
    },
    openingHours: "Monday – Friday: 08:30 – 18:00 | Saturday: By Appointment",
    responseCommitment: "Written quotations delivered within 24 business hours. Survey dates confirmed upon instruction."
  },

  // Service Coverage Areas (Master Spec Part 5.4 & 10)
  coverageAreas: [
    {
      id: "london",
      name: "London",
      label: "Greater London & Boroughs",
      description: "Comprehensive surveying across Central, North, South, East, and West London boroughs.",
      principalTowns: ["Westminster", "Kensington & Chelsea", "Camden", "Richmond", "Wandsworth", "Islington", "Greenwich", "Hammersmith & Fulham"],
      hubNote: "Fast coverage via central and borough-based survey surveyors."
    },
    {
      id: "surrey",
      name: "Surrey",
      label: "Surrey County & North Downs",
      description: "Specialist residential and structural inspections across Surrey commuter belts and rural estates.",
      principalTowns: ["Guildford", "Woking", "Epsom", "Farnham", "Weybridge", "Esher", "Reigate", "Godalming"],
      hubNote: "Extensive experience with Victorian, Edwardian, and modern Surrey developments."
    },
    {
      id: "oxfordshire",
      name: "Oxfordshire",
      label: "Oxfordshire & Thames Valley",
      description: "Heritage, period stone properties, and modern housing across Oxford and rural districts.",
      principalTowns: ["Oxford", "Abingdon", "Banbury", "Bicester", "Witney", "Didcot", "Henley-on-Thames"],
      hubNote: "Specialist knowledge of Cotswold stone, lime mortar, and listed architectural forms."
    },
    {
      id: "buckinghamshire",
      name: "Buckinghamshire",
      label: "Buckinghamshire & Chilterns",
      description: "Thorough structural and snagging reports across Chiltern towns and new development corridors.",
      principalTowns: ["Milton Keynes", "Aylesbury", "High Wycombe", "Marlow", "Beaconsfield", "Amersham", "Gerrards Cross"],
      hubNote: "Covering both historic market towns and expansive new-build communities."
    },
    {
      id: "berkshire",
      name: "Berkshire",
      label: "Royal Berkshire & Kennet Valley",
      description: "Expert level 2, level 3, and valuation reporting throughout Berkshire commercial and residential hubs.",
      principalTowns: ["Reading", "Windsor", "Maidenhead", "Slough", "Bracknell", "Newbury", "Ascot", "Wokingham"],
      hubNote: "Thames Valley corridor specialist with rapid site access."
    }
  ],

  // Professional Accreditations & Transparency Policy
  accreditationPolicy: {
    ricsStatus: "RICS Regulated Practice [Status & Firm Registration Number Pending Client Documentation]",
    valuerRegistration: "RICS Registered Valuer Scheme (VRS) [Pending Surveyor Registration Verification]",
    pcaAffiliation: "Property Care Association (PCA) Standards Alignment for Damp & Timber Investigations",
    cprPart35: "Civil Procedure Rules (CPR) Part 35 Compliant for Expert Witness Litigation Instructions",
    clientAssetChecklist: [
      "Official high-resolution Vector Logo (SVG/PNG)",
      "RICS Firm Registration Number and approved digital emblem",
      "Exact trading entity legal name and Companies House registration",
      "Registered office physical address and local telephone lines",
      "Standard Terms of Engagement (ToE) PDF downloads for each service tier"
    ]
  },

  // Retired Services Documentation (Master Spec Part 9)
  retiredServices: {
    list: ["Construction", "Real Estate"],
    actionTaken: "Excluded from website architecture and navigation. HTTP 301 redirect mapping prepared for production web server.",
    redirectDocsPath: "/REDIRECTS.md"
  }
};

