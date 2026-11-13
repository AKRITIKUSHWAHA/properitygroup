const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('PAGE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:5175...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    localStorage.setItem('njs_fresh_clean_state_v1', 'true');
    const user = {
      id: 'usr_customer',
      email: 'customer@demo.com',
      name: 'Emma Watson',
      role: 'customer',
      roleLabel: 'Property Client',
      phone: '+44 7700 900147'
    };
    localStorage.setItem('property_group_user_session', JSON.stringify(user));

    const mockJob = {
      id: 'JOB-2026-901',
      customer: 'Emma Watson',
      customerEmail: 'customer@demo.com',
      property: '12 Hans Crescent, Knightsbridge, London SW1X 0NA',
      location: 'London',
      surveyType: 'RICS Level 3 Building Survey',
      date: '08 Nov 2026',
      timeSlot: '09:30 - 13:00',
      status: 'Awaiting Payment',
      paymentStatus: 'Unpaid',
      termsStatus: 'Signed',
      timelineStep: 3,
      quote: {
        baseFee: 1450.00
      }
    };
    localStorage.setItem('propertygroup_jobs', JSON.stringify([mockJob]));
  });

  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  console.log('Navigating to http://localhost:5175/customer/invoices-and-payments...');
  await page.goto('http://localhost:5175/customer/invoices-and-payments', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Check if invoice card is rendered
  const settleBtn = page.locator('button:has-text("Settle Invoice Now")').first();
  await settleBtn.waitFor({ timeout: 5000 });
  console.log('Found Settle Invoice Now button! Clicking it...');
  await settleBtn.click();
  await page.waitForTimeout(600);

  // Take screenshot of Metro Bank Invoice Settlement modal
  await page.screenshot({ path: 'scratch/metro_bank_invoice_modal.png' });
  fs.copyFileSync('scratch/metro_bank_invoice_modal.png', path.join(artifactsDir, 'metro_bank_invoice_modal.png'));
  console.log('Saved metro_bank_invoice_modal.png');

  // Click Confirm Settlement
  console.log('Clicking Confirm Settlement...');
  await page.click('button:has-text("Confirm Settlement")');
  await page.waitForTimeout(1000);

  // Screenshot after settlement
  await page.screenshot({ path: 'scratch/invoice_settled_receipt.png' });
  fs.copyFileSync('scratch/invoice_settled_receipt.png', path.join(artifactsDir, 'invoice_settled_receipt.png'));
  console.log('Saved invoice_settled_receipt.png');

  await browser.close();
  console.log('Invoice settlement verified successfully!');
})();

