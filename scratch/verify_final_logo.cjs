const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop viewport (1440x900)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/header_logo_desktop_verified.png',
    clip: { x: 0, y: 0, width: 1440, height: 260 }
  });

  const header = await page.$('.header-main');
  if (header) {
    await header.screenshot({
      path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/header_logo_navbar_closeup.png'
    });
  }

  // 2. Mobile viewport (390x844)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(1000);

  await mobilePage.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/header_logo_mobile_verified.png',
    clip: { x: 0, y: 0, width: 390, height: 180 }
  });

  await browser.close();
  console.log('Verified screenshots saved to artifact directory!');
})();

