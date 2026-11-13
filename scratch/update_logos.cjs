const fs = require('fs');

// 1. Header.jsx
let header = fs.readFileSync('frontend/src/components/layout/Header.jsx', 'utf8');
const headerRegex = /<div className="logo-badge" aria-hidden="true">[\s\S]*?<Building size=\{20\} \/>[\s\S]*?<\/div>/;
if (headerRegex.test(header)) {
  header = header.replace(headerRegex, '<img src="/images/njs-logo.png" alt="NJS Property Group" className="site-logo-img" />');
  fs.writeFileSync('frontend/src/components/layout/Header.jsx', header, 'utf8');
  console.log('✓ Header.jsx updated with official logo');
} else {
  console.log('✗ Header.jsx regex failed');
}

// 2. MobileNavigation.jsx
let mob = fs.readFileSync('frontend/src/components/layout/MobileNavigation.jsx', 'utf8');
const mobRegex = /<div className="logo-badge" aria-hidden="true" style=\{\{\s*width:\s*'32px',[\s\S]*?<Building size=\{16\} \/>[\s\S]*?<\/div>/;
if (mobRegex.test(mob)) {
  mob = mob.replace(mobRegex, '<img src="/images/njs-logo.png" alt="NJS Property Group" className="site-logo-img-mobile" style={{ height: "42px", width: "auto", objectFit: "contain" }} />');
  fs.writeFileSync('frontend/src/components/layout/MobileNavigation.jsx', mob, 'utf8');
  console.log('✓ MobileNavigation.jsx updated with official logo');
} else {
  console.log('✗ MobileNavigation.jsx regex failed');
}

// 3. Footer.jsx
let footer = fs.readFileSync('frontend/src/components/layout/Footer.jsx', 'utf8');
const footerRegex = /<div\s+style=\{\{\s*width:\s*'38px',[\s\S]*?<Building size=\{20\} style=\{\{ color: 'var\(--color-white\)' \}\} \/>[\s\S]*?<\/div>/;
if (footerRegex.test(footer)) {
  footer = footer.replace(footerRegex, '<img src="/images/njs-logo.png" alt="NJS Property Group" style={{ height: "48px", width: "auto", objectFit: "contain", filter: "brightness(1.15)" }} />');
  fs.writeFileSync('frontend/src/components/layout/Footer.jsx', footer, 'utf8');
  console.log('✓ Footer.jsx updated with official logo');
} else {
  console.log('✗ Footer.jsx regex failed');
}

// 4. Sidebar.jsx (Portal / Back-Office logo)
let sidebar = fs.readFileSync('frontend/src/components/Sidebar.jsx', 'utf8');
const sidebarRegex = /<div className="w-9 h-9 rounded-xl bg-\[#0B1F4D\] flex items-center justify-center text-white shadow-md shadow-\[#0B1F4D\]\/20 shrink-0">[\s\S]*?<Building2 className="w-5 h-5 text-white stroke-\[2\.2\]" \/>[\s\S]*?<\/div>/;
if (sidebarRegex.test(sidebar)) {
  sidebar = sidebar.replace(sidebarRegex, '<div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center p-1 shadow-md shadow-[#0B1F4D]/20 shrink-0 border border-slate-700/50"><img src="/images/njs-logo.png" alt="NJS" className="w-full h-full object-contain" /></div>');
  fs.writeFileSync('frontend/src/components/Sidebar.jsx', sidebar, 'utf8');
  console.log('✓ Sidebar.jsx updated with official logo');
} else {
  console.log('✗ Sidebar.jsx regex failed');
}

