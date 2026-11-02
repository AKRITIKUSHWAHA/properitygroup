const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5175/login');
  await page.fill('input[type="email"]', 'customer@demo.com');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('Current URL:', page.url());
  const bodyText = await page.innerText('body');
  console.log('Body Text Preview (first 500 chars):\n', bodyText.substring(0, 500));
  await browser.close();
})();
