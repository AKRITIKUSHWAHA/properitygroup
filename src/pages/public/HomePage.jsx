import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Check,
  ArrowRight,
  ChevronRight,
  Phone,
  Mail,
  HelpCircle,
  ExternalLink,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Scale,
  Clock,
  Compass,
  Building,
  Star
} from 'lucide-react';
import { approvedServices, expertWitnessService } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CredentialsBanner } from '../../components/common/CredentialsBanner';
import { CoverageMap } from '../../components/common/CoverageMap';
import { StepProcess } from '../../components/common/StepProcess';
import { QuoteRequestForm } from '../../components/forms/QuoteRequestForm';
import { HeroSlider } from '../../components/hero/HeroSlider';
import { ArchitecturalHero } from '../../components/hero/ArchitecturalHero';
import { useScrollReveal } from '../../hooks/useScrollReveal';

// Benchmark Modernization Components (benchmarked to esurv.co.uk)
import { InstantQuoteCalculator } from '../../components/home/InstantQuoteCalculator';
import { TrafficLightRatings } from '../../components/home/TrafficLightRatings';
import { SurveySelector } from '../../components/home/SurveySelector';
import { ReviewsSection } from '../../components/home/ReviewsSection';
import { SampleReportSection } from '../../components/home/SampleReportSection';

