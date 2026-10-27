import React from 'react';
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
  ExternalLink
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

export function HomePage() {
  useDocumentTitle(
    "Independent RICS-Aligned Property Surveys & Valuations",
    "Specialist property surveys across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Homebuyer Level 2, Building Survey Level 3, Snagging, Valuations, and Damp Reports."
  );

  return (
    <div className="home-page">
      {/* 1. HERO SLIDER SECTION (Master Spec Part 5.2 & Redesign Spec Part 3) */}
      <HeroSlider>
        <QuoteRequestForm />
      </HeroSlider>

      {/* 2. CREDENTIALS & ACCREDITATIONS BANNER (Glassmorphic Polish) */}
      <CredentialsBanner />

      {/* 3. EDITORIAL SURVEY SERVICES SECTION (Master Spec Part 5.3 & Redesign Spec Part 5) */}
      <section id="services" className="section section-alt services-editorial-section" aria-label="Core Surveying Services">
        <Container>
          <SectionHeading
            eyebrow="Approved Survey Disciplines"
            title="Professional Surveying Services Tailored to Your Property"
            subtitle="Every residential property is architecturally distinct. Select the appropriate level of technical inspection based on property age, structural form, and condition."
          />

          {/* Balanced, Uniform Grid: All 5 Core Survey Services with Identical Dimensions & Image Aspect Ratios */}
          <div className="services-uniform-grid">
            {approvedServices.map(service => (
              <article key={service.id} className="editorial-service-card group">
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
                  <h3 className="card-title">
                    <Link to={service.path}>{service.name}</Link>
                  </h3>
                  <p className="card-desc">{service.summary}</p>

                  {/* Curated Key Inclusions Checklist */}
                  <div className="card-inclusions-list">
                    <span className="inclusions-heading">Inspection Highlights:</span>
                    {service.inclusions.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="inclusion-item">
                        <Check size={14} className="text-gold flex-shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Refined Action Footer */}
                  <div className="card-action-footer">
                    <Link to={service.path} className="card-details-link">
                      <span>View Service Details</span>
                      <ArrowRight size={14} className="arrow-icon" aria-hidden="true" />
                    </Link>
                    <Button to={`/contact?service=${service.id}#quote`} size="sm" variant="secondary">
                      Get Quote
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. DEDICATED EXPERT WITNESS & LITIGATION PRACTICE (Redesign Spec Part 6) */}
      <section className="section expert-witness-banner-section" aria-label="Expert Witness Services Callout">
        <Container>
          <div className="expert-witness-glass-card">
            <div className="grid-2" style={{ alignItems: 'center', gap: 'var(--space-10)' }}>
              {/* Left Column: Legal Scope */}
              <div>
                <div className="expert-eyebrow-pill">
                  <Scale size={16} className="text-gold" aria-hidden="true" />
                  <span>Civil Procedure Rules (CPR) Part 35 Compliant</span>
                </div>

                <h2 className="expert-card-title">
                  {expertWitnessService.name}
                </h2>

                <p className="expert-card-desc">
                  We provide independent, CPR Part 35 compliant expert witness reports, forensic defect audits, Scott Schedule contributions, and oral testimony at hearings for boundary demarcations, defective construction claims, subsidence causation, and surveyor negligence disputes across London and the South East.
                </p>

                <div className="expert-cta-group">
                  <Button to="/expert-witness" variant="gold" size="md" icon={ArrowRight} iconPosition="right">
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

      {/* 5. 4-STEP CLIENT PROCESS SECTION */}
      <section className="section" aria-label="Surveying Workflow">
        <Container>
          <StepProcess />
        </Container>
      </section>

      {/* 6. TARGET SERVICE COVERAGE SECTION (London, Surrey, Oxon, Bucks, Berks) */}
      <section className="section section-alt" aria-label="Regional Coverage">
        <Container>
          <CoverageMap />
        </Container>
      </section>

      {/* 7. FINAL HIGH-IMPACT CTA BANNER */}
      <section className="final-cta-section" aria-label="Closing Call to Action">
        <div className="final-cta-overlay" />
        <Container isNarrow>
          <div className="final-cta-content text-center">
            <span className="final-cta-eyebrow">Ready to Protect Your Investment?</span>
            <h2 className="final-cta-title">
              Request Your Fixed-Fee Survey Quote Today
            </h2>
            <p className="final-cta-desc">
              Our independent surveyors inspect properties throughout London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Receive an objective, detailed technical report delivered directly to your inbox.
            </p>
            <div className="final-cta-buttons">
              <Button href="#quote" variant="gold" size="lg" icon={ArrowRight} iconPosition="right">
                Request a Survey Quote
              </Button>
              <Button to="/contact" variant="outline-white" size="lg">
                Speak With A Surveyor
              </Button>
            </div>
            <div className="final-cta-footer-note">
              <span>Fast Turnaround &bull; RICS Standard Transparency &bull; No Obligation Quotation</span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
