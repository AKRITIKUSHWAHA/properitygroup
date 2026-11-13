const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  page.on('pageerror', err => logs.push('PAGE_ERROR: ' + err.toString()));

  try {
    console.log('Navigating to login...');
    await page.goto('http://127.0.0.1:5175/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Click Customer Login
    const loginBtn = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
    await loginBtn.click();
    await page.waitForTimeout(1500);

    console.log('Navigating to customer/support...');
    await page.goto('http://127.0.0.1:5175/customer/support', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'scratch/customer_support_repro.png', fullPage: true });
  } catch (e) {
    logs.push('ERR: ' + e.message);
  }

  console.log('Logs captured:', logs);
  await browser.close();
})();
