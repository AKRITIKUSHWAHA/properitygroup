const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Navbar Header (with new logo)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_header_new_logo.png',
    clip: { x: 0, y: 0, width: 1440, height: 260 }
  });

  // 2. Footer (with new address & new logo)
  const footer = await page.$('footer');
  if (footer) {
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await footer.screenshot({
      path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_footer_new_address.png'
    });
  }

  // 3. Contact Page (with new address)
  await page.goto('http://127.0.0.1:5175/contact', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_contact_new_address.png',
    clip: { x: 0, y: 150, width: 1440, height: 600 }
  });

  // 4. Login Page (with new logo)
  await page.goto('http://127.0.0.1:5175/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_login_new_logo.png'
  });

  await browser.close();
  console.log('All verified screenshots captured successfully!');
})();

