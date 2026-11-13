const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('PAGE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:5175/which-survey-do-i-need...');
  await page.goto('http://localhost:5175/which-survey-do-i-need', { waitUntil: 'networkidle' });

  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  // 1. Initial screenshot
  await page.screenshot({ path: 'scratch/which_survey_initial.png' });
  fs.copyFileSync('scratch/which_survey_initial.png', `${artifactsDir}/which_survey_initial.png`);
  console.log('Saved which_survey_initial.png');

  // 2. Click "Brand New (Under 2 years old)" option to test interactive reaction
  const newBuildBtn = await page.locator('text=Brand New (Under 2 years old)').first();
  if (await newBuildBtn.isVisible()) {
    await newBuildBtn.click();
    console.log('Clicked Brand New option');
    await page.waitForTimeout(500);
  }

  // 3. Full page screenshot after interaction
  await page.screenshot({ path: 'scratch/which_survey_full.png', fullPage: true });
  fs.copyFileSync('scratch/which_survey_full.png', `${artifactsDir}/which_survey_full.png`);
  console.log('Saved which_survey_full.png');

  // 4. Test dropdown link from Homepage
  console.log('Testing dropdown navigation from Homepage...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
  
  // Click Survey Services dropdown
  await page.click('button:has-text("Survey Services")');
  await page.waitForTimeout(400);

  // Screenshot open mega menu to verify highlighted badge
  await page.screenshot({ path: 'scratch/mega_menu_highlight.png' });
  fs.copyFileSync('scratch/mega_menu_highlight.png', `${artifactsDir}/mega_menu_highlight.png`);
  console.log('Saved mega_menu_highlight.png');

  await browser.close();
  console.log('Done verifying Which Survey Tool.');
})();

