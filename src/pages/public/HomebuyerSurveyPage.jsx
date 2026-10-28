import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Check,
  FileText,
  Clock,
  Phone,
  Building,
  HelpCircle
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

export function HomebuyerSurveyPage() {
  const service = approvedServices.find(s => s.id === 'homebuyer-survey-level-2');

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
                <span>RICS Benchmark Level 2</span>
              </span>
              <span className="service-meta-pill">
                <Clock size={14} className="text-white" />
                <span>3 – 5 Business Day Turnaround</span>
              </span>
              <span className="service-meta-pill">
                <Building size={14} className="text-white" />
                <span>Conventional Homes Built Post-1900</span>
              </span>
              <span className="service-meta-pill">
                <Phone size={14} className="text-white" />
                <span>Surveyor Phone Consultation Included</span>
              </span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content & Quote Request Grid */}
      <section className="section">
        <Container>
          <div className="service-detail-grid">
            {/* Left Column: Deep Technical Guidance */}
            <div>
              {/* Overview Card */}
              <div className="service-overview-card">
                <h2 className="service-section-title">What is an RICS Homebuyer Survey (Level 2)?</h2>
                <p style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.7', color: 'var(--color-main-text)', marginBottom: '1rem' }}>
                  The RICS Level 2 Homebuyer Survey is the UK’s most commissioned residential inspection, purposefully engineered for modern and conventional properties in reasonable structural order. It provides an objective assessment of visible structural elements, roof coverings, fabric condition, and building services using an intuitive traffic-light condition rating.
                </p>
                <p style={{ lineHeight: '1.7', color: 'var(--color-muted-text)', margin: 0 }}>
                  Unlike a basic mortgage valuation (which merely verifies whether the asset represents adequate security for a lender’s loan), our Level 2 Homebuyer Report is commissioned entirely on your behalf to uncover urgent repairs, hidden defects, damp indications, and future maintenance liabilities before legal exchange of contracts.
                </p>
              </div>

              {/* Inclusions Card */}
              <div className="service-inclusions-card">
                <h3 className="service-section-title" style={{ fontSize: '1.25rem' }}>
                  Comprehensive Inspection Scope:
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

              {/* Property Suitability Criteria */}
              <div className="service-overview-card">
                <h3 className="service-section-title" style={{ fontSize: '1.25rem' }}>
                  Property Suitability Criteria
                </h3>
                <p style={{ marginBottom: '1rem', color: 'var(--color-muted-text)', fontSize: '0.9rem' }}>
                  The Level 2 survey is designed specifically for conventional residential forms:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {service.recommendedFor.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--color-border-subtle)',
                        backgroundColor: '#F8FAFC',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 500,
                        color: '#1E293B'
                      }}
                    >
                      <Check size={14} style={{ color: 'var(--color-primary-navy)', flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Light System Explanation */}
              <div className="service-overview-card">
                <h3 className="service-section-title" style={{ fontSize: '1.25rem' }}>
                  RICS Condition Ratings Explained
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)' }}>
                    <strong style={{ color: 'var(--color-success)', minWidth: '85px', flexShrink: 0 }}>Condition 1:</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-main-text)' }}>No repair is currently needed. Normal maintenance must be undertaken in the usual way.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)' }}>
                    <strong style={{ color: 'var(--color-warning)', minWidth: '85px', flexShrink: 0 }}>Condition 2:</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-main-text)' }}>Defects requiring repair or replacement, but are not considered to be serious or urgent.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)' }}>
                    <strong style={{ color: 'var(--color-danger)', minWidth: '85px', flexShrink: 0 }}>Condition 3:</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-main-text)' }}>Critical defects requiring urgent repair, further specialist investigation, or immediate safety remedy.</span>
                  </div>
                </div>
              </div>

              {/* Local Regional Context */}
              <div style={{ padding: '1.5rem', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.05rem', color: '#0F172A' }}>
                  <MapPin size={18} style={{ color: 'var(--color-primary-navy)' }} />
                  <span>Regional Focus: London &amp; Home Counties</span>
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-muted-text)', margin: 0, lineHeight: 1.6 }}>
                  Our surveyors possess specific insight into 20th-century housing stock across London boroughs, Surrey commuter expansions, Oxford residential belts, Buckinghamshire suburbs, and Berkshire towns.
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
