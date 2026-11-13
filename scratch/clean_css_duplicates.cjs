const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../frontend/src/styles/components.css');
let css = fs.readFileSync(cssPath, 'utf8');

// In line ~8158, revert the duplicate scrollbar block that was inserted in the middle
const duplicateMiddle = `  max-height: calc(100vh - 120px) !important;
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

const originalMiddle = `  z-index: 1000 !important;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: headerDropdownFade 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}`;

if (css.includes(duplicateMiddle)) {
  css = css.replace(duplicateMiddle, originalMiddle);
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Cleaned up duplicate middle block');
} else {
  console.log('Duplicate middle block not found or already clean');
}

