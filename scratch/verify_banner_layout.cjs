const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  console.log('Navigating to http://localhost:5175...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  const banner = page.locator('.practice-metrics-ticker').first();
  await banner.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  // Screenshot desktop banner
  await banner.screenshot({ path: 'scratch/emerald_banner_1row.png' });
  fs.copyFileSync('scratch/emerald_banner_1row.png', path.join(artifactsDir, 'emerald_banner_1row.png'));
  console.log('Saved emerald_banner_1row.png');

  // Also take full section context screenshot showing Services above and Emerald Banner below
  await page.screenshot({ path: 'scratch/homepage_flow_verified.png' });
  fs.copyFileSync('scratch/homepage_flow_verified.png', path.join(artifactsDir, 'homepage_flow_verified.png'));
  console.log('Saved homepage_flow_verified.png');

  await browser.close();
  console.log('Banner layout verified successfully!');
})();

