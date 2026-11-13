const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/layout/MobileNavigation.jsx', 'utf8');
c = c.replace('src="/images/njs-logo.png"', 'src="/images/njs-logo-white.png"');
c = c.replace('height: "42px"', 'height: "52px"');
fs.writeFileSync('frontend/src/components/layout/MobileNavigation.jsx', c);
console.log('Updated MobileNavigation.jsx');

