import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Check, Building2, Compass, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { SectionHeading } from './SectionHeading';
import { Button } from './Button';

export function CoverageMap({ showHeading = true, isCompact = false }) {
  const { coverageAreas } = siteConfig;
  const location = useLocation();

  const [selectedArea, setSelectedArea] = useState(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const area = searchParams.get('area');
      if (area && coverageAreas.some(a => a.id === area.toLowerCase())) {
        return area.toLowerCase();
      }
    }
    return coverageAreas[0].id;
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const area = searchParams.get('area');
    if (area && coverageAreas.some(a => a.id === area.toLowerCase())) {
      setSelectedArea(area.toLowerCase());
    }
  }, [location.search, coverageAreas]);

  const activeAreaObj = coverageAreas.find(a => a.id === selectedArea) || coverageAreas[0];

  return (
    <div className="coverage-component" aria-label="Regional Survey Coverage">
      {showHeading && (
        <SectionHeading
          eyebrow="Target Service Areas"
          title="Regional Coverage Across London &amp; The Home Counties"
          subtitle="Our surveyors inspect residential properties across London and core counties with responsive scheduling and deep local architectural knowledge."
        />
      )}

      {/* Region Selector Pills */}
      <div className="coverage-tabs-wrapper" role="tablist" aria-label="Target Coverage Regions">
        {coverageAreas.map(area => {
          const isSelected = area.id === selectedArea;
          return (
            <button
              key={area.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedArea(area.id)}
              className={`coverage-tab-btn ${isSelected ? 'active' : ''}`}
            >
              <MapPin size={15} style={{ color: isSelected ? 'var(--color-accent-gold)' : 'var(--color-silver-dark)' }} />
              <span>{area.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Area Details Card */}
      <div className={`coverage-card ${isCompact ? 'compact' : ''}`}>
        {/* Card Header with Icon, Name & Active Badge */}
        <div className="coverage-card-header">
          <div className="coverage-header-main">
            <div className="coverage-icon-badge" aria-hidden="true">
              <Compass size={22} />
            </div>
            <div>
              <h3 className="coverage-county-name">{activeAreaObj.name} Coverage</h3>
              <span className="coverage-county-label">{activeAreaObj.label}</span>
            </div>
          </div>

          <div className="coverage-status-tag">
            <span className="status-dot" aria-hidden="true" />
            <span>Active Surveyor Coverage</span>
          </div>
        </div>

        {/* Editorial Area Description */}
        <p className="coverage-desc">
          {activeAreaObj.description}
        </p>

        {/* Key Towns & Boroughs Inspected */}
        <div className="coverage-towns-section">
          <div className="coverage-towns-heading">
            <Building2 size={13} className="text-gold" aria-hidden="true" />
            <span>Key Areas &amp; Boroughs Inspected:</span>
          </div>

          <div className="coverage-towns-grid">
            {activeAreaObj.principalTowns.map((town, idx) => (
              <span key={idx} className="coverage-town-pill">
                <Check size={12} className="text-success flex-shrink-0" aria-hidden="true" />
                <span>{town}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Action & Hub Footer */}
        <div className="coverage-card-footer">
          <div className="coverage-hub-note">
            <ShieldCheck size={14} className="text-gold flex-shrink-0" aria-hidden="true" />
            <span>{activeAreaObj.hubNote}</span>
          </div>

          <Button to={`/contact?area=${activeAreaObj.id}#quote`} size="sm" variant="primary">
            Request {activeAreaObj.name} Survey
          </Button>
        </div>
      </div>
    </div>
  );
}

