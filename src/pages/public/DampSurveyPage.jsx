import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Check,
  Droplets,
  Wind,
  AlertCircle,
  Clock,
  Phone,
  Building,
  Scale
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

export function DampSurveyPage() {
  const service = approvedServices.find(s => s.id === 'damp-survey');

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
                <span>100% Impartial — Zero Contractor Sales</span>
              </span>
              <span className="service-meta-pill">
                <Clock size={14} className="text-white" />
                <span>Calibrated Radio &amp; Resistance Mapping</span>
              </span>
              <span className="service-meta-pill">
                <Building size={14} className="text-white" />
                <span>Targeted Root-Cause Defect Diagnosis</span>
              </span>
              <span className="service-meta-pill">
                <Phone size={14} className="text-white" />
                <span>Direct Surveyor Phone Consultation</span>
              </span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content & Quote Request Grid */}
      <section className="section">
        <Container>
          <div className="service-detail-grid">
            {/* Left Column: Scientific Damp & Timber Guidance */}
            <div>
              {/* Overview Card */}
              <div className="service-overview-card">
                <h2 className="service-section-title">Independent Moisture Diagnostics Free From Sales Bias</h2>
                <p style={{ fontSize: 'var(--font-size-md)', lineHeight: '1.7', color: '#F8FAFC', marginBottom: '1rem' }}>
                  Damp is among the most frequently cited defects in UK residential survey reports, yet it remains one of the most widely misdiagnosed. Many commercial damp-proofing contractors offer 'free surveys' primarily to sell disruptive, expensive chemical injection treatments, waterproof tanking, or unnecessary plaster destruction.
                </p>
                <p style={{ lineHeight: '1.7', color: '#CBD5E1', margin: 0 }}>
                  As independent building surveyors, we do not sell damp-proofing products, chemical treatments, or contracting services. Our specialist damp surveys employ calibrated moisture metering, hygrometric readings, and thermal imaging to scientifically differentiate between true rising damp, external penetrating moisture, internal condensation, and historic hygroscopic salt contamination, delivering unbiased remediation strategies.
                </p>
              </div>

              {/* Inclusions Card */}
              <div className="service-inclusions-card">
                <h3 className="service-section-title" style={{ fontSize: '1.25rem' }}>
                  What the Diagnostic Moisture Inspection Evaluates:
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

              {/* Contractor vs Independent Comparison Box */}
              <div className="service-overview-card" style={{ border: '2px solid #142A43' }}>
                <h4 style={{ color: '#0F172A', marginBottom: '0.75rem', fontSize: '1.15rem', fontWeight: 700 }}>
                  Why Independent Damp Diagnostics Save You Thousands
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.65', margin: 0 }}>
                  Contractor damp companies have a direct commercial interest in finding "rising damp" so they can quote £3,000 to £10,000 for chemical damp proof courses. In over 80% of our inspections, the actual culprit is high external ground levels, leaking rainwater goods, or poor internal ventilation. Our report gives you the true cause and the most economical, non-invasive fix.
                </p>
              </div>

              {/* Property Suitability Criteria */}
              <div className="service-overview-card">
                <h3 className="service-section-title" style={{ fontSize: '1.25rem' }}>
                  When is a Damp &amp; Timber Survey Recommended?
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

              {/* Regional Focus */}
              <div className="service-regional-card" style={{ padding: '1.5rem', border: '1px solid #CBD5E1', borderRadius: '16px', backgroundColor: '#FFFFFF', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.05rem', color: '#0F172A', fontWeight: 700 }}>
                  <MapPin size={18} style={{ color: '#142A43' }} />
                  <span style={{ color: '#0F172A' }}>Historic Building Fabric &amp; Breathability</span>
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                  Older properties across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire were designed to breathe using lime plasters and subfloor air vents. Applying modern cementitious waterproof renders often traps moisture and triggers dry rot. We prescribe period-appropriate remedies that preserve historic integrity.
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
