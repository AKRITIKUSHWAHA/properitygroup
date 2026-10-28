import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, XCircle, ChevronRight, FileText, ExternalLink, ArrowRight } from 'lucide-react';
import { Container } from '../common/Container';
import { SectionHeading } from '../common/SectionHeading';
import { Button } from '../common/Button';

export function TrafficLightRatings() {
  const [activeDefectTab, setActiveDefectTab] = useState(0);

  // e.surv inspired defect examples illustrating Condition 1, 2, and 3
  const defectExamples = [
    {
      id: 'roof-chimney',
      title: 'Chimney Stacks & Flashing',
      rating: 3,
      ratingLabel: 'Condition Rating 3',
      ratingCategory: 'Urgent Repair Required',
      ratingColor: '#EF4444',
      propertyType: 'Victorian Terraced Home (Richmond, SW14)',
      summary: 'Deteriorated lime mortar pointing, loose chimney pots, and fractured lead flashing allowing driving rainwater into loft void.',
      surveyorAdvice: 'Urgent scaffolding and repointing required prior to purchase. Risk of chimney collapse during gale-force winds. Estimated repair: £2,800 – £3,500.',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
      actionImpact: 'Buyer successfully renegotiated £3,200 discount off agreed asking price.',
    },
    {
      id: 'rising-damp',
      title: 'Damp Proof Course & Timbers',
      rating: 3,
      ratingLabel: 'Condition Rating 3',
      ratingCategory: 'Serious Defect',
      ratingColor: '#EF4444',
      propertyType: '1930s Semi-Detached House (Guildford, GU1)',
      summary: 'High electronic moisture meter readings (99.9% WME) along external party wall. Ground level bridged above subfloor air vents.',
      surveyorAdvice: 'Subfloor timber floorboards exhibiting early signs of dry rot mycelium. Further specialist timber and damp diagnosis instructed.',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      actionImpact: 'Vendor agreed to fund chemical DPC injection and timber remediation before contract exchange.',
    },
    {
      id: 'rainwater-gutters',
      title: 'Rainwater Goods & Fascias',
      rating: 2,
      ratingLabel: 'Condition Rating 2',
      ratingCategory: 'Repair Required (Non-Urgent)',
      ratingColor: '#F59E0B',
      propertyType: '1980s Detached Property (Oxford, OX2)',
      summary: 'Cast UPVC gutters exhibiting joint seepage and debris accumulation at rear elevation. Fascia paint flaking.',
      surveyorAdvice: 'Clear foliage and replace failing union clip joints within the next 6-12 months to avoid external brickwork saturation.',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      actionImpact: 'Routine seasonal maintenance cost estimated at £350.',
    },
    {
      id: 'modern-glazing',
      title: 'Windows & Double Glazing',
      rating: 1,
      ratingLabel: 'Condition Rating 1',
      ratingCategory: 'No Repair Needed',
      ratingColor: '#10B981',
      propertyType: 'Modern Townhouse (Reading, RG1)',
      summary: 'Modern argon-filled double glazed UPVC units with intact perimeter seals, functional trickle vents, and compliant egress friction stays.',
      surveyorAdvice: 'In sound condition. Maintain regular lubrication of multipoint espagnolette locks during normal occupation.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      actionImpact: 'Zero financial expenditure required. Expected lifespan 15+ years.',
    },
  ];

  const activeDefect = defectExamples[activeDefectTab];

  return (
    <section className="section traffic-light-section" aria-label="RICS Condition Ratings Guide">
      <Container>
        <SectionHeading
          eyebrow="Clear Jargon-Free Reporting"
          title="Understanding RICS Traffic-Light Condition Ratings"
          subtitle="Every defect identified in your survey report is categorized into an intuitive 1-2-3 traffic-light rating, giving you immediate clarity on urgent hazards versus routine upkeep."
        />

        {/* The 3 Core RICS Condition Pillars (e.surv format) */}
        <div className="condition-pillars-grid">
          {/* Condition 1 */}
          <div className="condition-pillar-card pillar-green">
            <div className="pillar-header">
              <div className="pillar-number-badge bg-emerald-500">
                <span>1</span>
              </div>
              <div className="pillar-meta">
                <span className="pillar-title">Condition Rating 1</span>
                <span className="pillar-subtitle text-emerald-600">No Repair Currently Needed</span>
              </div>
            </div>
            <p className="pillar-desc">
              No repair is currently needed. The property must be maintained in the normal way. Elements are in sound, serviceable condition with no significant faults.
            </p>
            <div className="pillar-status-chip chip-green">
              <CheckCircle size={14} className="mr-1" />
              <span>Satisfactory Condition</span>
            </div>
          </div>

          {/* Condition 2 */}
          <div className="condition-pillar-card pillar-amber">
            <div className="pillar-header">
              <div className="pillar-number-badge bg-amber-500">
                <span>2</span>
              </div>
              <div className="pillar-meta">
                <span className="pillar-title">Condition Rating 2</span>
                <span className="pillar-subtitle text-amber-600">Repair or Replacement Needed</span>
              </div>
            </div>
            <p className="pillar-desc">
              Defects that need repairing or replacing but are not considered to be serious or urgent. Helps you budget and plan ongoing planned maintenance.
            </p>
            <div className="pillar-status-chip chip-amber">
              <AlertTriangle size={14} className="mr-1" />
              <span>Non-Urgent Maintenance</span>
            </div>
          </div>

          {/* Condition 3 */}
          <div className="condition-pillar-card pillar-red">
            <div className="pillar-header">
              <div className="pillar-number-badge bg-rose-500">
                <span>3</span>
              </div>
              <div className="pillar-meta">
                <span className="pillar-title">Condition Rating 3</span>
                <span className="pillar-subtitle text-rose-600">Urgent Defect / Serious Hazard</span>
              </div>
            </div>
            <p className="pillar-desc">
              Defects that are serious and/or need urgent repairing or replacing, or need further specialist investigation before you commit to exchange of contracts.
            </p>
            <div className="pillar-status-chip chip-red">
              <XCircle size={14} className="mr-1" />
              <span>Urgent Action Required</span>
            </div>
          </div>
        </div>

        {/* Interactive Defect Report Preview Simulator */}
        <div className="defect-simulator-container">
          <div className="simulator-header-bar">
            <div className="simulator-header-left">
              <FileText size={18} className="text-sky-400" />
              <span className="simulator-title">Live Report Defect Inspector: Real Case Studies</span>
            </div>
            <span className="simulator-note">Click a building component to inspect how our surveyors diagnose and report on defects:</span>
          </div>

          {/* Component Tabs */}
          <div className="defect-tabs-row">
            {defectExamples.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveDefectTab(idx)}
                className={`defect-tab-btn ${activeDefectTab === idx ? 'is-active' : ''}`}
              >
                <span
                  className="rating-dot"
                  style={{
                    backgroundColor: item.rating === 1 ? '#10B981' : item.rating === 2 ? '#F59E0B' : '#EF4444',
                  }}
                />
                <span>{item.title}</span>
              </button>
            ))}
          </div>

          {/* Defect Preview Detail Card */}
          <div className="defect-detail-panel">
            <div className="defect-detail-grid">
              {/* Left Column: Defect Photo & Badge */}
              <div className="defect-photo-col">
                <div className="defect-image-wrap">
                  <img
                    src={activeDefect.image}
                    alt={activeDefect.title}
                    className="defect-image"
                    loading="lazy"
                  />
                  <div
                    className="defect-floating-rating"
                    style={{
                      backgroundColor: activeDefect.ratingColor,
                    }}
                  >
                    <span>{activeDefect.ratingLabel}</span>
                    <span className="rating-sub">{activeDefect.ratingCategory}</span>
                  </div>
                </div>
                <div className="defect-property-location">
                  <strong>Inspection Case:</strong> {activeDefect.propertyType}
                </div>
              </div>

              {/* Right Column: Technical Findings & Action */}
              <div className="defect-analysis-col">
                <div className="analysis-section">
                  <h4 className="analysis-heading">Surveyor's Physical Observation:</h4>
                  <p className="analysis-text">{activeDefect.summary}</p>
                </div>

                <div className="analysis-section">
                  <h4 className="analysis-heading">Actionable Technical Recommendation:</h4>
                  <p className="analysis-text">{activeDefect.surveyorAdvice}</p>
                </div>

                <div className="analysis-impact-banner">
                  <div className="impact-icon">💡</div>
                  <div className="impact-text">
                    <strong>Financial Value to Homebuyer:</strong> {activeDefect.actionImpact}
                  </div>
                </div>

                <div className="defect-cta-row">
                  <Button to="/contact#quote" size="sm" variant="gold" icon={ArrowRight} iconPosition="right">
                    Get a Quote For Your Home
                  </Button>
                  <Button to="/services/homebuyer-survey-level-2" size="sm" variant="secondary">
                    View Full Level 2 vs Level 3 Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
