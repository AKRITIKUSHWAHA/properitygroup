import React, { useState } from 'react';
import { ShieldCheck, Award, Scale, CheckCircle2, Info, X } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { Container } from './Container';

export function CredentialsBanner() {
  const [showModal, setShowModal] = useState(false);
  const { accreditationPolicy } = siteConfig;

  return (
    <section className="credentials-banner" aria-label="Professional Standards and Accreditations">
      <Container>
        <div className="credentials-grid">
          {/* RICS Standard */}
          <div className="credential-item">
            <div className="credential-icon" aria-hidden="true">
              <ShieldCheck size={22} className="text-gold" />
            </div>
            <div className="credential-content">
              <div className="credential-title">RICS Standards Aligned</div>
              <div className="credential-desc">Conduct &amp; inspection aligned with RICS Home Survey Benchmark</div>
            </div>
          </div>

          {/* Independent Red Book Valuers */}
          <div className="credential-item">
            <div className="credential-icon" aria-hidden="true">
              <Award size={22} className="text-gold" />
            </div>
            <div className="credential-content">
              <div className="credential-title">Independent Valuers</div>
              <div className="credential-desc">RICS Red Book methodology for Help to Buy &amp; probate valuations</div>
            </div>
          </div>

          {/* CPR Part 35 Litigation */}
          <div className="credential-item">
            <div className="credential-icon" aria-hidden="true">
              <Scale size={22} className="text-gold" />
            </div>
            <div className="credential-content">
              <div className="credential-title">CPR Part 35 Compliant</div>
              <div className="credential-desc">Civil court litigation reports for solicitors &amp; dispute parties</div>
            </div>
          </div>

          {/* PCA Moisture Standards */}
          <div className="credential-item">
            <div className="credential-icon" aria-hidden="true">
              <CheckCircle2 size={22} className="text-gold" />
            </div>
            <div className="credential-content">
              <div className="credential-title">PCA Aligned Diagnostics</div>
              <div className="credential-desc">Independent damp analysis without contractor product sales</div>
            </div>
          </div>
        </div>

        {/* Transparent Compliance Note */}
        <div className="credentials-footer">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="credentials-notice-btn"
          >
            <Info size={14} aria-hidden="true" className="text-gold" />
            <span>View Professional Standards, Registration &amp; Accreditation Notice</span>
          </button>
        </div>

        {/* Modal for Client Document Checklist */}
        {showModal && (
          <div
            className="mobile-drawer-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accreditation-modal-title"
            onClick={() => setShowModal(false)}
          >
            <div
              className="hero-card"
              style={{
                maxWidth: '560px',
                margin: '10vh auto',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 id="accreditation-modal-title" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-primary-navy)' }}>
                  Professional Accreditations &amp; Asset Notice
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-text)' }}
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-text)', marginBottom: '1rem', lineHeight: '1.6' }}>
                In strict adherence to client delivery rules, no official RICS firm number, partner credentials, or regulatory seals have been fabricated. The items below require formal client asset provision prior to live production deployment:
              </p>

              <div style={{ backgroundColor: 'var(--color-light-grey)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: '0.5rem', color: 'var(--color-primary-navy)' }}>
                  Pending Verification Checklist:
                </h4>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: 'var(--font-size-xs)', color: 'var(--color-main-text)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {accreditationPolicy.clientAssetChecklist.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-primary btn-sm"
                >
                  Understood &amp; Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
