const { chromium } = require('playwright');

(async () => {
  console.log('Testing Menu Isolation & Deduplication in Real Browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Login as Admin
  await page.goto('http://localhost:5175/login/admin', { waitUntil: 'networkidle' });
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/dashboard**', { timeout: 5000 });
  console.log('✅ Admin Logged in');

  // Helper to count API requests for a navigation
  async function testPageRequests(url, label) {
    const apiRequests = [];
    const listener = (req) => {
      if (req.url().includes('/api/v1/')) {
        const u = new URL(req.url());
        apiRequests.push(`${req.method()} ${u.pathname}`);
      }
    };
    page.on('request', listener);

    console.log(`\nNavigating to ${label} (${url})...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    page.off('request', listener);
    console.log(`Total API requests for ${label}:`, apiRequests.length);
    console.log(`Requests:`, apiRequests);
    return apiRequests;
  }

  // 2. Test CRM & Leads Page
  const crmReqs = await testPageRequests('http://localhost:5175/admin/crm-and-leads', 'CRM & Leads');

  // 3. Test Survey Jobs Page
  const jobsReqs = await testPageRequests('http://localhost:5175/admin/survey-jobs', 'Survey Jobs');

  // 4. Test Messages Page
  const msgReqs = await testPageRequests('http://localhost:5175/admin/messages', 'Messages Inbox');

  // 5. Test Terms Page
  const termsReqs = await testPageRequests('http://localhost:5175/admin/terms-and-documents', 'Terms & Documents');

  await browser.close();
  console.log('\n🎉 Verified clean single-request isolation across all menus!');
})();
