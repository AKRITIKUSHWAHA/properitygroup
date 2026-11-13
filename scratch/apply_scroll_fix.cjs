const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../frontend/src/styles/components.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace the dropdown styling with perfect scrollable container + sticky header/footer
const scrollableDropdownCSS = `
/* =============================================================
   PERFECT SCROLLABLE DROPDOWN SYSTEM WITH STICKY HEADER & FOOTER
   ============================================================= */
.site-header .nav-dropdown-menu {
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
  max-height: calc(100vh - 180px) !important;
  max-height: calc(100dvh - 180px) !important;
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

/* Slim modern scrollbar */
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
}

/* Sticky header inside scrollable dropdown */
.site-header .dropdown-menu-header {
  position: sticky !important;
  top: -0.65rem !important;
  background: rgba(10, 18, 30, 0.98) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  z-index: 10 !important;
  margin: -0.65rem -0.65rem 0.35rem -0.65rem !important;
  padding: 0.65rem 0.85rem 0.4rem 0.85rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Sticky footer inside scrollable dropdown */
.site-header .dropdown-menu-footer {
  position: sticky !important;
  bottom: -0.65rem !important;
  background: rgba(10, 18, 30, 0.98) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  z-index: 10 !important;
  margin: 0.35rem -0.65rem -0.65rem -0.65rem !important;
  padding: 0.45rem 0.65rem 0.65rem 0.65rem !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Refined item density so content fits naturally */
.site-header .dropdown-item {
  padding: 0.55rem 0.8rem !important;
  border-radius: 10px !important;
}

.site-header .dropdown-item-desc {
  font-size: 0.76rem !important;
  line-height: 1.35 !important;
  margin-top: 2px !important;
}
`;

// Append or replace
const marker = '/* =============================================================\n   PERFECT SCROLLABLE DROPDOWN SYSTEM WITH STICKY HEADER & FOOTER';
if (css.includes(marker)) {
  const parts = css.split(marker);
  css = parts[0] + scrollableDropdownCSS.trim();
} else {
  css += '\n' + scrollableDropdownCSS.trim();
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully appended/updated perfect scrollable dropdown CSS');

