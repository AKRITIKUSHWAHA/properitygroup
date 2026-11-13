const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../frontend/src/styles/components.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. In .luxury-hero-container, reduce bottom padding
css = css.replace(
  'padding: 2rem 0 3.5rem;',
  'padding: 2rem 0 1rem;'
);

// 2. In .luxury-hero-text-block, remove large margin-bottom
css = css.replace(
  'margin-bottom: clamp(2rem, 4.5vw, 3.5rem);',
  'margin-bottom: 0.5rem;'
);

// 3. In .services-overview-section, reduce large top padding
css = css.replace(
  'padding: 4.5rem 0 3.5rem;',
  'padding: 2.25rem 0 3.5rem !important;'
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully adjusted gap between hero and services overview');

