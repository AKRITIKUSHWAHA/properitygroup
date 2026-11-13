const fs = require('fs');
const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const whiteB64 = fs.readFileSync('scratch/njs_transparent_white.png').toString('base64');
  const brightBlueB64 = fs.readFileSync('scratch/njs_transparent_brightblue.png').toString('base64');
  const navyB64 = fs.readFileSync('scratch/njs_transparent_navy.png').toString('base64');

  await page.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  // Screenshot 1: Crisp White Transparent Logo on actual Dark Header
  await page.evaluate((b64) => {
    const img = document.querySelector('.site-logo-img');
    if (img) {
      img.src = 'data:image/png;base64,' + b64;
      img.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))';
    }
  }, whiteB64);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/actual_header_white_transparent.png', clip: { x: 0, y: 0, width: 1440, height: 220 } });

  // Screenshot 2: Bright Royal Blue Transparent Logo on actual Dark Header
  await page.evaluate((b64) => {
    const img = document.querySelector('.site-logo-img');
    if (img) {
      img.src = 'data:image/png;base64,' + b64;
      img.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.4)) brightness(1.15)';
    }
  }, brightBlueB64);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/actual_header_blue_transparent.png', clip: { x: 0, y: 0, width: 1440, height: 220 } });

  // Screenshot 3: Exact Navy Transparent Logo on actual Dark Header (to inspect contrast)
  await page.evaluate((b64) => {
    const img = document.querySelector('.site-logo-img');
    if (img) {
      img.src = 'data:image/png;base64,' + b64;
      img.style.filter = 'none';
    }
  }, navyB64);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/actual_header_navy_transparent.png', clip: { x: 0, y: 0, width: 1440, height: 220 } });

  await browser.close();
  console.log('Header comparison screenshots done');
})();

