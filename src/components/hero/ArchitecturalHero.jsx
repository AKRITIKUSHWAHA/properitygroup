import React from 'react';
import { ArrowRight, ShieldCheck, Clock, CheckCircle2, Scale } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';

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

        {/* Hero Top Content Layer (Spacious e.surv Architecture) */}
        <div className="luxury-hero-inner">
          <div className="luxury-hero-text-block">
            {/* Practice Category Eyebrow */}
            <div className="hero-eyebrow-chip">
              <ShieldCheck size={14} className="text-gold" aria-hidden="true" />
              <span>RICS-Aligned Independent Practice</span>
            </div>

            {/* Editorial Serif Headline matching Client Mockup */}
            <h1 className="luxury-headline font-serif">
              ‘See Beyond<br />the Surface.’
            </h1>

            {/* Concise Supporting Text */}
            <p className="luxury-subtitle">
              Independent property surveys across London &amp; the Home Counties. Clear technical insight, swift turnaround, and confident decisions before exchange.
            </p>

            {/* Two Frosted Glass Pill CTAs */}
            <div className="luxury-cta-group">
              <a 
                href="#quote-section" 
                onClick={scrollToQuote} 
                className="luxury-pill-btn primary-glass"
              >
                <span>Request Your Survey Quote</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a 
                href="#services-overview" 
                onClick={scrollToServices} 
                className="luxury-pill-btn secondary-glass"
              >
                <span>Explore Survey Services</span>
              </a>
            </div>

            {/* Fast Confidence Badges Strip */}
            <div className="hero-confidence-strip">
              <div className="confidence-chip">
                <CheckCircle2 size={13} className="text-gold" aria-hidden="true" />
                <span>Zero Contractor Bias</span>
              </div>
              <div className="confidence-chip">
                <Clock size={13} className="text-gold" aria-hidden="true" />
                <span>3–5 Days Turnaround</span>
              </div>
              <div className="confidence-chip">
                <Scale size={13} className="text-gold" aria-hidden="true" />
                <span>CPR Part 35 Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
