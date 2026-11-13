import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Scale,
  Award,
  CheckCircle2,
  FileCheck2,
  Building2,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { CredentialsBanner } from '../../components/common/CredentialsBanner';

export function ProfessionalStandardsPage() {
  useDocumentTitle(
    'Professional Standards Notice | NJS Property Group',
    'Our commitment to RICS Home Survey Standards, complete practice independence, Red Book valuations, CPR Part 35 compliance, and CEDR independent redress.'
  );

  const breadcrumbs = [
    { label: 'About & Contact', path: '/contact' },
    { label: 'Professional Standards Notice', path: '/professional-standards-notice' },
  ];

  const pillars = [
    {
      icon: ShieldCheck,
      badge: 'RICS Home Survey Standard',
      title: 'Independent Practice & Fiduciary Loyalty',
      body: 'Every residential inspection, defect schedule, and valuation report is prepared solely for our instructing client. NJS Property Group maintains strict operational independence from estate agency panels, mortgage lenders, builders, and remedial repair contractors.',
    },
    {
      icon: Award,
      badge: 'RICS Red Book Appraisals',
      title: 'Valuation & Reporting Benchmarked Rigour',
      body: 'Market valuations for Help to Buy, shared ownership, probate, capital gains tax, and matrimonial division follow RICS Valuation – Global Standards (Red Book) methodology, supported by verified local comparable transactions.',
    },
    {
      icon: CheckCircle2,
      badge: 'Non-Commercial Diagnostics',
      title: 'Unbiased Damp & Structural Assessment',
      body: 'Diagnostic moisture investigations follow Property Care Association (PCA) technical guidance. Because we never manufacture, supply, or install chemical treatments or building works, every recommendation is strictly objective.',
    },
    {
      icon: Scale,
      badge: 'CPR Part 35 Compliant',
      title: 'Court-Admissible Expert Witness Duty',
      body: 'When instructed in residential boundary, construction defect, or housing disrepair proceedings, our surveyors adhere to Civil Procedure Rules (CPR Part 35), holding a paramount duty to the Court over any commercial consideration.',
    },
  ];

  return (
    <div className="professional-standards-page service-page luxury-site-canvas">
      {/* Architectural Hero Banner */}
      <header
        className="service-header-hero"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1920&q=85)',
        }}
      >
        <div className="service-header-overlay" />
        <Container>
          <div className="service-header-content">
            <Breadcrumbs items={breadcrumbs} />
            <h1 className="page-header-title">Professional Standards Notice</h1>
            <p className="page-header-desc">
              Governance, ethical independence, RICS-aligned inspection benchmarks, and statutory consumer protection across every survey commission undertaken by NJS Property Group.
            </p>

            <div className="service-meta-strip">
              <span className="service-meta-pill">
                <ShieldCheck size={14} className="text-white" />
                <span>RICS Home Survey Standard Aligned</span>
              </span>
              <span className="service-meta-pill">
                <Scale size={14} className="text-white" />
                <span>CPR Part 35 Compliant</span>
              </span>
              <span className="service-meta-pill">
                <FileCheck2 size={14} className="text-white" />
                <span>CEDR Independent Stage 2 Redress</span>
              </span>
            </div>
          </div>
        </Container>
      </header>

      {/* Core Standards Grid (High-Contrast White Cards) */}
      <section className="section">
        <Container>
          <div style={{ maxWidth: '780px', marginBottom: '2.25rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#34D399',
                display: 'block',
                marginBottom: '0.45rem',
              }}
            >
              Regulatory Conduct &amp; Quality Assurance
            </span>
            <h2 style={{ color: '#FFFFFF', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 800, margin: '0 0 0.6rem 0' }}>
              Our Practice Standards &amp; Code of Conduct
            </h2>
            <p style={{ color: '#CBD5E1', fontSize: '0.94rem', lineHeight: 1.65, margin: 0 }}>
              Clear, accountable standards protect property purchasers, homeowners, and legal representatives before exchange or formal proceedings.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '18px',
                    padding: '1.6rem',
                    border: '1px solid #CBD5E1',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '11px',
                        backgroundColor: '#0B1F4D',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#032954',
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Terms, PII, and CEDR Governance Notice Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '2rem',
              border: '1px solid #CBD5E1',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#0B1F4D',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', display: 'block' }}>
                  Practice Disclosures
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Terms, Insurance &amp; Independent Complaints Redress (CEDR)
                </h3>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
              }}
            >
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem 0' }}>
                  Written Terms of Engagement
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.55, fontWeight: 500 }}>
                  Clear, plain-English Terms of Engagement confirming inspection scope, limitations, fee structure, and turnaround are issued for review before any site inspection proceeds.
                </p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem 0' }}>
                  Professional Indemnity &amp; Data Protection
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.55, fontWeight: 500 }}>
                  Full Professional Indemnity Insurance (PII) maintained by {siteConfig.legalName} (Company No. {siteConfig.companyNumber}) alongside strict UK GDPR data handling at {siteConfig.contact.address.line1}, {siteConfig.contact.address.city} {siteConfig.contact.address.postcode}.
                </p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem 0' }}>
                  Complaints Handling &amp; CEDR Redress
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.55, fontWeight: 500 }}>
                  Stage 1 internal complaints are investigated by our Nominated Officer at{' '}
                  <a href={`mailto:${siteConfig.contact.email}`} style={{ color: '#2563EB', textDecoration: 'underline' }}>
                    {siteConfig.contact.email}
                  </a>
                  . Unresolved Stage 2 complaints may be referred directly to CEDR.{' '}
                  <Link to="/contact#complaints" style={{ color: '#032954', fontWeight: 700, textDecoration: 'underline' }}>
                    View full CHP &rarr;
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Credentials Summary Banner & Accredited Logos */}
      <CredentialsBanner />

      <section className="py-12 bg-slate-900/90 border-t border-slate-800">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Need Fixed-Fee Survey Guidance?</h3>
              <p className="text-xs sm:text-sm text-slate-300 m-0">
                Request your written quotation online or call our surveying office on{' '}
                <strong className="text-white">{siteConfig.contact.telephoneDisplay}</strong>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button to="/request-quote" variant="gold" size="md" icon={ArrowRight} iconPosition="right">
                Request a Quote
              </Button>
              <a
                href={`tel:${siteConfig.contact.telephone}`}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-2"
                style={{ color: '#FFFFFF' }}
              >
                <Phone size={14} />
                <span>{siteConfig.contact.telephoneDisplay}</span>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default ProfessionalStandardsPage;

