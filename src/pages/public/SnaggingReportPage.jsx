import React from 'react';
import { CheckCircle2, ShieldCheck, MapPin, Check, Camera, Sparkles, AlertCircle } from 'lucide-react';
import { approvedServices } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { QuoteRequestForm } from '../../components/forms/QuoteRequestForm';
import { CoverageMap } from '../../components/common/CoverageMap';

export function SnaggingReportPage() {
  const service = approvedServices.find(s => s.id === 'snagging-report');

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
            {/* Left Column: Forensic Snagging Guidance */}
            <div>
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h2>Independent Quality Inspection for New-Build Properties</h2>
                <p style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.7', color: 'var(--color-main-text)' }}>
                  Purchasing a newly constructed home represents a substantial investment. While buyers rightfully anticipate flawless craftsmanship, fast-track developer build schedules and subcontracting pressures frequently result in cosmetic blemishes, regulatory non-compliance, and hidden operational defects.
                </p>
                <p style={{ lineHeight: '1.7', color: 'var(--color-muted-text)' }}>
                  Our independent snagging inspection provides an exhaustive room-by-room audit of your new-build property. We identify cosmetic defects, plumbing leaks, thermal bridging, defective insulation, window seal failures, and building regulation discrepancies, delivering a professionally formatted, photographic defect schedule engineered for direct submission to your developer’s customer care division.
                </p>
              </div>

              {/* What the Snagging Report Includes */}
              <div style={{ marginBottom: 'var(--space-8)', backgroundColor: 'var(--color-light-grey)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-primary-navy)' }}>
                  What Our Forensic Snagging Audit Evaluates:
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

              {/* Suitability & Warranty Standards */}
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-primary-navy)' }}>
                  New-Build Warranty Alignment
                </h3>
                <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-muted-text)', fontSize: 'var(--font-size-sm)' }}>
                  Our technical defect schedules are structured to hold housebuilders accountable under standard UK warranty and building code criteria:
                </p>
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

              {/* Timing Advice Box */}
              <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-5)', backgroundColor: 'var(--color-accent-gold-soft)', border: '1px solid rgba(197, 155, 39, 0.3)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ color: 'var(--color-primary-dark)', marginBottom: 'var(--space-2)' }}>
                  When Should You Book a Snagging Inspection?
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-main-text)', lineHeight: '1.6' }}>
                  Under the New Homes Quality Board (NHQB) framework, buyers are entitled to instruct an independent pre-completion inspection (PCI) prior to handover. Alternatively, an inspection can be conducted immediately following key handover or at any point within the two-year developer warranty defect liability period.
                </p>
              </div>

              {/* Regional Housing Growth Context */}
              <div style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-2)' }}>
                  <MapPin size={18} style={{ color: 'var(--color-primary-navy)' }} />
                  <span>Inspecting Developments Across South East Corridors</span>
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-text)' }}>
                  We routinely inspect new developments across London apartment complexes, Surrey commuter expansions, Oxford science-park housing belts, Milton Keynes masterplans in Buckinghamshire, and Thames Valley new communities in Berkshire.
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

