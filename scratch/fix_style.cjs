const fs = require('fs');
let header = fs.readFileSync('frontend/src/components/layout/Header.jsx', 'utf8');
header = header.replace(
  'className="site-logo-img"',
  'className="site-logo-img" style={{ height: "54px", width: "auto", maxHeight: "54px", objectFit: "contain" }}'
);
fs.writeFileSync('frontend/src/components/layout/Header.jsx', header, 'utf8');

let css = fs.readFileSync('frontend/src/styles/components.css', 'utf8');
css = css.replace(
  '.site-logo-img {',
  '.site-logo-img, .site-header .site-logo img {\n  height: 54px !important;\n  width: auto !important;\n  max-height: 54px !important;\n  max-width: 125px !important;\n  object-fit: contain !important;'
);
fs.writeFileSync('frontend/src/styles/components.css', css, 'utf8');

console.log('✓ Updated Header.jsx and components.css');

