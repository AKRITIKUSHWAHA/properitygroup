/**
 * Approved Core Surveying Services Data
 * Master Specification Part 5.3 & Part 6
 * Enhanced with Curated Architectural Imagery for Editorial Cards
 */

export const approvedServices = [
  {
    id: "homebuyer-survey-level-2",
    slug: "homebuyer-survey-level-2",
    path: "/services/homebuyer-survey-level-2",
    name: "Homebuyer Survey — Level 2",
    shortName: "Level 2 Survey",
    ricsBenchmark: "RICS Home Survey Standard — Level 2",
    tagline: "Comprehensive visual condition assessment for modern and conventional properties",
    summary: "The industry-standard inspection designed for conventional properties in reasonable order. Provides a thorough visual assessment of structural elements, finishes, and services using an intuitive traffic-light condition rating.",
    suitability: "Ideal for houses, bungalows, and standard flats built after 1900, constructed from conventional materials, and showing no obvious signs of major historic alteration or severe distress.",
    badge: "Most Popular",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    inclusions: [
      "Extensive inspection of external roof coverings, chimneys, guttering, brickwork, and joinery from ground level",
      "Internal visual inspection of all accessible rooms, ceilings, floors, windows, and internal woodwork",
      "Roof space inspection (where safe ladder access and boarding permit)",
      "Proactive electronic moisture meter damp readings taken at vulnerable wall locations",
      "Visual assessment of plumbing, electrical installations, heating systems, and drainage gullies",
      "Inspection of permanent outbuildings, boundary walls, retaining structures, and grounds",
      "Traffic-light condition ratings (1-Green, 2-Amber, 3-Red) highlighting urgent defects vs routine maintenance",
      "Legal and conveyancer issues checklist (rights of way, missing building regulation approvals, planning consents)"
    ],
    exclusions: [
      "Destructive opening up of concealed cavities, underfloor voids, or enclosed pipework",
      "Full formal structural engineering calculation",
      "Drilling into walls or lifting fixed carpeting"
    ],
    recommendedFor: [
      "Properties constructed post-1900 in reasonable decorative and structural condition",
      "Standard brick-and-tile or cavity-wall residential construction",
      "Properties that have not undergone major unconsented structural alterations",
      "Purchasers seeking professional clarity on imminent maintenance costs"
    ],
    meta: {
      title: "RICS Level 2 Homebuyer Survey | London, Surrey, Oxon, Bucks & Berks",
      description: "Thorough RICS Level 2 Homebuyer Surveys across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Clear traffic-light defect ratings and swift turnaround."
    }
  },
  {
    id: "building-survey-level-3",
    slug: "building-survey-level-3",
    path: "/services/building-survey-level-3",
    name: "Building Survey — Level 3",
    shortName: "Level 3 Survey",
    ricsBenchmark: "RICS Home Survey Standard — Level 3",
    tagline: "Exhaustive structural investigation and detailed defect diagnosis for complex or period properties",
    summary: "The most comprehensive non-invasive property investigation available. Delivers an in-depth diagnosis of structural integrity, hidden defects, historic fabric condition, and projected long-term remediation recommendations.",
    suitability: "Essential for older properties (pre-1900), listed buildings, properties built with non-standard methods (timber frame, flint, cob, concrete), properties in visible disrepair, or homes where major extension and structural remodeling are planned.",
    badge: "Maximum Depth",
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
    inclusions: [
      "Deep structural analysis of load-bearing walls, foundations, settlement, and heave indicators",
      "Exhaustive inspection of roof framing, rafters, purlins, wall plates, and covering condition",
      "Comprehensive moisture mapping, damp profiling, and timber decay analysis (wet rot, dry rot, woodworm)",
      "Evaluation of past alterations, removed load-bearing partitions, and structural chimney breast removals",
      "Technical guidance on construction materials: historic lime mortars, lath-and-plaster, cavity ties",
      "Drainage inspection chambers opened and visually assessed for root ingress and blockages",
      "Prioritized defect schedule with actionable repair guidance, materials specification, and consequence of inaction",
      "Environmental and subsoil risk appraisal (clay shrinkage, trees in proximity, flood hazard)"
    ],
    exclusions: [
      "Specialist invasive laboratory chemical testing unless commissioned separately",
      "Specialist electrical/CCTV drainage test equipment (visual assessment only)"
    ],
    recommendedFor: [
      "Properties constructed before 1900 or period Victorian, Edwardian, and Georgian homes",
      "Listed buildings (Grade I, II*, II) and properties in designated conservation areas",
      "Houses undergoing significant remodeling, loft conversions, or extensions",
      "Buildings displaying existing structural cracking, roof sag, or substantial damp symptoms"
    ],
    meta: {
      title: "RICS Level 3 Building Survey | Structural Surveys London & Home Counties",
      description: "In-depth RICS Level 3 Building Surveys for period, altered, and complex homes in London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Rigorous defect diagnosis."
    }
  },
  {
    id: "snagging-report",
    slug: "snagging-report",
    path: "/services/snagging-report",
    name: "Snagging Report",
    shortName: "New-Build Snagging",
    ricsBenchmark: "Professional New-Build Inspection & Warranty Standard",
    tagline: "Rigorous quality-assurance inspection for new-build properties and newly completed refurbishments",
    summary: "An independent, forensic quality audit carried out on newly completed residential properties prior to or immediately following legal completion. Protects your investment by identifying cosmetic blemishes, technical omissions, and building regulation breaches for developer remediation.",
    suitability: "Targeted at buyers of new-build houses and apartments from major and bespoke developers across London and the Home Counties, as well as clients taking handover of major contractor refurbishments.",
    badge: "New-Build Focus",
    imageUrl: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80",
    inclusions: [
      "Room-by-room forensic audit of cosmetic finishes (plaster smoothness, paint coverage, mastic application)",
      "Window and door alignment, double-glazing seal integrity, draft performance, and ironmongery check",
      "Level and plumb checks on internal walls, kitchen worktops, cabinetry, and tile alignment",
      "Plumbing checks: water pressure, instantaneous hot water delivery, trap leaks, and sanitaryware seal testing",
      "Roof void insulation uniformity, fire barrier installation, and loft ventilation checks",
      "External brickwork pointing, weep hole placement, rainwater gutter falls, and paving levels",
      "Thermal spot-checks and draught inspection using calibrated temperature monitoring",
      "Fully indexed, photographic defect schedule formatted ready for instant submission to developer customer care"
    ],
    exclusions: [
      "Invasive removal of developer finishes or fixed joinery",
      "Alteration of manufacturer pre-commissioned boiler settings"
    ],
    recommendedFor: [
      "Purchasers of new-build properties prior to handover or within warranty defect liability periods",
      "Holders of NHBC, Premier Guarantee, LABC, or Checkmate warranty policies",
      "Off-plan property investors needing independent site-readiness signoff",
      "Homeowners completing major architect-managed extensions or full refurbishments"
    ],
    meta: {
      title: "Independent New Build Snagging Surveys | London & Home Counties",
      description: "Comprehensive new-build snagging reports across London, Surrey, Oxon, Bucks, and Berks. Detailed photographic defect schedules for developer warranty remediation."
    }
  },
  {
    id: "valuation-report",
    slug: "valuation-report",
    path: "/services/valuation-report",
    name: "Valuation Report",
    shortName: "Independent Valuation",
    ricsBenchmark: "RICS Red Book Global Valuation Standards",
    tagline: "Impartial, market-backed formal property valuations for legal, tax, and equity purposes",
    summary: "A formal, legally robust appraisal of current property market value conducted strictly in accordance with the RICS Valuation — Global Standards (the 'Red Book'). Provides definitive figures required by public bodies, lenders, legal representatives, and private individuals.",
    suitability: "Required whenever an authoritative, independent valuation is demanded for Help to Buy loan redemption, shared ownership staircasing, probate/inheritance tax calculation, matrimonial asset division, capital gains tax, or private sale negotiation.",
    badge: "RICS Red Book",
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    inclusions: [
      "Physical on-site inspection to record layout, gross internal/external floor areas, and condition",
      "Detailed analysis of local property market transactions, registered Land Registry sale prices, and active market sentiment",
      "Thorough evaluation of lease terms, ground rents, service charges, and unexpired lease length (for leasehold properties)",
      "Formal Valuation calculation adopting comparative and investment valuation methodologies",
      "Insurance Reinstatement Cost Assessment (Building Reinstatement Value) for insurance coverage",
      "Sign-off by an RICS Registered Valuer under mandatory professional indemnity compliance",
      "Report formatting accepted by Target HCA / Homes England, major housing associations, HMRC, and the Family Court"
    ],
    exclusions: [
      "Condition defect diagnosis beyond its immediate impact on open market capital value",
      "Automated algorithmic valuation without physical surveyor site attendance"
    ],
    recommendedFor: [
      "Homeowners redeeming Help to Buy equity loans requiring Homes England approved reports",
      "Shared ownership leaseholders staircasing or selling their property shares",
      "Executors and solicitors managing probate and Inheritance Tax calculations for HMRC",
      "Divorce or matrimonial financial dispute asset settlements"
    ],
    meta: {
      title: "RICS Red Book Property Valuations | Help to Buy & Probate | London & SE",
      description: "Official RICS Red Book property valuations across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Accepted by Homes England, HMRC, and housing associations."
    }
  },
  {
    id: "damp-survey",
    slug: "damp-survey",
    path: "/services/damp-survey",
    name: "Damp Survey",
    shortName: "Damp & Timber Survey",
    ricsBenchmark: "PCA Aligned & Independent Moisture Diagnostics",
    tagline: "Unbiased, scientific damp and timber decay investigation free from contractor sales bias",
    summary: "A specialist diagnostic inspection focused exclusively on moisture ingress, rising damp, penetrating damp, condensation, mould proliferation, and associated timber decay. Because we are independent surveyors and do not sell chemical treatments or damp-proofing work, our advice is 100% impartial.",
    suitability: "Essential when purchase surveys have flagged damp warnings, when internal damp staining, salt efflorescence, or mould is present, or when older masonry properties are experiencing recurring damp issues.",
    badge: "100% Impartial",
    imageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
    inclusions: [
      "Systematic moisture profiling across affected walls using calibrated electronic resistance and radio-frequency meters",
      "Clear diagnosis distinguishing between rising damp, penetrating damp, hygroscopic salts, plumbing leaks, and condensation",
      "Inspection of external ground levels, damp-proof courses (DPC), subfloor airbricks, and perimeter drainage",
      "Assessment of structural floor timbers, joist bearings, and timber framing for wet rot (Coniophora puteana) or dry rot (Serpula lacrymans)",
      "Evaluation of indoor humidity levels, dew points, mechanical extraction, and building ventilation adequacy",
      "Thermal imaging inspection to detect thermal bridging, missing cavity insulation, and hidden cold spots",
      "Targeted, unbiased remediation strategy focusing on breathing buildings, appropriate lime renders, and defect source elimination",
      "Protection from unnecessary, disruptive, and costly chemical injection treatments"
    ],
    exclusions: [
      "Commercial sales pitches for chemical damp proof injection (we do not sell contractor products)",
      "Destructive plaster stripping during pre-purchase visits without vendor written consent"
    ],
    recommendedFor: [
      "Homebuyers whose initial Homebuyer or mortgage valuation flagged high damp readings",
      "Owners of period properties suffering from flaking paint, salt crystallization, or black mould",
      "Property owners seeking second opinions on aggressive chemical damp contractor quotes",
      "Landlords addressing tenant condensation and mould complaints under the Decent Homes Standard"
    ],
    meta: {
      title: "Independent Specialist Damp Surveys | London, Surrey, Oxon, Bucks & Berks",
      description: "Expert, independent damp and timber decay surveys across London and the Home Counties. Unbiased scientific diagnosis without contractor sales pressure."
    }
  }
];

