import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { approvedServices } from '../../config/services';

export function ArchitecturalHero({ onQuoteClick }) {
  const scrollToQuote = (e) => {
    e.preventDefault();
    const quoteElement = document.getElementById('quote-section') || document.getElementById('quote');
    if (quoteElement) {
      quoteElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToServices = (e) => {
    e.preventDefault();
    const section = document.getElementById('services-overview') || document.getElementById('expertise');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="luxury-hero-container" aria-label="Architectural Surveying Showcase">
      {/* Cinematic Architectural Canvas */}
      <div className="luxury-hero-canvas">
        {/* Estate Manor Background Image with Left Masked Fade */}
        <div 
          className="luxury-hero-manor-bg"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1920&q=85')`
          }}
          role="img"
          aria-label="Prestigious British Estate Architecture"
        >
          {/* Deep Navy Radial & Linear Gradient Fade */}
          <div className="luxury-hero-overlay" />
        </div>

        {/* Hero Top Content Layer */}
        <div className="luxury-hero-inner">
          <div className="luxury-hero-text-block">
            {/* Editorial Serif Headline matching Client Mockup */}
            <h1 className="luxury-headline font-serif">
              ‘See Beyond<br />the Surface.’
            </h1>

            {/* Concise Supporting Text */}
            <p className="luxury-subtitle">
              Independent property surveys across London &amp; the Home Counties. Clear insight, fast turnaround, confident decisions.
            </p>

            {/* Two Frosted Glass Pill CTAs */}
            <div className="luxury-cta-group">
              <a 
                href="#quote-section" 
                onClick={scrollToQuote} 
                className="luxury-pill-btn primary-glass"
              >
                Request Your Survey Quote
              </a>
              <a 
                href="#services-overview" 
                onClick={scrollToServices} 
                className="luxury-pill-btn secondary-glass"
              >
                Explore Survey Services
              </a>
            </div>
          </div>

          {/* Unified 5-Service Showcase Grid */}
          <div className="luxury-unified-showcase" id="services-overview">
            {/* Row 1: Primary Pre-Purchase Surveys */}
            <div className="luxury-showcase-row-primary">
              {/* Card 1: Homebuyer Survey Level 2 */}
              <Link 
                to="/services/homebuyer-survey-level-2" 
                className="luxury-service-card group"
              >
                <div 
                  className="luxury-card-media"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80')`
                  }}
                  role="img"
                  aria-label="Conventional Homebuyer Survey Level 2"
                >
                  <div className="luxury-card-badge">
                    <span>Level 2</span>
                  </div>
                  <div className="luxury-card-overlay">
                    <h3 className="luxury-card-title">Homebuyer Survey — Level 2</h3>
                    <p className="luxury-card-desc">Essential condition report for conventional post-1900 properties.</p>
                  </div>
                </div>
              </Link>

              {/* Card 2: Building Survey Level 3 (Featured) */}
              <Link 
                to="/services/building-survey-level-3" 
                className="luxury-service-card featured-level3 group"
              >
                <div 
                  className="luxury-card-media"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85')`
                  }}
                  role="img"
                  aria-label="Comprehensive Building Survey Level 3"
                >
                  <div className="luxury-card-badge">
                    <span>Level 3</span>
                  </div>
                  <div className="luxury-card-overlay">
                    <h3 className="luxury-card-title">Building Survey — Level 3</h3>
                    <p className="luxury-card-desc">Comprehensive structural investigation for period &amp; altered homes.</p>
                  </div>
                </div>
              </Link>

              {/* Card 3: Snagging Report */}
              <Link 
                to="/services/snagging-report" 
                className="luxury-service-card group"
              >
                <div 
                  className="luxury-card-media"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80')`
                  }}
                  role="img"
                  aria-label="New-Build Snagging Report"
                >
                  <div className="luxury-card-badge">
                    <span>New-Build</span>
                  </div>
                  <div className="luxury-card-overlay">
                    <h3 className="luxury-card-title">Snagging Report</h3>
                    <p className="luxury-card-desc">Independent defect audit before developer completion handover.</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Row 2: Specialist Valuation & Diagnostics */}
            <div className="luxury-showcase-row-secondary">
              {/* Card 4: Valuation Report */}
              <Link 
                to="/services/valuation-report" 
                className="luxury-service-card secondary-wide group"
              >
                <div 
                  className="luxury-card-media"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80')`
                  }}
                  role="img"
                  aria-label="RICS Red Book Property Valuation"
                >
                  <div className="luxury-card-badge">
                    <span>Red Book</span>
                  </div>
                  <div className="luxury-card-overlay">
                    <h3 className="luxury-card-title">Valuation Report</h3>
                    <p className="luxury-card-desc">Help to Buy, shared ownership &amp; probate appraisals.</p>
                  </div>
                </div>
              </Link>

              {/* Card 5: Damp Survey */}
              <Link 
                to="/services/damp-survey" 
                className="luxury-service-card secondary-wide group"
              >
                <div 
                  className="luxury-card-media"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80')`
                  }}
                  role="img"
                  aria-label="Independent Damp & Moisture Diagnostics"
                >
                  <div className="luxury-card-badge">
                    <span>Diagnostics</span>
                  </div>
                  <div className="luxury-card-overlay">
                    <h3 className="luxury-card-title">Damp Survey</h3>
                    <p className="luxury-card-desc">Scientific moisture investigation without contractor sales bias.</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
