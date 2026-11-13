const fs = require('fs');

let content = fs.readFileSync('frontend/src/styles/global.css', 'utf8');
const hasCrlf = content.includes('\r\n');
const norm = content.replace(/\r\n/g, '\n');

const targetBlock = `/* Privacy Notice Card High-Contrast Overrides */
.site-wrapper .luxury-site-canvas .privacy-notice-card,
.site-wrapper .privacy-notice-card,
.privacy-notice-card {
  color: #0F172A !important;
}

.site-wrapper .luxury-site-canvas .privacy-notice-card h2,
.site-wrapper .luxury-site-canvas .privacy-notice-card h4,
.site-wrapper .privacy-notice-card h2,
.site-wrapper .privacy-notice-card h4,
.privacy-notice-card h2,
.privacy-notice-card h4 {
  color: #0F172A !important;
  text-shadow: none !important;
}

.site-wrapper .luxury-site-canvas .privacy-notice-card p,
.site-wrapper .privacy-notice-card p,
.privacy-notice-card p {
  color: #334155 !important;
  text-shadow: none !important;
  font-weight: 500 !important;
}

.site-wrapper .luxury-site-canvas .privacy-notice-card span,
.site-wrapper .privacy-notice-card span,
.privacy-notice-card span {
  text-shadow: none !important;
}

.site-wrapper .luxury-site-canvas .privacy-notice-card .privacy-subcard,
.privacy-notice-card .privacy-subcard {
  background-color: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
}

.site-wrapper .luxury-site-canvas .privacy-notice-card .privacy-subcard h4,
.privacy-notice-card .privacy-subcard h4 {
  color: #0F172A !important;
  text-shadow: none !important;
}

.site-wrapper .luxury-site-canvas .privacy-notice-card .privacy-subcard p,
.privacy-notice-card .privacy-subcard p {
  color: #475569 !important;
  text-shadow: none !important;
}`;

const replacementBlock = `/* Privacy Notice Card & Complaints Handling Procedure (CHP) High-Contrast Overrides */
.site-wrapper .luxury-site-canvas .privacy-notice-card,
.site-wrapper .privacy-notice-card,
.privacy-notice-card,
.site-wrapper .luxury-site-canvas .complaints-procedure-card,
.site-wrapper .complaints-procedure-card,
.complaints-procedure-card,
.site-wrapper .luxury-site-canvas #privacy,
.site-wrapper .luxury-site-canvas #complaints {
  color: #0F172A !important;
}

.site-wrapper .luxury-site-canvas .privacy-notice-card h1,
.site-wrapper .luxury-site-canvas .privacy-notice-card h2,
.site-wrapper .luxury-site-canvas .privacy-notice-card h3,
.site-wrapper .luxury-site-canvas .privacy-notice-card h4,
.site-wrapper .privacy-notice-card h2,
.site-wrapper .privacy-notice-card h4,
.privacy-notice-card h2,
.privacy-notice-card h4,
.site-wrapper .luxury-site-canvas .complaints-procedure-card h1,
.site-wrapper .luxury-site-canvas .complaints-procedure-card h2,
.site-wrapper .luxury-site-canvas .complaints-procedure-card h3,
.site-wrapper .luxury-site-canvas .complaints-procedure-card h4,
.site-wrapper .complaints-procedure-card h2,
.site-wrapper .complaints-procedure-card h4,
.complaints-procedure-card h2,
.complaints-procedure-card h4 {
  color: #0F172A !important;
  text-shadow: none !important;
}

.site-wrapper .luxury-site-canvas .privacy-notice-card p,
.site-wrapper .privacy-notice-card p,
.privacy-notice-card p,
.site-wrapper .luxury-site-canvas .complaints-procedure-card p,
.site-wrapper .complaints-procedure-card p,
.complaints-procedure-card p {
  color: #1E293B !important;
  text-shadow: none !important;
  font-weight: 500 !important;
}

.site-wrapper .luxury-site-canvas .privacy-notice-card span,
.site-wrapper .privacy-notice-card span,
.privacy-notice-card span,
.site-wrapper .luxury-site-canvas .complaints-procedure-card span,
.site-wrapper .complaints-procedure-card span,
.complaints-procedure-card span {
  text-shadow: none !important;
}

.site-wrapper .luxury-site-canvas .privacy-notice-card .privacy-subcard,
.privacy-notice-card .privacy-subcard {
  background-color: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
}

.site-wrapper .luxury-site-canvas .privacy-notice-card .privacy-subcard h4,
.privacy-notice-card .privacy-subcard h4 {
  color: #0F172A !important;
  text-shadow: none !important;
}

.site-wrapper .luxury-site-canvas .privacy-notice-card .privacy-subcard p,
.privacy-notice-card .privacy-subcard p {
  color: #1E293B !important;
  text-shadow: none !important;
}

/* Contact Page Left Column White Info Cards (Address, Hours, RICS Practice Notice) & Universal White Cards */
.site-wrapper .luxury-site-canvas .contact-detail-grid p:not(.contact-lead-text),
.site-wrapper .contact-detail-grid p:not(.contact-lead-text),
.site-wrapper .luxury-site-canvas div[style*="255, 255, 255"] p,
.site-wrapper .luxury-site-canvas .bg-white p {
  color: #1E293B !important;
  text-shadow: none !important;
}

.site-wrapper .luxury-site-canvas div[style*="255, 255, 255"] h1,
.site-wrapper .luxury-site-canvas div[style*="255, 255, 255"] h2,
.site-wrapper .luxury-site-canvas div[style*="255, 255, 255"] h3,
.site-wrapper .luxury-site-canvas div[style*="255, 255, 255"] h4,
.site-wrapper .luxury-site-canvas div[style*="255, 255, 255"] strong,
.site-wrapper .luxury-site-canvas .bg-white h1,
.site-wrapper .luxury-site-canvas .bg-white h2,
.site-wrapper .luxury-site-canvas .bg-white h3,
.site-wrapper .luxury-site-canvas .bg-white h4 {
  color: #0F172A !important;
  text-shadow: none !important;
}

/* Dark Hero Breadcrumb Links Fix (About Us / Which Survey) */
.site-wrapper nav[aria-label="Breadcrumb"] a {
  color: #CBD5E1 !important;
}
.site-wrapper nav[aria-label="Breadcrumb"] a:hover {
  color: #FFFFFF !important;
}`;

if (!norm.includes(targetBlock)) {
  console.error('Could not find targetBlock in global.css');
  process.exit(1);
}

let updated = norm.replace(targetBlock, replacementBlock);

// Also fix line 1094 .site-header background color in global.css so it never flashes dark over the blue logo
const oldHeaderBlock = `.site-header {
  position: sticky !important;
  top: 0 !important;
  z-index: 1000 !important;
  background-color: #070F1E !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45) !important;
}`;
const newHeaderBlock = `.site-header {
  position: sticky !important;
  top: 0 !important;
  z-index: 1000 !important;
  background-color: #FFFFFF !important;
  box-shadow: 0 4px 20px rgba(10, 22, 36, 0.08) !important;
}`;
if (updated.includes(oldHeaderBlock)) {
  updated = updated.replace(oldHeaderBlock, newHeaderBlock);
  console.log('Also fixed .site-header in global.css');
}

fs.writeFileSync('frontend/src/styles/global.css', hasCrlf ? updated.replace(/\n/g, '\r\n') : updated);
console.log('Successfully updated frontend/src/styles/global.css');

