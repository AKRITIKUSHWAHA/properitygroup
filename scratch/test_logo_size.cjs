const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Test 82px with enhanced brightness/contrast
  await page.evaluate(() => {
    const img = document.querySelector('.site-logo-img');
    if (img) {
      img.style.height = '82px';
      img.style.maxHeight = '82px';
      img.style.maxWidth = '210px';
      img.style.filter = 'brightness(1.3) contrast(1.15) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.45))';
    }
    const header = document.querySelector('.header-main');
    if (header) {
      header.style.padding = '0.75rem 0';
    }
  });

  await page.waitForTimeout(500);
  const header = await page.$('.header-main');
  if (header) {
    await header.screenshot({ path: 'scratch/header_logo_82px.png' });
  }

  // Also take full viewport top area
  await page.screenshot({ path: 'scratch/header_full_82px.png', clip: { x: 0, y: 0, width: 1440, height: 400 } });

  await browser.close();
  console.log('Tested 82px logo size');
})();
