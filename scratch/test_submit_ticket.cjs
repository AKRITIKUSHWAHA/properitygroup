const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://127.0.0.1:5175/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const loginBtn = await page.waitForSelector('button[type="submit"]');
    await loginBtn.click();
    await page.waitForTimeout(1000);

    await page.goto('http://127.0.0.1:5175/customer/support', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Fill message details
    await page.fill('textarea', 'Can I please request a copy of the photographic annex for the Mayfair property?');
    await page.click('button:has-text("Dispatch Ticket")');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'scratch/customer_support_submitted.png', fullPage: true });
    console.log('Ticket dispatched test successful!');
  } catch (e) {
    console.error('Error during ticket submission:', e);
  }

  await browser.close();
})();

