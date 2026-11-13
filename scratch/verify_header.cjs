const { chromium } = require('../frontend/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('PAGE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:5175...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  // Screenshot header area
  const headerElem = await page.$('.site-header');
  if (headerElem) {
    await headerElem.screenshot({ path: 'scratch/header_verified.png' });
    console.log('Saved scratch/header_verified.png');
  }

  // Also screenshot top viewport
  await page.screenshot({ path: 'scratch/viewport_verified.png' });
  console.log('Saved scratch/viewport_verified.png');

  // Copy to artifacts dir
  const fs = require('fs');
  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';
  fs.copyFileSync('scratch/header_verified.png', `${artifactsDir}/header_verified.png`);
  fs.copyFileSync('scratch/viewport_verified.png', `${artifactsDir}/viewport_verified.png`);

  await browser.close();
  console.log('Done verifying header.');
})();
