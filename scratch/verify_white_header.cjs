const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop viewport (1440x900)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  await page.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_white_header_desktop.png',
    clip: { x: 0, y: 0, width: 1440, height: 420 }
  });

  // 2. Hover/click dropdown on white header
  const trigger = await page.$('button[aria-label="Survey Services Menu"]');
  if (trigger) {
    await trigger.hover();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_white_header_dropdown.png',
      clip: { x: 0, y: 0, width: 1440, height: 650 }
    });
  }

  // 3. Mobile viewport (390x844)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(1000);

  await mobilePage.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_white_header_mobile.png',
    clip: { x: 0, y: 0, width: 390, height: 220 }
  });

  // Click hamburger to check mobile drawer contrast & X button
  const toggleBtn = await mobilePage.$('.mobile-nav-toggle');
  if (toggleBtn) {
    await toggleBtn.click();
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({
      path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_white_header_mobile_drawer.png',
      clip: { x: 0, y: 0, width: 390, height: 500 }
    });
  }

  await browser.close();
  console.log('White header verification screenshots saved!');
})();

