const fs = require('fs');

let hero = fs.readFileSync('frontend/src/components/hero/ArchitecturalHero.jsx', 'utf8');

// Add Link import
if (!hero.includes("import { Link } from 'react-router-dom';")) {
  hero = "import { Link } from 'react-router-dom';\n" + hero;
}

// Update Quote button to Link to /contact#quote
const oldBtn = `<a 
                href="#quote-section" 
                onClick={scrollToQuote} 
                className="luxury-pill-btn primary-glass"
              >
                <span>Request Your Survey Quote</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>`;

const newBtn = `<Link 
                to="/contact#quote" 
                className="luxury-pill-btn primary-glass"
              >
                <span>Request Your Survey Quote</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>`;

// Remove Zero Contractor Bias chip
const oldStrip = `<div className="hero-confidence-strip">
              <div className="confidence-chip">
                <CheckCircle2 size={13} style={{ color: '#FFFFFF' }} aria-hidden="true" />
                <span>Zero Contractor Bias</span>
              </div>
              <div className="confidence-chip">
                <Clock size={13} style={{ color: '#FFFFFF' }} aria-hidden="true" />
                <span>3–5 Days Turnaround</span>
              </div>
              <div className="confidence-chip">
                <Scale size={13} style={{ color: '#FFFFFF' }} aria-hidden="true" />
                <span>CPR Part 35 Ready</span>
              </div>
            </div>`;

const newStrip = `<div className="hero-confidence-strip">
              <div className="confidence-chip">
                <Clock size={13} style={{ color: '#FFFFFF' }} aria-hidden="true" />
                <span>3–5 Days Turnaround</span>
              </div>
              <div className="confidence-chip">
                <Scale size={13} style={{ color: '#FFFFFF' }} aria-hidden="true" />
                <span>CPR Part 35 Ready</span>
              </div>
            </div>`;

hero = hero.replace(/\r\n/g, '\n');
if (hero.includes(oldBtn)) {
  hero = hero.replace(oldBtn, newBtn);
  console.log('✓ Quote button updated to Link');
} else {
  console.log('Quote button pattern not found');
}

if (hero.includes(oldStrip)) {
  hero = hero.replace(oldStrip, newStrip);
  console.log('✓ Zero Contractor Bias chip removed');
} else {
  console.log('Confidence strip pattern not found');
}

fs.writeFileSync('frontend/src/components/hero/ArchitecturalHero.jsx', hero, 'utf8');

