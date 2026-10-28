import React from 'react';
import { Scale, ShieldCheck, CheckCircle2, FileText, Users, ArrowRight, Gavel, HelpCircle, Phone, Mail } from 'lucide-react';
import { expertWitnessService } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ExpertWitnessForm } from '../../components/forms/ExpertWitnessForm';

export function ExpertWitnessPage() {
  useDocumentTitle(
    expertWitnessService.meta.title,
    expertWitnessService.meta.description
  );

  const breadcrumbs = [
    { label: "Legal & Disputes", path: "/expert-witness" },
    { label: "Expert Witness", path: "/expert-witness" }
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: 'var(--space-2)' }}>
              <Badge variant="gold">Civil Litigation Practice</Badge>
              <span style={{ fontSize: 'var(--font-size-xs)', color: '#CBD5E1', fontWeight: 600 }}>
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
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h2>Independent Technical Evidence for Property Disputes</h2>
                <p style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.7', color: 'var(--color-main-text)' }}>
                  When contentious property disputes escalate to formal litigation, arbitration, or pre-action dispute resolution, courts and tribunals require impartial, objective technical evidence. As independent expert surveyors, our duty in expert witness matters is defined by Civil Procedure Rules (CPR) Part 35: our overriding duty is to the Court, rather than to the instructing client.
                </p>
                <p style={{ lineHeight: '1.7', color: 'var(--color-muted-text)' }}>
                  We provide CPR Part 35 compliant expert reports, advisory technical audits, Scott Schedule contributions, joint expert meetings, and oral testimony at hearings across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire.
                </p>
              </div>

              {/* Target Audiences (Master Spec Part 7 Item 4) */}
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-primary-navy)' }}>
                  Intended Audiences &amp; Instructing Parties
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)' }}>
                  {expertWitnessService.targetAudiences.map((aud, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border-subtle)',
                        backgroundColor: 'var(--color-light-grey)'
                      }}
                    >
                      <h4 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-navy)', marginBottom: '0.25rem' }}>
                        {aud.title}
                      </h4>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted-text)', margin: 0 }}>
                        {aud.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispute Categories Covered */}
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-primary-navy)' }}>
                  Dispute Disciplines &amp; Case Typologies
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
                  {expertWitnessService.disputeCategories.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Scale size={16} style={{ color: 'var(--color-accent-gold)', flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5-Step Instruction Process (Master Spec Part 7 Item 3) */}
              <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)', backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border-medium)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-primary-navy)' }}>
                  The Expert Witness Instruction Process
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {expertWitnessService.instructionProcess.map(step => (
                    <div key={step.step} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary-navy)',
                          color: 'var(--color-white)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}
                      >
                        {step.step}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-navy)', marginBottom: '0.25rem' }}>
                          {step.title}
                        </h4>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted-text)', margin: 0 }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Credentials & Transparency Safeguard (Master Spec Part 7 Item 2) */}
              <div style={{ padding: 'var(--space-5)', backgroundColor: 'var(--color-light-grey-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                <h4 style={{ color: 'var(--color-primary-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-2)' }}>
                  <ShieldCheck size={18} />
                  <span>Professional Credentials Notice</span>
                </h4>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted-text)', lineHeight: '1.6' }}>
                  In accordance with professional rules, individual surveyor CVs, full statements of courtroom appearance experience, and practicing certificate numbers are confirmed upon formal instruction inquiry. No unverified legal appointments or court credentials are fabricated on this public website.
                </p>
              </div>
            </div>

            {/* Right Column: Separate Expert Witness Enquiry Form (Master Spec Part 7 Item 5) */}
            <div id="instruction" className="service-quote-sidebar">
              <ExpertWitnessForm />
            </div>
          </div>
        </Container>
      </section>

      {/* Direct Contact Banner */}
      <section className="section section-navy" aria-label="Legal Practice Contact">
        <Container isNarrow>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'var(--color-white)', marginBottom: 'var(--space-2)' }}>
              Urgent Court Deadlines or Pre-Action Inquiries?
            </h2>
            <p style={{ color: 'var(--color-silver-light)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
              Contact our legal instruction coordinator directly for immediate conflict check verification and instruction availability.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: 'var(--font-size-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} style={{ color: 'var(--color-accent-gold)' }} />
                <a href={`tel:${siteConfig.contact.telephone}`} style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                  {siteConfig.contact.telephoneDisplay}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} style={{ color: 'var(--color-accent-gold)' }} />
                <span style={{ color: 'var(--color-white)' }}>{siteConfig.contact.email}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

