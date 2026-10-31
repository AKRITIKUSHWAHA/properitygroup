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
              <ShieldCheck size={22} className="text-white" style={{ color: '#FFFFFF' }} />
            </div>
            <div className="credential-content">
              <div className="credential-title">RICS Standards Aligned</div>
              <div className="credential-desc">Conduct &amp; inspection aligned with RICS Home Survey Benchmark</div>
            </div>
          </div>

          {/* Independent Red Book Valuers */}
          <div className="credential-item">
            <div className="credential-icon" aria-hidden="true">
              <Award size={22} className="text-white" style={{ color: '#FFFFFF' }} />
            </div>
            <div className="credential-content">
              <div className="credential-title">Independent Valuers</div>
              <div className="credential-desc">RICS Red Book methodology for Help to Buy &amp; probate valuations</div>
            </div>
          </div>

          {/* CPR Part 35 Litigation */}
          <div className="credential-item">
            <div className="credential-icon" aria-hidden="true">
              <Scale size={22} className="text-white" style={{ color: '#FFFFFF' }} />
            </div>
            <div className="credential-content">
              <div className="credential-title">CPR Part 35 Compliant</div>
              <div className="credential-desc">Civil court litigation reports for solicitors &amp; dispute parties</div>
            </div>
          </div>

          {/* PCA Moisture Standards */}
          <div className="credential-item">
            <div className="credential-icon" aria-hidden="true">
              <CheckCircle2 size={22} className="text-white" style={{ color: '#FFFFFF' }} />
            </div>
            <div className="credential-content">
              <div className="credential-title">PCA Aligned Diagnostics</div>
              <div className="credential-desc">Independent damp analysis without contractor product sales</div>
            </div>
          </div>
        </div>

        {/* Modal for Client Document Checklist */}
        </Container>
    </section>
  );
}
