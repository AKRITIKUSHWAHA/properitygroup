const fs = require('fs');

const homeContent = `import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Container } from '../../components/common/Container';
import { ArchitecturalHero } from '../../components/hero/ArchitecturalHero';

export function HomePage() {
  useDocumentTitle(
    "Independent RICS-Aligned Property Surveys & Valuations",
    "Specialist property surveys across London, Surrey, Oxfordshire, Buckinghamshire, and Berkshire. Homebuyer Level 2, Building Survey Level 3, Snagging, Valuations, and Damp Reports."
  );

  // Smooth scroll to hash on load or page navigation
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    }
  }, []);

  return (
    <div className="home-page luxury-site-canvas">
      {/* 1. HERO SECTION */}
      <ArchitecturalHero />

      {/* 2. CORE SURVEYING SERVICES SYSTEMATIC OVERVIEW (Above the banner as requested) */}
      <div id="services" style={{ position: 'relative', top: '-80px', height: 0 }} aria-hidden="true" />
      <section 
        id="services-overview" 
        className="section services-overview-section"
        aria-label="Core Survey Services"
      >
        <Container>
          <div className="services-overview-header text-center">
            <span className="section-eyebrow">Core Surveying Practice</span>
            <h2 className="section-heading-title">Our Independent Survey Services</h2>
            <p className="section-heading-subtitle">
              Objective condition reports and valuations tailored to your property's age, construction, and legal requirements.
            </p>
          </div>

          <div className="services-overview-grid">
            {/* 1. Homebuyer Survey Level 2 */}
            <Link to="/services/homebuyer-survey-level-2" className="overview-service-card group">
              <div 
                className="overview-card-img"
                style={{ backgroundImage: \`url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=500&q=75')\` }}
                role="img"
                aria-label="Homebuyer Survey Level 2"
              >
                <div className="overview-card-badge">Level 2</div>
              </div>
              <div className="overview-card-body">
                <h3 className="overview-card-title">Homebuyer Survey — Level 2</h3>
                <p className="overview-card-desc">
                  Clear condition report highlighting urgent defects, damp indications, and timber decay in post-1900 homes.
                </p>
                <span className="overview-card-action">
                  <span>Explore Level 2 Details</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* 2. Building Survey Level 3 (Featured) */}
            <Link to="/services/building-survey-level-3" className="overview-service-card featured-overview-card group">
              <div 
                className="overview-card-img"
                style={{ backgroundImage: \`url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=650&q=75')\` }}
                role="img"
                aria-label="Building Survey Level 3"
              >
                <div className="overview-card-badge">Level 3</div>
              </div>
              <div className="overview-card-body">
                <h3 className="overview-card-title">Building Survey — Level 3</h3>
                <p className="overview-card-desc">
                  In-depth structural audit with prioritized repair schedules for older, altered, or complex properties.
                </p>
                <span className="overview-card-action">
                  <span>Explore Level 3 Details</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* 3. Snagging Report */}
            <Link to="/services/snagging-report" className="overview-service-card group">
              <div 
                className="overview-card-img"
                style={{ backgroundImage: \`url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=75')\` }}
                role="img"
                aria-label="New-Build Snagging Report"
              >
                <div className="overview-card-badge">New-Build</div>
              </div>
              <div className="overview-card-body">
                <h3 className="overview-card-title">Snagging Report</h3>
                <p className="overview-card-desc">
                  Detailed inspection identifying cosmetic and technical defects before developer warranty handover.
                </p>
                <span className="overview-card-action">
                  <span>Explore Snagging Details</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* 4. Valuation Report */}
            <Link to="/services/valuation-report" className="overview-service-card group">
              <div 
                className="overview-card-img"
                style={{ backgroundImage: \`url('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=500&q=75')\` }}
                role="img"
                aria-label="Valuation Report"
              >
                <div className="overview-card-badge">Red Book</div>
              </div>
              <div className="overview-card-body">
                <h3 className="overview-card-title">Valuation Report</h3>
                <p className="overview-card-desc">
                  RICS Red Book market appraisals for Help to Buy, shared ownership, probate, and tax purposes.
                </p>
                <span className="overview-card-action">
                  <span>Explore Valuation Details</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* 5. Damp Survey */}
            <Link to="/services/damp-survey" className="overview-service-card group">
              <div 
                className="overview-card-img"
                style={{ backgroundImage: \`url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=75')\` }}
                role="img"
                aria-label="Damp Survey"
              >
                <div className="overview-card-badge">Diagnostics</div>
              </div>
              <div className="overview-card-body">
                <h3 className="overview-card-title">Damp Survey</h3>
                <p className="overview-card-desc">
                  Scientific moisture diagnostics identifying damp and condensation without contractor sales bias.
                </p>
                <span className="overview-card-action">
                  <span>Explore Damp Details</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* 3. PRACTICE LIVE METRICS STRIP — DARK EMERALD GREEN (Shifted below services per client request) */}
      <div className="practice-metrics-ticker">
        <Container>
          <div className="metrics-ticker-inner">
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">100%</span>
              <span className="metric-ticker-label">RICS-Aligned Independent Practice</span>
            </div>
            <div className="metric-ticker-sep" aria-hidden="true" />
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">Fixed-Fee</span>
              <span className="metric-ticker-label">Transparent Written Quotes with Zero Hidden Costs</span>
            </div>
            <div className="metric-ticker-sep" aria-hidden="true" />
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">3 – 5 Days</span>
              <span className="metric-ticker-label">Fast Report Delivery &amp; Direct Phone Debrief</span>
            </div>
            <div className="metric-ticker-sep" aria-hidden="true" />
            <div className="metric-ticker-item">
              <span className="metric-ticker-num">CPR Part 35</span>
              <span className="metric-ticker-label">Court-Admissible Legal Witness Evidence</span>
            </div>
          </div>
        </Container>
      </div>

      {/* 4. PROFESSIONAL ACCREDITATION & TRUST STRIP (Second banner at bottom per client meeting) */}
      <section className="section bg-slate-900/80 border-t border-slate-800 py-10" aria-label="Professional Accreditations">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Professional Accreditations &amp; Standards
              </span>
              <h3 className="text-lg font-bold text-white">Regulated &amp; Aligned with UK Industry Bodies</h3>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                All inspections carried out under strict Royal Institution of Chartered Surveyors and industry benchmarks.
              </p>
            </div>

            {/* Official Industry Logos */}
            <div className="flex items-center justify-center flex-wrap gap-6 sm:gap-8">
              <div className="h-12 px-3 py-1.5 rounded-xl bg-white/95 flex items-center justify-center shadow-xs">
                <img src="/images/rics-regulated-logo.jpeg" alt="Regulated by RICS" className="h-9 w-auto object-contain" />
              </div>
              <div className="h-12 px-3 py-1.5 rounded-xl bg-white/95 flex items-center justify-center shadow-xs">
                <img src="/images/rics-valuer-logo.png" alt="RICS Registered Valuer" className="h-9 w-auto object-contain" />
              </div>
              <div className="h-12 px-3 py-1.5 rounded-xl bg-white/95 flex items-center justify-center shadow-xs">
                <img src="/images/ciob-logo.png" alt="CIOB" className="h-9 w-auto object-contain" />
              </div>
              <div className="h-12 px-3 py-1.5 rounded-xl bg-white/95 flex items-center justify-center shadow-xs">
                <img src="/images/rpsa-logo.png" alt="RPSA" className="h-9 w-auto object-contain" />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
`;

fs.writeFileSync('frontend/src/pages/public/HomePage.jsx', homeContent, 'utf8');
console.log('✓ HomePage.jsx redesigned successfully');

