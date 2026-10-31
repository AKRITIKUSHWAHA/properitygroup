import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Check,
  AlertTriangle,
  Layers,
  Home,
  Clock,
  Phone,
  Building,
  FileCheck2,
  Download
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
import { downloadReportPDF } from '../../utils/pdfGenerator';

export function BuildingSurveyPage() {
  const service = approvedServices.find(s => s.id === 'building-survey-level-3');

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
                <span>RICS Benchmark Level 3</span>
              </span>
              <span className="service-meta-pill">
                <Clock size={14} className="text-white" />
                <span>3 – 5 Business Day Turnaround</span>
              </span>
              <span className="service-meta-pill">
                <Building size={14} className="text-white" />
                <span>Period, Altered &amp; Listed Properties</span>
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
            {/* Left Column: Deep Structural Guidance */}
            <div>
              {/* Overview Card */}
              <div className="service-overview-card">
                <h2 className="service-section-title">Comprehensive Structural Investigation (Level 3)</h2>
                <p style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.7', color: '#F8FAFC', marginBottom: '1rem' }}>
                  The RICS Level 3 Building Survey represents the most rigorous, detailed property inspection available in the UK residential sector. Formerly known as a Full Structural Survey, it is specifically commissioned for older properties, architecturally complex structures, listed buildings, and homes that have undergone extensive alterations or show evidence of structural movement.
                </p>
                <p style={{ lineHeight: '1.7', color: '#CBD5E1', margin: 0 }}>
                  Our surveyors conduct an exhaustive physical investigation into structural fabric integrity, roof trusses, subfloor cavities, foundation stability, moisture transmission, and historic building materials. The resultant report provides a prioritized defect remediation schedule, technical repair advice, and analysis of the consequences of inaction.
                </p>
              </div>

              {/* Inclusions Card */}
              <div className="service-inclusions-card">
                <h3 className="service-section-title" style={{ fontSize: '1.25rem' }}>
                  What the Level 3 Structural Inspection Includes:
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

              {/* Suitability Criteria */}
              <div className="service-overview-card">
                <h3 className="service-section-title" style={{ fontSize: '1.25rem' }}>
                  When is a Level 3 Building Survey Essential?
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

              {/* Level 2 vs Level 3 Comparison Box */}
              <div className="service-overview-card" style={{ border: '2px solid #142A43' }}>
                <h4 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '1.15rem', fontWeight: 700 }}>
                  Key Difference: Level 2 vs Level 3 Building Survey
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                  <div className="service-comparison-card" style={{ padding: '1rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
                    <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.35rem', fontWeight: 700 }}>Level 2 Homebuyer Survey:</strong>
                    <p style={{ color: '#334155', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                      Concise visual overview focusing on urgent defects in standard, modern properties post-1900. No detailed repair specifications.
                    </p>
                  </div>
                  <div className="service-comparison-card" style={{ padding: '1rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
                    <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.35rem', fontWeight: 700 }}>Level 3 Building Survey:</strong>
                    <p style={{ color: '#334155', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                      Exhaustive structural appraisal, materials specification, diagnosis of underlying defect causes, and comprehensive long-term maintenance advice.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Level 3 Report Download Card */}
              <div className="sample-report-download-card" style={{ padding: '1.25rem 1.5rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
                <div>
                  <h4 className="sample-report-title" style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Sample Level 3 Building Survey Report</h4>
                  <p className="sample-report-subtitle" style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0 0' }}>Review an anonymised comprehensive structural survey report with prioritized defects &amp; repairs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadReportPDF({
                    jobNo: 'SAMPLE-LVL3-2026',
                    clientName: 'Sample Client',
                    property: '42 Clarendon Road, Holland Park, London W11 2HR',
                    surveyType: 'RICS Level 3 Building Survey',
                    propertyType: 'Victorian Terraced Townhouse (c. 1885)',
                  })}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: 600, borderRadius: '10px' }}
                >
                  <Download size={15} />
                  <span>Download Sample PDF</span>
                </button>
              </div>

              {/* Regional Structural Context */}
              <div className="service-regional-card" style={{ padding: '1.5rem', border: '1px solid #CBD5E1', borderRadius: '16px', backgroundColor: '#FFFFFF', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.05rem', color: '#0F172A', fontWeight: 700 }}>
                  <MapPin size={18} style={{ color: '#142A43' }} />
                  <span style={{ color: '#0F172A' }}>Period &amp; Heritage Properties Across The Region</span>
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                  Our building surveyors have deep familiarity with period London Victorian and Edwardian conversions, clay subsoil subsidence in Surrey and Berkshire, timber-framed Buckinghamshire barns, and historic Cotswold stone architecture across Oxfordshire.
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
