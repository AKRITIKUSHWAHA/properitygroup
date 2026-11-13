const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('PAGE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:5175/about-us...');
  await page.goto('http://localhost:5175/about-us', { waitUntil: 'networkidle' });

  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  // 1. Initial screenshot
  await page.screenshot({ path: 'scratch/about_initial.png' });
  fs.copyFileSync('scratch/about_initial.png', `${artifactsDir}/about_initial.png`);
  console.log('Saved about_initial.png');

  // 2. Full page screenshot
  await page.screenshot({ path: 'scratch/about_full.png', fullPage: true });
  fs.copyFileSync('scratch/about_full.png', `${artifactsDir}/about_full.png`);
  console.log('Saved about_full.png');

  // 3. Test dropdown on Homepage
  console.log('Testing About dropdown from Homepage...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
  
  // Hover over the About / Contact trigger
  const triggers = await page.locator('.nav-dropdown-trigger');
  const count = await triggers.count();
  for (let i = 0; i < count; i++) {
    const text = await triggers.nth(i).innerText();
    if (text.includes('About')) {
      await triggers.nth(i).hover();
      await page.waitForTimeout(500);
      break;
    }
  }

  await page.screenshot({ path: 'scratch/about_dropdown_hover.png' });
  fs.copyFileSync('scratch/about_dropdown_hover.png', `${artifactsDir}/about_dropdown_hover.png`);
  console.log('Saved about_dropdown_hover.png');

  await browser.close();
  console.log('Done verifying About Page.');
})();

