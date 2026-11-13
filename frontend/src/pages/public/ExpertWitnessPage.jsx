import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  Users,
  ArrowRight,
  Gavel,
  Phone,
  Mail,
  Building,
  Building2,
  Shield,
} from 'lucide-react';
import { expertWitnessService } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Badge } from '../../components/common/Badge';
import { ExpertWitnessForm } from '../../components/forms/ExpertWitnessForm';

const AUDIENCE_ICONS = [Building2, Gavel, Shield, Users];

export function ExpertWitnessPage() {
  useDocumentTitle(
    expertWitnessService.meta.title,
    expertWitnessService.meta.description
  );

  const breadcrumbs = [
    { label: 'Survey Services', path: '/#services' },
    { label: 'Expert Witness & Litigation', path: '/expert-witness' },
  ];

  return (
    <div className="expert-witness-page service-page luxury-site-canvas">
      {/* High-Impact Architectural Header Banner */}
      <header
        className="service-header-hero"
        style={{ backgroundImage: `url(${expertWitnessService.imageUrl})` }}
      >
        <div className="service-header-overlay" />
        <Container>
          <div className="service-header-content">
            <Breadcrumbs items={breadcrumbs} />
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem', marginBottom: 'var(--space-2)' }}>
              <Badge variant="gold">Civil Litigation Practice</Badge>
              <span style={{ fontSize: 'var(--font-size-xs)', color: '#E2E8F0', fontWeight: 600 }}>
                {expertWitnessService.cprCompliance}
              </span>
            </div>
            <h1 className="page-header-title">{expertWitnessService.name}</h1>
            <p className="page-header-desc">{expertWitnessService.tagline}</p>

            {/* Service Metadata Strip */}
            <div className="service-meta-strip">
              <span className="service-meta-pill">
                <Scale size={14} className="text-white" />
                <span>Civil Procedure Rules (CPR) Part 35</span>
              </span>
              <span className="service-meta-pill">
                <ShieldCheck size={14} className="text-white" />
                <span>Overriding Duty to the Court</span>
              </span>
              <span className="service-meta-pill">
                <Building size={14} className="text-white" />
                <span>Scott Schedules &amp; Quantum Diagnostics</span>
              </span>
              <span className="service-meta-pill">
                <Phone size={14} className="text-white" />
                <span>Solicitor &amp; Direct Litigation Instructions</span>
              </span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Section */}
      <section className="section">
        <Container>
          <div className="expert-detail-grid">
            {/* Left Column: Legal Context & Scope */}
            <div>
              {/* Introduction */}
              <div className="service-overview-card">
                <span className="expert-section-eyebrow">CPR Part 35 &bull; Independent Technical Duty</span>
                <h2 className="service-section-title">Independent Technical Evidence for Property Disputes</h2>
                <p style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.7', color: '#F8FAFC', marginBottom: '1rem' }}>
                  When contentious property disputes escalate to formal litigation, arbitration, or pre-action dispute resolution, courts and tribunals require impartial, objective technical evidence. As independent expert surveyors, our duty in expert witness matters is defined by Civil Procedure Rules (CPR) Part 35: our overriding duty is to the Court, rather than to the instructing client.
                </p>
                <p style={{ lineHeight: '1.7', color: '#CBD5E1', margin: 0 }}>
                  We provide CPR Part 35 compliant expert reports, advisory technical audits, Scott Schedule contributions, joint expert meetings, and oral testimony at hearings across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire.
                </p>
              </div>

              {/* Target Audiences (2x2 clean grid) */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#FFFFFF', fontSize: '1.35rem', fontWeight: 700 }}>
                  Intended Audiences &amp; Instructing Parties
                </h3>
                <div className="expert-audience-grid">
                  {expertWitnessService.targetAudiences.map((aud, idx) => {
                    const AudienceIcon = AUDIENCE_ICONS[idx % AUDIENCE_ICONS.length];
                    return (
                      <div key={idx} className="expert-audience-card">
                        <div className="expert-audience-icon">
                          <AudienceIcon size={18} />
                        </div>
                        <h4>{aud.title}</h4>
                        <p>{aud.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dispute Categories Covered */}
              <div className="service-inclusions-card">
                <h3 className="service-section-title" style={{ fontSize: '1.3rem' }}>
                  Dispute Disciplines &amp; Case Typologies
                </h3>
                <div className="expert-disciplines-grid">
                  {expertWitnessService.disputeCategories.map((item, idx) => (
                    <div key={idx} className="expert-discipline-item">
                      <Scale size={16} className="expert-discipline-icon" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-Step Instruction Process */}
              <div className="expert-process-card">
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ marginBottom: '0.25rem' }}>
                    The Expert Witness Instruction Process
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#475569' }}>
                    Structured workflow from initial conflict screening to CPR Part 35 report delivery and tribunal support.
                  </p>
                </div>
                <div className="expert-process-steps">
                  {expertWitnessService.instructionProcess.map((step) => (
                    <div key={step.step} className="expert-process-step-row">
                      <div className="step-number-badge">{step.step}</div>
                      <div>
                        <h4>{step.title}</h4>
                        <p>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Credentials & Transparency Safeguard */}
              <div className="expert-credentials-notice">
                <h4>
                  <ShieldCheck size={18} />
                  <span>Professional Credentials Notice</span>
                </h4>
                <p style={{ marginBottom: '0.75rem' }}>
                  In accordance with professional rules, individual surveyor CVs, full statements of courtroom appearance experience, and practicing certificate numbers are confirmed upon formal instruction inquiry. No unverified legal appointments or court credentials are fabricated on this public website.
                </p>
                <Link
                  to="/professional-standards-notice"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#142A43',
                    textDecoration: 'none',
                  }}
                >
                  <span>Read our full Professional Standards Notice</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Column: Separate Expert Witness Enquiry Form */}
            <div id="instruction" className="service-quote-sidebar">
              <ExpertWitnessForm />
            </div>
          </div>
        </Container>
      </section>

      {/* Direct Contact Banner */}
      <section className="section section-navy expert-cta-band" aria-label="Legal Practice Contact">
        <Container isNarrow>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#FFFFFF', marginBottom: '0.65rem', fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)' }}>
              Urgent Court Deadlines or Pre-Action Inquiries?
            </h2>
            <p style={{ color: '#CBD5E1', fontSize: '0.95rem', marginBottom: '1.75rem', maxWidth: '620px', marginInline: 'auto' }}>
              Contact our legal instruction coordinator directly for immediate conflict check verification and instruction availability.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
              <a
                href={`tel:${siteConfig.contact.telephone}`}
                className="expert-cta-pill"
              >
                <Phone size={16} />
                <span>{siteConfig.contact.telephoneDisplay}</span>
              </a>
              <a
                href={`mailto:${siteConfig.contact.email}?subject=Expert%20Witness%20Instruction%20Enquiry`}
                className="expert-cta-pill expert-cta-pill-outline"
              >
                <Mail size={16} />
                <span>{siteConfig.contact.email}</span>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}


