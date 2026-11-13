import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Phone, Mail, ShieldCheck, Clock, CheckCircle2, Compass, ArrowRight } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { QuoteRequestForm } from '../../components/forms/QuoteRequestForm';

export function RequestQuotePage() {
  const [searchParams] = useSearchParams();
  const defaultServiceId = searchParams.get('service') || '';

  useDocumentTitle(
    'Request a Fixed-Fee Survey Quote | NJS Property Group',
    'Request a written fixed-fee quotation for RICS Level 2 Homebuyer Surveys, Level 3 Building Surveys, Red Book Valuations, Snagging, or Damp Investigations.'
  );

  const breadcrumbs = [{ label: 'Request a Quote', path: '/request-quote' }];

  return (
    <div className="request-quote-page service-page luxury-site-canvas">
      {/* Hero Banner */}
      <header
        className="service-header-hero"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85)',
        }}
      >
        <div className="service-header-overlay" />
        <Container>
          <div className="service-header-content">
            <Breadcrumbs items={breadcrumbs} />
            <h1 className="page-header-title">Request a Fixed-Fee Survey Quote</h1>
            <p className="page-header-desc">
              Complete the property instruction details below to receive a clear, fixed-fee written quotation within 24 business hours — zero hidden costs or obligation.
            </p>

            <div className="service-meta-strip">
              <span className="service-meta-pill">
                <Clock size={14} className="text-white" />
                <span>Written Quotes Within 24 Hours</span>
              </span>
              <span className="service-meta-pill">
                <ShieldCheck size={14} className="text-white" />
                <span>RICS-Aligned Independent Practice</span>
              </span>
              <span className="service-meta-pill">
                <Phone size={14} className="text-white" />
                <span>Hotline: {siteConfig.contact.telephoneDisplay}</span>
              </span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Quote Grid */}
      <section className="section">
        <Container>
          <div className="contact-detail-grid">
            {/* Left Column: Why Request + Decision Tool Helper + Direct Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 style={{ color: '#FFFFFF', marginBottom: '0.5rem', fontWeight: 700 }}>
                  Tailored Survey Quotation
                </h2>
                <p className="contact-lead-text" style={{ color: '#CBD5E1', fontSize: 'var(--font-size-sm)', lineHeight: 1.65, margin: 0 }}>
                  Every property is assessed on age, construction type, location, and scope. Once submitted, your enquiry goes straight to our surveying desk at{' '}
                  <strong style={{ color: '#FFFFFF' }}>{siteConfig.contact.email}</strong>.
                </p>
              </div>

              {/* What happens next card */}
              <div
                style={{
                  padding: '1.35rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                }}
              >
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.85rem' }}>
                  What Happens After You Submit?
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem', color: '#334155' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                    <span>Instant confirmation &amp; dispatch to our surveying office ({siteConfig.contact.email}).</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                    <span>Fixed-fee written quotation &amp; earliest available inspection date within 24 hours.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                    <span>Full Terms of Engagement issued before key collection &amp; inspection booking.</span>
                  </li>
                </ul>
              </div>

              {/* Helper CTA to What Survey Do I Need? */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
                  <Compass size={18} style={{ color: '#032954' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Not Sure Which Survey You Need?
                  </h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.55, marginBottom: '0.85rem' }}>
                  Use our quick multi-option selector to compare Level 2 Homebuyer, Level 3 Building Survey, and New-Build Snagging for your property.
                </p>
                <Link
                  to="/what-survey-do-i-need"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#032954',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  <span>Open “What Survey Do I Need?” Tool</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Direct Call / Email Card */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #CBD5E1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Phone size={18} style={{ color: '#032954', flexShrink: 0 }} />
                  <a
                    href={`tel:${siteConfig.contact.telephone}`}
                    style={{ fontSize: '1rem', fontWeight: 800, color: '#032954', textDecoration: 'none' }}
                  >
                    {siteConfig.contact.telephoneDisplay}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail size={18} style={{ color: '#032954', flexShrink: 0 }} />
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    style={{ fontSize: '0.88rem', fontWeight: 700, color: '#032954', textDecoration: 'none' }}
                  >
                    {siteConfig.contact.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Quote Request Form */}
            <div id="quote">
              <QuoteRequestForm key={defaultServiceId || 'default'} defaultServiceId={defaultServiceId} />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default RequestQuotePage;

