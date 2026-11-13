const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  console.log('Navigating to http://localhost:5175...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  // Scroll so that both the bottom of Hero (confidence strip) and the top of Services are in view
  const confidenceStrip = page.locator('.hero-confidence-strip').first();
  await confidenceStrip.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  // Take screenshot of the exact region the user screenshotted
  await page.screenshot({ path: 'scratch/gap_fixed_verified.png' });
  fs.copyFileSync('scratch/gap_fixed_verified.png', path.join(artifactsDir, 'gap_fixed_verified.png'));
  console.log('Saved gap_fixed_verified.png');

  // Also take full homepage top to services screenshot
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/hero_services_transition.png' });
  fs.copyFileSync('scratch/hero_services_transition.png', path.join(artifactsDir, 'hero_services_transition.png'));
  console.log('Saved hero_services_transition.png');

  await browser.close();
  console.log('Done!');
})();

