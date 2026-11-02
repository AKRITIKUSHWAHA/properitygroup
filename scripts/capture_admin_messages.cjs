const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

async function run() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test (1440x900)
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin/**', { timeout: 10000 });
    await page.goto('http://localhost:5175/admin/messages', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_messages_desktop_clean.png'), fullPage: false });
    console.log('Saved admin_messages_desktop_clean.png');

    // Test sending a quick reply
    const firstChip = page.locator('button:has-text("Confirmed surveyor appointment")').first();
    if (await firstChip.isVisible()) {
      await firstChip.click();
      await page.waitForTimeout(500);
      const sendBtn = page.locator('button:has-text("Send")').first();
      await sendBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_messages_sent_reply.png'), fullPage: false });
    console.log('Saved admin_messages_sent_reply.png');

    await context.close();
  }

  // 2. Mobile Responsive Test (390x844 iPhone viewport)
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin/**', { timeout: 10000 });
    await page.goto('http://localhost:5175/admin/messages', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Screenshot of Mobile Conversation List
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_messages_mobile_list.png'), fullPage: false });
    console.log('Saved admin_messages_mobile_list.png');

    // Click first conversation to open chat
    const firstThread = page.locator('button:has-text("Emma Watson")').first();
    if (await firstThread.isVisible()) {
      await firstThread.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_messages_mobile_chat.png'), fullPage: false });
      console.log('Saved admin_messages_mobile_chat.png');
    }

    await context.close();
  }

  await browser.close();
  console.log('=== All visual tests completed successfully ===');
}

run();
