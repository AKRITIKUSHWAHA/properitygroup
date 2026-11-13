const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  // Hover over the dropdown wrapper
  const trigger = await page.locator('.nav-dropdown-trigger').first();
  await trigger.hover();
  await page.waitForTimeout(600);

  await page.screenshot({ path: 'scratch/mega_menu_hover.png' });
  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';
  fs.copyFileSync('scratch/mega_menu_hover.png', artifactsDir + '/mega_menu_hover.png');
  await browser.close();
  console.log('Saved mega_menu_hover.png');
})();

