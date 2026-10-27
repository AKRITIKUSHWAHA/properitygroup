import React from 'react';
import { CheckCircle2, Award, MapPin, Check, FileCheck, Scale, Banknote } from 'lucide-react';
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
    { label: "Services", path: "/#services" },
    { label: service.name, path: service.path }
  ];

  return (
    <div className="service-page">
      {/* Header Banner */}
      <header className="page-header">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-2)' }}>
            <Badge variant="gold">{service.badge}</Badge>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-silver-light)' }}>
              {service.ricsBenchmark}
            </span>
          </div>
          <h1>{service.name}</h1>
          <p className="page-header-desc">{service.tagline}</p>
        </Container>
      </header>

      {/* Main Content & Quote Request Grid */}
      <section className="section">
        <Container>
          <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'start' }}>
            {/* Left Column: RICS Red Book Valuation Guidance */}
            <div>
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h2>Authoritative RICS Red Book Property Valuations</h2>
                <p style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.7', color: 'var(--color-main-text)' }}>
                  A formal property valuation is a legally binding appraisal of open market value conducted strictly in accordance with the mandatory RICS Valuation — Global Standards (widely referred to as the 'Red Book'). Unlike automated estate agency estimates, an independent RICS Red Book valuation is supported by physical site inspection, verified Land Registry transactional evidence, and strict professional indemnity compliance.
                </p>
                <p style={{ lineHeight: '1.7', color: 'var(--color-muted-text)' }}>
                  Our reports are recognized and formally accepted by Homes England, major housing associations, HM Revenue &amp; Customs (HMRC), matrimonial solicitors, the Family Division of the High Court, and probate executors across London and the South East.
                </p>
              </div>

              {/* What the Valuation Process Includes */}
              <div style={{ marginBottom: 'var(--space-8)', backgroundColor: 'var(--color-light-grey)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-primary-navy)' }}>
                  What the Formal Valuation Process Delivers:
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {service.inclusions.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Specific Valuation Applications */}
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-primary-navy)' }}>
                  Key Valuation Purposes &amp; Requirements
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
                  {service.recommendedFor.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border-subtle)',
                        backgroundColor: 'var(--color-white)',
                        fontSize: 'var(--font-size-xs)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Check size={14} style={{ color: 'var(--color-primary-navy)' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help to Buy Compliance Note */}
              <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-5)', backgroundColor: 'var(--color-light-grey-alt)', border: '1px solid var(--color-border-medium)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ color: 'var(--color-primary-navy)', marginBottom: 'var(--space-2)' }}>
                  Help to Buy &amp; Shared Ownership Strict Guidelines
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-text)', lineHeight: '1.6' }}>
                  Homes England requires that Help to Buy equity loan redemption valuations must be undertaken by an RICS Registered Valuer who is independent of estate agency operations. The valuation is valid for 3 months from the inspection date. Our team formats and issues compliant reports ready for immediate portal submission.
                </p>
              </div>

              {/* Regional Market Knowledge */}
              <div style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-2)' }}>
                  <MapPin size={18} style={{ color: 'var(--color-primary-navy)' }} />
                  <span>Nuanced Regional Property Market Valuations</span>
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-text)' }}>
                  Property capital values, leasehold ground rent risks, and micro-location variations demand true regional expertise. We provide accurate market valuations across London prime/suburban markets, Surrey commuter hubs, Oxfordshire heritage markets, Buckinghamshire growth centers, and Berkshire towns.
                </p>
              </div>
            </div>

            {/* Right Column: Sticky Quote Form */}
            <div style={{ position: 'sticky', top: '90px' }}>
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

