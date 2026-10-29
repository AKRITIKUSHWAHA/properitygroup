import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';

export function ArchitecturalHero({ onQuoteClick }) {
  const scrollToQuote = (e) => {
    e.preventDefault();
    const quoteElement = document.getElementById('quote-section') || document.getElementById('quote');
    if (quoteElement) {
      quoteElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToExpertise = (e) => {
    e.preventDefault();
    const section = document.getElementById('services-showcase') || document.getElementById('expertise');
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
          aria-label="Prestigious British Manor Estate Architecture"
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
              Independent property surveys. Clear insight. Confident decisions.
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
                href="#services-showcase" 
                onClick={scrollToExpertise} 
                className="luxury-pill-btn secondary-glass"
              >
                Explore Our Expertise
              </a>
            </div>
          </div>

          {/* Asymmetric Bottom Glass Showcase matching Client Mockup */}
          <div className="luxury-asymmetric-showcase" id="services-showcase">
            {/* Left Column: Stacked Frosted Cards */}
            <div className="luxury-showcase-col-left">
              {/* Card 1: Homebuyer Survey Level 2 */}
              <Link 
                to="/services/homebuyer-survey-level-2" 
                className="luxury-glass-card stacked-card group"
              >
                <div className="luxury-card-badge">
                  <span>Level 2</span>
                </div>
                <div className="luxury-card-body">
                  <h3 className="luxury-card-title">Homebuyer Survey — Level 2</h3>
                  <p className="luxury-card-desc">Independent property surveys.</p>
                </div>
              </Link>

              {/* Card 2: Snagging Report */}
              <Link 
                to="/services/snagging-report" 
                className="luxury-glass-card stacked-card group"
              >
                <div className="luxury-card-badge">
                  <span>New-Build</span>
                </div>
                <div className="luxury-card-body">
                  <h3 className="luxury-card-title">Snagging Report</h3>
                  <p className="luxury-card-desc">Closing and snagging report.</p>
                </div>
              </Link>
            </div>

            {/* Right Column: Large Featured Architectural Card */}
            <div className="luxury-showcase-col-right">
              <Link 
                to="/services/building-survey-level-3" 
                className="luxury-featured-card group"
              >
                {/* Architectural Photography */}
                <div 
                  className="luxury-featured-img"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85')`
                  }}
                  role="img"
                  aria-label="Contemporary British Architecture - Building Survey Level 3"
                >
                  <div className="luxury-card-badge">
                    <span>Level 3</span>
                  </div>
                  <div className="luxury-featured-overlay">
                    <h3 className="luxury-featured-title">Building Survey — Level 3</h3>
                    <p className="luxury-featured-subtitle">Comprehensive structural investigation for period &amp; complex homes.</p>
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
