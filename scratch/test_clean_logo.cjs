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
      img.style.height = '74px';
      img.style.maxHeight = '74px';
      img.style.maxWidth = '180px';
      img.style.filter = 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4)) brightness(1.15)';
    }
  });

  await page.waitForTimeout(500);

  // Full header crop
  await page.screenshot({ path: 'scratch/header_with_clean_logo_74px.png', clip: { x: 0, y: 0, width: 1440, height: 260 } });

  // Close-up of navbar only
  const header = await page.$('.header-main');
  if (header) {
    await header.screenshot({ path: 'scratch/header_main_clean_74px.png' });
  }

  await browser.close();
  console.log('Screenshots taken for 74px clean logo');
})();

