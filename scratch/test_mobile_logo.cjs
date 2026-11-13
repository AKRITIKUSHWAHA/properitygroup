const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await page.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    const img = document.querySelector('.site-logo-img');
    if (img) {
      img.src = '/images/njs-logo-clean.png';
      img.style.height = '56px';
      img.style.maxHeight = '56px';
      img.style.maxWidth = '140px';
      img.style.filter = 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.45)) brightness(1.2) contrast(1.08)';
    }
  });

  await page.waitForTimeout(500);

  await page.screenshot({ path: 'scratch/header_mobile_logo.png', clip: { x: 0, y: 0, width: 390, height: 160 } });

  await browser.close();
  console.log('Mobile screenshot taken');
})();

