const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5175/login/admin', { waitUntil: 'networkidle' });

  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin/dashboard**', { timeout: 5000 });
  await page.waitForTimeout(1000);
  console.log('Final URL after 1s:', page.url());

  const h1s = await page.$$eval('h1', els => els.map(e => e.innerText));
  console.log('All H1s on final page:', h1s);

  await browser.close();
})();
