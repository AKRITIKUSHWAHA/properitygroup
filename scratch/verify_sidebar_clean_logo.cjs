const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5175/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const loginBtn = await page.waitForSelector('button[type="submit"]');
  await loginBtn.click();
  await page.waitForURL('**/customer/**', { timeout: 10000 });
  await page.waitForTimeout(1200);

  // Full dashboard screenshot
  await page.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_sidebar_clean_full.png'
  });

  // Close-up of top-left sidebar matching user's uploaded crop
  await page.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_sidebar_clean_closeup.png',
    clip: { x: 0, y: 0, width: 420, height: 220 }
  });

  await browser.close();
  console.log('Sidebar clean logo screenshots saved');
})();

