const fs = require('fs');

// 1. frontend/src/config/siteConfig.js
let siteConfig = fs.readFileSync('frontend/src/config/siteConfig.js', 'utf8');
siteConfig = siteConfig.replace(/line1:\s*["']124 City Road["']/g, 'line1: "Belmont House"');
siteConfig = siteConfig.replace(/line2:\s*["']Kemp House["']/g, 'line2: ""');
siteConfig = siteConfig.replace(/city:\s*["']London["']/g, 'city: "Uxbridge"');
siteConfig = siteConfig.replace(/postcode:\s*["']EC1V 2NX["']/g, 'postcode: "UB8 1QS"');
fs.writeFileSync('frontend/src/config/siteConfig.js', siteConfig);
console.log('Updated siteConfig.js');

// 2. frontend/src/components/layout/Footer.jsx
let footer = fs.readFileSync('frontend/src/components/layout/Footer.jsx', 'utf8');
footer = footer.replace(/124 City Road, London EC1V 2NX/g, 'Belmont House, Uxbridge, UB8 1QS');
fs.writeFileSync('frontend/src/components/layout/Footer.jsx', footer);
console.log('Updated Footer.jsx');

// 3. frontend/src/pages/public/ContactPage.jsx
let contact = fs.readFileSync('frontend/src/pages/public/ContactPage.jsx', 'utf8');
contact = contact.replace(/124 City Road, London EC1V 2NX/g, 'Belmont House, Uxbridge, UB8 1QS');
fs.writeFileSync('frontend/src/pages/public/ContactPage.jsx', contact);
console.log('Updated ContactPage.jsx');

// 4. frontend/src/pages/customer/CustomerModules.jsx
let customer = fs.readFileSync('frontend/src/pages/customer/CustomerModules.jsx', 'utf8');
customer = customer.replace(/124 City Road, London EC1V 2NX/g, 'Belmont House, Uxbridge, UB8 1QS');
fs.writeFileSync('frontend/src/pages/customer/CustomerModules.jsx', customer);
console.log('Updated CustomerModules.jsx');

// 5. frontend/src/utils/pdfGenerator.js
let pdf = fs.readFileSync('frontend/src/utils/pdfGenerator.js', 'utf8');
pdf = pdf.replace(/124 City Road, London EC1V 2NX/g, 'Belmont House, Uxbridge, UB8 1QS');
fs.writeFileSync('frontend/src/utils/pdfGenerator.js', pdf);
console.log('Updated pdfGenerator.js');

