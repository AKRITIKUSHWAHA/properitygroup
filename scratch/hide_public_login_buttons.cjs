const fs = require('fs');

// 1. Update siteConfig.js to add features.showPublicPortalLogin = false
let sc = fs.readFileSync('frontend/src/config/siteConfig.js', 'utf8');
const scCrlf = sc.includes('\r\n');
let scNorm = sc.replace(/\r\n/g, '\n');

if (!scNorm.includes('showPublicPortalLogin')) {
  scNorm = scNorm.replace(
    '  // Contact Information\n',
    '  // Feature Toggles (Phase 1 Public Website Launch vs Phase 2 CRM Activation)\n  features: {\n    showPublicPortalLogin: false\n  },\n\n  // Contact Information\n'
  );
  fs.writeFileSync('frontend/src/config/siteConfig.js', scCrlf ? scNorm.replace(/\n/g, '\r\n') : scNorm);
  console.log('Updated siteConfig.js');
}

// 2. Update MobileNavigation.jsx to gate Client Portal Login on siteConfig.features?.showPublicPortalLogin
let mn = fs.readFileSync('frontend/src/components/layout/MobileNavigation.jsx', 'utf8');
const mnCrlf = mn.includes('\r\n');
let mnNorm = mn.replace(/\r\n/g, '\n');

const mnTarget = `          {/* 5. Client Portal Login */}
          <NavLink
            to="/login"
            className={({ isActive }) => \`mobile-link \${isActive ? 'active' : ''}\`}
            onClick={onClose}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={15} />
              <span>Customer Login</span>
            </span>
            <ChevronRight size={15} />
          </NavLink>`;

const mnRepl = `          {/* 5. Client Portal Login (Hidden until Phase 2 CRM activation) */}
          {siteConfig.features?.showPublicPortalLogin && (
            <NavLink
              to="/login"
              className={({ isActive }) => \`mobile-link \${isActive ? 'active' : ''}\`}
              onClick={onClose}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={15} />
                <span>Customer Login</span>
              </span>
              <ChevronRight size={15} />
            </NavLink>
          )}`;

if (!mnNorm.includes(mnTarget)) {
  console.error('Could not find target block in MobileNavigation.jsx');
  process.exit(1);
}
mnNorm = mnNorm.replace(mnTarget, mnRepl);
fs.writeFileSync('frontend/src/components/layout/MobileNavigation.jsx', mnCrlf ? mnNorm.replace(/\n/g, '\r\n') : mnNorm);
console.log('Updated MobileNavigation.jsx');

