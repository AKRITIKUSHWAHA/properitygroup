const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('PAGE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to homepage to set customer session...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    localStorage.setItem('property_group_user_session', JSON.stringify({
      id: 'cust-1',
      email: 'customer@demo.com',
      name: 'Harrison Croft',
      role: 'customer',
      roleLabel: 'Instructing Client',
      phone: '+44 7700 900543'
    }));
  });

  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  // 1. Invoices & Payments Page
  console.log('Navigating to http://localhost:5175/customer/invoices-and-payments...');
  await page.goto('http://localhost:5175/customer/invoices-and-payments', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Find a Settle Now / Pay button
  const settleBtn = await page.locator('button:has-text("Settle Now"), button:has-text("Pay Invoice"), button:has-text("Pay")').first();
  if (await settleBtn.count() > 0) {
    console.log('Clicking Settle button...');
    await settleBtn.click();
    await page.waitForTimeout(600);

    // Take screenshot of Metro Bank BACS modal
    await page.screenshot({ path: 'scratch/metro_bank_invoice_modal.png' });
    fs.copyFileSync('scratch/metro_bank_invoice_modal.png', path.join(artifactsDir, 'metro_bank_invoice_modal.png'));
    console.log('Saved metro_bank_invoice_modal.png');
  } else {
    console.log('No settle button found, screenshotting page');
    await page.screenshot({ path: 'scratch/metro_bank_invoices_page.png' });
  }

  // 2. Terms to Sign Page
  console.log('Navigating to http://localhost:5175/customer/terms-to-sign...');
  await page.goto('http://localhost:5175/customer/terms-to-sign', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // If already signed, check view or reset stage
  await page.screenshot({ path: 'scratch/terms_page_state.png' });
  fs.copyFileSync('scratch/terms_page_state.png', path.join(artifactsDir, 'terms_page_state.png'));
  console.log('Saved terms_page_state.png');

  await browser.close();
  console.log('Verification complete!');
})();

