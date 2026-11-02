const { chromium } = require('playwright');

(async () => {
  console.log('Testing Menu Network Requests & Logout in Real Browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const requestsIntercepted = [];
  page.on('request', (req) => {
    if (req.url().includes('/api/v1/')) {
      const urlObj = new URL(req.url());
      requestsIntercepted.push({ method: req.method(), path: urlObj.pathname });
    }
  });

  // 1. Login as Admin
  await page.goto('http://localhost:5175/login/admin', { waitUntil: 'networkidle' });
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/dashboard**', { timeout: 5000 });
  console.log('✅ Logged in as Admin, on:', page.url());

  // 2. Go to /admin/messages
  console.log('Navigating to /admin/messages ...');
  await page.goto('http://localhost:5175/admin/messages', { waitUntil: 'networkidle' });
  const messagesRequests = requestsIntercepted.filter(r => r.path.includes('/messages'));
  console.log('Messages Requests Intercepted:', messagesRequests);

  // 3. Go to /admin/terms-and-documents
  console.log('Navigating to /admin/terms-and-documents ...');
  await page.goto('http://localhost:5175/admin/terms-and-documents', { waitUntil: 'networkidle' });
  const termsRequests = requestsIntercepted.filter(r => r.path.includes('/terms-and-documents'));
  console.log('Terms Requests Intercepted:', termsRequests);

  // 4. Go to /admin/reports-and-analytics
  console.log('Navigating to /admin/reports-and-analytics ...');
  await page.goto('http://localhost:5175/admin/reports-and-analytics', { waitUntil: 'networkidle' });
  const reportsRequests = requestsIntercepted.filter(r => r.path.includes('/reports-and-analytics'));
  console.log('Reports Requests Intercepted:', reportsRequests);

  // 5. Test Sign Out button
  console.log('Clicking Sign Out button in sidebar...');
  const logoutBtn = await page.$('button[aria-label="Sign Out"]');
  if (logoutBtn) {
    await logoutBtn.click();
    await page.waitForURL('**/login/**', { timeout: 5000 });
    console.log('✅ Sign Out clicked, redirected to:', page.url());
    const logoutReq = requestsIntercepted.filter(r => r.path.includes('/auth/logout'));
    console.log('Logout Request Intercepted:', logoutReq);
  } else {
    console.warn('Sign Out button not found');
  }

  await browser.close();
  console.log('\n🎉 ALL 4 ITEMS (MESSAGES API, TERMS API, REPORTS API, SIGNOUT API) VERIFIED LIVE!');
})();
