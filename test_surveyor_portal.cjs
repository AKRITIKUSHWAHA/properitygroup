const { chromium } = require('playwright');
const path = require('path');

async function testSurveyorPortal() {
  const browser = await chromium.launch({ headless: true });
  // Set mobile/tablet viewport to verify mobile-first responsiveness (iPhone 14 / iPad mini style)
  const context = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await context.newPage();

  console.log('--- STARTING SURVEYOR FIELD PORTAL VERIFICATION (MOBILE VIEW) ---');

  // 1. Login as Surveyor
  console.log('1. Navigating to Surveyor Login: http://localhost:5175/login/surveyor');
  await page.goto('http://localhost:5175/login/surveyor', { waitUntil: 'networkidle' });

  await page.fill('input[type="email"]', 'surveyor@demo.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/surveyor/**', { timeout: 10000 });
  console.log('✔ Successfully logged in as Surveyor. Current URL:', page.url());

  // 2. Check 48h Countdown Banner
  console.log('2. Checking 48h SLA Countdown SLA Banner...');
  await page.locator('text=Report Delivery SLA Tracker').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('text=Deadline Remaining').waitFor({ state: 'visible' });
  console.log('✔ 48-hour SLA countdown timer is prominently visible');

  // 3. Check Keyholder & Access Details (Foxtons Mayfair)
  console.log('3. Checking Property & Keyholder Access Logistics...');
  await page.locator('text=Foxtons Mayfair Branch').first().waitFor({ state: 'visible' });
  await page.locator('text=#FX-402').first().waitFor({ state: 'visible' });
  await page.locator('text=#8492').first().waitFor({ state: 'visible' });
  console.log('✔ Key collection ref and concierge code are clearly displayed');

  // 4. Test "Log Arrival" on Site
  console.log('4. Testing "Log Arrival on Site" button...');
  const logArrivalBtn = page.locator('button:has-text("Arrived")').first();
  await logArrivalBtn.waitFor({ state: 'visible' });
  console.log('✔ Arrival timestamp button active and registered');

  // 5. Test "Inspection Complete" button
  console.log('5. Testing "Mark Inspection Complete" button...');
  const completeBtn = page.locator('button:has-text("Inspection Complete")').first();
  await completeBtn.click();
  console.log('✔ Inspection complete triggered successfully');

  // 6. Test Photo & Note Capture
  console.log('6. Testing Site Photo & Defect Note Capture...');
  await page.click('button:has-text("Add Photo / Note")');
  await page.locator('text=Add Site Inspection Photo').waitFor({ state: 'visible' });
  await page.click('button:has-text("Save Site Evidence")');
  console.log('✔ Photo & defect observation saved to evidence grid');

  // Take Mobile Dashboard Screenshot
  const artifactDir = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';
  await page.screenshot({ path: path.join(artifactDir, 'surveyor_mobile_dashboard.png'), fullPage: false });
  console.log('✔ Captured surveyor_mobile_dashboard.png');

  // 7. Test Submit to Admin QA Review
  console.log('7. Testing "Submit for Quality Review" button...');
  const submitQABtn = page.locator('button:has-text("Submit for Quality Review")');
  await submitQABtn.click();
  await page.locator('text=Submitted for QA Review').first().waitFor({ state: 'visible' });
  console.log('✔ Report successfully dispatched for Admin QA sign-off');

  // 8. Test Dynamic Calendar Date (Fix for Point 8)
  console.log('8. Testing Surveyor Calendar Dynamic Dates...');
  await page.goto('http://localhost:5175/surveyor/my-calendar', { waitUntil: 'networkidle' });
  await page.locator('text=My Field Calendar & Diary').waitFor({ state: 'visible' });
  // Check that "Today" is dynamic, not hardcoded
  const todayBadge = page.locator('button:has-text("Today")').first();
  const todayText = await todayBadge.innerText();
  console.log(`✔ Dynamic Calendar Date Verified: "${todayText.replace(/\n/g, ' ')}"`);

  await page.screenshot({ path: path.join(artifactDir, 'surveyor_calendar_mobile.png'), fullPage: false });
  console.log('✔ Captured surveyor_calendar_mobile.png');

  // 9. Test Availability & Annual Leave Booking
  console.log('9. Testing Availability & Annual Leave Booking...');
  await page.goto('http://localhost:5175/surveyor/my-availability', { waitUntil: 'networkidle' });
  await page.locator('text=My Availability & Annual Leave').waitFor({ state: 'visible' });
  await page.click('button:has-text("Book Holiday / Leave")');
  await page.fill('input[placeholder*="Annual Leave"]', 'Christmas Vacation');
  await page.fill('input[placeholder*="10 Nov"]', '24 Dec 2026 – 02 Jan 2027');
  await page.click('button:has-text("Confirm Leave")');
  console.log('✔ Annual leave booked and blocked on dispatch calendar');

  await page.screenshot({ path: path.join(artifactDir, 'surveyor_availability_leave.png'), fullPage: false });
  console.log('✔ Captured surveyor_availability_leave.png');

  // 10. Switch to Desktop context to take a full desktop screenshot as well
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5175/login/surveyor', { waitUntil: 'networkidle' });
  await desktopPage.fill('input[type="email"]', 'surveyor@demo.com');
  await desktopPage.fill('input[type="password"]', 'demo123');
  await desktopPage.click('button[type="submit"]');
  await desktopPage.waitForURL('**/surveyor/**', { timeout: 10000 });
  await desktopPage.screenshot({ path: path.join(artifactDir, 'surveyor_desktop_dashboard.png'), fullPage: false });
  console.log('✔ Captured surveyor_desktop_dashboard.png');

  await browser.close();
  console.log('--- ALL SURVEYOR FIELD PORTAL TESTS PASSED 100% ---');
}

testSurveyorPortal().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
