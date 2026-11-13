const { chromium } = require('../frontend/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });

  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  await page.screenshot({ path: 'scratch/mobile_header_verified.png' });
  console.log('Saved scratch/mobile_header_verified.png');

  // Copy to artifacts
  const fs = require('fs');
  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';
  fs.copyFileSync('scratch/mobile_header_verified.png', `${artifactsDir}/mobile_header_verified.png`);

  await browser.close();
  console.log('Done mobile verification.');
})();