export function HomePage() {
  useDocumentTitle(
    "The UK's Trusted Home Survey & Valuation Specialists | RICS Aligned",
    "Independent property surveys across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. RICS Level 2 Homebuyer, Level 3 Building Surveys, Valuations, and Snagging Reports with 48h digital delivery."
  );

  const [prefilledService, setPrefilledService] = useState('homebuyer-survey-level-2');
  const [selectedComparisonTab, setSelectedComparisonTab] = useState('survey-levels'); // 'survey-levels' | 'valuation-vs-survey'
  const [useInstantCalc, setUseInstantCalc] = useState(false);

  const [credentialsRef, credentialsVisible] = useScrollReveal({ threshold: 0.1 });
  const [selectorRef, selectorVisible] = useScrollReveal({ threshold: 0.1 });
  const [servicesRef, servicesVisible] = useScrollReveal({ threshold: 0.08 });
  const [comparisonRef, comparisonVisible] = useScrollReveal({ threshold: 0.1 });
  const [trafficLightRef, trafficLightVisible] = useScrollReveal({ threshold: 0.1 });
  const [sampleReportRef, sampleReportVisible] = useScrollReveal({ threshold: 0.1 });
  const [reviewsRef, reviewsVisible] = useScrollReveal({ threshold: 0.1 });
  const [expertRef, expertVisible] = useScrollReveal({ threshold: 0.12 });
  const [processRef, processVisible] = useScrollReveal({ threshold: 0.1 });
  const [coverageRef, coverageVisible] = useScrollReveal({ threshold: 0.1 });
  const [quoteSuiteRef, quoteSuiteVisible] = useScrollReveal({ threshold: 0.08 });
  const [ctaRef, ctaVisible] = useScrollReveal({ threshold: 0.15 });

  const handleQuickQuoteSelect = ({ serviceId, postcode }) => {
    if (serviceId) setPrefilledService(serviceId);
  };

  return (
    <div className="home-page luxury-site-canvas">
      {/* 1. SIGNATURE ARCHITECTURAL LUXURY HERO (MATCHING CLIENT MOCKUP) */}
      <ArchitecturalHero onQuoteClick={() => setPrefilledService('homebuyer-survey-level-2')} />

      {/* 1.2. SECONDARY ARCHITECTURAL SERVICES ROW (Valuation & Damp Survey) */}
      <div className="luxury-hero-canvas luxury-secondary-services-wrap">
        <div className="luxury-secondary-grid">
          {/* Card 4: Valuation Report */}
          <Link to="/services/valuation-report" className="luxury-secondary-card group">
            <div 
              className="luxury-secondary-img"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80')`
              }}
              role="img"
              aria-label="Independent RICS Red Book Valuation"
            >
              <div className="luxury-card-badge">
                <span>Red Book</span>
              </div>
              <div className="luxury-secondary-overlay">
                <h3 className="luxury-card-title">Valuation Report</h3>
                <p className="luxury-card-desc">Help to Buy, Shared Ownership &amp; Probate Appraisals.</p>
              </div>
            </div>
          </Link>

          {/* Card 5: Damp Survey */}
          <Link to="/services/damp-survey" className="luxury-secondary-card group">
            <div 
              className="luxury-secondary-img"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80')`
              }}
              role="img"
              aria-label="Independent Damp & Moisture Diagnostics"
            >
              <div className="luxury-card-badge">
                <span>Diagnostic</span>
              </div>
              <div className="luxury-secondary-overlay">
                <h3 className="luxury-card-title">Damp Survey</h3>
                <p className="luxury-card-desc">Zero Contractor Bias. Scientific moisture profiling.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Practice Metrics Ticker */}
      <div className="practice-metrics-ticker">
        <Container>
          <div className="metrics-ticker-grid">
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">100%</span>
              <span className="metric-ticker-label">Independent &bull; Zero Contractor Bias</span>
            </div>
            <div className="metric-ticker-sep" aria-hidden="true" />
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">Fixed-Fee</span>
              <span className="metric-ticker-label">Transparent Written Quotes with Zero Hidden Costs</span>
            </div>
            <div className="metric-ticker-sep" aria-hidden="true" />
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">48 Hours</span>
              <span className="metric-ticker-label">Fast Report Turnaround &bull; Direct Phone Debrief</span>
            </div>
            <div className="metric-ticker-sep" aria-hidden="true" />
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">4.8 / 5 ★</span>
              <span className="metric-ticker-label">Rated Excellent on Trustpilot (2,500+ Reviews)</span>
            </div>
            <div className="metric-ticker-sep" aria-hidden="true" />
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">CPR Part 35</span>
              <span className="metric-ticker-label">Court-Admissible Legal Witness Evidence</span>
            </div>
          </div>
        </Container>
      </div>

      {/* 2. CREDENTIALS & ACCREDITATIONS BANNER */}
      <div ref={credentialsRef} className={`reveal-init ${credentialsVisible ? 'is-revealed' : ''}`}>
        <CredentialsBanner />
      </div>

      {/* 2.5. ARCHITECTURAL LUXURY EXPERTISE & BUYER PROTECTION (Clean White Section) */}
      <section id="expertise" className="luxury-dark-section" aria-label="Independent Surveying Expertise">
        <Container>
          <div className="luxury-section-header">
            <span className="luxury-section-eyebrow">Pure Independence</span>
            <h2 className="luxury-section-title">See Beyond the Surface.</h2>
            <p className="luxury-section-sub">
              A home is an emotional purchase, but structural condition is purely objective. We provide technical clarity without contractor conflicts of interest.
            </p>
          </div>

          <div className="luxury-pillars-grid">
            <div className="luxury-pillar-card">
              <div className="luxury-pillar-icon" aria-hidden="true">
                <ShieldCheck size={26} />
              </div>
              <h3 className="luxury-pillar-title">Zero Contractor Bias</h3>
              <p className="luxury-pillar-text">
                We sell independent diagnostic reports only. We never quote for building work, damp treatments, or remedial contracting.
              </p>
            </div>

            <div className="luxury-pillar-card">
              <div className="luxury-pillar-icon" aria-hidden="true">
                <Phone size={26} />
              </div>
              <h3 className="luxury-pillar-title">Direct Surveyor Debrief</h3>
              <p className="luxury-pillar-text">
                Speak directly with the chartered surveyor who inspected your prospective property before and after legal exchange.
              </p>
            </div>

            <div className="luxury-pillar-card">
              <div className="luxury-pillar-icon" aria-hidden="true">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="luxury-pillar-title">Traffic-Light Defect Ratings</h3>
              <p className="luxury-pillar-text">
                Instant visual prioritization using RICS 1-2-3 condition ratings so you know exactly which repairs to renegotiate.
              </p>
            </div>

            <div className="luxury-pillar-card">
              <div className="luxury-pillar-icon" aria-hidden="true">
                <Building size={26} />
              </div>
              <h3 className="luxury-pillar-title">Survey vs Mortgage Valuation</h3>
              <p className="luxury-pillar-text">
                Mortgage valuations protect the lender’s loan only. Our independent survey is commissioned 100% to protect your capital.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. INTERACTIVE "WHICH SURVEY DO I NEED?" TOOL (esurv benchmark by Akriti) */}
      <div ref={selectorRef} className={`reveal-init ${selectorVisible ? 'is-revealed' : ''}`}>
        <SurveySelector />
      </div>

      {/* 4. EDITORIAL SURVEY SERVICES SECTION WITH STARTING PRICES */}
      <section
        id="services"
        ref={servicesRef}
        className={`section section-alt services-editorial-section reveal-init ${servicesVisible ? 'is-revealed' : ''}`}
        aria-label="Core Surveying Services"
      >
        <Container>
          <SectionHeading
            eyebrow="Independent Survey Disciplines"
            title="Professional Surveying Services Tailored to Your Property"
            subtitle="RICS-standard survey reports tailored to property age, construction typology, and planned alterations. Transparent fixed fees with zero hidden disbursements."
          />

          <div className="services-editorial-grid">
            {approvedServices.map(service => (
              <article key={service.id} className="service-editorial-card">
                <div className="service-card-image-wrap">
                  <img
                    src={service.image}
                    alt={service.imageAlt}
                    className="service-card-img"
                    loading="lazy"
                  />
                  <div className="service-card-badge-wrap">
                    <Badge variant="navy">{service.badge}</Badge>
                  </div>
                </div>

                <div className="service-card-body">
                  <div className="service-card-header">
                    <h3 className="service-card-title">{service.name}</h3>
                    <p className="service-card-tagline">{service.tagline}</p>
                  </div>

                  <p className="service-card-desc">{service.shortDesc}</p>

                  <div className="service-card-suitability">
                    <span className="suitability-label">Best Suited For:</span>
                    <p className="suitability-text">{service.suitableFor}</p>
                  </div>

                  <div className="service-card-highlights">
                    <span className="highlights-label">Key Report Inclusions:</span>
                    <ul className="highlights-list">
                      {service.keyDeliverables.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="highlight-item">
                          <Check size={14} className="text-success flex-shrink-0" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="service-card-footer">
                    <div className="service-price-wrap">
                      <span className="price-from-label">Fixed Fees From</span>
                      <span className="service-price-amount">{service.startingPrice}</span>
                      <span className="price-vat-note">inc. VAT</span>
                    </div>
                    <div className="service-card-actions">
                      <Button to={service.path} variant="outline" size="sm">
                        View Full Details
                      </Button>
                      <Button
                        to={`/contact?service=${service.id}#quote`}
                        variant="primary"
                        size="sm"
                        onClick={() => setPrefilledService(service.id)}
                      >
                        Get Quote
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. TRAFFIC-LIGHT DEFECT RATINGS EXPLAINED (esurv Signature Feature by Akriti) */}
      <div ref={trafficLightRef} className={`reveal-init ${trafficLightVisible ? 'is-revealed' : ''}`}>
        <TrafficLightRatings />
      </div>

      {/* 6. WHICH SURVEY DO I NEED? INTERACTIVE DECISION MATRIX */}
      <section
        id="comparison-matrix"
        ref={comparisonRef}
        className={`section survey-comparison-section reveal-init ${comparisonVisible ? 'is-revealed' : ''}`}
        aria-label="Survey Level Comparison Guide"
      >
        <Container>
          <SectionHeading
            eyebrow="Decision Guidance"
            title="Which Survey Does Your Property Require?"
            subtitle="Choosing the right survey depends on property age, structural history, and planned alterations. Compare our benchmark inspections below."
          />

          {/* Interactive Navigation Pills */}
          <div className="comparison-tabs-pill-wrap" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={selectedComparisonTab === 'survey-levels'}
              className={`comparison-tab-btn ${selectedComparisonTab === 'survey-levels' ? 'active' : ''}`}
              onClick={() => setSelectedComparisonTab('survey-levels')}
            >
              <Layers size={16} aria-hidden="true" />
              <span>Level 2 vs Level 3 Comparison</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedComparisonTab === 'valuation-vs-survey'}
              className={`comparison-tab-btn ${selectedComparisonTab === 'valuation-vs-survey' ? 'active' : ''}`}
              onClick={() => setSelectedComparisonTab('valuation-vs-survey')}
            >
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Mortgage Valuation vs Independent Survey</span>
            </button>
          </div>

          {/* Level 2 vs Level 3 Comparison View */}
          {selectedComparisonTab === 'survey-levels' && (
            <div className="comparison-table-wrapper" role="tabpanel">
              <div className="table-responsive">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th scope="col" className="col-feature">Diagnostic Scope</th>
                      <th scope="col" className="col-level2">
                        <span className="th-badge">Conventional Homes &bull; Post-1930</span>
                        <span className="th-title">Homebuyer Survey (Level 2)</span>
                        <span className="th-price">From £425 inc. VAT</span>
                      </th>
                      <th scope="col" className="col-level3 highlighted-col">
                        <span className="th-badge popular-badge">Historic &bull; Altered &bull; Dilapidated</span>
                        <span className="th-title">Building Survey (Level 3)</span>
                        <span className="th-price">From £750 inc. VAT</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Property Age</strong></td>
                      <td>Built after 1930; standard brick/block construction</td>
                      <td className="highlighted-col">Pre-1930; period, listed, or heavily altered structures</td>
                    </tr>
                    <tr>
                      <td><strong>Inspection Depth</strong></td>
                      <td>Visual inspection of accessible elements</td>
                      <td className="highlighted-col">Comprehensive, invasive structural examination including lofts & subfloors</td>
                    </tr>
                    <tr>
                      <td><strong>Roof &amp; Timber Diagnostics</strong></td>
                      <td>Head and shoulders loft hatch inspection</td>
                      <td className="highlighted-col">Full crawl of roof void; timber moisture profiling & woodworm check</td>
                    </tr>
                    <tr>
                      <td><strong>Defect Urgency Ratings</strong></td>
                      <td>Condition Ratings 1, 2, 3 color-coded</td>
                      <td className="highlighted-col">Condition Ratings 1, 2, 3 with structural defect causal analysis</td>
                    </tr>
                    <tr>
                      <td><strong>Remediation Cost Guidance</strong></td>
                      <td>Available as optional add-on</td>
                      <td className="highlighted-col">Detailed remediation prioritization schedules included</td>
                    </tr>
                    <tr>
                      <td><strong>Turnaround &amp; Debrief</strong></td>
                      <td>3 to 5 business days + phone debrief</td>
                      <td className="highlighted-col">3 to 5 business days + direct surveyor telephone debrief</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td></td>
                      <td>
                        <Button to="/services/homebuyer-survey-level-2" variant="outline" size="sm">
                          Explore Level 2
                        </Button>
                      </td>
                      <td className="highlighted-col">
                        <Button to="/services/building-survey-level-3" variant="primary" size="sm">
                          Explore Level 3
                        </Button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Mortgage Valuation vs Independent Survey Comparison View */}
          {selectedComparisonTab === 'valuation-vs-survey' && (
            <div className="valuation-explainer-card" role="tabpanel">
              <div className="explainer-header">
                <AlertTriangle size={24} className="text-warning flex-shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="explainer-title">Why Your Mortgage Valuation Is NOT a Property Survey</h3>
                  <p className="explainer-subtitle">
                    A lender’s mortgage valuation confirms only that the property provides sufficient security for the loan amount. It does not protect you against hidden structural defects.
                  </p>
                </div>
              </div>

              <div className="grid-2 explainer-grid">
                <div className="explainer-column column-valuation">
                  <div className="column-header">
                    <span className="column-badge badge-danger">Lender Protection Only</span>
                    <h4 className="column-title">Mortgage Valuation</h4>
                  </div>
                  <ul className="column-list">
                    <li><XCircle size={15} className="text-danger flex-shrink-0" /> Commissioned by and prepared solely for the mortgage lender</li>
                    <li><XCircle size={15} className="text-danger flex-shrink-0" /> Often takes under 20 minutes; may be done as a drive-by or desktop algorithm</li>
                    <li><XCircle size={15} className="text-danger flex-shrink-0" /> Inspects no subfloors, lofts, damp profiles, or hidden drainage</li>
                    <li><XCircle size={15} className="text-danger flex-shrink-0" /> Offers zero legal recourse to the buyer if serious defects emerge post-completion</li>
                  </ul>
                </div>

                <div className="explainer-column column-survey highlighted-panel">
                  <div className="column-header">
                    <span className="column-badge badge-success">Buyer Protection</span>
                    <h4 className="column-title">Independent RICS Survey</h4>
                  </div>
                  <ul className="column-list">
                    <li><CheckCircle2 size={15} className="text-success flex-shrink-0" /> Commissioned by you and works exclusively in your legal and financial interest</li>
                    <li><CheckCircle2 size={15} className="text-success flex-shrink-0" /> 2 to 4 hours of exhaustive on-site physical inspection</li>
                    <li><CheckCircle2 size={15} className="text-success flex-shrink-0" /> Detailed forensic diagnostics of roof voids, damp ingress, timber, and movement</li>
                    <li><CheckCircle2 size={15} className="text-success flex-shrink-0" /> Essential leverage to renegotiate asking prices or request seller repairs before exchange</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* 7. SAMPLE RICS REPORT PREVIEW & DOWNLOAD (esurv Benchmark by Akriti) */}
      <div ref={sampleReportRef} className={`reveal-init ${sampleReportVisible ? 'is-revealed' : ''}`}>
        <SampleReportSection />
      </div>

      {/* 8. VERIFIED CLIENT REVIEWS & TRUSTPILOT 4.8★ SOCIAL PROOF (by Akriti) */}
      <div ref={reviewsRef} className={`reveal-init ${reviewsVisible ? 'is-revealed' : ''}`}>
        <ReviewsSection />
      </div>

      {/* 9. DEDICATED EXPERT WITNESS & LITIGATION PRACTICE (Clean White Section) */}
      <section
        id="expert-witness-section"
        ref={expertRef}
        className={`section expert-witness-banner-section reveal-init ${expertVisible ? 'is-revealed' : ''}`}
        aria-label="Expert Witness Services Callout"
      >
        <Container>
          <div className="expert-witness-glass-card">
            <div className="grid-2" style={{ alignItems: 'center', gap: 'var(--space-10)' }}>
              {/* Left Column: Legal Scope */}
              <div>
                <div className="expert-eyebrow-pill">
                  <Scale size={16} className="text-white" aria-hidden="true" />
                  <span>Civil Procedure Rules (CPR) Part 35 Compliant</span>
                </div>

                <h2 className="expert-card-title">
                  {expertWitnessService.name}
                </h2>

                <p className="expert-card-desc">
                  We provide independent, CPR Part 35 compliant expert witness reports, forensic defect audits, Scott Schedule contributions, and oral testimony at hearings for boundary demarcations, defective construction claims, subsidence causation, and surveyor negligence disputes across London and the South East.
                </p>

                <div className="expert-cta-group">
                  <Button to="/expert-witness" variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                    Explore Expert Witness Practice
                  </Button>
                  <Button to="/expert-witness#instruction" variant="outline-white" size="md">
                    Instruct An Expert
                  </Button>
                </div>
              </div>

              {/* Right Column: Dispute Typology Cards */}
              <div className="expert-disputes-panel">
                <h4 className="expert-panel-heading">
                  Primary Dispute Areas Covered:
                </h4>
                <ul className="expert-disputes-list">
                  {expertWitnessService.disputeCategories.map((cat, idx) => (
                    <li key={idx} className="expert-dispute-item">
                      <div className="dispute-bullet" />
                      <span>{cat}</span>
                    </li>
                  ))}
                </ul>

                <div className="expert-panel-footer">
                  <span className="duty-notice">Overriding duty is to the Court under CPR Part 35</span>
                  <Link to="/expert-witness" className="expert-link-sm">
                    <span>View Instruction Protocol</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 10. 4-STEP CLIENT PROCESS SECTION */}
      <section
        ref={processRef}
        className={`section workflow-process-section reveal-init ${processVisible ? 'is-revealed' : ''}`}
        aria-label="Surveying Workflow"
      >
        <Container>
          <StepProcess />
        </Container>
      </section>

      {/* 11. TARGET SERVICE COVERAGE SECTION (Pure Navy Blue Background) */}
      <section
        ref={coverageRef}
        className={`section section-alt regional-coverage-section reveal-init ${coverageVisible ? 'is-revealed' : ''}`}
        aria-label="Regional Coverage"
      >
        <Container>
          <CoverageMap />
        </Container>
      </section>

      {/* 12. DEDICATED FIXED-FEE QUOTATION SUITE (With Instant 60s & Detailed Form Switcher) */}
      <section
        id="quote-section"
        ref={quoteSuiteRef}
        className={`section dedicated-quote-section reveal-init ${quoteSuiteVisible ? 'is-revealed' : ''}`}
        aria-label="Request a Fixed-Fee Survey Quote"
      >
        <Container isNarrow>
          <div className="quote-suite-header text-center">
            <span className="section-eyebrow">Fixed-Fee Quotation Engine</span>
            <h2 className="section-heading-title">Request Your Fixed-Fee Survey Quote</h2>
            <p className="section-heading-subtitle">
              Receive a transparent, fixed quotation with zero hidden fees. Our independent surveyors inspect properties throughout London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire.
            </p>
          </div>

          <div className="quote-suite-card-wrap">
            {/* Mode Switcher: Instant 60s Calculator or Detailed Form */}
            <div className="calc-mode-switch flex justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => setUseInstantCalc(true)}
                className={`calc-mode-btn ${useInstantCalc ? 'is-active' : ''}`}
              >
                <Sparkles size={14} className="mr-1 text-amber-400" />
                <span>Instant Postcode Estimate (60s)</span>
              </button>
              <button
                type="button"
                onClick={() => setUseInstantCalc(false)}
                className={`calc-mode-btn ${!useInstantCalc ? 'is-active' : ''}`}
              >
                <SlidersHorizontal size={14} className="mr-1" />
                <span>Full Fixed-Fee Survey Form</span>
              </button>
            </div>

            {useInstantCalc ? (
              <InstantQuoteCalculator />
            ) : (
              <QuoteRequestForm defaultServiceId={prefilledService} />
            )}
          </div>

          <div className="quote-suite-reassurance">
            <div className="reassurance-item">
              <ShieldCheck size={18} className="text-navy flex-shrink-0" />
              <span>No Obligation &bull; Strictly Confidential</span>
            </div>
            <div className="reassurance-item">
              <Clock size={18} className="text-navy flex-shrink-0" />
              <span>Quotes Issued Within 24 Business Hours</span>
            </div>
            <div className="reassurance-item">
              <Phone size={18} className="text-navy flex-shrink-0" />
              <span>Direct Phone Support: <strong>{siteConfig.contact.telephoneDisplay}</strong></span>
            </div>
          </div>
        </Container>
      </section>

      {/* 13. FINAL HIGH-IMPACT CLOSING CTA BANNER (Clean White Section) */}
      <section
        ref={ctaRef}
        className={`final-cta-section reveal-init ${ctaVisible ? 'is-revealed' : ''}`}
        aria-label="Closing Call to Action"
      >
        <Container isNarrow>
          <div className="final-cta-content text-center">
            <span className="final-cta-eyebrow">Ready to Protect Your Investment?</span>
            <h2 className="final-cta-title">
              Instruct an Independent Survey Before Exchange
            </h2>
            <p className="final-cta-desc">
              Make sure you understand the true condition of your prospective property. Receive an objective, detailed technical report delivered directly to your inbox.
            </p>
            <div className="final-cta-buttons">
              <a href="#quote-section" className="btn btn-primary btn-lg">
                <span>Request a Survey Quote</span>
                <ArrowRight size={18} />
              </a>
              <Button to="/contact" variant="outline-white" size="lg">
                Speak With A Surveyor
              </Button>
            </div>
            <div className="final-cta-footer-note">
              <span>Fast Turnaround &bull; RICS Standard Transparency &bull; Call: {siteConfig.contact.telephoneDisplay}</span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
