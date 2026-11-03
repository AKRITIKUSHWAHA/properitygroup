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
import { approvedServices, expertWitnessService } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { SectionHeading } from '../../components/common/SectionHeading';
import { CredentialsBanner } from '../../components/common/CredentialsBanner';
import { CoverageMap } from '../../components/common/CoverageMap';
import { StepProcess } from '../../components/common/StepProcess';
import { QuoteRequestForm } from '../../components/forms/QuoteRequestForm';
import { ArchitecturalHero } from '../../components/hero/ArchitecturalHero';
import { SurveySelector } from '../../components/home/SurveySelector';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export function HomePage() {
  useDocumentTitle(
    "Independent RICS-Aligned Property Surveys & Valuations",
    "Specialist property surveys across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Homebuyer Level 2, Building Survey Level 3, Snagging, Valuations, and Damp Reports."
  );

  const [prefilledService, setPrefilledService] = useState('homebuyer-survey-level-2');

  const [servicesRef, servicesVisible] = useScrollReveal({ threshold: 0.05, rootMargin: '200px 0px 200px 0px' });
  const [credentialsRef, credentialsVisible] = useScrollReveal({ threshold: 0.05, rootMargin: '200px 0px 200px 0px' });
  const [expertiseRef, expertiseVisible] = useScrollReveal({ threshold: 0.05, rootMargin: '200px 0px 200px 0px' });
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
      {/* 1. MINIMAL & SPACIOUS HERO SECTION (e.surv Architecture) */}
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

      {/* 3. CORE SURVEYING SERVICES SYSTEMATIC OVERVIEW */}
      <div id="services" style={{ position: 'relative', top: '-80px', height: 0 }} aria-hidden="true" />
      <section 
        id="services-overview" 
        ref={servicesRef} 
        className={`section services-overview-section reveal-init ${servicesVisible ? 'is-revealed' : ''}`}
        aria-label="Core Survey Services"
      >
        <Container>
          <div className="services-overview-header text-center">
            <span className="section-eyebrow">Core Surveying Practice</span>
            <h2 className="section-heading-title">Our Independent Survey Services</h2>
            <p className="section-heading-subtitle">
              Objective condition reports and valuations tailored to your property's age, construction, and legal requirements.
            </p>
          </div>

          <div className="services-overview-grid">
            {/* 1. Homebuyer Survey Level 2 */}
            <Link to="/services/homebuyer-survey-level-2" className="overview-service-card group">
              <div 
                className="overview-card-img"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=500&q=75')` }}
                role="img"
                aria-label="Homebuyer Survey Level 2"
              >
                <div className="overview-card-badge">Level 2</div>
              </div>
              <div className="overview-card-body">
                <h3 className="overview-card-title">Homebuyer Survey — Level 2</h3>
                <p className="overview-card-desc">
                  Clear condition report highlighting urgent defects, damp indications, and timber decay in post-1900 homes.
                </p>
                <span className="overview-card-action">
                  <span>Explore Level 2 Details</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* 2. Building Survey Level 3 (Featured) */}
            <Link to="/services/building-survey-level-3" className="overview-service-card featured-overview-card group">
              <div 
                className="overview-card-img"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=650&q=75')` }}
                role="img"
                aria-label="Building Survey Level 3"
              >
                <div className="overview-card-badge">Level 3</div>
              </div>
              <div className="overview-card-body">
                <h3 className="overview-card-title">Building Survey — Level 3</h3>
                <p className="overview-card-desc">
                  In-depth structural audit with prioritized repair schedules for older, altered, or complex properties.
                </p>
                <span className="overview-card-action">
                  <span>Explore Level 3 Details</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* 3. Snagging Report */}
            <Link to="/services/snagging-report" className="overview-service-card group">
              <div 
                className="overview-card-img"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=75')` }}
                role="img"
                aria-label="New-Build Snagging Report"
              >
                <div className="overview-card-badge">New-Build</div>
              </div>
              <div className="overview-card-body">
                <h3 className="overview-card-title">Snagging Report</h3>
                <p className="overview-card-desc">
                  Detailed inspection identifying cosmetic and technical defects before developer warranty handover.
                </p>
                <span className="overview-card-action">
                  <span>Explore Snagging Details</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* 4. Valuation Report */}
            <Link to="/services/valuation-report" className="overview-service-card group">
              <div 
                className="overview-card-img"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=500&q=75')` }}
                role="img"
                aria-label="Valuation Report"
              >
                <div className="overview-card-badge">Red Book</div>
              </div>
              <div className="overview-card-body">
                <h3 className="overview-card-title">Valuation Report</h3>
                <p className="overview-card-desc">
                  RICS Red Book market appraisals for Help to Buy, shared ownership, probate, and tax purposes.
                </p>
                <span className="overview-card-action">
                  <span>Explore Valuation Details</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* 5. Damp Survey */}
            <Link to="/services/damp-survey" className="overview-service-card group">
              <div 
                className="overview-card-img"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=75')` }}
                role="img"
                aria-label="Damp Survey"
              >
                <div className="overview-card-badge">Diagnostics</div>
              </div>
              <div className="overview-card-body">
                <h3 className="overview-card-title">Damp Survey</h3>
                <p className="overview-card-desc">
                  Scientific moisture diagnostics identifying damp and condensation without contractor sales bias.
                </p>
                <span className="overview-card-action">
                  <span>Explore Damp Details</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* 3B. INTERACTIVE SURVEY SELECTOR DECISION MATRIX */}
      <SurveySelector />

      {/* 4. CREDENTIALS & ACCREDITATIONS BANNER */}
      <div id="credentials" ref={credentialsRef} className={`reveal-init ${credentialsVisible ? 'is-revealed' : ''}`}>
        <CredentialsBanner />
      </div>

      {/* 5. OBJECTIVE INDEPENDENCE & BUYER PROTECTION PILLARS */}
      <section 
        id="expertise" 
        ref={expertiseRef} 
        className={`luxury-dark-section reveal-init ${expertiseVisible ? 'is-revealed' : ''}`} 
        aria-label="Independent Surveying Expertise"
      >
        <Container>
          <div className="luxury-section-header">
            <span className="luxury-section-eyebrow">Pure Independence</span>
            <h2 className="luxury-section-title">Independent Buyer Protection</h2>
            <p className="luxury-section-sub">
              Objective technical clarity and buyer protection with zero contractor conflicts of interest.
            </p>
          </div>

          <div className="luxury-pillars-grid">
            <div className="luxury-pillar-card">
              <div className="luxury-pillar-icon" aria-hidden="true">
                <ShieldCheck size={26} />
              </div>
              <h3 className="luxury-pillar-title">Zero Contractor Bias</h3>
              <p className="luxury-pillar-text">
                We provide diagnostic reports only. We never sell building work, damp treatments, or remedial contracting.
              </p>
            </div>

            <div className="luxury-pillar-card">
              <div className="luxury-pillar-icon" aria-hidden="true">
                <Phone size={26} />
              </div>
              <h3 className="luxury-pillar-title">Direct Surveyor Debrief</h3>
              <p className="luxury-pillar-text">
                Speak directly with the surveyor who inspected your property, before and after your report is delivered.
              </p>
            </div>

            <div className="luxury-pillar-card">
              <div className="luxury-pillar-icon" aria-hidden="true">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="luxury-pillar-title">Traffic-Light Defect Ratings</h3>
              <p className="luxury-pillar-text">
                Clear RICS 1-2-3 ratings highlight urgent defects so you can renegotiate repairs with confidence.
              </p>
            </div>

            <div className="luxury-pillar-card">
              <div className="luxury-pillar-icon" aria-hidden="true">
                <Building size={26} />
              </div>
              <h3 className="luxury-pillar-title">Survey vs Mortgage Valuation</h3>
              <p className="luxury-pillar-text">
                Mortgage valuations protect the lender's loan only. Our independent survey protects your purchase.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 6. DEDICATED EXPERT WITNESS & LITIGATION PRACTICE (CPR Part 35) */}
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
                  Independent, CPR Part 35 compliant expert witness reports, forensic defect audits, Scott Schedules, and dispute testimony across London and the South East.
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
              Transparent, fixed-fee quotes with zero hidden costs across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire.
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
