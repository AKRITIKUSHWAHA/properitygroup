import React from 'react';
import { CheckCircle2, ShieldCheck, MapPin, Check, Droplets, Wind, AlertCircle } from 'lucide-react';
import { approvedServices } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { QuoteRequestForm } from '../../components/forms/QuoteRequestForm';
import { CoverageMap } from '../../components/common/CoverageMap';

export function DampSurveyPage() {
  const service = approvedServices.find(s => s.id === 'damp-survey');

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
            {/* Left Column: Scientific Damp & Timber Guidance */}
            <div>
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h2>Independent Moisture Diagnostics Free From Sales Bias</h2>
                <p style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.7', color: 'var(--color-main-text)' }}>
                  Damp is among the most frequently cited defects in UK residential survey reports, yet it remains one of the most widely misdiagnosed. Many commercial damp-proofing contractors offer 'free surveys' primarily to sell disruptive, expensive chemical injection treatments, waterproof tanking, or unnecessary plaster destruction.
                </p>
                <p style={{ lineHeight: '1.7', color: 'var(--color-muted-text)' }}>
                  As independent building surveyors, we do not sell damp-proofing products, chemical treatments, or contracting services. Our specialist damp surveys employ calibrated moisture metering, hygrometric readings, and thermal imaging to scientifically differentiate between true rising damp, external penetrating moisture, internal condensation, and historic hygroscopic salt contamination, delivering unbiased remediation strategies.
                </p>
              </div>

              {/* What the Diagnostic Inspection Includes */}
              <div style={{ marginBottom: 'var(--space-8)', backgroundColor: 'var(--color-light-grey)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-primary-navy)' }}>
                  What Our Specialist Damp &amp; Timber Investigation Delivers:
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

              {/* Classification of Damp Problems */}
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-primary-navy)' }}>
                  Diagnostic Differentiation: Understanding The Real Cause
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
                  <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)' }}>
                    <strong style={{ color: 'var(--color-primary-navy)', display: 'block', marginBottom: '0.25rem' }}>
                      Penetrating Damp:
                    </strong>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted-text)' }}>
                      Caused by external defects like leaking gutters, cracked render, high ground levels, or defective pointing allowing rainwater entry.
                    </span>
                  </div>
                  <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)' }}>
                    <strong style={{ color: 'var(--color-primary-navy)', display: 'block', marginBottom: '0.25rem' }}>
                      Condensation &amp; Mould:
                    </strong>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted-text)' }}>
                      Caused by insufficient ventilation, thermal bridging, and elevated indoor humidity—often mistaken for rising damp.
                    </span>
                  </div>
                  <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)' }}>
                    <strong style={{ color: 'var(--color-primary-navy)', display: 'block', marginBottom: '0.25rem' }}>
                      Rising Damp:
                    </strong>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted-text)' }}>
                      Capillary action drawing subsoil moisture through porous masonry where a DPC is absent, bridged, or failed.
                    </span>
                  </div>
                  <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)' }}>
                    <strong style={{ color: 'var(--color-primary-navy)', display: 'block', marginBottom: '0.25rem' }}>
                      Timber Decay (Rot/Woodworm):
                    </strong>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted-text)' }}>
                      Investigation of floor joists, wall plates, and rafters for wet rot (Coniophora) or true dry rot (Serpula lacrymans).
                    </span>
                  </div>
                </div>
              </div>

              {/* Independent Guarantee Box */}
              <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-5)', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ color: 'var(--color-success)', marginBottom: 'var(--space-2)' }}>
                  Why Impartiality Saves Thousands of Pounds
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-main-text)', lineHeight: '1.6' }}>
                  Commercial damp firms earn profit from selling plaster removal and chemical injections. In over 80% of properties we inspect, the moisture issue is caused by simple maintenance defects—such as high external path levels bridging the damp-proof course, or blocked subfloor air bricks—which can be remedied without expensive chemical work.
                </p>
              </div>

              {/* Regional Damp Context */}
              <div style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-2)' }}>
                  <MapPin size={18} style={{ color: 'var(--color-primary-navy)' }} />
                  <span>Damp &amp; Timber Investigation Across The Region</span>
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-text)' }}>
                  From Victorian solid-brick basements in London and Surrey, to solid limestone cottages in Oxfordshire and riverside properties along Berkshire's Thames corridor, our diagnostic methods respect the building's historic construction and breathability.
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

