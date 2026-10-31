import React, { useState } from 'react';
import { HelpCircle, Check, ArrowRight, Shield, Award, Sparkles, AlertCircle } from 'lucide-react';
import { Container } from '../common/Container';
import { SectionHeading } from '../common/SectionHeading';
import { Button } from '../common/Button';

export function SurveySelector() {
  const [propertyAge, setPropertyAge] = useState('1930-1990');
  const [propertyCondition, setPropertyCondition] = useState('good');
  const [hasAlterations, setHasAlterations] = useState(false);

  // Recommendation logic
  const getRecommendation = () => {
    if (propertyAge === 'new-build') {
      return {
        level: 'Snagging Report',
        badge: 'New-Build Handover',
        tagline: 'Best for brand-new houses and off-plan apartments',
        summary: 'Prior to moving in, a comprehensive snagging inspection identifies developer cosmetic defects, compliance breaches, and finish oversights for rectification under NHBC / Premier guarantee.',
        price: 'From £350 Inc VAT',
        path: '/services/snagging-report',
        reasons: [
          'Room-by-room cosmetic and technical audit',
          'Identifies breaches of NHBC technical standards',
          'Professional photographic defect schedule sent directly to developer',
          'Protection before your 2-year builder warranty expires',
        ],
      };
    }

    if (
      propertyAge === 'pre-1930' ||
      propertyAge === 'listed' ||
      propertyCondition === 'poor' ||
      hasAlterations
    ) {
      return {
        level: 'RICS Level 3 Building Survey',
        badge: 'Maximum Structural Depth',
        tagline: 'Recommended for your older, altered, or complex property',
        summary: 'Because of your property’s age, construction fabric, or alterations, an exhaustive Level 3 structural survey is essential to uncover hidden defects, timber decay, historic movement, and projected repair costs.',
        price: 'From £650 Inc VAT',
        path: '/services/building-survey-level-3',
        reasons: [
          'Full structural examination of load-bearing walls, foundations & roof framing',
          'Timber decay & wood-boring insect diagnostics (dry rot / wet rot)',
          'Assessment of past wall removals, loft conversions, or extensions',
          'Prioritized remediation schedule with budgeting recommendations',
        ],
      };
    }

    return {
      level: 'RICS Level 2 Homebuyer Survey',
      badge: 'Most Popular Choice',
      tagline: 'Recommended for your conventional, modern property',
      summary: 'For conventional properties built after 1930 in reasonable condition, a Level 2 survey provides thorough visual reassurance with traffic-light defect ratings without unnecessary structural over-engineering.',
      price: 'From £425 Inc VAT',
      path: '/services/homebuyer-survey-level-2',
      reasons: [
        'Extensive visual inspection of roof, chimneys, rainwater goods & masonry',
        'Electronic moisture meter damp profiling across vulnerable walls',
        'Traffic-light condition ratings (1-Green, 2-Amber, 3-Red)',
        'Legal issues and building regulation compliance checklist',
      ],
    };
  };

  const rec = getRecommendation();

  return (
    <section id="which-survey" className="section survey-selector-section section-alt" aria-label="Survey Decision Tool">
      <Container>
        <SectionHeading
          eyebrow="Interactive Decision Tool"
          title="Which Survey Do I Need?"
          subtitle="Selecting the right RICS survey level ensures you don't overpay for unnecessary tests or under-inspect complex structures. Answer 3 quick questions for an instant recommendation."
        />

        <div className="selector-layout-card">
          <div className="selector-grid">
            {/* Left Column: Interactive Questions */}
            <div className="selector-form-col">
              {/* Question 1: Age */}
              <div className="selector-group">
                <label className="selector-group-title">
                  1. When was the property built?
                </label>
                <div className="selector-options-list">
                  {[
                    { id: 'new-build', label: 'Brand New (Under 2 years old)' },
                    { id: 'post-1990', label: 'Modern (Built after 1990)' },
                    { id: '1930-1990', label: 'Conventional (Built between 1930 – 1990)' },
                    { id: 'pre-1930', label: 'Period / Victorian / Edwardian (Pre-1930)' },
                    { id: 'listed', label: 'Historic, Thatched, or Listed Building' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPropertyAge(option.id)}
                      className={`selector-option-btn ${propertyAge === option.id ? 'is-selected' : ''}`}
                    >
                      <div className="selector-radio-circle" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Condition */}
              <div className="selector-group">
                <label className="selector-group-title">
                  2. What is the apparent physical condition?
                </label>
                <div className="selector-options-grid">
                  {[
                    { id: 'good', label: 'Good / Well Maintained' },
                    { id: 'fair', label: 'Average / Needs Modernising' },
                    { id: 'poor', label: 'Poor / Visible Cracks & Damp' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPropertyCondition(option.id)}
                      className={`selector-option-btn compact ${propertyCondition === option.id ? 'is-selected' : ''}`}
                    >
                      <div className="selector-radio-circle" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Alterations */}
              <div className="selector-group">
                <label className="selector-group-title">
                  3. Has the property had major structural alterations?
                </label>
                <div className="selector-toggle-row">
                  <button
                    type="button"
                    onClick={() => setHasAlterations(false)}
                    className={`selector-toggle-btn ${!hasAlterations ? 'is-selected' : ''}`}
                  >
                    No Significant Alterations
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasAlterations(true)}
                    className={`selector-toggle-btn ${hasAlterations ? 'is-selected' : ''}`}
                  >
                    Yes (Loft conversion, extensions, removed walls)
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Recommendation Result */}
            <div className="selector-result-col">
              <div className="recommendation-result-box">
                <div className="rec-header">
                  <span className="rec-badge">{rec.badge}</span>
                  <span className="rec-price">{rec.price}</span>
                </div>

                <h3 className="rec-title">{rec.level}</h3>
                <p className="rec-tagline">{rec.tagline}</p>
                <p className="rec-summary">{rec.summary}</p>

                <div className="rec-reasons-box">
                  <span className="reasons-heading">Why this survey fits your property:</span>
                  <ul className="reasons-list">
                    {rec.reasons.map((reason, idx) => (
                      <li key={idx} className="reason-item">
                        <Check size={16} className="text-emerald-500 flex-shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rec-actions">
                  <Button to="/contact#quote" size="md" variant="gold" icon={ArrowRight} iconPosition="right">
                    Get Fixed Quote for {rec.level}
                  </Button>
                  <Button to={rec.path} size="md" variant="secondary">
                    View Full Specification
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

