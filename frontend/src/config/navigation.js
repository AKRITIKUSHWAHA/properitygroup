/**
 * Navigation Configuration
 * Master Specification Part 4 & 5.1
 * Aligned with e.surv Information Architecture & Practice Requirements
 */

import { approvedServices } from './services';
import { siteConfig } from './siteConfig';

export const navigationCategories = {
  home: {
    id: "home",
    name: "Home",
    path: "/",
    exact: true
  },
  services: {
    id: "services",
    name: "Survey Services",
    path: "/services",
    isDropdown: true,
    isMegaMenu: true,
    columns: [
      {
        id: "surveys-col",
        title: "Residential Surveys",
        caption: "Pre-Purchase Condition Reports",
        items: [
          {
            id: "homebuyer-survey-level-2",
            name: "Homebuyer Survey — Level 2",
            shortName: "Level 2 Survey",
            badge: "Level 2",
            path: "/services/homebuyer-survey-level-2",
            description: "Essential condition report for conventional post-1900 properties."
          },
          {
            id: "building-survey-level-3",
            name: "Building Survey — Level 3",
            shortName: "Level 3 Survey",
            badge: "Level 3",
            path: "/services/building-survey-level-3",
            description: "Comprehensive structural audit for period, altered & larger homes."
          },
          {
            id: "snagging-report",
            name: "Snagging Report",
            shortName: "Snagging Report",
            badge: "New-Build",
            path: "/services/snagging-report",
            description: "Independent defect inspection before developer completion handover."
          }
        ]
      },
      {
        id: "specialist-col",
        title: "Valuations & Legal",
        caption: "Appraisals & Dispute Evidence",
        items: [
          {
            id: "valuation-report",
            name: "Valuation Report",
            shortName: "Valuation Report",
            badge: "Red Book",
            path: "/services/valuation-report",
            description: "RICS Red Book appraisals for Help to Buy, probate & capital gains."
          },
          {
            id: "damp-survey",
            name: "Damp Survey",
            shortName: "Damp Survey",
            badge: "Diagnostics",
            path: "/services/damp-survey",
            description: "Scientific moisture investigation without contractor sales bias."
          },
          {
            id: "expert-witness",
            name: "Expert Witness Services",
            shortName: "Expert Witness",
            badge: "CPR Part 35",
            path: "/expert-witness",
            description: "Court-admissible technical evidence & civil litigation reports."
          }
        ]
      },
      {
        id: "guidance-col",
        title: "Advice & Quick Action",
        caption: "Guidance & Fast Quotation",
        items: [
          {
            id: "which-survey",
            name: "Which Survey Do I Need?",
            shortName: "Survey Guidance",
            path: "/#which-survey",
            description: "Compare survey levels and property suitability."
          },
          {
            id: "locations-covered",
            name: "Regional Coverage Areas",
            shortName: "Coverage Areas",
            path: "/contact#coverage",
            description: "London, Surrey, Oxfordshire, Buckinghamshire & Berkshire."
          },
          {
            id: "practice-standards",
            name: "Professional Standards Notice",
            shortName: "Accreditations",
            path: "/#credentials",
            description: "100% independent RICS-aligned survey practice."
          }
        ],
        cta: {
          title: "Need a Survey Quote?",
          subtitle: "Fixed-fee written quotation within 24 hours.",
          buttonText: "Request a Quote",
          path: "/#quote-section"
        }
      }
    ],
    // Flat children for mobile / fallback
    children: [
      {
        id: "homebuyer-survey-level-2",
        name: "Homebuyer Survey — Level 2",
        shortName: "Level 2 Survey",
        badge: "Level 2",
        path: "/services/homebuyer-survey-level-2",
        description: "Essential condition report for conventional post-1900 homes."
      },
      {
        id: "building-survey-level-3",
        name: "Building Survey — Level 3",
        shortName: "Level 3 Survey",
        badge: "Level 3",
        path: "/services/building-survey-level-3",
        description: "Comprehensive structural audit for period, altered & larger homes."
      },
      {
        id: "snagging-report",
        name: "Snagging Report",
        shortName: "Snagging Report",
        badge: "New-Build",
        path: "/services/snagging-report",
        description: "Independent defect inspection before developer handover."
      },
      {
        id: "valuation-report",
        name: "Valuation Report",
        shortName: "Valuation Report",
        badge: "Red Book",
        path: "/services/valuation-report",
        description: "RICS Red Book appraisals for Help to Buy, probate & capital gains."
      },
      {
        id: "damp-survey",
        name: "Damp Survey",
        shortName: "Damp Survey",
        badge: "Diagnostics",
        path: "/services/damp-survey",
        description: "Scientific moisture investigation without contractor sales bias."
      }
    ]
  },
  expertWitness: {
    id: "expert-witness",
    name: "Expert Witness",
    path: "/expert-witness",
    badge: "CPR Part 35",
    description: "Court-admissible technical evidence & dispute resolution."
  },
  coverage: {
    id: "coverage",
    name: "Service Coverage",
    path: "/contact#coverage",
    isDropdown: true,
    children: [
      {
        id: "london",
        name: "London Property Surveys",
        shortName: "London",
        badge: "Greater London",
        path: "/contact?area=london#coverage",
        description: "All Central, North, South, East & West London boroughs."
      },
      {
        id: "surrey",
        name: "Surrey Building Surveys",
        shortName: "Surrey",
        badge: "Surrey County",
        path: "/contact?area=surrey#coverage",
        description: "Guildford, Woking, Epsom, Farnham, Weybridge & Surrey Hills."
      },
      {
        id: "oxfordshire",
        name: "Oxfordshire Property Valuations",
        shortName: "Oxfordshire",
        badge: "Thames Valley",
        path: "/contact?area=oxfordshire#coverage",
        description: "Oxford, Banbury, Bicester, Witney & period stone properties."
      },
      {
        id: "buckinghamshire",
        name: "Buckinghamshire Snagging Reports",
        shortName: "Buckinghamshire",
        badge: "Chilterns",
        path: "/contact?area=buckinghamshire#coverage",
        description: "Milton Keynes, Aylesbury, High Wycombe & Chiltern corridor."
      },
      {
        id: "berkshire",
        name: "Berkshire Damp Investigations",
        shortName: "Berkshire",
        badge: "Royal Berkshire",
        path: "/contact?area=berkshire#coverage",
        description: "Reading, Windsor, Maidenhead, Slough, Newbury & Ascot."
      }
    ],
    footerLink: {
      name: "View All Coverage Areas & Postcodes",
      path: "/contact#coverage"
    }
  },
  aboutContact: {
    id: "about-contact",
    name: "About & Contact",
    path: "/contact",
    isDropdown: true,
    children: [
      {
        id: "contact-hub",
        name: "Contact & Enquiries",
        shortName: "Contact Us",
        path: "/contact",
        description: "Direct practice telephone, email and office details."
      },
      {
        id: "contact-faqs",
        name: "Frequently Asked Questions",
        shortName: "Practice FAQs",
        path: "/contact#faqs",
        description: "Report turnarounds, survey comparisons & booking guide."
      },
      {
        id: "contact-standards",
        name: "Professional Standards Notice",
        shortName: "Accreditations",
        path: "/#credentials",
        description: "RICS Home Survey alignment & surveyor code of conduct."
      }
    ],
    hotline: {
      label: "Direct Dispatch Hotline",
      tel: siteConfig.contact.telephone,
      display: siteConfig.contact.telephoneDisplay
    }
  }
};

export const navigationLinks = [
  navigationCategories.home,
  navigationCategories.services,
  navigationCategories.expertWitness,
  navigationCategories.coverage,
  navigationCategories.aboutContact
];

export const footerQuickLinks = [
  { name: "Home", path: "/" },
  { name: "Expert Witness Services", path: "/expert-witness" },
  { name: "Regional Service Coverage", path: "/contact#coverage" },
  { name: "Direct Contact & Enquiries", path: "/contact" },
  { name: "Frequently Asked Questions", path: "/contact#faqs" }
];

export const footerServiceLinks = approvedServices.map(s => ({
  name: s.name,
  path: s.path
}));

export const footerCoverageLinks = [
  { name: "London Property Surveys", path: "/contact?area=london#coverage" },
  { name: "Surrey Building Surveys", path: "/contact?area=surrey#coverage" },
  { name: "Oxfordshire Property Valuations", path: "/contact?area=oxfordshire#coverage" },
  { name: "Buckinghamshire Snagging Reports", path: "/contact?area=buckinghamshire#coverage" },
  { name: "Berkshire Damp Investigations", path: "/contact?area=berkshire#coverage" }
];
