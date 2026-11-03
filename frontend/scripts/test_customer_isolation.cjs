const { chromium } = require('playwright');
const path = require('path');

async function testCustomerIsolation() {
  console.log('Starting Customer Data Isolation & Privacy Test...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const artifactDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  try {
    // ----------------------------------------------------
    // TEST 1: EMMA WATSON (Customer A: customer@demo.com)
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Emma Watson (Customer A: customer@demo.com) ---');
    await page.goto('http://localhost:5175/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'customer@demo.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/customer/**', { timeout: 10000 });
    console.log('Logged in as Emma Watson. Checking Dashboard...');

    // Clear stale stored jobs in localStorage so clean INITIAL_JOBS are used
    await page.evaluate(() => {
      localStorage.removeItem('propertygroup_jobs');
      localStorage.removeItem('propertygroup_conversations_v1');
      window.dispatchEvent(new Event('propertygroup_jobs_updated'));
    });

    await page.goto('http://localhost:5175/customer/my-dashboard');
    await page.waitForTimeout(1000);

    let dashContent = await page.content();
    console.log('Emma Dashboard Privacy Verification:');
    console.log('- Contains 14 Mayfair Gate (Her job):', dashContent.includes('14 Mayfair Gate') ? 'PASSED (Visible)' : 'FAIL');
    console.log('- Contains 12 Pembroke Square (Harrison job):', dashContent.includes('12 Pembroke Square') ? 'FAIL (Leak)' : 'PASSED (Hidden)');
    console.log('- Contains Harrison Croft name:', dashContent.includes('Harrison Croft') ? 'FAIL (Leak)' : 'PASSED (Hidden)');

    await page.screenshot({ path: path.join(artifactDir, 'emma_dashboard_isolated.png'), fullPage: true });

    // Check Bookings Page
    await page.goto('http://localhost:5175/customer/my-bookings');
    await page.waitForTimeout(800);
    let bookContent = await page.content();
    console.log('Emma Bookings Privacy Verification:');
    console.log('- Contains 14 Mayfair Gate:', bookContent.includes('14 Mayfair Gate') ? 'PASSED (Visible)' : 'FAIL');
    console.log('- Contains 12 Pembroke Square:', bookContent.includes('12 Pembroke Square') ? 'FAIL (Leak)' : 'PASSED (Hidden)');
    await page.screenshot({ path: path.join(artifactDir, 'emma_bookings_isolated.png'), fullPage: true });

    // Check Quotations Page
    await page.goto('http://localhost:5175/customer/quotations');
    await page.waitForTimeout(800);
    let quoteContent = await page.content();
    console.log('Emma Quotations Privacy Verification:');
    console.log('- Contains 14 Mayfair Gate quote:', quoteContent.includes('14 Mayfair Gate') ? 'PASSED (Visible)' : 'FAIL');
    console.log('- Contains 12 Pembroke Square quote:', quoteContent.includes('12 Pembroke Square') ? 'FAIL (Leak)' : 'PASSED (Hidden)');

    // Check Messages Page
    await page.goto('http://localhost:5175/customer/messages');
    await page.waitForTimeout(800);
    let msgContent = await page.content();
    console.log('Emma Messages Privacy Verification:');
    console.log('- Contains Emma message thread:', msgContent.includes('Foxtons Mayfair') ? 'PASSED (Visible)' : 'FAIL');
    console.log('- Contains Harrison Croft or Kensington message:', (msgContent.includes('Harrison Croft') || msgContent.includes('sub-basement')) ? 'FAIL (Leak)' : 'PASSED (Hidden)');
    await page.screenshot({ path: path.join(artifactDir, 'emma_messages_isolated.png'), fullPage: true });

    // ----------------------------------------------------
    // TEST 2: HARRISON CROFT (Customer B: harrison@demo.com)
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Harrison Croft (Customer B: harrison@demo.com) ---');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('http://localhost:5175/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'harrison@demo.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/customer/**', { timeout: 10000 });
    console.log('Logged in as Harrison Croft. Checking Dashboard...');

    await page.goto('http://localhost:5175/customer/my-dashboard');
    await page.waitForTimeout(1000);

    let harrisonDash = await page.content();
    console.log('Harrison Dashboard Privacy Verification:');
    console.log('- Contains 12 Pembroke Square (His job):', harrisonDash.includes('12 Pembroke Square') ? 'PASSED (Visible)' : 'FAIL');
    console.log('- Contains 14 Mayfair Gate (Emma job):', harrisonDash.includes('14 Mayfair Gate') ? 'FAIL (Leak)' : 'PASSED (Hidden)');
    console.log('- Contains Emma Watson name:', harrisonDash.includes('Emma Watson') ? 'FAIL (Leak)' : 'PASSED (Hidden)');
    await page.screenshot({ path: path.join(artifactDir, 'harrison_dashboard_isolated.png'), fullPage: true });

    // Check Bookings Page
    await page.goto('http://localhost:5175/customer/my-bookings');
    await page.waitForTimeout(800);
    let harrisonBook = await page.content();
    console.log('Harrison Bookings Privacy Verification:');
    console.log('- Contains 12 Pembroke Square:', harrisonBook.includes('12 Pembroke Square') ? 'PASSED (Visible)' : 'FAIL');
    console.log('- Contains 14 Mayfair Gate:', harrisonBook.includes('14 Mayfair Gate') ? 'FAIL (Leak)' : 'PASSED (Hidden)');
    await page.screenshot({ path: path.join(artifactDir, 'harrison_bookings_isolated.png'), fullPage: true });

    // Check Quotations Page
    await page.goto('http://localhost:5175/customer/quotations');
    await page.waitForTimeout(800);
    let harrisonQuote = await page.content();
    console.log('Harrison Quotations Privacy Verification:');
    console.log('- Contains 12 Pembroke Square (£1,450):', harrisonQuote.includes('12 Pembroke Square') ? 'PASSED (Visible)' : 'FAIL');
    console.log('- Contains 14 Mayfair Gate:', harrisonQuote.includes('14 Mayfair Gate') ? 'FAIL (Leak)' : 'PASSED (Hidden)');
    await page.screenshot({ path: path.join(artifactDir, 'harrison_quotations_isolated.png'), fullPage: true });

    // Check Reports Page
    await page.goto('http://localhost:5175/customer/reports');
    await page.waitForTimeout(800);
    let harrisonRep = await page.content();
    console.log('Harrison Reports Privacy Verification:');
    console.log('- Leaks 14 Mayfair Gate certified report:', harrisonRep.includes('14 Mayfair Gate, London W1K 2PB') ? 'FAIL (Leak)' : 'PASSED (Hidden/No leak)');
    console.log('- Shows clean pending/in-progress message:', harrisonRep.includes('No completed reports released yet') ? 'PASSED (Accurate)' : 'FAIL');

    // Check Messages Page
    await page.goto('http://localhost:5175/customer/messages');
    await page.waitForTimeout(800);
    let harrisonMsg = await page.content();
    console.log('Harrison Messages Privacy Verification:');
    console.log('- Contains Harrison thread (conv-3):', harrisonMsg.includes('12 Pembroke Square') ? 'PASSED (Visible)' : 'FAIL');
    console.log('- Leaks Emma Watson Mayfair messages:', harrisonMsg.includes('Foxtons Mayfair under branch reference FX-402') ? 'FAIL (Leak)' : 'PASSED (Hidden)');
    await page.screenshot({ path: path.join(artifactDir, 'harrison_messages_isolated.png'), fullPage: true });

    console.log('\nAll Customer Data Isolation Tests Completed Successfully!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

testCustomerIsolation();

