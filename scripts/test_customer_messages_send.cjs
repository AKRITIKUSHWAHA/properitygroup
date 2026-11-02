const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 750 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[PAGE ERROR] ${msg.text()}`);
  });

  console.log('--- Step 1: Login as Harrison Croft ---');
  await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'customer2@demo.com');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/customer/**', { timeout: 10000 });
  console.log('Navigating to /customer/messages...');
  await page.goto('http://localhost:5175/customer/messages', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check input box visibility
  const input = page.locator('input[placeholder*="Type your message"]').first();
  const sendBtn = page.locator('button:has-text("Send")').first();
  console.log('Is input visible:', await input.isVisible());
  console.log('Is Send button visible:', await sendBtn.isVisible());

  // Take screenshot before sending
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'customer_messages_before.png'), fullPage: false });

  // Type and send message
  const testMsg = 'Hello Sarah, please confirm if Oliver requires special keys for the sub-basement vaults.';
  console.log('Typing message:', testMsg);
  await input.fill(testMsg);
  await sendBtn.click();
  await page.waitForTimeout(1000);

  // Check if message is rendered in the chatbox
  const messageBubble = page.locator(`text=${testMsg}`).first();
  const isMessageRendered = await messageBubble.isVisible();
  console.log('Is message rendered in chatbox after sending:', isMessageRendered);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'harrison_customer_message_sent.png'), fullPage: false });
  console.log('Saved harrison_customer_message_sent.png');

  console.log('--- Step 2: Check Admin Side Real-Time Sync ---');
  await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@demo.com');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin/**', { timeout: 10000 });
  await page.goto('http://localhost:5175/admin/messages', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Find Harrison Croft conversation
  const harrisonThread = page.locator('button:has-text("Harrison Croft")').first();
  if (await harrisonThread.isVisible()) {
    console.log('Selecting Harrison Croft thread in Admin Inbox...');
    await harrisonThread.click();
    await page.waitForTimeout(800);
  }

  const adminHasMessage = await page.locator(`text=${testMsg}`).first().isVisible().catch(() => false);
  console.log('Is Harrison message visible in Admin Messages Inbox:', adminHasMessage);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_harrison_message_received.png'), fullPage: false });
  console.log('Saved admin_harrison_message_received.png');

  await browser.close();
  console.log('=== All customer messaging tests completed ===');
}

run();

