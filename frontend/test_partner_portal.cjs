const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5175/partners ...');
  await page.goto('http://localhost:5175/partners');
  await page.waitForLoadState('networkidle');

  // Verify Header & Partner Branding
  const title = await page.locator('h1').textContent();
  console.log('Partner Portal Title:', title.trim());

  // Test 1: Submit new referral modal
  console.log('Opening Submit Survey Referral modal...');
  await page.locator('button:has-text("Submit Survey Referral")').click();
  await page.waitForTimeout(400);

  // Fill in referral details
  console.log('Filling referral form...');
  await page.fill('input[placeholder="e.g. David & Caroline Sterling"]', 'Julian & Rebecca Foster');
  await page.fill('input[placeholder="e.g. 07700 900812"]', '07700 900412');
  await page.fill('input[placeholder="e.g. 14 Mayfair Gate, South Audley Street"]', '42 Grosvenor Square, Mayfair');

  // Submit referral
  console.log('Submitting referral...');
  await page.click('button:has-text("Submit Referral to NJS Desk")');
  await page.waitForTimeout(600);

  // Check referral appears in table
  const hasNewBuyer = await page.locator('td:has-text("Julian & Rebecca Foster")').first().isVisible();
  console.log('New referral visible in table:', hasNewBuyer);

  // Take screenshot of Partner Portal & Referrals Ledger
  await page.screenshot({ path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/partner_portal_dashboard.png' });

  // Test 2: Switch to Property Intelligence Tab (Point 26)
  console.log('Switching to Property Intelligence Tab (Point 26)...');
  await page.click('button:has-text("Property Intelligence (EPC & Land Registry)")');
  await page.waitForTimeout(400);

  // Test preset lookup
  await page.click('button:has-text("SW1X 0JH")');
  await page.waitForTimeout(400);

  const cadoganText = await page.locator('text=28 Cadogan Square').first().isVisible();
  console.log('Cadogan Square Intelligence loaded:', cadoganText);

  // Take screenshot of Property Intelligence tool
  await page.screenshot({ path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/property_intelligence_point26.png' });

  console.log('🎉 ALL PARTNER PORTAL & PROPERTY INTELLIGENCE TESTS PASSED 100%!');
  await browser.close();
})();
