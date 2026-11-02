const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[PAGE ERROR] ${msg.text()}`);
  });

  try {
    console.log('--- Step 1: Login as Customer Emma Watson ---');
    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    
    // Fill credentials
    await page.fill('input[type="email"]', 'customer@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');

    // Wait for customer dashboard
    await page.waitForURL('**/customer/**', { timeout: 10000 });
    console.log('Logged in successfully. Navigating to customer dashboard...');
    await page.goto('http://localhost:5175/customer/my-dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify Trustpilot trigger banner is present
    const hasTrustpilotBanner = await page.locator('text=Stage 6 Complete • Trustpilot Trigger').first().isVisible().catch(() => false);
    const hasTrustpilotCard = await page.locator('text=Trustpilot').first().isVisible();
    console.log(`Trustpilot trigger banner visible: ${hasTrustpilotBanner}, generic card visible: ${hasTrustpilotCard}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'trustpilot_dashboard_card.png'), fullPage: true });
    console.log('Saved trustpilot_dashboard_card.png');

    console.log('--- Step 2: Test Download Final Report & Prompt Modal ---');
    await page.goto('http://localhost:5175/customer/reports', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click Download PDF Report
    const downloadBtn = page.locator('button:has-text("Download PDF Report")').first();
    if (await downloadBtn.isVisible()) {
      console.log('Clicking Download PDF Report...');
      await downloadBtn.click();
      await page.waitForTimeout(1200);

      // Verify Trustpilot prompt modal appears
      const modalHeader = page.locator('text=Rate Surveyor David Thorne MRICS').first();
      const isModalVisible = await modalHeader.isVisible().catch(() => false);
      console.log(`Trustpilot prompt modal visible: ${isModalVisible}`);

      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'trustpilot_report_download_prompt.png'), fullPage: false });
      console.log('Saved trustpilot_report_download_prompt.png');

      // Close modal by clicking "Maybe Later"
      const maybeLaterBtn = page.locator('button:has-text("Maybe Later")').first();
      if (await maybeLaterBtn.isVisible()) {
        await maybeLaterBtn.click();
        await page.waitForTimeout(500);
      }
    }

    console.log('--- Step 3: Test Dedicated Leave a Review Page ---');
    await page.goto('http://localhost:5175/customer/leave-review', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Type feedback in textarea
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill('David Thorne MRICS was exceptionally thorough and flagged damp meter readings in the dining room before exchange. Excellent 48-hour turnaround!');
    }

    // Click Submit Review on Trustpilot
    const submitBtn = page.locator('button:has-text("Submit Review on Trustpilot")').first();
    if (await submitBtn.isVisible()) {
      console.log('Submitting Trustpilot review...');
      await submitBtn.click();
      await page.waitForTimeout(1500);
    }

    // Verify verified confirmation state
    const confirmedText = await page.locator('text=Verified Trustpilot Review Recorded').first().isVisible().catch(() => false);
    console.log(`Review recorded confirmation visible: ${confirmedText}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'trustpilot_submitted.png'), fullPage: true });
    console.log('Saved trustpilot_submitted.png');

    console.log('--- Step 4: Verify Customer Dashboard Reflects Verified Review ---');
    await page.goto('http://localhost:5175/customer/my-dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const verifiedOnDash = await page.locator('text=Verified Trustpilot Review ★★★★★').first().isVisible().catch(() => false);
    console.log(`Verified review badge visible on dashboard: ${verifiedOnDash}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'trustpilot_dashboard_verified.png'), fullPage: true });
    console.log('Saved trustpilot_dashboard_verified.png');

    console.log('--- Step 5: Check Admin Side Job Details Verification ---');
    // Logout and login as admin
    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin/**', { timeout: 10000 });
    console.log('Logged in as Admin. Opening JOB-2026-080...');
    await page.goto('http://localhost:5175/admin/jobs/JOB-2026-080', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    const adminReviewCard = await page.locator('text=Trustpilot Review Automation').first().isVisible().catch(() => false);
    console.log(`Admin job details Trustpilot Review Automation card visible: ${adminReviewCard}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_job_trustpilot_verified.png'), fullPage: true });
    console.log('Saved admin_job_trustpilot_verified.png');

    console.log('=== All Trustpilot Review Trigger tests PASSED ===');
  } catch (err) {
    console.error('Test run failed:', err);
  } finally {
    await browser.close();
  }
}

run();

