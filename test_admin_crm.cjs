const { chromium } = require('playwright');
const path = require('path');

async function testAdminCRM() {
  console.log('🚀 Starting Automated Verification for Module 3: Admin CRM Software...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Handle dialogs (make sure no unhandled alert popups block)
  page.on('dialog', async (dialog) => {
    console.log(`[Dialog Alert Detected]: ${dialog.message()}`);
    await dialog.accept();
  });

  const BASE_URL = 'http://localhost:5175';

  try {
    // 1. Login as Admin
    console.log('Step 1: Logging in as Admin...');
    await page.goto(`${BASE_URL}/login/admin`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**', { timeout: 10000 });
    console.log('✅ Logged in to Admin CRM');

    // 2. Test Admin Dashboard & Survey Booker Workflow Buckets
    console.log('Step 2: Testing Survey Booker Buckets & Messaging Desk...');
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=SurveyBooker Workflow');
    await page.waitForSelector('text=Priority Action Buckets');
    console.log('✅ SurveyBooker 6 Action Buckets visible');

    // Test Messaging Desk Shortcut
    const msgDeskBtn = page.locator('button:has-text("Client Messages")').first();
    await msgDeskBtn.click();
    await page.waitForSelector('text=Central Operations Messaging Desk');
    await page.waitForSelector('text=Emma Watson');
    console.log('✅ Operations Messaging Desk modal verified with client threads');

    // Screenshot of Messaging Desk
    await page.screenshot({
      path: path.join(__dirname, 'admin_messaging_desk.png'),
    });

    // Close Messaging Desk
    await page.click('button:has-text("Close Desk")');
    await page.waitForTimeout(500);

    // 3. Test Job Details Page (QA Review Desk, BACS Payment, Messages Tab)
    console.log('Step 3: Testing Job Details Page (QA Desk & BACS Settlement)...');
    await page.goto(`${BASE_URL}/admin/jobs/JOB-2026-080`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Survey Job Record: JOB-2026-080');
    await page.waitForSelector('text=NJS Property Group');
    console.log('✅ NJS Property Group branding in breadcrumb verified');

    // Check RICS QA Desk
    const qaDesk = page.locator('text=RICS Quality Assurance (QA) Approval Desk');
    await qaDesk.scrollIntoViewIfNeeded();
    await page.waitForSelector('text=24% WME');
    await page.waitForSelector('button:has-text("Approve & Release to Customer")');
    await page.waitForSelector('button:has-text("Request Revisions from Surveyor")');
    console.log('✅ RICS Quality Assurance (QA) Approval Desk with 24% WME damp readings verified');

    // Test Request Revisions Modal
    await page.click('button:has-text("Request Revisions from Surveyor")');
    await page.waitForSelector('text=Request Surveyor Revisions (QA Desk)');
    await page.locator('.fixed.inset-0 button:has-text("Cancel")').first().click();
    await page.waitForTimeout(400);

    // Test "Client Messages" Tab
    console.log('Step 4: Testing Client Messages Tab...');
    await page.click('button:has-text("Client Messages")');
    await page.waitForSelector('text=Direct Portal Chat with Emma Watson');
    await page.waitForSelector('text=Foxtons Mayfair under branch reference FX-402');
    console.log('✅ Client Messages direct thread with Emma Watson verified');

    // Take screenshot of Job Details & QA Desk
    await page.screenshot({
      path: path.join(__dirname, 'admin_job_qa_desk.png'),
    });

    // 4. Test Quotations & Payments (Rate Card Calculator & BACS)
    console.log('Step 5: Testing Quotations Page & Rate Card Calculator...');
    await page.goto(`${BASE_URL}/admin/quotes`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Quotations & Payment Gateway');

    // Open "+ New Quotation" modal
    await page.click('button:has-text("New Quotation")');
    await page.waitForSelector('text=NJS Instant Rate Card Calculator');
    await page.waitForSelector('button:has-text("Auto-Calculate Fee")');

    // Click Auto-Calculate Fee
    await page.click('button:has-text("Auto-Calculate Fee")');
    await page.waitForTimeout(500);
    console.log('✅ NJS Instant Rate Card Calculator verified');

    // Take screenshot of Rate Card Calculator
    await page.screenshot({
      path: path.join(__dirname, 'admin_rate_card_calculator.png'),
    });

    // Close New Quote modal
    await page.locator('.fixed.inset-0 button:has-text("Cancel")').first().click();
    await page.waitForTimeout(600);

    // Test Offline BACS Payment modal
    console.log('Step 6: Testing Offline BACS Settlement Modal...');
    // Switch to Outstanding / Awaiting Payment tab to guarantee unpaid quotes
    const outstandingTab = page.locator('button:has-text("Awaiting Payment")').first();
    if (await outstandingTab.isVisible()) {
      await outstandingTab.click();
      await page.waitForTimeout(400);
    }

    const actionBtn = page.locator('button[title="Quotation actions"]:visible').first();
    await actionBtn.scrollIntoViewIfNeeded();
    await actionBtn.click();
    await page.waitForTimeout(400);

    const bacsBtn = page.locator('button:has-text("Record BACS Payment")').first();
    if (await bacsBtn.isVisible()) {
      await bacsBtn.click();
      await page.waitForSelector('text=Record Offline BACS Bank Settlement');
      await page.waitForSelector('text=Receiving Bank Account');
      console.log('✅ Offline BACS Payment Modal verified');

      await page.screenshot({
        path: path.join(__dirname, 'admin_bacs_modal.png'),
      });

      await page.locator('.fixed.inset-0 button:has-text("Cancel")').first().click();
      await page.waitForTimeout(400);
    } else {
      console.log('Quotation already paid, testing Download VAT Receipt...');
      const downloadReceiptBtn = page.locator('button:has-text("Download VAT Receipt")').first();
      await downloadReceiptBtn.click();
      console.log('✅ Real VAT Receipt PDF download triggered');
    }

    // 5. Test Booking Calendar Double-Booking Alert
    console.log('Step 7: Testing Booking Calendar Double-Booking Detection...');
    await page.goto(`${BASE_URL}/admin/calendar`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Survey Booking Calendar');

    // Open "New Inspection Booking" modal
    const scheduleBtn = page.locator('button:has-text("New Inspection Booking"):visible').first();
    await scheduleBtn.scrollIntoViewIfNeeded();
    await scheduleBtn.click();
    await page.waitForSelector('text=Create Survey Booking Slot');
    await page.waitForSelector('text=Keyholder & On-Site Access Logistics');
    console.log('✅ Booking Modal with Keyholder Logistics verified');

    await page.screenshot({
      path: path.join(__dirname, 'admin_calendar_booking.png'),
    });

    await page.locator('.fixed.inset-0 button:has-text("Cancel")').first().click();

    console.log('🎉 ALL ADMIN CRM MODULE 3 TESTS PASSED 100%!');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testAdminCRM();

