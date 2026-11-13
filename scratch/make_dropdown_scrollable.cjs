const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../frontend/src/styles/components.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Target the .site-header .nav-dropdown-menu definition at line ~8148
const oldRule = `.site-header .nav-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: rgba(10, 18, 30, 0.96) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  border-radius: 18px !important;
  box-shadow: 0 24px 50px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
  padding: 0.65rem !important;
  min-width: 330px !important;
  max-width: 380px !important;
  z-index: 1000 !important;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: headerDropdownFade 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}`;

const newRule = `.site-header .nav-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: rgba(10, 18, 30, 0.96) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  border-radius: 18px !important;
  box-shadow: 0 24px 50px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
  padding: 0.65rem !important;
  min-width: 330px !important;
  max-width: 380px !important;
  max-height: calc(100vh - 120px) !important;
  max-height: calc(100dvh - 120px) !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  overscroll-behavior: contain !important;
  scrollbar-width: thin !important;
  scrollbar-color: rgba(255, 255, 255, 0.35) rgba(255, 255, 255, 0.06) !important;
  z-index: 1000 !important;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: headerDropdownFade 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Slim modern scrollbar for header dropdowns */
.site-header .nav-dropdown-menu::-webkit-scrollbar {
  width: 6px !important;
}

.site-header .nav-dropdown-menu::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 999px !important;
  margin: 6px 0 !important;
}

.site-header .nav-dropdown-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.28) !important;
  border-radius: 999px !important;
}

.site-header .nav-dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5) !important;
}`;

if (css.includes(oldRule)) {
  css = css.replace(oldRule, newRule);
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Successfully updated .site-header .nav-dropdown-menu with scrollable max-height and custom scrollbar');
} else {
  console.log('Warning: oldRule not found exactly, attempting normalized replace...');
  // Normalize CRLF / LF
  const normCss = css.replace(/\r\n/g, '\n');
  const normOld = oldRule.replace(/\r\n/g, '\n');
  if (normCss.includes(normOld)) {
    const normNew = newRule.replace(/\r\n/g, '\n');
    css = normCss.replace(normOld, normNew);
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('Successfully updated via normalized replace');
  } else {
    console.error('Could not find oldRule in components.css');
  }
}

