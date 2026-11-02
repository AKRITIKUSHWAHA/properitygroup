const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

async function run() {
  const browser = await chromium.launch({ headless: true });
  // Realistic standard laptop resolution: 1280x750 (similar to user's Chrome with bookmarks bar & taskbar)
  const context = await browser.newContext({ viewport: { width: 1280, height: 750 } });
  const page = await context.newPage();

  console.log('Logging in as Admin...');
  await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@demo.com');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin/**', { timeout: 10000 });
  await page.goto('http://localhost:5175/admin/messages', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click Kensington Estates PLC
  const keThread = page.locator('button:has-text("Kensington Estates PLC")').first();
  if (await keThread.isVisible()) {
    console.log('Selecting Kensington Estates PLC conversation...');
    await keThread.click();
    await page.waitForTimeout(800);
  }

  // Check if reply composer input & Send button are visible within viewport
  const replyInput = page.locator('input[placeholder*="Reply to"]').first();
  const sendBtn = page.locator('button:has-text("Send")').first();
  const isInputVisible = await replyInput.isVisible();
  const isSendVisible = await sendBtn.isVisible();

  // Evaluate bounding box of send button
  const sendBox = await sendBtn.boundingBox();
  console.log(`Send Button bounding box:`, sendBox);
  console.log(`Viewport height: 750, Send button Y: ${sendBox?.y}, bottom: ${(sendBox?.y || 0) + (sendBox?.height || 0)}`);

  const composerInViewport = sendBox && (sendBox.y + sendBox.height <= 750);
  console.log(`Is composer completely inside viewport without page scrolling? ${composerInViewport}`);

  // Check outer page scroll height vs client height
  const scrollInfo = await page.evaluate(() => {
    return {
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollY: window.scrollY,
      hasOuterScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight + 5,
    };
  });
  console.log('Scroll Info:', scrollInfo);

  // Take screenshot
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_messages_chatbox_fixed.png'), fullPage: false });
  console.log('Saved admin_messages_chatbox_fixed.png');

  // Test typing a message and sending
  await replyInput.fill('Access to the sub-basement vaults is confirmed. Oliver has been informed.');
  await sendBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_messages_reply_delivered.png'), fullPage: false });
  console.log('Saved admin_messages_reply_delivered.png');

  await browser.close();
  console.log('=== Chatbox Fixed Scroll Test COMPLETED ===');
}

run();

