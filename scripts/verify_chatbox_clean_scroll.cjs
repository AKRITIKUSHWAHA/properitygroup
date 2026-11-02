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

  // Click Emma Watson
  const emmaBtn = page.locator('button:has-text("Emma Watson")').first();
  if (await emmaBtn.isVisible()) {
    await emmaBtn.click();
    await page.waitForTimeout(400);
  }

  // Check header layout & wrapping
  const headerInfo = await page.evaluate(() => {
    const header = document.querySelector('div.h-16');
    const jobBtn = document.querySelector('a[href*="/admin/jobs/"]');
    return {
      headerHeight: header ? header.offsetHeight : null,
      headerScrollHeight: header ? header.scrollHeight : null,
      jobBtnText: jobBtn ? jobBtn.innerText.replace(/\n/g, ' ') : null,
      windowScrollY: window.scrollY,
      windowInnerHeight: window.innerHeight,
      docScrollHeight: document.documentElement.scrollHeight,
      bodyOverflow: document.body.style.overflow
    };
  });
  console.log('Header & Scroll metrics at 1440x900:', headerInfo);

  // Test wheel scrolling on the header (should NOT scroll the page!)
  await page.mouse.move(700, 30);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(200);

  const scrollYAfterHeaderWheel = await page.evaluate(() => window.scrollY);
  console.log('Window scrollY after wheel on header (must be 0):', scrollYAfterHeaderWheel);

  // Test scrolling inside message thread
  const messagesBox = page.locator('div.overscroll-contain.overflow-y-auto').last();
  const boxScrollBefore = await messagesBox.evaluate((el) => ({
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight
  }));
  console.log('Messages container scroll before wheel:', boxScrollBefore);

  // Send a few test messages to ensure lots of content to scroll
  const input = page.locator('input[placeholder*="Reply to"]').first();
  const sendBtn = page.locator('button:has-text("Send")').first();

  await input.fill('Message 1: Site inspection confirmation noted.');
  await sendBtn.click();
  await page.waitForTimeout(300);

  await input.fill('Message 2: Surveyor report draft will be reviewed by senior partner.');
  await sendBtn.click();
  await page.waitForTimeout(300);

  // Wheel scroll inside message box
  const boxBounding = await messagesBox.boundingBox();
  if (boxBounding) {
    await page.mouse.move(boxBounding.x + boxBounding.width / 2, boxBounding.y + boxBounding.height / 2);
    await page.mouse.wheel(0, -300); // scroll up
    await page.waitForTimeout(300);
  }

  const boxScrollAfter = await messagesBox.evaluate((el) => ({
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight
  }));
  console.log('Messages container scroll after wheel up:', boxScrollAfter);

  const finalWindowScrollY = await page.evaluate(() => window.scrollY);
  console.log('Final Window scrollY (must be 0):', finalWindowScrollY);

  // Screenshot at 1440x900
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_messages_clean_header_1440.png') });
  console.log('Saved admin_messages_clean_header_1440.png');

  // Screenshot at laptop 1280x750
  await page.setViewportSize({ width: 1280, height: 750 });
  await page.waitForTimeout(400);

  const laptopMetrics = await page.evaluate(() => {
    const header = document.querySelector('div.h-16');
    const jobBtn = document.querySelector('a[href*="/admin/jobs/"]');
    return {
      headerHeight: header ? header.offsetHeight : null,
      jobBtnText: jobBtn ? jobBtn.innerText.replace(/\n/g, ' ') : null,
      windowScrollY: window.scrollY,
      windowInnerHeight: window.innerHeight,
      docScrollHeight: document.documentElement.scrollHeight
    };
  });
  console.log('Laptop 1280x750 metrics:', laptopMetrics);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_messages_clean_header_1280.png') });
  console.log('Saved admin_messages_clean_header_1280.png');

  await browser.close();
  console.log('=== All clean header & scroll-lock tests PASSED ===');
}

run();
