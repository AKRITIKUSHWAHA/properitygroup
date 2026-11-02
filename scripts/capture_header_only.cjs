const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@demo.com');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin/**', { timeout: 10000 });
  await page.goto('http://localhost:5175/admin/messages', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Click Emma Watson
  const emmaBtn = page.locator('button:has-text("Emma Watson")').first();
  if (await emmaBtn.isVisible()) {
    await emmaBtn.click();
    await page.waitForTimeout(400);
  }

  // Find the header element
  const header = page.locator('div.border-b.bg-white').filter({ hasText: 'Emma Watson' }).first();
  if (await header.isVisible()) {
    await header.screenshot({ path: path.join(ARTIFACTS_DIR, 'header_only_name_clean.png') });
    console.log('Saved header_only_name_clean.png');
  }

  // Also take full screenshot of the page
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_messages_only_name_full.png') });
  console.log('Saved admin_messages_only_name_full.png');

  await browser.close();
}

run();
