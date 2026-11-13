const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  // 1366x768 (User's laptop resolution)
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });

  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  console.log('Navigating to http://localhost:5175...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  // Scroll down slightly so transition is centered on screen
  await page.evaluate(() => window.scrollTo(0, 320));
  await page.waitForTimeout(400);

  await page.screenshot({ path: 'scratch/transition_1366x768.png' });
  fs.copyFileSync('scratch/transition_1366x768.png', path.join(artifactsDir, 'transition_1366x768.png'));
  console.log('Saved transition_1366x768.png');

  await browser.close();
  console.log('Done 1366 test!');
})();

