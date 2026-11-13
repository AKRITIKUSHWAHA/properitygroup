const fs = require('fs');

let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// 1. Add lazy import
const oldImport = "const ExpertWitnessPage = lazyNamed(() => import('./pages/public/ExpertWitnessPage'), 'ExpertWitnessPage');";
const newImport = oldImport + "\nconst WhichSurveyPage = lazyNamed(() => import('./pages/public/WhichSurveyPage'), 'WhichSurveyPage');";

if (!app.includes('WhichSurveyPage')) {
  app = app.replace(oldImport, newImport);
}

// 2. Add Route
const oldRoute = '<Route path="/expert-witness" element={<ExpertWitnessPage />} />';
const newRoute = oldRoute + '\n          <Route path="/which-survey-do-i-need" element={<WhichSurveyPage />} />\n          <Route path="/which-survey" element={<Navigate to="/which-survey-do-i-need" replace />} />';

if (!app.includes('/which-survey-do-i-need')) {
  app = app.replace(oldRoute, newRoute);
}

fs.writeFileSync('frontend/src/App.jsx', app, 'utf8');
console.log('✓ App.jsx updated with /which-survey-do-i-need route');

