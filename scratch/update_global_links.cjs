const fs = require('fs');
let c = fs.readFileSync('frontend/src/styles/global.css', 'utf8');
const hasCrlf = c.includes('\r\n');
let norm = c.replace(/\r\n/g, '\n');

const target = `/* Dark Hero Breadcrumb Links Fix (About Us / Which Survey) */
.site-wrapper nav[aria-label="Breadcrumb"] a {
  color: #CBD5E1 !important;
}
.site-wrapper nav[aria-label="Breadcrumb"] a:hover {
  color: #FFFFFF !important;
}`;

const repl = `${target}

/* Keep explicit Tailwind text-white links readable on dark sections */
.site-wrapper .luxury-site-canvas a.text-white,
.site-wrapper .luxury-site-canvas a.text-white span {
  color: #FFFFFF !important;
}`;

if (!norm.includes(target)) {
  console.error('target missing');
  process.exit(1);
}
norm = norm.replace(target, repl);
fs.writeFileSync('frontend/src/styles/global.css', hasCrlf ? norm.replace(/\n/g, '\r\n') : norm);
console.log('Added a.text-white preservation rule');

