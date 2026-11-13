const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop viewport (1440x900)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  await page.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_transparent_header.png',
    clip: { x: 0, y: 0, width: 1440, height: 260 }
  });

  // 2. Footer
  const footer = await page.$('footer');
  if (footer) {
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await footer.screenshot({
      path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_transparent_footer.png'
    });
  }

  // 3. Login Page (Exact Navy transparent logo on white card)
  await page.goto('http://127.0.0.1:5175/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_transparent_login.png'
  });

  // 4. Customer Portal Sidebar
  const loginBtn = await page.waitForSelector('button[type="submit"]');
  await loginBtn.click();
  await page.waitForURL('**/customer/**', { timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_transparent_sidebar.png',
    clip: { x: 0, y: 0, width: 320, height: 300 }
  });

  // 5. Mobile viewport
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_transparent_mobile.png',
    clip: { x: 0, y: 0, width: 390, height: 180 }
  });

  await browser.close();
  console.log('All transparent logo screenshots captured successfully!');
})();

