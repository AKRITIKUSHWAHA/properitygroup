import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Scale,
  Phone,
  Building,
  ChevronRight,
  Clock
} from 'lucide-react';
import { expertWitnessService } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { CredentialsBanner } from '../../components/common/CredentialsBanner';
import { CoverageMap } from '../../components/common/CoverageMap';
import { StepProcess } from '../../components/common/StepProcess';
import { QuoteRequestForm } from '../../components/forms/QuoteRequestForm';
import { ArchitecturalHero } from '../../components/hero/ArchitecturalHero';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export function HomePage() {
  useDocumentTitle(
    "Independent RICS-Aligned Property Surveys & Valuations",
    "Specialist property surveys across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Homebuyer Level 2, Building Survey Level 3, Snagging, Valuations, and Damp Reports."
  );

  const [prefilledService, setPrefilledService] = useState('homebuyer-survey-level-2');

  const [credentialsRef, credentialsVisible] = useScrollReveal({ threshold: 0.05, rootMargin: '200px 0px 200px 0px' });
  const [expertRef, expertVisible] = useScrollReveal({ threshold: 0.05, rootMargin: '200px 0px 200px 0px' });
  const [processRef, processVisible] = useScrollReveal({ threshold: 0.05, rootMargin: '200px 0px 200px 0px' });
  const [coverageRef, coverageVisible] = useScrollReveal({ threshold: 0.05, rootMargin: '200px 0px 200px 0px' });
  const [quoteSuiteRef, quoteSuiteVisible] = useScrollReveal({ threshold: 0.05, rootMargin: '200px 0px 200px 0px' });

  // Smooth scroll to hash on load or page navigation
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    }
  }, []);

  return (
    <div className="home-page luxury-site-canvas">
      {/* 1. SIGNATURE ARCHITECTURAL HERO & UNIFIED 5-SERVICE SHOWCASE */}
      <ArchitecturalHero onQuoteClick={() => setPrefilledService('homebuyer-survey-level-2')} />

      {/* 2. PRACTICE LIVE METRICS STRIP (Verified Standards Only) */}
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

      {/* 3. CREDENTIALS & ACCREDITATIONS BANNER */}
      <div id="credentials" ref={credentialsRef} className={`reveal-init ${credentialsVisible ? 'is-revealed' : ''}`}>
        <CredentialsBanner />
      </div>

      {/* 4. OBJECTIVE INDEPENDENCE & BUYER PROTECTION PILLARS */}
      <section id="expertise" className="luxury-dark-section" aria-label="Independent Surveying Expertise">
        <Container>
          <div className="luxury-section-header">
            <span className="luxury-section-eyebrow">Pure Independence</span>
            <h2 className="luxury-section-title">Independent Buyer Protection</h2>
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

      {/* 5. DEDICATED EXPERT WITNESS & LITIGATION PRACTICE (CPR Part 35) */}
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

      {/* 6. 4-STEP CLIENT PROCESS SECTION */}
      <section
        ref={processRef}
        className={`section workflow-process-section reveal-init ${processVisible ? 'is-revealed' : ''}`}
        aria-label="Surveying Workflow"
      >
        <Container>
          <StepProcess />
        </Container>
      </section>

      {/* 7. TARGET SERVICE COVERAGE SECTION (London, Surrey, Oxon, Bucks, Berks) */}
      <section
        ref={coverageRef}
        className={`section section-alt regional-coverage-section reveal-init ${coverageVisible ? 'is-revealed' : ''}`}
        aria-label="Regional Coverage"
      >
        <Container>
          <CoverageMap />
        </Container>
      </section>

      {/* 8. DEDICATED FULL FIXED-FEE QUOTATION SUITE (Preserving All 11 Fields) */}
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
    </div>
  );
}
