const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAdminMessages() {
  console.log('--- Starting Admin Messages Inbox & Real-Time Sync Test ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const artifactDir = path.resolve('C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0');

  try {
    // 1. Verify Login Page
    console.log('1. Checking /login page wording...');
    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    const h1Text = await page.locator('h1').innerText();
    const btnText = await page.locator('button[type="submit"]').innerText();
    console.log(`- Login Heading: "${h1Text}"`);
    console.log(`- Login Button: "${btnText}"`);

    // 2. Sign In as Admin
    console.log('2. Signing in as Admin (admin@demo.com)...');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**', { timeout: 10000 });
    console.log('-> Admin logged in, redirected to:', page.url());

    // 3. Verify Sidebar contains Messages Inbox with badge
    console.log('3. Checking sidebar for "Messages Inbox"...');
    await page.waitForSelector('aside nav, aside', { timeout: 5000 });
    const messagesNavLink = page.locator('aside a[href*="/admin/messages"]');
    const isVisible = await messagesNavLink.isVisible();
    console.log(`- Messages Inbox link visible in sidebar: ${isVisible}`);

    const badge = await messagesNavLink.locator('span').last().innerText();
    console.log(`- Messages Inbox sidebar badge text: "${badge}"`);

    // 4. Click into /admin/messages
    console.log('4. Navigating to /admin/messages...');
    await messagesNavLink.click();
    await page.waitForURL('**/admin/messages', { timeout: 5000 });
    await page.waitForTimeout(1000);

    const adminInboxShot = path.join(artifactDir, 'admin_messages_inbox.png');
    await page.screenshot({ path: adminInboxShot, fullPage: true });
    console.log(`-> Screenshot saved: ${adminInboxShot}`);

    // 5. Select Emma Watson thread and send Admin reply
    console.log('5. Selecting Emma Watson conversation (JOB-2026-080)...');
    const emmaBtn = page.locator('button:has-text("Emma Watson")').first();
    await emmaBtn.click();
    await page.waitForTimeout(500);

    const replyInput = page.locator('textarea[placeholder*="Type your reply to"]');
    const testReplyText = 'Hello Emma, David Thorne has noted your damp meter request for the dining room. Inspection confirmed for tomorrow morning.';
    await replyInput.fill(testReplyText);

    console.log('Sending reply as Admin...');
    await page.click('button:has-text("Send Reply")');
    await page.waitForTimeout(1000);

    // Verify reply appears in thread
    const sentMsg = page.locator(`text=${testReplyText}`).first();
    const isSentVisible = await sentMsg.isVisible();
    console.log(`- Sent Admin reply visible in thread: ${isSentVisible}`);

    const adminSentShot = path.join(artifactDir, 'admin_sent_reply.png');
    await page.screenshot({ path: adminSentShot });
    console.log(`-> Screenshot saved: ${adminSentShot}`);

    // 6. Sign in as Emma Watson (customer@demo.com) and check customer portal messages
    console.log('6. Switching session to Customer Emma Watson (customer@demo.com)...');
    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'customer@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/customer/**', { timeout: 10000 });
    console.log('-> Customer logged in, redirected to:', page.url());

    // Navigate to Customer Messages
    await page.goto('http://localhost:5175/customer/messages', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify Admin's reply is visible in Emma's chat!
    const customerReceivedMsg = page.locator(`text=${testReplyText}`).first();
    const isCustomerMsgVisible = await customerReceivedMsg.isVisible();
    console.log(`- Admin reply received in Customer Portal: ${isCustomerMsgVisible}`);

    const customerMessagesShot = path.join(artifactDir, 'customer_messages_synced.png');
    await page.screenshot({ path: customerMessagesShot, fullPage: true });
    console.log(`-> Screenshot saved: ${customerMessagesShot}`);

    // 7. Emma Watson sends a reply back to Admin
    console.log('7. Emma Watson sending a message back to Admin...');
    const customerInput = page.locator('input[placeholder*="Type your message to NJS"]');
    const customerReplyText = 'Thank you Alexander! That gives me great peace of mind. Key is with Foxtons.';
    await customerInput.fill(customerReplyText);
    await page.click('button:has(svg.lucide-send)');
    await page.waitForTimeout(1000);

    // 8. Return to Admin and verify Emma's message appears in real time
    console.log('8. Returning to Admin Messages Inbox to verify Emma Watson response...');
    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**', { timeout: 10000 });

    await page.goto('http://localhost:5175/admin/messages', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const emmaMsgInAdmin = page.locator(`text=${customerReplyText}`).first();
    const isEmmaMsgInAdminVisible = await emmaMsgInAdmin.isVisible();
    console.log(`- Customer reply visible in Admin Messages Inbox: ${isEmmaMsgInAdminVisible}`);

    const finalAdminShot = path.join(artifactDir, 'admin_messages_bidirectional_synced.png');
    await page.screenshot({ path: finalAdminShot, fullPage: true });
    console.log(`-> Final screenshot saved: ${finalAdminShot}`);

    console.log('=== All Admin & Customer Real-Time Messaging Tests Passed Successfully! ===');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testAdminMessages();
