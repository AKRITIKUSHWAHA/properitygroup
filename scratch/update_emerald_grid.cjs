const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../frontend/src/styles/components.css');
let css = fs.readFileSync(cssPath, 'utf8');

const targetStr = `.practice-metrics-ticker .metric-ticker-sep {
  background: rgba(255, 255, 255, 0.22) !important;
  height: 38px !important;
}`;

const replacementStr = `.practice-metrics-ticker .metric-ticker-sep {
  background: rgba(255, 255, 255, 0.22) !important;
  height: 38px !important;
  width: 1px !important;
}

.practice-metrics-ticker .metrics-ticker-inner {
  display: grid !important;
  grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr !important;
  align-items: center !important;
  gap: 1rem !important;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 1rem;
}

.practice-metrics-ticker .metric-ticker-item {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  text-align: center !important;
}

@media (max-width: 1024px) {
  .practice-metrics-ticker .metrics-ticker-inner {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 1.5rem 1rem !important;
  }
  .practice-metrics-ticker .metric-ticker-sep {
    display: none !important;
  }
}

@media (max-width: 640px) {
  .practice-metrics-ticker .metrics-ticker-inner {
    grid-template-columns: 1fr !important;
    gap: 1.25rem !important;
  }
}`;

if (css.includes(targetStr)) {
  css = css.replace(targetStr, replacementStr);
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Successfully updated practice-metrics-ticker layout to clean 1-row grid with responsive break');
} else {
  console.error('Could not find targetStr');
}

