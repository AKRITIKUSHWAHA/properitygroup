import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Check,
  Camera,
  Sparkles,
  AlertCircle,
  Clock,
  Phone,
  Building,
  FileCheck2
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

export function SnaggingReportPage() {
  const service = approvedServices.find(s => s.id === 'snagging-report');

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
                <span>NHQB &amp; Warranty Standard Compliant</span>
              </span>
              <span className="service-meta-pill">
                <Clock size={14} className="text-white" />
                <span>Photographic Defect Schedule in 48-72h</span>
              </span>
              <span className="service-meta-pill">
                <Building size={14} className="text-white" />
                <span>New-Build Houses &amp; Apartments</span>
              </span>
              <span className="service-meta-pill">
                <Phone size={14} className="text-white" />
                <span>Direct Developer Care Formatted Report</span>
              </span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content & Quote Request Grid */}
      <section className="section">
        <Container>
          <div className="service-detail-grid">
            {/* Left Column: Forensic Snagging Guidance */}
            <div>
              {/* Overview Card */}
              <div className="service-overview-card">
                <h2 className="service-section-title">Independent Quality Inspection for New-Build Properties</h2>
                <p style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.7', color: 'var(--color-main-text)', marginBottom: '1rem' }}>
                  Purchasing a newly constructed home represents a substantial investment. While buyers rightfully anticipate flawless craftsmanship, fast-track developer build schedules and subcontracting pressures frequently result in cosmetic blemishes, regulatory non-compliance, and hidden operational defects.
                </p>
                <p style={{ lineHeight: '1.7', color: 'var(--color-muted-text)', margin: 0 }}>
                  Our independent snagging inspection provides an exhaustive room-by-room audit of your new-build property. We identify cosmetic defects, plumbing leaks, thermal bridging, defective insulation, window seal failures, and building regulation discrepancies, delivering a professionally formatted, photographic defect schedule engineered for direct submission to your developer’s customer care division.
                </p>
              </div>

              {/* Inclusions Card */}
              <div className="service-inclusions-card">
                <h3 className="service-section-title" style={{ fontSize: '1.25rem' }}>
                  What Our Forensic Snagging Audit Evaluates:
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

              {/* Timing Advice Box */}
              <div className="service-overview-card" style={{ border: '2px solid #142A43' }}>
                <h4 style={{ color: '#0F172A', marginBottom: '0.75rem', fontSize: '1.15rem', fontWeight: 700 }}>
                  When Should You Book a Snagging Inspection?
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.65', margin: 0 }}>
                  Under the New Homes Quality Board (NHQB) framework, buyers are entitled to instruct an independent pre-completion inspection (PCI) prior to handover. Alternatively, an inspection can be conducted immediately following key handover or at any point within the two-year developer warranty defect liability period.
                </p>
              </div>

              {/* Suitability & Warranty Standards */}
              <div className="service-overview-card">
                <h3 className="service-section-title" style={{ fontSize: '1.25rem' }}>
                  New-Build Warranty Alignment
                </h3>
                <p style={{ marginBottom: '1rem', color: 'var(--color-muted-text)', fontSize: '0.9rem' }}>
                  Our technical defect schedules are structured to hold housebuilders accountable under standard UK warranty and building code criteria:
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

              {/* Regional Housing Growth Context */}
              <div style={{ padding: '1.5rem', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.05rem', color: '#0F172A' }}>
                  <MapPin size={18} style={{ color: 'var(--color-primary-navy)' }} />
                  <span>Inspecting Developments Across South East Corridors</span>
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-muted-text)', margin: 0, lineHeight: 1.6 }}>
                  We routinely inspect new developments across London apartment complexes, Surrey commuter expansions, Oxford science-park housing belts, Milton Keynes masterplans in Buckinghamshire, and Thames Valley new communities in Berkshire.
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
