const fs = require('fs');
const path = require('path');

// 1. Remove backoffice link from Footer.jsx
const footerPath = path.join(__dirname, '../frontend/src/components/layout/Footer.jsx');
let footerContent = fs.readFileSync(footerPath, 'utf8').replace(/\r\n/g, '\n');

const backofficePattern = /\{\/\* Discreet Back-Office link for Practice Personnel only \*\/\}[\s\S]*?<\/Link>/;
if (backofficePattern.test(footerContent)) {
  footerContent = footerContent.replace(backofficePattern, '');
  fs.writeFileSync(footerPath, footerContent, 'utf8');
  console.log('1. Successfully removed Staff & Surveyor Back-Office link from Footer.jsx');
} else {
  console.log('1. Warning: backofficePattern not found in Footer.jsx');
}

// 2. In LoginPage.jsx:
// - Replace the placeholder icon/text with the official NJS Brand Logo
// - Remove the "Practice surveyor or administrator? Surveyor Sign In · Admin Sign In" footer note links
const loginPath = path.join(__dirname, '../frontend/src/pages/auth/LoginPage.jsx');
let loginContent = fs.readFileSync(loginPath, 'utf8').replace(/\r\n/g, '\n');

// Replace Top Brand link with official logo
const oldBrandBlock = `<Link to="/" className="flex items-center gap-2.5 text-slate-800 group">
                <div className="w-8 h-8 rounded-xl bg-[#0B1F4D] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-[11px] tracking-tight block text-[#0B1F4D] leading-none">
                    NJS PROPERTY GROUP
                  </span>
                  <span className="text-[9px] font-semibold tracking-wider text-slate-400 block mt-1 uppercase">
                    RICS REGULATED PRACTICE
                  </span>
                </div>
              </Link>`;

const newBrandBlock = `<Link to="/" className="flex items-center gap-2 text-slate-800 group" title="Return to NJS Property Group Homepage">
                <img
                  src="/images/njs-logo.png"
                  alt="NJS Property Group"
                  className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                  style={{ maxHeight: '48px', width: 'auto', objectFit: 'contain' }}
                />
              </Link>`;

if (loginContent.includes(oldBrandBlock)) {
  loginContent = loginContent.replace(oldBrandBlock, newBrandBlock);
  console.log('2. Successfully mounted official NJS logo in LoginPage.jsx');
} else {
  console.log('2. Warning: oldBrandBlock not found in LoginPage.jsx');
}

// Remove the surveyor/admin links from the bottom of LoginPage.jsx
const oldFooterNoteBlock = `          {/* Footer note with discreet links between portals */}
          <div className="pt-4 mt-3 text-center border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
            <div className="font-medium">{currentRoleConfig.footerNote}</div>
            {activeRoleKey === 'customer' ? (
              <div className="text-[10.5px] text-slate-400 font-medium">
                Practice surveyor or administrator?{' '}
                <Link
                  to="/login/surveyor"
                  className="text-slate-600 hover:text-[#0B1F4D] font-semibold underline"
                >
                  Surveyor Sign In
                </Link>
                {' · '}
                <Link
                  to="/login/admin"
                  className="text-slate-600 hover:text-[#0B1F4D] font-semibold underline"
                >
                  Admin Sign In
                </Link>
              </div>
            ) : activeRoleKey === 'surveyor' ? (
              <div className="text-[10.5px] text-slate-400 font-medium">
                Switch portal:{' '}
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-[#0B1F4D] font-semibold underline"
                >
                  Customer Portal
                </Link>
                {' · '}
                <Link
                  to="/login/admin"
                  className="text-slate-600 hover:text-[#0B1F4D] font-semibold underline"
                >
                  Admin Sign In
                </Link>
              </div>
            ) : (
              <div className="text-[10.5px] text-slate-400 font-medium">
                Switch portal:{' '}
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-[#0B1F4D] font-semibold underline"
                >
                  Customer Portal
                </Link>
                {' · '}
                <Link
                  to="/login/surveyor"
                  className="text-slate-600 hover:text-[#0B1F4D] font-semibold underline"
                >
                  Surveyor Sign In
                </Link>
              </div>
            )}
          </div>`;

const newFooterNoteBlock = `          {/* Footer note */}
          <div className="pt-4 mt-3 text-center border-t border-slate-100 text-[11px] text-slate-400">
            <div className="font-medium">{currentRoleConfig.footerNote}</div>
          </div>`;

if (loginContent.includes(oldFooterNoteBlock)) {
  loginContent = loginContent.replace(oldFooterNoteBlock, newFooterNoteBlock);
  console.log('3. Successfully removed surveyor / admin links from LoginPage.jsx footer');
} else {
  console.log('3. Warning: oldFooterNoteBlock not found in LoginPage.jsx');
}

fs.writeFileSync(loginPath, loginContent, 'utf8');

