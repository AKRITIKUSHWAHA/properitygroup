const { chromium } = require('playwright');
const path = require('path');

async function testTermsSigningFlow() {
  console.log('--- Starting Digital Terms Signing & Save Flow Test ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const artifactDir = path.resolve('C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0');

  try {
    // ==========================================
    // 1. TEST EMMA WATSON (ALREADY SIGNED TERMS)
    // ==========================================
    console.log('1. Signing in as Emma Watson (customer@demo.com)...');
    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'customer@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/customer/**', { timeout: 10000 });

    console.log('Navigating to /customer/terms-to-sign for Emma Watson...');
    await page.goto('http://localhost:5175/customer/terms-to-sign', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Verify Emma's executed contract view
    const emmaTitle = await page.locator('text=Terms of Engagement Signed').first().isVisible();
    const emmaProperty = await page.locator('text=14 Mayfair Gate').first().isVisible();
    const emmaFee = await page.locator('text=£924.00').first().isVisible();
    console.log(`- Emma Terms Signed Badge Visible: ${emmaTitle}`);
    console.log(`- Emma Property (14 Mayfair Gate) Visible: ${emmaProperty}`);
    console.log(`- Emma Fee (£924.00) Visible: ${emmaFee}`);

    // Toggle clauses
    await page.click('button:has-text("View Executed Agreement Terms")');
    await page.waitForTimeout(500);

    const emmaShot = path.join(artifactDir, 'emma_terms_executed.png');
    await page.screenshot({ path: emmaShot, fullPage: true });
    console.log(`-> Screenshot saved: ${emmaShot}`);

    // ==========================================
    // 2. TEST HARRISON CROFT (PENDING TERMS -> SIGN & SAVE)
    // ==========================================
    console.log('2. Signing in as Harrison Croft (harrison@demo.com)...');
    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'harrison@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/customer/**', { timeout: 10000 });

    console.log('Navigating to /customer/terms-to-sign for Harrison Croft...');
    await page.goto('http://localhost:5175/customer/terms-to-sign', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Verify Harrison sees his specific pending job details
    const harrisonProp = await page.locator('text=12 Pembroke Square').first().isVisible();
    const harrisonFee = await page.locator('text=£1,740.00').first().isVisible();
    const harrisonService = await page.locator('text=RICS Level 3 Building Survey').first().isVisible();
    console.log(`- Harrison Property (12 Pembroke Square) Visible: ${harrisonProp}`);
    console.log(`- Harrison Fee (£1,740.00) Visible: ${harrisonFee}`);
    console.log(`- Harrison Level 3 Service Visible: ${harrisonService}`);

    const harrisonPendingShot = path.join(artifactDir, 'harrison_terms_pending.png');
    await page.screenshot({ path: harrisonPendingShot, fullPage: true });
    console.log(`-> Screenshot saved: ${harrisonPendingShot}`);

    // Execute digital signature
    console.log('Signing terms as Harrison Croft...');
    await page.click('input[type="checkbox"]');
    await page.fill('input[placeholder*="Harrison Croft"]', 'Harrison Croft');
    await page.click('button:has-text("Sign Agreement & Proceed to Payment")');
    await page.waitForTimeout(800);

    // Verify payment stage
    console.log('Verifying Stage 2: Payment & Order Breakdown...');
    const payTitle = await page.locator('text=Secure Payment Gateway (Stripe)').first().isVisible();
    const payButton = await page.locator('button:has-text("Confirm Booking")').first().isVisible();
    console.log(`- Payment Gateway Visible: ${payTitle}`);
    console.log(`- Pay Button Visible: ${payButton}`);

    const harrisonPaymentShot = path.join(artifactDir, 'harrison_terms_payment_stage.png');
    await page.screenshot({ path: harrisonPaymentShot, fullPage: true });
    console.log(`-> Screenshot saved: ${harrisonPaymentShot}`);

    // Authorize payment & save
    console.log('Submitting payment authorization...');
    await page.click('button:has-text("Confirm Booking")');
    await page.waitForTimeout(2000);

    // Verify confirmed stage
    const confirmedTitle = await page.locator('text=Inspection Confirmed & Locked!').first().isVisible();
    console.log(`- Confirmed & Locked Screen Visible: ${confirmedTitle}`);

    const harrisonConfirmedShot = path.join(artifactDir, 'harrison_terms_confirmed.png');
    await page.screenshot({ path: harrisonConfirmedShot, fullPage: true });
    console.log(`-> Screenshot saved: ${harrisonConfirmedShot}`);

    // Reload page to verify persistence
    console.log('Reloading /customer/terms-to-sign to verify persistence...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const harrisonPersisted = await page.locator('text=Terms of Engagement Signed').first().isVisible();
    console.log(`- Harrison Terms Executed & Persisted: ${harrisonPersisted}`);

    const harrisonPersistedShot = path.join(artifactDir, 'harrison_terms_persisted.png');
    await page.screenshot({ path: harrisonPersistedShot, fullPage: true });
    console.log(`-> Screenshot saved: ${harrisonPersistedShot}`);

    // ==========================================
    // 3. VERIFY IN ADMIN PORTAL
    // ==========================================
    console.log('3. Signing in as Admin to verify Harrison Croft Terms in /admin/terms...');
    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**', { timeout: 10000 });

    console.log('Navigating to /admin/terms...');
    await page.goto('http://localhost:5175/admin/terms', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Check Harrison Croft row in Admin table
    const harrisonRowInAdmin = page.locator('tr:has-text("Harrison Croft")');
    const isSignedBadgeInAdmin = await harrisonRowInAdmin.locator('span:has-text("Signed")').first().isVisible();
    console.log(`- Harrison Croft row in /admin/terms shows Signed: ${isSignedBadgeInAdmin}`);

    const adminTermsShot = path.join(artifactDir, 'admin_terms_harrison_signed.png');
    await page.screenshot({ path: adminTermsShot, fullPage: true });
    console.log(`-> Screenshot saved: ${adminTermsShot}`);

    // Check Job Details Page
    console.log('Navigating to /admin/jobs/JOB-2026-082...');
    await page.goto('http://localhost:5175/admin/jobs/JOB-2026-082', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const jobDetailsShot = path.join(artifactDir, 'admin_job_82_updated.png');
    await page.screenshot({ path: jobDetailsShot, fullPage: true });
    console.log(`-> Screenshot saved: ${jobDetailsShot}`);

    console.log('=== Digital Terms Signing & Save Flow Test Completed Successfully! ===');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testTermsSigningFlow();
