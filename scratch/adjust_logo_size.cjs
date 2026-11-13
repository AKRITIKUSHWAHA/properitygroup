const fs = require('fs');

let header = fs.readFileSync('frontend/src/components/layout/Header.jsx', 'utf8');
header = header.replace('height: "54px"', 'height: "64px"');
header = header.replace('maxHeight: "54px"', 'maxHeight: "64px"');
fs.writeFileSync('frontend/src/components/layout/Header.jsx', header, 'utf8');

let css = fs.readFileSync('frontend/src/styles/components.css', 'utf8');
css = css.replace(/height: 54px !important;/g, 'height: 64px !important;');
css = css.replace(/max-height: 54px !important;/g, 'max-height: 64px !important;');
css = css.replace(/max-width: 125px !important;/g, 'max-width: 160px !important;');
fs.writeFileSync('frontend/src/styles/components.css', css, 'utf8');

console.log('✓ Adjusted logo to 64px');

