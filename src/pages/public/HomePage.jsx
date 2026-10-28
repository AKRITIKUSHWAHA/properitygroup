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
  Sparkles,
  SlidersHorizontal
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

  const [useInstantCalc, setUseInstantCalc] = useState(true);

  const [credentialsRef, credentialsVisible] = useScrollReveal({ threshold: 0.1 });
  const [selectorRef, selectorVisible] = useScrollReveal({ threshold: 0.1 });
  const [servicesRef, servicesVisible] = useScrollReveal({ threshold: 0.08 });
  const [trafficLightRef, trafficLightVisible] = useScrollReveal({ threshold: 0.1 });
  const [sampleReportRef, sampleReportVisible] = useScrollReveal({ threshold: 0.1 });
  const [reviewsRef, reviewsVisible] = useScrollReveal({ threshold: 0.1 });
  const [expertRef, expertVisible] = useScrollReveal({ threshold: 0.12 });
  const [processRef, processVisible] = useScrollReveal({ threshold: 0.1 });
  const [coverageRef, coverageVisible] = useScrollReveal({ threshold: 0.1 });
  const [ctaRef, ctaVisible] = useScrollReveal({ threshold: 0.15 });

  return (
    <div className="home-page">
      {/* 1. HERO SLIDER SECTION WITH INSTANT POSTCODE CALCULATOR (esurv style) */}
      <HeroSlider>
        <div className="hero-calculator-container">
          {/* Toggle between Instant 60s Calculator & Full Form */}
          <div className="calc-mode-switch">
            <button
              type="button"
              onClick={() => setUseInstantCalc(true)}
              className={`calc-mode-btn ${useInstantCalc ? 'is-active' : ''}`}
            >
              <Sparkles size={13} className="mr-1 text-amber-400" />
              <span>Instant Postcode Quote (60s)</span>
            </button>
            <button
              type="button"
              onClick={() => setUseInstantCalc(false)}
              className={`calc-mode-btn ${!useInstantCalc ? 'is-active' : ''}`}
            >
              <SlidersHorizontal size={13} className="mr-1" />
              <span>Detailed Form</span>
            </button>
          </div>

          {useInstantCalc ? (
            <InstantQuoteCalculator />
          ) : (
            <QuoteRequestForm />
          )}
        </div>
      </HeroSlider>

      {/* 1.5. PRACTICE LIVE METRICS STRIP */}
      <div className="practice-metrics-ticker">
        <Container>
          <div className="metrics-ticker-inner">
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">100%</span>
              <span className="metric-ticker-label">RICS-Aligned Independent Practice</span>
            </div>
            <div className="metric-ticker-sep" aria-hidden="true" />
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">1,200+</span>
              <span className="metric-ticker-label">Residential Reports Delivered</span>
            </div>
            <div className="metric-ticker-sep" aria-hidden="true" />
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">48 Hours</span>
              <span className="metric-ticker-label">Fast Report Digital Turnaround</span>
            </div>
            <div className="metric-ticker-sep" aria-hidden="true" />
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">4.8 / 5 ★</span>
              <span className="metric-ticker-label">Rated Excellent on Trustpilot</span>
            </div>
          </div>
        </Container>
      </div>

      {/* 2. CREDENTIALS & ACCREDITATIONS BANNER */}
      <div ref={credentialsRef} className={`reveal-init ${credentialsVisible ? 'is-revealed' : ''}`}>
        <CredentialsBanner />
      </div>

      {/* 3. INTERACTIVE "WHICH SURVEY DO I NEED?" TOOL (esurv benchmark) */}
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
            eyebrow="Approved Survey Disciplines"
            title="Professional Surveying Services Tailored to Your Property"
            subtitle="Every residential property is architecturally distinct. Select the appropriate level of technical inspection based on property age, structural form, and condition."
          />

          {/* Balanced, Uniform Grid: All 5 Core Survey Services with Real UK Imagery & Starting Prices */}
          <div className="services-uniform-grid">
            {approvedServices.map(service => (
              <article key={service.id} className="editorial-service-card group stagger-item">
                {/* Visual Image Header with Subtle Zoom */}
                <div className="card-image-wrap">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="card-image"
                    loading="lazy"
                  />
                  <div className="card-image-overlay" />
                  <span className="card-floating-badge">{service.badge}</span>
                  <span className="card-benchmark-tag">{service.ricsBenchmark}</span>
                </div>

                {/* Card Content Body */}
                <div className="card-body">
                  <div className="card-price-strip">
                    <span className="price-tag">
                      {service.id === 'homebuyer-survey-level-2' && 'From £425 inc VAT'}
                      {service.id === 'building-survey-level-3' && 'From £650 inc VAT'}
                      {service.id === 'snagging-report' && 'From £350 inc VAT'}
                      {service.id === 'valuation-report' && 'From £320 inc VAT'}
                      {service.id === 'damp-survey' && 'From £380 inc VAT'}
                    </span>
                    <span className="turnaround-tag">48h Delivery</span>
                  </div>

                  <h3 className="card-title">
                    <Link to={service.path}>{service.name}</Link>
                  </h3>
                  <p className="card-desc">{service.summary}</p>

                  {/* Curated Key Inclusions Checklist */}
                  <div className="card-inclusions-list">
                    <span className="inclusions-heading">Inspection Highlights:</span>
                    {service.inclusions.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="inclusion-item">
                        <Check size={14} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Refined Action Footer */}
                  <div className="card-action-footer">
                    <Link to={service.path} className="card-details-link">
                      <span>View Full Service Scope</span>
                      <ArrowRight size={14} className="arrow-icon" aria-hidden="true" />
                    </Link>
                    <Button to={`/contact?service=${service.id}#quote`} size="sm" variant="gold">
                      Get Quote
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. TRAFFIC-LIGHT DEFECT RATINGS EXPLAINED (esurv Signature Feature) */}
      <div ref={trafficLightRef} className={`reveal-init ${trafficLightVisible ? 'is-revealed' : ''}`}>
        <TrafficLightRatings />
      </div>

      {/* 6. SAMPLE RICS REPORT PREVIEW & DOWNLOAD (esurv Benchmark) */}
      <div ref={sampleReportRef} className={`reveal-init ${sampleReportVisible ? 'is-revealed' : ''}`}>
        <SampleReportSection />
      </div>

      {/* 7. VERIFIED CLIENT REVIEWS & TRUSTPILOT 4.8★ SOCIAL PROOF */}
      <div ref={reviewsRef} className={`reveal-init ${reviewsVisible ? 'is-revealed' : ''}`}>
        <ReviewsSection />
      </div>

      {/* 8. DEDICATED EXPERT WITNESS & LITIGATION PRACTICE */}
      <section
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
                  <Scale size={16} className="text-sky-400" aria-hidden="true" />
                  <span>Civil Procedure Rules (CPR) Part 35 Compliant</span>
                </div>

                <h2 className="expert-card-title">
                  {expertWitnessService.name}
                </h2>

                <p className="expert-card-desc">
                  We provide independent, CPR Part 35 compliant expert witness reports, forensic defect audits, Scott Schedule contributions, and oral testimony at hearings for boundary demarcations, defective construction claims, subsidence causation, and surveyor negligence disputes across London and the South East.
                </p>

                <div className="expert-cta-group">
                  <Button to="/expert-witness" variant="outline-white" size="md" icon={ArrowRight} iconPosition="right">
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

      {/* 9. 4-STEP CLIENT PROCESS SECTION */}
      <section
        ref={processRef}
        className={`section reveal-init ${processVisible ? 'is-revealed' : ''}`}
        aria-label="Surveying Workflow"
      >
        <Container>
          <StepProcess />
        </Container>
      </section>

      {/* 10. TARGET SERVICE COVERAGE SECTION (London, Surrey, Oxon, Bucks, Berks) */}
      <section
        ref={coverageRef}
        className={`section section-alt reveal-init ${coverageVisible ? 'is-revealed' : ''}`}
        aria-label="Regional Coverage"
      >
        <Container>
          <CoverageMap />
        </Container>
      </section>

      {/* 11. FINAL HIGH-IMPACT CTA BANNER */}
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
              Request Your Fixed-Fee Survey Quote in 60 Seconds
            </h2>
            <p className="final-cta-desc">
              Our independent surveyors inspect properties throughout London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Receive an objective, detailed technical report with clear traffic-light condition ratings delivered within 48 to 72 hours.
            </p>
            <div className="final-cta-buttons">
              <Button href="#quote" variant="outline-white" size="lg" icon={ArrowRight} iconPosition="right">
                Instant Online Quote
              </Button>
              <Button to="/contact" variant="outline-white" size="lg">
                Speak With A Surveyor
              </Button>
            </div>
            <div className="final-cta-footer-note">
              <span>Fast Turnaround &bull; RICS Standard Transparency &bull; 48-Hour Report Delivery</span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
