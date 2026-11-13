const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    const img = document.querySelector('.site-logo-img');
    if (img) {
      img.src = '/images/njs-logo-clean.png';
      img.style.height = '82px';
      img.style.maxHeight = '82px';
      img.style.maxWidth = '200px';
      img.style.filter = 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.45)) brightness(1.2) contrast(1.08)';
    }
    const header = document.querySelector('.header-main');
    if (header) {
      header.style.padding = '0.75rem 0';
    }
  });

  await page.waitForTimeout(500);

  // Full header crop
  await page.screenshot({ path: 'scratch/header_with_clean_logo_82px.png', clip: { x: 0, y: 0, width: 1440, height: 260 } });

  await browser.close();
  console.log('Screenshots taken for 82px clean logo');
})();

