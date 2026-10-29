import React from 'react';
import {
  CheckCircle2,
  Award,
  MapPin,
  Check,
  FileCheck,
  Scale,
  Banknote,
  ShieldCheck,
  Clock,
  Building,
  Phone
} from 'lucide-react';
import { approvedServices } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { QuoteRequestForm } from '../../components/forms/QuoteRequestForm';
import { CoverageMap } from '../../components/common/CoverageMap';

export function ValuationReportPage() {
  const service = approvedServices.find(s => s.id === 'valuation-report');

  useDocumentTitle(
    service.meta.title,
    service.meta.description
  );

  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/#services" },
    { label: service.name, path: service.path }
  ];

  return (
    <div className="service-page luxury-site-canvas">
      {/* High-Impact Architectural Header Banner */}
      <header
        className="service-header-hero"
        style={{ backgroundImage: `url(${service.imageUrl})` }}
      >
        <div className="service-header-overlay" />
        <Container>
          <div className="service-header-content">
            <Breadcrumbs items={breadcrumbs} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: 'var(--space-2)' }}>
              <Badge variant="gold">{service.badge}</Badge>
              <span style={{ fontSize: 'var(--font-size-xs)', color: '#CBD5E1', fontWeight: 600 }}>
                {service.ricsBenchmark}
              </span>
            </div>
            <h1 className="page-header-title">{service.name}</h1>
            <p className="page-header-desc">{service.tagline}</p>

            {/* Service Metadata Strip */}
            <div className="service-meta-strip">
              <span className="service-meta-pill">
                <ShieldCheck size={14} className="text-white" />
                <span>RICS Red Book Global Standards</span>
              </span>
              <span className="service-meta-pill">
                <Clock size={14} className="text-white" />
                <span>Delivered Within 3 – 5 Business Days</span>
              </span>
              <span className="service-meta-pill">
                <Building size={14} className="text-white" />
                <span>Accepted by Homes England, HMRC &amp; Courts</span>
              </span>
              <span className="service-meta-pill">
                <Phone size={14} className="text-white" />
                <span>Signed by RICS Registered Valuer</span>
              </span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content & Quote Request Grid */}
      <section className="section">
        <Container>
          <div className="service-detail-grid">
            {/* Left Column: RICS Red Book Valuation Guidance */}
            <div>
              {/* Overview Card */}
              <div className="service-overview-card">
                <h2 className="service-section-title">Authoritative RICS Red Book Property Valuations</h2>
                <p style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.7', color: 'var(--color-main-text)', marginBottom: '1rem' }}>
                  A formal property valuation is a legally binding appraisal of open market value conducted strictly in accordance with the mandatory RICS Valuation — Global Standards (widely referred to as the 'Red Book'). Unlike automated estate agency estimates, an independent RICS Red Book valuation is supported by physical site inspection, verified Land Registry transactional evidence, and strict professional indemnity compliance.
                </p>
                <p style={{ lineHeight: '1.7', color: 'var(--color-muted-text)', margin: 0 }}>
                  Our reports are recognized and formally accepted by Homes England, major housing associations, HM Revenue &amp; Customs (HMRC), matrimonial solicitors, the Family Division of the High Court, and probate executors across London and the South East.
                </p>
              </div>

              {/* Inclusions Card */}
              <div className="service-inclusions-card">
                <h3 className="service-section-title" style={{ fontSize: '1.25rem' }}>
                  What the Formal Valuation Process Delivers:
                </h3>
                <div className="inclusions-grid-2">
                  {service.inclusions.map((item, idx) => (
                    <div key={idx} className="inclusion-point-item">
                      <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help to Buy Compliance Note */}
              <div className="service-overview-card" style={{ border: '2px solid #142A43' }}>
                <h4 style={{ color: '#0F172A', marginBottom: '0.75rem', fontSize: '1.15rem', fontWeight: 700 }}>
                  Help to Buy &amp; Shared Ownership Strict Guidelines
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.65', margin: 0 }}>
                  Homes England requires that Help to Buy equity loan redemption valuations must be undertaken by an RICS Registered Valuer who is independent of estate agency operations. The valuation is valid for 3 months from the inspection date. Our team formats and issues compliant reports ready for immediate portal submission.
                </p>
              </div>

              {/* Specific Valuation Applications */}
              <div className="service-overview-card">
                <h3 className="service-section-title" style={{ fontSize: '1.25rem' }}>
                  Key Valuation Purposes &amp; Requirements
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {service.recommendedFor.map((item, idx) => (
                    <div
                      key={idx}
                      className="service-suitability-pill"
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 600,
                        color: '#0F172A'
                      }}
                    >
                      <Check size={14} style={{ color: '#142A43', flexShrink: 0 }} />
                      <span style={{ color: '#0F172A', fontWeight: 600 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regional Market Knowledge */}
              <div className="service-regional-card" style={{ padding: '1.5rem', border: '1px solid #CBD5E1', borderRadius: '16px', backgroundColor: '#FFFFFF', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.05rem', color: '#0F172A', fontWeight: 700 }}>
                  <MapPin size={18} style={{ color: '#142A43' }} />
                  <span style={{ color: '#0F172A' }}>Nuanced Regional Property Market Valuations</span>
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                  Property capital values, leasehold ground rent risks, and micro-location variations demand true regional expertise. We provide accurate market valuations across London prime/suburban markets, Surrey commuter hubs, Oxfordshire heritage markets, Buckinghamshire growth centers, and Berkshire towns.
                </p>
              </div>
            </div>

            {/* Right Column: Sticky Quote Form */}
            <div className="service-quote-sidebar">
              <QuoteRequestForm defaultServiceId={service.id} />
            </div>
          </div>
        </Container>
      </section>

      {/* Regional Coverage Subsection */}
      <section className="section section-alt">
        <Container>
          <CoverageMap isCompact showHeading={false} />
        </Container>
      </section>
    </div>
  );
}
