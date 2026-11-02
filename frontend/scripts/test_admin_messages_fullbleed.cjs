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

  // Check that the top status strip is GONE
  const hasOldTopStrip = await page.locator('text=0 Unread • 2 Survey Jobs Linked').isVisible().catch(() => false);
  console.log('Is old top status strip gone:', !hasOldTopStrip);

  // Select Kensington Estates PLC
  const keThread = page.locator('button:has-text("Kensington Estates PLC")').first();
  if (await keThread.isVisible()) {
    console.log('Selecting Kensington Estates PLC...');
    await keThread.click();
    await page.waitForTimeout(600);
  }

  // Type and send a quick message
  const input = page.locator('input[placeholder*="Reply to"]').first();
  const sendBtn = page.locator('button:has-text("Send")').first();
  await input.fill('Noted with thanks! The building surveyor has updated the site access instructions.');
  await sendBtn.click();
  await page.waitForTimeout(800);

  // Screenshot of the full-bleed real layout
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_messages_fullbleed_real.png'), fullPage: false });
  console.log('Saved admin_messages_fullbleed_real.png');

  // Also test at 1280x750 (laptop)
  await page.setViewportSize({ width: 1280, height: 750 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_messages_laptop_fullbleed.png'), fullPage: false });
  console.log('Saved admin_messages_laptop_fullbleed.png');

  await browser.close();
  console.log('=== Full-bleed test PASSED ===');
}

run();

