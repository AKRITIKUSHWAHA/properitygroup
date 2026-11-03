const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Logging in as Admin...');
  await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@demo.com');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin/**', { timeout: 10000 });
  await page.goto('http://localhost:5175/admin/messages', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Measure window & document scroll dimensions
  const initialScroll = await page.evaluate(() => {
    return {
      windowInnerHeight: window.innerHeight,
      docScrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      windowScrollY: window.scrollY,
      canScrollWindow: document.documentElement.scrollHeight > window.innerHeight
    };
  });
  console.log('Scroll metrics before fix:', initialScroll);

  // Try to scroll window down
  await page.evaluate(() => {
    window.scrollTo(0, 500);
  });
  const afterWindowScroll = await page.evaluate(() => window.scrollY);
  console.log('Window scrollY after attempted window.scrollTo(0, 500):', afterWindowScroll);

  // Take screenshot of current state
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_messages_before_clean_header.png') });
  console.log('Saved admin_messages_before_clean_header.png');

  await browser.close();
}

run();