/**
 * Separate Legal & Expert Witness Service (Master Spec Part 7)
 */
export const expertWitnessService = {
  id: "expert-witness",
  slug: "expert-witness",
  path: "/expert-witness",
  name: "Expert Witness & Litigation Services",
  shortName: "Expert Witness",
  cprCompliance: "Civil Procedure Rules (CPR) Part 35 Compliant",
  tagline: "Independent expert witness reports, CPR Part 35 declarations, and court testimony for property disputes",
  summary: "Authoritative expert surveying services for legal disputes involving property boundaries, defective building works, structural movement, landlord & tenant dilapidations, and surveyor professional negligence. We act as independent experts whose overriding duty is to the Court.",
  imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
  targetAudiences: [
    {
      title: "Solicitors & Law Firms",
      description: "Litigation-ready CPR Part 35 compliant expert reports, preliminary advisory notes, and assistance with Scott Schedules."
    },
    {
      title: "Barristers & Counsel",
      description: "Conferences with counsel, technical interrogation of opposing expert evidence, joint statements of experts, and trial attendance."
    },
    {
      title: "Property Insurers & Loss Adjusters",
      description: "Impartial causation investigations for major property damage claims, subsidence disputes, and contractor workmanship failures."
    },
    {
      title: "Private Individuals & Commercial Parties",
      description: "Objective advice and formal reporting to resolve contentious property boundary or contractor disputes prior to trial."
    }
  ],
  disputeCategories: [
    "Boundary demarcations and party wall disputes",
    "Contractor workmanship defects and construction disputes",
    "Building movement, subsidence, heave, and settlement claims",
    "Damp, water ingress, and toxic mould legal liability cases",
    "Landlord and tenant dilapidations disputes (Section 18 valuation)",
    "Surveyor professional negligence and valuation defense"
  ],
  instructionProcess: [
    {
      step: 1,
      title: "Preliminary Review & Conflict Check",
      description: "Immediate checking for conflicts of interest and evaluation of dispute documentation to verify instruction suitability."
    },
    {
      step: 2,
      title: "Formal Letter of Instruction",
      description: "Agreement on the scope of inquiry, court deadlines, single joint expert (SJE) or party-appointed expert terms."
    },
    {
      step: 3,
      title: "Detailed Physical Site Inspection",
      description: "Forensic on-site investigation, metric measurement, photographic logging, and technical evidence gathering."
    },
    {
      step: 4,
      title: "CPR Part 35 Report Delivery",
      description: "Production of a comprehensive, court-compliant report containing clear opinions, factual analysis, and expert declarations."
    },
    {
      step: 5,
      title: "Joint Statements & Court Attendance",
      description: "Meetings with opposing experts to prepare joint statements, conference with counsel, and oral testimony in Court or Tribunal."
    }
  ],
  meta: {
    title: "Expert Witness Property Surveyors | CPR Part 35 Reports London & Home Counties",
    description: "Independent RICS-aligned Expert Witness surveying services for litigation, CPR Part 35 court reports, and tribunal hearings across London and the South East."
  }
};
