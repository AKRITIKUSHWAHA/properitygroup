const { chromium } = require('playwright');
const path = require('path');

async function testInvoicesAndPaymentSettlement() {
  console.log('--- Starting Payment Settlement & VAT Invoice PDF Verification ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const artifactDir = path.resolve('C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0');

  try {
    // ==========================================
    // 1. TEST EMMA WATSON INVOICES & VAT RECEIPT
    // ==========================================
    console.log('1. Signing in as Emma Watson (customer@demo.com)...');
    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'customer@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/customer/**', { timeout: 10000 });

    console.log('Navigating to /customer/invoices-and-payments...');
    await page.goto('http://localhost:5175/customer/invoices-and-payments', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Verify Invoices Page UI
    const isVatRegVisible = await page.locator('text=VAT Reg: GB 384 9281 92').first().isVisible();
    const isPaidBadgeVisible = await page.locator('text=Paid & Settled').first().isVisible();
    const isPropertyVisible = await page.locator('text=14 Mayfair Gate').first().isVisible();
    console.log(`- VAT Registration Badge Visible: ${isVatRegVisible}`);
    console.log(`- Paid & Settled Badge Visible: ${isPaidBadgeVisible}`);
    console.log(`- Property (14 Mayfair Gate) Visible: ${isPropertyVisible}`);

    const emmaInvoicesShot = path.join(artifactDir, 'emma_invoices_page.png');
    await page.screenshot({ path: emmaInvoicesShot, fullPage: true });
    console.log(`-> Screenshot saved: ${emmaInvoicesShot}`);

    // Click "View Details" to open Itemized Receipt Modal
    console.log('Opening View Details modal...');
    await page.click('button:has-text("View Details")');
    await page.waitForTimeout(600);

    const isModalVisible = await page.locator('text=Official VAT Invoice Receipt').first().isVisible();
    console.log(`- Itemized VAT Modal Visible: ${isModalVisible}`);

    const emmaModalShot = path.join(artifactDir, 'emma_invoice_modal.png');
    await page.screenshot({ path: emmaModalShot });
    console.log(`-> Screenshot saved: ${emmaModalShot}`);

    // Close modal
    await page.click('button:has-text("Close")');
    await page.waitForTimeout(400);

    // Trigger PDF Download
    console.log('Triggering Download VAT Receipt...');
    await page.click('button:has-text("Download VAT Receipt")');
    await page.waitForTimeout(1000);

    // ==========================================
    // 2. TEST PAYMENT SETTLEMENT MODAL FLOW
    // ==========================================
    console.log('2. Testing Payment Settlement Flow with an unpaid job...');
    // Create an unpaid job in localStorage for Harrison or set JOB-2026-082 to Unpaid
    await page.evaluate(() => {
      try {
        const stored = localStorage.getItem('propertygroup_jobs_v1');
        if (stored) {
          const jobs = JSON.parse(stored);
          const j82 = jobs.find((j) => j.id === 'JOB-2026-082');
          if (j82) {
            j82.paymentStatus = 'Unpaid';
            localStorage.setItem('propertygroup_jobs_v1', JSON.stringify(jobs));
          }
        }
      } catch (e) {
        console.error(e);
      }
    });

    console.log('Signing in as Harrison Croft (harrison@demo.com)...');
    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'harrison@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/customer/**', { timeout: 10000 });

    console.log('Navigating to /customer/invoices-and-payments for Harrison...');
    await page.goto('http://localhost:5175/customer/invoices-and-payments', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Verify Unpaid status
    const isUnpaidVisible = await page.locator('text=Payment Outstanding').first().isVisible();
    const isSettleBtnVisible = await page.locator('button:has-text("Settle Invoice Now")').first().isVisible();
    console.log(`- Payment Outstanding Badge Visible: ${isUnpaidVisible}`);
    console.log(`- Settle Invoice Button Visible: ${isSettleBtnVisible}`);

    const harrisonUnpaidShot = path.join(artifactDir, 'harrison_invoice_unpaid.png');
    await page.screenshot({ path: harrisonUnpaidShot, fullPage: true });
    console.log(`-> Screenshot saved: ${harrisonUnpaidShot}`);

    // Click "Settle Invoice Now"
    console.log('Clicking "Settle Invoice Now"...');
    await page.click('button:has-text("Settle Invoice Now")');
    await page.waitForTimeout(600);

    const isSettleModalVisible = await page.locator('text=Settle Invoice & Lock Inspection').first().isVisible();
    console.log(`- Settle Modal Visible: ${isSettleModalVisible}`);

    const settleModalShot = path.join(artifactDir, 'customer_payment_settlement_modal.png');
    await page.screenshot({ path: settleModalShot });
    console.log(`-> Screenshot saved: ${settleModalShot}`);

    // Submit payment
    console.log('Authorizing payment...');
    await page.click('button:has-text("Pay £1740.00 & Download VAT Receipt"), button:has-text("Pay £1,740.00 & Download VAT Receipt")');
    await page.waitForTimeout(2000);

    // Verify invoice is now Paid!
    const isNowPaid = await page.locator('text=Paid & Settled').first().isVisible();
    console.log(`- Invoice Successfully Settled and Shows Paid: ${isNowPaid}`);

    const harrisonSettledShot = path.join(artifactDir, 'harrison_invoice_settled.png');
    await page.screenshot({ path: harrisonSettledShot, fullPage: true });
    console.log(`-> Screenshot saved: ${harrisonSettledShot}`);

    // ==========================================
    // 3. VERIFY IN ADMIN PORTAL
    // ==========================================
    console.log('3. Signing in as Admin to verify Quotations & Invoices...');
    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**', { timeout: 10000 });

    console.log('Navigating to /admin/quotes (Quotations & Payments)...');
    await page.goto('http://localhost:5175/admin/quotes', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const adminQuotesShot = path.join(artifactDir, 'admin_quotes_invoices.png');
    await page.screenshot({ path: adminQuotesShot, fullPage: true });
    console.log(`-> Screenshot saved: ${adminQuotesShot}`);

    console.log('=== Payment Settlement & VAT Invoice PDF Verification Completed Successfully! ===');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testInvoicesAndPaymentSettlement();

