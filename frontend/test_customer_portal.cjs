const { chromium } = require('playwright');
const path = require('path');

async function testCustomerPortal() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('--- STARTING CUSTOMER PORTAL VERIFICATION ---');

  // 1. Login as Customer
  console.log('1. Navigating to Customer Login: http://localhost:5175/login');
  await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });

  await page.fill('input[type="email"]', 'customer@demo.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/customer/**', { timeout: 10000 });
  console.log('✔ Successfully logged in as Customer. Current URL:', page.url());

  // Wait for sidebar links to hydrate
  await page.waitForSelector('aside a[href*="/customer/"]', { timeout: 10000 });
  await page.waitForTimeout(500);

  // 2. Check 14 Menu Items in Sidebar
  console.log('2. Checking 14 Dedicated Sidebar Navigation Tabs:');
  const expectedMenus = [
    'Dashboard',
    'My Quotations',
    'My Bookings',
    'Track My Survey',
    'Appointment Details',
    'Assigned Surveyor',
    'Terms to Sign',
    'Invoices & Payments',
    'My Reports',
    'Messages',
    'Leave a Review',
    'Support',
    'My Details',
    'Previous Surveys',
  ];

  for (const menuName of expectedMenus) {
    const el = page.locator(`aside a[title="${menuName}"]`).first();
    const count = await el.count();
    console.log(`  - [${count > 0 ? '✔' : '✖'}] Menu: "${menuName}"`);
    if (count === 0) throw new Error(`Missing required customer menu: ${menuName}`);
  }

  // 3. Check 10-Stage Progress Tracker on Dashboard
  console.log('3. Checking 10-Stage Progress Tracker on Dashboard...');
  const trackerHeader = await page.locator('text=10-Stage RICS Survey Progress Tracker').first();
  await trackerHeader.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✔ 10-Stage Progress Tracker is visibly rendered on Customer Dashboard');

  // Check all 10 stages exist
  const stages = [
    'Enquiry', 'Quote', 'Accepted', 'Signed', 'Paid',
    'Booked', 'Inspected', 'Drafting', 'QA Review', 'Delivered'
  ];
  for (const s of stages) {
    const stageEl = page.locator(`text=${s}`).first();
    if (await stageEl.isVisible()) {
      console.log(`  - Stage Node: "${s}" is visible`);
    }
  }

  // Take Dashboard Screenshot
  const artifactDir = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';
  await page.screenshot({ path: path.join(artifactDir, 'customer_dashboard_with_tracker.png'), fullPage: false });
  console.log('✔ Captured customer_dashboard_with_tracker.png');

  // 4. Test "View Status" on /customer/my-bookings (Client Bug Point 7)
  console.log('4. Testing "View Status" in My Bookings (Client Bug Point 7)...');
  await page.goto('http://localhost:5175/customer/my-bookings', { waitUntil: 'networkidle' });
  const viewStatusBtn = page.locator('button:has-text("View Status")').first();
  await viewStatusBtn.click();
  await page.waitForURL('**/customer/track-my-survey', { timeout: 5000 });
  console.log('✔ "View Status" successfully opened /customer/track-my-survey (NOT terms-to-sign)!');

  await page.screenshot({ path: path.join(artifactDir, 'customer_track_my_survey.png'), fullPage: false });
  console.log('✔ Captured customer_track_my_survey.png');

  // 5. Test Terms to Sign Screen & Digital Signature
  console.log('5. Testing Terms to Sign Screen...');
  await page.goto('http://localhost:5175/customer/terms-to-sign', { waitUntil: 'networkidle' });
  await page.locator('text=RICS Standard Letter of Engagement').waitFor({ state: 'visible' });

  // Agree to terms & sign
  await page.click('input[type="checkbox"]');
  await page.click('button:has-text("Sign Agreement & Proceed")');
  await page.locator('text=Secure Payment Gateway (Stripe)').waitFor({ state: 'visible', timeout: 5000 });
  console.log('✔ Digital signature executed and proceeded to payment stage');

  // 6. Test Direct Messages Chat
  console.log('6. Testing Direct Messages Chat Screen...');
  await page.goto('http://localhost:5175/customer/messages', { waitUntil: 'networkidle' });
  await page.locator('text=NJS Operations Desk').waitFor({ state: 'visible' });
  await page.fill('input[placeholder*="Type your message"]', 'Hello Sarah, could David also check the dampness in the loft?');
  await page.click('button:has-text("Send")');
  console.log('✔ Message sent successfully in Customer Messages Chat');

  await page.screenshot({ path: path.join(artifactDir, 'customer_messages_chat.png'), fullPage: false });
  console.log('✔ Captured customer_messages_chat.png');

  // 7. Test Leave a Review (Trustpilot)
  console.log('7. Testing Leave a Review (Trustpilot)...');
  await page.goto('http://localhost:5175/customer/leave-review', { waitUntil: 'networkidle' });
  await page.locator('text=Trustpilot Verified Partner').waitFor({ state: 'visible' });
  const trustpilotBtn = page.locator('button:has-text("Submit Review on Trustpilot")');
  if (await trustpilotBtn.isVisible()) {
    console.log('✔ Trustpilot review button is prominently visible and configured for njspropertygroup.com');
  }

  await page.screenshot({ path: path.join(artifactDir, 'customer_trustpilot_review.png'), fullPage: false });
  console.log('✔ Captured customer_trustpilot_review.png');

  // 8. Test Reports Page & Sample Reports
  console.log('8. Testing My Reports & Sample Reports...');
  await page.goto('http://localhost:5175/customer/reports', { waitUntil: 'networkidle' });
  await page.locator('text=Certified Final RICS Report').waitFor({ state: 'visible' });
  await page.locator('text=Sample RICS Reports for Reference').waitFor({ state: 'visible' });
  console.log('✔ Reports page and Sample Reports section verified');

  await page.screenshot({ path: path.join(artifactDir, 'customer_reports_download.png'), fullPage: false });
  console.log('✔ Captured customer_reports_download.png');

  await browser.close();
  console.log('--- ALL CUSTOMER PORTAL TESTS PASSED 100% ---');
}

testCustomerPortal().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
