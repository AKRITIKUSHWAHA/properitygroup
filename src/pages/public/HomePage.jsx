import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle,
  FileCheck,
  ArrowRight,
  Scale,
  Award,
  Clock,
  Compass,
  Building,
  Check,
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
  Sparkles
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

export function HomePage() {
  useDocumentTitle(
    "Independent RICS-Aligned Property Surveys & Valuations",
    "Specialist property surveys across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Homebuyer Level 2, Building Survey Level 3, Snagging, Valuations, and Damp Reports."
  );

  const [prefilledService, setPrefilledService] = useState('homebuyer-survey-level-2');
  const [selectedComparisonTab, setSelectedComparisonTab] = useState('survey-levels'); // 'survey-levels' | 'valuation-vs-survey'

  const [credentialsRef, credentialsVisible] = useScrollReveal({ threshold: 0.1 });
  const [servicesRef, servicesVisible] = useScrollReveal({ threshold: 0.08 });
  const [comparisonRef, comparisonVisible] = useScrollReveal({ threshold: 0.1 });
  const [trustRef, trustVisible] = useScrollReveal({ threshold: 0.1 });
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
                <span>Diagnostics</span>
              </div>
              <div className="luxury-secondary-overlay">
                <h3 className="luxury-card-title">Damp Survey</h3>
                <p className="luxury-card-desc">Scientific moisture investigation without contractor sales.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 1.5. PRACTICE LIVE METRICS STRIP (Verified Standards Only) */}
      <div className="practice-metrics-ticker">
        <Container>
          <div className="metrics-ticker-inner">
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">100%</span>
              <span className="metric-ticker-label">RICS-Aligned Independent Practice</span>
            </div>
            <div className="metric-ticker-sep" aria-hidden="true" />
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">Fixed-Fee</span>
              <span className="metric-ticker-label">Transparent Written Quotes with Zero Hidden Costs</span>
            </div>
            <div className="metric-ticker-sep" aria-hidden="true" />
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">3 – 5 Days</span>
              <span className="metric-ticker-label">Fast Report Delivery &amp; Direct Phone Debrief</span>
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

      {/* 2.5. ARCHITECTURAL LUXURY EXPERTISE & BUYER PROTECTION */}
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

      {/* 3. WHICH SURVEY DO I NEED? INTERACTIVE DECISION MATRIX */}
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
              <Scale size={16} aria-hidden="true" />
              <span>Mortgage Valuation vs Independent Survey</span>
            </button>
          </div>

          {/* Tab 1: Level 2 vs Level 3 Decision Matrix */}
          {selectedComparisonTab === 'survey-levels' && (
            <div className="survey-decision-cards-grid">
              {/* Level 2 Card */}
              <div className="decision-matrix-card level-2-decision">
                <div className="matrix-card-header">
                  <div className="matrix-badge">Conventional &amp; Modern Homes</div>
                  <h3 className="matrix-title">Homebuyer Survey (Level 2)</h3>
                  <p className="matrix-summary">
                    An essential condition report identifying urgent defects, damp indications, and timber decay in conventional properties.
                  </p>
                </div>

                <div className="matrix-attributes-list">
                  <div className="matrix-attribute">
                    <span className="attr-title">Property Age:</span>
                    <span className="attr-value">Constructed post-1900</span>
                  </div>
                  <div className="matrix-attribute">
                    <span className="attr-title">Construction:</span>
                    <span className="attr-value">Standard brick, tile, cavity walls</span>
                  </div>
                  <div className="matrix-attribute">
                    <span className="attr-title">Condition:</span>
                    <span className="attr-value">Reasonable order, no major visible distress</span>
                  </div>
                  <div className="matrix-attribute">
                    <span className="attr-title">Defect Ratings:</span>
                    <span className="attr-value">Standard RICS 1-2-3 Condition Ratings</span>
                  </div>
                  <div className="matrix-attribute">
                    <span className="attr-title">Report Depth:</span>
                    <span className="attr-value">Visual non-invasive condition assessment</span>
                  </div>
                </div>

                <div className="matrix-footer">
                  <Link to="/services/homebuyer-survey-level-2" className="matrix-link">
                    <span>Full Level 2 Details</span>
                    <ArrowRight size={14} />
                  </Link>
                  <a
                    href="#quote-section"
                    onClick={() => setPrefilledService('homebuyer-survey-level-2')}
                    className="btn btn-primary btn-sm"
                  >
                    Quote Level 2
                  </a>
                </div>
              </div>

              {/* Level 3 Card */}
              <div className="decision-matrix-card level-3-decision highlight-card">
                <div className="matrix-popular-tag">Maximum Structural Depth</div>
                <div className="matrix-card-header">
                  <div className="matrix-badge">Period, Altered &amp; Listed Properties</div>
                  <h3 className="matrix-title">Building Survey (Level 3)</h3>
                  <p className="matrix-summary">
                    The most comprehensive non-invasive property investigation available. In-depth diagnosis of structural integrity and repair schedules.
                  </p>
                </div>

                <div className="matrix-attributes-list">
                  <div className="matrix-attribute">
                    <span className="attr-title">Property Age:</span>
                    <span className="attr-value">Pre-1900 or period Victorian / Edwardian / Georgian</span>
                  </div>
                  <div className="matrix-attribute">
                    <span className="attr-title">Construction:</span>
                    <span className="attr-value">Non-standard (timber frame, stone, cob) or heavily altered</span>
                  </div>
                  <div className="matrix-attribute">
                    <span className="attr-title">Condition:</span>
                    <span className="attr-value">In disrepair, structural cracks, or significant damp symptoms</span>
                  </div>
                  <div className="matrix-attribute">
                    <span className="attr-title">Remediation:</span>
                    <span className="attr-value">Prioritized repair schedule with consequences of inaction</span>
                  </div>
                  <div className="matrix-attribute">
                    <span className="attr-title">Report Depth:</span>
                    <span className="attr-value">Exhaustive fabric, roof frame, foundations &amp; subfloor audit</span>
                  </div>
                </div>

                <div className="matrix-footer">
                  <Link to="/services/building-survey-level-3" className="matrix-link">
                    <span>Full Level 3 Details</span>
                    <ArrowRight size={14} />
                  </Link>
                  <a
                    href="#quote-section"
                    onClick={() => setPrefilledService('building-survey-level-3')}
                    className="btn btn-primary btn-sm"
                  >
                    Quote Level 3
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Mortgage Valuation vs Independent Survey (e.surv Essential) */}
          {selectedComparisonTab === 'valuation-vs-survey' && (
            <div className="valuation-comparison-wrap">
              <div className="valuation-table-card">
                <div className="table-responsive">
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: '40%' }}>Inspection Factor</th>
                        <th scope="col" className="text-center" style={{ width: '30%', backgroundColor: '#F1F5F9' }}>
                          Lender Mortgage Valuation
                        </th>
                        <th scope="col" className="text-center highlight-head" style={{ width: '30%' }}>
                          Independent RICS Survey
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Whose Interests Are Protected?</strong></td>
                        <td className="text-center text-muted">The Mortgage Bank / Lender only</td>
                        <td className="text-center text-success font-bold">100% You (The Buyer)</td>
                      </tr>
                      <tr>
                        <td><strong>Inspection Time on Site</strong></td>
                        <td className="text-center text-muted">15 – 25 minutes brief walk-through</td>
                        <td className="text-center text-success font-bold">2 – 4 hours rigorous examination</td>
                      </tr>
                      <tr>
                        <td><strong>Roof Voids, Chimneys &amp; Drainage</strong></td>
                        <td className="text-center text-danger"><XCircle size={18} className="inline-block text-danger" /> Not inspected</td>
                        <td className="text-center text-success"><CheckCircle2 size={18} className="inline-block text-success" /> Meticulously inspected</td>
                      </tr>
                      <tr>
                        <td><strong>Defect Diagnosis &amp; Remediation Advice</strong></td>
                        <td className="text-center text-danger"><XCircle size={18} className="inline-block text-danger" /> No defect advice given</td>
                        <td className="text-center text-success"><CheckCircle2 size={18} className="inline-block text-success" /> Clear diagnosis &amp; consequences</td>
                      </tr>
                      <tr>
                        <td><strong>Renegotiation Leverage</strong></td>
                        <td className="text-center text-muted">Zero legal leverage for buyer</td>
                        <td className="text-center text-success font-bold">Written evidence to renegotiate price</td>
                      </tr>
                      <tr>
                        <td><strong>Direct Phone Debrief with Surveyor</strong></td>
                        <td className="text-center text-danger"><XCircle size={18} className="inline-block text-danger" /> Not available</td>
                        <td className="text-center text-success font-bold">Direct telephone consultation included</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* 4. DEDICATED EXPERT WITNESS & LITIGATION PRACTICE (CPR Part 35) */}
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

      {/* 7. 4-STEP CLIENT PROCESS SECTION */}
      <section
        ref={processRef}
        className={`section workflow-process-section reveal-init ${processVisible ? 'is-revealed' : ''}`}
        aria-label="Surveying Workflow"
      >
        <Container>
          <StepProcess />
        </Container>
      </section>

      {/* 8. TARGET SERVICE COVERAGE SECTION (London, Surrey, Oxon, Bucks, Berks) */}
      <section
        ref={coverageRef}
        className={`section section-alt regional-coverage-section reveal-init ${coverageVisible ? 'is-revealed' : ''}`}
        aria-label="Regional Coverage"
      >
        <Container>
          <CoverageMap />
        </Container>
      </section>

      {/* 9. DEDICATED FULL FIXED-FEE QUOTATION SUITE (Preserving All 11 Fields) */}
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
            <QuoteRequestForm defaultServiceId={prefilledService} />
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

      {/* 10. FINAL HIGH-IMPACT CLOSING CTA BANNER */}
      <section
        ref={ctaRef}
        className={`final-cta-section reveal-init ${ctaVisible ? 'is-revealed' : ''}`}
        aria-label="Closing Call to Action"
      >
        <div className="final-cta-overlay" />
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
