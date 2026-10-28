import React, { useState } from 'react';
import { FileText, Download, CheckCircle, ArrowRight, Eye, Shield, Camera, Layers } from 'lucide-react';
import { Container } from '../common/Container';
import { Button } from '../common/Button';

export function SampleReportSection() {
  const [activeReportTab, setActiveReportTab] = useState('level-2');
  const [showSampleModal, setShowSampleModal] = useState(false);

  return (
    <section className="section sample-report-section" aria-label="Sample RICS Survey Report Preview">
      <Container>
        <div className="sample-report-card">
          <div className="sample-report-grid">
            {/* Left Column: Visual Report Mockup Spread */}
            <div className="sample-preview-col">
              <div className="report-mockup-wrapper">
                <div className="report-page-sheet page-front">
                  <div className="sheet-header">
                    <div className="sheet-logo-placeholder">
                      <div className="sheet-crest" />
                      <div>
                        <span className="sheet-firm-name">RICS HOME SURVEY REPORT</span>
                        <span className="sheet-firm-sub">Independent Property Surveyors &bull; Level 2 &amp; 3</span>
                      </div>
                    </div>
                    <span className="sheet-confidential-tag">CONFIDENTIAL REPORT</span>
                  </div>

                  <div className="sheet-property-photo-box">
                    <img
                      src={
                        activeReportTab === 'level-2'
                          ? 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=700&q=80'
                          : 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=700&q=80'
                      }
                      alt="Sample Survey Inspection Property"
                      className="sheet-img"
                    />
                    <div className="sheet-photo-overlay">
                      <span className="sheet-badge-type">
                        {activeReportTab === 'level-2' ? 'RICS Level 2 Homebuyer Survey' : 'RICS Level 3 Building Survey'}
                      </span>
                    </div>
                  </div>

                  {/* Defect Highlights Table inside Report */}
                  <div className="sheet-summary-table">
                    <div className="sheet-row header-row">
                      <span>Section</span>
                      <span>Element</span>
                      <span>Condition Rating</span>
                    </div>
                    <div className="sheet-row">
                      <span>D1</span>
                      <span>Chimney Stacks &amp; Flues</span>
                      <span className="sheet-cr-badge cr-3">Condition 3 (Urgent)</span>
                    </div>
                    <div className="sheet-row">
                      <span>D2</span>
                      <span>Main Roof Coverings &amp; Flashings</span>
                      <span className="sheet-cr-badge cr-2">Condition 2 (Maintenance)</span>
                    </div>
                    <div className="sheet-row">
                      <span>E1</span>
                      <span>Dampness, Damp Proofing &amp; Timbers</span>
                      <span className="sheet-cr-badge cr-1">Condition 1 (Sound)</span>
                    </div>
                    <div className="sheet-row">
                      <span>F1</span>
                      <span>Windows &amp; External Doors</span>
                      <span className="sheet-cr-badge cr-1">Condition 1 (Sound)</span>
                    </div>
                  </div>

                  <div className="sheet-footer">
                    <span>Page 12 of 56 &bull; RICS Home Survey Standard (Aligned)</span>
                    <span className="sheet-signoff">Inspected &amp; Signed by MRICS Chartered Surveyor</span>
                  </div>
                </div>

                {/* Layered Back Sheet for depth */}
                <div className="report-page-sheet page-back" />
              </div>
            </div>

            {/* Right Column: Informative Copy and Download CTA */}
            <div className="sample-info-col">
              <div className="sample-eyebrow-pill">
                <FileText size={14} className="text-sky-400" />
                <span>Transparent Technical Reporting</span>
              </div>

              <h2 className="sample-title">
                See What a Real RICS Home Survey Looks Like
              </h2>

              <p className="sample-desc">
                Don't guess what your final document will contain. Our comprehensive digital reports feature high-resolution defect photographs, prioritized action tables, and plain-English summaries so you can negotiate repairs before exchanging contracts.
              </p>

              {/* Toggle Level 2 vs Level 3 */}
              <div className="sample-toggle-box">
                <button
                  type="button"
                  onClick={() => setActiveReportTab('level-2')}
                  className={`sample-tab-btn ${activeReportTab === 'level-2' ? 'is-active' : ''}`}
                >
                  Level 2 Homebuyer (40-55 Pages)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReportTab('level-3')}
                  className={`sample-tab-btn ${activeReportTab === 'level-3' ? 'is-active' : ''}`}
                >
                  Level 3 Building Survey (60-85 Pages)
                </button>
              </div>

              {/* Feature Checklist */}
              <div className="sample-features-list">
                <div className="sample-feature-item">
                  <CheckCircle size={17} className="text-emerald-400 flex-shrink-0" />
                  <span><strong>High-Resolution Digital Photos</strong> documenting every flagged defect with arrows</span>
                </div>
                <div className="sample-feature-item">
                  <CheckCircle size={17} className="text-emerald-400 flex-shrink-0" />
                  <span><strong>Color-Coded Traffic Light Ratings</strong> for instant clarity on urgency</span>
                </div>
                <div className="sample-feature-item">
                  <CheckCircle size={17} className="text-emerald-400 flex-shrink-0" />
                  <span><strong>Conveyancer &amp; Legal Issues Section</strong> highlighting unapproved works</span>
                </div>
                <div className="sample-feature-item">
                  <CheckCircle size={17} className="text-emerald-400 flex-shrink-0" />
                  <span><strong>Post-Inspection Debrief Call</strong> included with every report</span>
                </div>
              </div>

              <div className="sample-cta-buttons">
                <Button
                  to="/contact#quote"
                  variant="gold"
                  size="md"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Request Your Survey Quote
                </Button>
                <button
                  type="button"
                  onClick={() => setShowSampleModal(true)}
                  className="sample-download-btn"
                >
                  <Eye size={16} className="mr-2" />
                  <span>Preview Full Sample PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Sample Preview */}
        {showSampleModal && (
          <div
            className="sample-modal-overlay"
            onClick={() => setShowSampleModal(false)}
          >
            <div
              className="sample-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sample-modal-header">
                <div>
                  <h3 className="modal-title">Sample RICS Home Survey Report (PDF Preview)</h3>
                  <span className="modal-sub">
                    {activeReportTab === 'level-2'
                      ? 'RICS Level 2 Homebuyer Survey • Sample Document'
                      : 'RICS Level 3 Building Survey • Sample Document'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSampleModal(false)}
                  className="modal-close-btn"
                >
                  ✕
                </button>
              </div>

              <div className="sample-modal-body">
                <div className="sample-pdf-sheet">
                  <div className="pdf-header-strip">
                    <span>RICS HOME SURVEY STANDARD &bull; COMPREHENSIVE REPORT</span>
                    <span>REF: SPECIMEN-2026</span>
                  </div>
                  <div className="pdf-body-content">
                    <h4 className="pdf-property-address">
                      Property: 24 Cranley Mews, South Kensington, London SW7 3NX
                    </h4>
                    <p className="pdf-intro">
                      This sample inspection report demonstrates the structure, clarity, and detail provided in an official independent survey. All sections conform to the RICS Home Survey Standard.
                    </p>
                    <div className="pdf-elements-breakdown">
                      <div className="pdf-defect-item">
                        <span className="pdf-defect-badge cr-3">Condition 3</span>
                        <div>
                          <strong>Section D1: Chimney Stacks &amp; Roof Parapets</strong>
                          <p>Spalling facing brickwork and deteriorated lime pointing to party chimney stack. Parapet flashing requires renewal.</p>
                        </div>
                      </div>
                      <div className="pdf-defect-item">
                        <span className="pdf-defect-badge cr-2">Condition 2</span>
                        <div>
                          <strong>Section D4: Rainwater Guttering &amp; Downpipes</strong>
                          <p>Vegetation accumulation in front gutter with slight staining at joints. Cleansing required.</p>
                        </div>
                      </div>
                      <div className="pdf-defect-item">
                        <span className="pdf-defect-badge cr-1">Condition 1</span>
                        <div>
                          <strong>Section E1: Ground Floor Slabs &amp; Moisture</strong>
                          <p>Electronic moisture profiles returned normal background levels. DPC sound.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sample-modal-footer">
                <span>Want an inspection on your property? Quotes take under 60 seconds.</span>
                <Button
                  to="/contact#quote"
                  variant="gold"
                  size="sm"
                  onClick={() => setShowSampleModal(false)}
                >
                  Get an Instant Quote
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

