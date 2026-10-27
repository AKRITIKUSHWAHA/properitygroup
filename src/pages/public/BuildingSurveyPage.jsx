import React from 'react';
import { CheckCircle2, ShieldCheck, MapPin, Check, AlertTriangle, Layers, Home } from 'lucide-react';
import { approvedServices } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { QuoteRequestForm } from '../../components/forms/QuoteRequestForm';
import { CoverageMap } from '../../components/common/CoverageMap';

export function BuildingSurveyPage() {
  const service = approvedServices.find(s => s.id === 'building-survey-level-3');

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
            {/* Left Column: Deep Structural Guidance */}
            <div>
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h2>Comprehensive Structural Investigation (Level 3)</h2>
                <p style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.7', color: 'var(--color-main-text)' }}>
                  The RICS Level 3 Building Survey represents the most rigorous, detailed property inspection available in the UK residential sector. Formerly known as a Full Structural Survey, it is specifically commissioned for older properties, architecturally complex structures, listed buildings, and homes that have undergone extensive alterations or show evidence of structural movement.
                </p>
                <p style={{ lineHeight: '1.7', color: 'var(--color-muted-text)' }}>
                  Our surveyors conduct an exhaustive physical investigation into structural fabric integrity, roof trusses, subfloor cavities, foundation stability, moisture transmission, and historic building materials. The resultant report provides a prioritized defect remediation schedule, technical repair advice, and analysis of the consequences of inaction.
                </p>
              </div>

              {/* What the Level 3 Investigation Includes */}
              <div style={{ marginBottom: 'var(--space-8)', backgroundColor: 'var(--color-light-grey)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-primary-navy)' }}>
                  What the Level 3 Structural Inspection Includes:
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

              {/* Suitability Criteria */}
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-primary-navy)' }}>
                  When is a Level 3 Building Survey Essential?
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

              {/* Level 2 vs Level 3 Comparison Box */}
              <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-5)', border: '1px solid var(--color-border-medium)', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ color: 'var(--color-primary-navy)', marginBottom: 'var(--space-3)' }}>
                  Key Difference: Level 2 vs Level 3 Building Survey
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)' }}>
                  <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-light-grey)', borderRadius: 'var(--radius-md)' }}>
                    <strong>Level 2 Homebuyer Survey:</strong>
                    <p style={{ marginTop: '0.25rem', color: 'var(--color-muted-text)' }}>
                      Concise visual overview focusing on urgent defects in standard, modern properties post-1900. No detailed repair specifications.
                    </p>
                  </div>
                  <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-accent-gold-soft)', borderRadius: 'var(--radius-md)' }}>
                    <strong>Level 3 Building Survey:</strong>
                    <p style={{ marginTop: '0.25rem', color: 'var(--color-primary-dark)' }}>
                      Exhaustive structural appraisal, materials specification, diagnosis of underlying defect causes, and comprehensive long-term maintenance advice.
                    </p>
                  </div>
                </div>
              </div>

              {/* Regional Structural Context */}
              <div style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-2)' }}>
                  <MapPin size={18} style={{ color: 'var(--color-primary-navy)' }} />
                  <span>Period &amp; Heritage Properties Across The Region</span>
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-text)' }}>
                  Our building surveyors have deep familiarity with period London Victorian and Edwardian conversions, clay subsoil subsidence in Surrey and Berkshire, timber-framed Buckinghamshire barns, and historic Cotswold stone architecture across Oxfordshire.
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

