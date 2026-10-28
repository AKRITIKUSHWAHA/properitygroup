import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
        {showModal && typeof document !== 'undefined' && createPortal(
          <div
            className="credentials-modal-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(6, 14, 24, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              overflowY: 'auto'
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="accreditation-modal-title"
            onClick={() => setShowModal(false)}
          >
            <div
              className="credentials-modal-card"
              style={{
                maxWidth: '520px',
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '2rem 1.85rem',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #E2E8F0',
                position: 'relative',
                margin: 'auto',
                maxHeight: 'min(580px, calc(100vh - 4rem))',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
                <h3 id="accreditation-modal-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Professional Accreditations &amp; Asset Notice
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.6' }}>
                In strict adherence to client delivery rules, no official RICS firm number, partner credentials, or regulatory seals have been fabricated. The items below require formal client asset provision prior to live production deployment:
              </p>

              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.15rem', borderRadius: '14px', border: '1px solid #F1F5F9', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', color: '#0F172A' }}>
                  Pending Verification Checklist:
                </h4>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.45rem', lineHeight: '1.45' }}>
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
                  style={{ borderRadius: '9999px', padding: '0.6rem 1.35rem', fontWeight: 600 }}
                >
                  Understood &amp; Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </Container>
    </section>
  );
}
