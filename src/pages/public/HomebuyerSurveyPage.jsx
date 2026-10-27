import React from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, MapPin, Check, FileText } from 'lucide-react';
import { approvedServices } from '../../config/services';
import { siteConfig } from '../../config/siteConfig';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { QuoteRequestForm } from '../../components/forms/QuoteRequestForm';
import { CoverageMap } from '../../components/common/CoverageMap';

export function HomebuyerSurveyPage() {
  const service = approvedServices.find(s => s.id === 'homebuyer-survey-level-2');

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
            {/* Left Column: Deep Technical Guidance */}
            <div>
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h2>What is a Homebuyer Survey (Level 2)?</h2>
                <p style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.7', color: 'var(--color-main-text)' }}>
                  The RICS Level 2 Homebuyer Survey is the UK’s most commissioned residential inspection, purposefully engineered for modern and conventional properties in reasonable structural order. It provides an objective assessment of visible structural elements, roof coverings, fabric condition, and building services using an intuitive traffic-light condition rating.
                </p>
                <p style={{ lineHeight: '1.7', color: 'var(--color-muted-text)' }}>
                  Unlike a basic mortgage valuation (which merely verifies whether the asset represents adequate security for a lender’s loan), our Level 2 Homebuyer Report is commissioned entirely on your behalf to uncover urgent repairs, hidden defects, damp indications, and future maintenance liabilities before legal exchange of contracts.
                </p>
              </div>

              {/* What the Inspection Includes */}
              <div style={{ marginBottom: 'var(--space-8)', backgroundColor: 'var(--color-light-grey)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-primary-navy)' }}>
                  What the Level 2 Inspection Includes:
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

              {/* Who is This Service Suitable For */}
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-primary-navy)' }}>
                  Property Suitability Criteria
                </h3>
                <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-muted-text)', fontSize: 'var(--font-size-sm)' }}>
                  The Level 2 survey is designed specifically for conventional residential forms:
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

              {/* Traffic Light System Explanation */}
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-primary-navy)' }}>
                  RICS Condition Ratings Explained
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', gap: '1rem', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)' }}>
                    <strong style={{ color: 'var(--color-success)', minWidth: '70px' }}>Condition 1:</strong>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-main-text)' }}>No repair is currently needed. Normal maintenance must be undertaken in the usual way.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)' }}>
                    <strong style={{ color: 'var(--color-warning)', minWidth: '70px' }}>Condition 2:</strong>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-main-text)' }}>Defects requiring repair or replacement, but are not considered to be serious or urgent.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)' }}>
                    <strong style={{ color: 'var(--color-danger)', minWidth: '70px' }}>Condition 3:</strong>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-main-text)' }}>Critical defects requiring urgent repair, further specialist investigation, or immediate safety remedy.</span>
                  </div>
                </div>
              </div>

              {/* Local Regional Context */}
              <div style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-2)' }}>
                  <MapPin size={18} style={{ color: 'var(--color-primary-navy)' }} />
                  <span>Regional Focus: London &amp; Home Counties</span>
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-text)' }}>
                  Our surveyors possess specific insight into 20th-century housing stock across London boroughs, Surrey commuter expansions, Oxford residential belts, Buckinghamshire suburbs, and Berkshire towns.
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

