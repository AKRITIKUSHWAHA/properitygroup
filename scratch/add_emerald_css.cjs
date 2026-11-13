const fs = require('fs');

let css = fs.readFileSync('frontend/src/styles/components.css', 'utf8');

const emeraldCss = `
/* =============================================================
   CLIENT SPEC: DARK EMERALD GREEN STATS BANNER
   ============================================================= */
.practice-metrics-ticker {
  background: linear-gradient(135deg, #022c22 0%, #064e3b 50%, #047857 100%) !important;
  border-top: 1px solid rgba(52, 211, 153, 0.4) !important;
  border-bottom: 1px solid rgba(52, 211, 153, 0.4) !important;
  padding: 2rem 0 !important;
  box-shadow: 0 12px 36px rgba(4, 120, 87, 0.25) !important;
  position: relative;
  z-index: 20;
}

.practice-metrics-ticker .metric-ticker-num {
  color: #FFFFFF !important;
  font-size: clamp(1.3rem, 2.2vw, 1.7rem) !important;
  font-weight: 800 !important;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4) !important;
  letter-spacing: -0.01em;
}

.practice-metrics-ticker .metric-ticker-label {
  color: #D1FAE5 !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  margin-top: 0.35rem;
  letter-spacing: 0.01em;
}

.practice-metrics-ticker .metric-ticker-sep {
  background: rgba(255, 255, 255, 0.22) !important;
  height: 38px !important;
}
`;

css += '\n' + emeraldCss;
fs.writeFileSync('frontend/src/styles/components.css', css, 'utf8');
console.log('✓ Appended dark emerald green styles to components.css');

