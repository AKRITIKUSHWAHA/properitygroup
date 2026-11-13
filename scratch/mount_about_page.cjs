const fs = require('fs');

// 1. App.jsx
let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const oldAppImport = "const WhichSurveyPage = lazyNamed(() => import('./pages/public/WhichSurveyPage'), 'WhichSurveyPage');";
const newAppImport = oldAppImport + "\nconst AboutPage = lazyNamed(() => import('./pages/public/AboutPage'), 'AboutPage');";

if (!app.includes('AboutPage')) {
  app = app.replace(oldAppImport, newAppImport);
}

const oldAppRoute = '<Route path="/which-survey-do-i-need" element={<WhichSurveyPage />} />';
const newAppRoute = oldAppRoute + '\n          <Route path="/about-us" element={<AboutPage />} />\n          <Route path="/about" element={<Navigate to="/about-us" replace />} />';

if (!app.includes('/about-us')) {
  app = app.replace(oldAppRoute, newAppRoute);
}

fs.writeFileSync('frontend/src/App.jsx', app, 'utf8');
console.log('✓ App.jsx updated with /about-us route');

// 2. navigation.js
let nav = fs.readFileSync('frontend/src/config/navigation.js', 'utf8');

const targetChildren = `children: [
      {
        id: "contact-hub",`;

const replacementChildren = `children: [
      {
        id: "about-us-link",
        name: "About Us & Leadership",
        shortName: "About Us",
        path: "/about-us",
        description: "Director Natasha Shergill, company profile & practice ethics."
      },
      {
        id: "contact-hub",`;

if (nav.includes(targetChildren)) {
  nav = nav.replace(targetChildren, replacementChildren);
  fs.writeFileSync('frontend/src/config/navigation.js', nav, 'utf8');
  console.log('✓ navigation.js updated with About Us item');
} else {
  console.log('Notice: targetChildren not matched in navigation.js');
}

// 3. MobileNavigation.jsx
let mob = fs.readFileSync('frontend/src/components/layout/MobileNavigation.jsx', 'utf8');
// Check if About Us link can be added to mobile navigation items
const targetMob = `<Link
            to="/contact"`;

const replacementMob = `<Link
            to="/about-us"
            onClick={onClose}
            className="mobile-nav-link"
          >
            <div className="mobile-link-inner">
              <span className="mobile-link-name">About Us (Leadership)</span>
              <span className="mobile-link-desc">Director Natasha Shergill &amp; Practice Profile</span>
            </div>
            <ChevronRight size={14} className="mobile-chevron" />
          </Link>
          <Link
            to="/contact"`;

if (mob.includes(targetMob) && !mob.includes('/about-us')) {
  mob = mob.replace(targetMob, replacementMob);
  fs.writeFileSync('frontend/src/components/layout/MobileNavigation.jsx', mob, 'utf8');
  console.log('✓ MobileNavigation.jsx updated with About Us link');
}

