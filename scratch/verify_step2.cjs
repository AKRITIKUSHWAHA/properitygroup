const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('PAGE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:5175...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  // 1. Screenshot Hero area
  const heroElem = await page.$('.luxury-hero-container');
  if (heroElem) {
    await heroElem.screenshot({ path: 'scratch/hero_step2.png' });
    fs.copyFileSync('scratch/hero_step2.png', `${artifactsDir}/hero_step2.png`);
    console.log('Saved hero_step2.png');
  }

  // 2. Screenshot Emerald Ticker area
  const tickerElem = await page.$('.practice-metrics-ticker');
  if (tickerElem) {
    await tickerElem.screenshot({ path: 'scratch/emerald_banner_step2.png' });
    fs.copyFileSync('scratch/emerald_banner_step2.png', `${artifactsDir}/emerald_banner_step2.png`);
    console.log('Saved emerald_banner_step2.png');
  }

  // 3. Screenshot Full page
  await page.screenshot({ path: 'scratch/homepage_full_step2.png', fullPage: true });
  fs.copyFileSync('scratch/homepage_full_step2.png', `${artifactsDir}/homepage_full_step2.png`);
  console.log('Saved homepage_full_step2.png');

  await browser.close();
  console.log('Done verifying Step 2.');
})();

