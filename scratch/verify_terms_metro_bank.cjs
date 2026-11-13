const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('PAGE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:5175 to inject fresh user session...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('property_group_user_session', JSON.stringify({
      id: 'cust-temp-1',
      email: 'client.survey@demo.com',
      name: 'Natasha Shergill Client',
      role: 'customer',
      roleLabel: 'Instructing Client',
      phone: '0333 305 2777'
    }));
  });

  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  console.log('Navigating to http://localhost:5175/customer/terms-to-sign...');
  await page.goto('http://localhost:5175/customer/terms-to-sign', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Check the terms agreement checkbox
  const checkbox = page.locator('input[type="checkbox"]').first();
  await checkbox.check();

  // Type legal name
  const nameInput = page.locator('input[placeholder*="Harrison Croft"]').first();
  if (await nameInput.count() > 0) {
    await nameInput.fill('Natasha Shergill');
  }

  // Click Sign Agreement & Proceed to Payment
  console.log('Clicking Sign Agreement & Proceed to Payment...');
  await page.click('button:has-text("Sign Agreement & Proceed to Payment")');
  await page.waitForTimeout(600);

  // We should now be on stage === 'payment'
  console.log('Checking for Metro Bank PLC text...');
  const metroBankText = await page.locator('text=Metro Bank PLC').first();
  await metroBankText.waitFor({ timeout: 5000 });
  console.log('Found Metro Bank PLC text on page!');

  // Take screenshot of Stage 2 with Metro Bank details
  await page.screenshot({ path: 'scratch/metro_bank_terms_payment.png', fullPage: true });
  fs.copyFileSync('scratch/metro_bank_terms_payment.png', path.join(artifactsDir, 'metro_bank_terms_payment.png'));
  console.log('Saved metro_bank_terms_payment.png');

  // Click Confirm Metro Bank Transfer
  console.log('Clicking Confirm Metro Bank Transfer button...');
  await page.click('button:has-text("Confirm Metro Bank Transfer")');
  await page.waitForTimeout(1500);

  // Take screenshot of confirmed state
  await page.screenshot({ path: 'scratch/metro_bank_confirmed.png', fullPage: true });
  fs.copyFileSync('scratch/metro_bank_confirmed.png', path.join(artifactsDir, 'metro_bank_confirmed.png'));
  console.log('Saved metro_bank_confirmed.png');

  await browser.close();
  console.log('Test completed successfully!');
})();

