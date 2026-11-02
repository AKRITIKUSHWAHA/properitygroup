const { chromium } = require('playwright');

async function testRole(email, expectedPath) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });

  await page.fill('input[type="email"]', email);
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/v1/auth/login')),
    page.click('button[type="submit"]'),
  ]);

  await page.waitForURL(`**${expectedPath}**`, { timeout: 5000 });
  console.log(`✅ ${email} successfully logged in & navigated to:`, page.url());
  await browser.close();
}

async function run() {
  await testRole('customer@demo.com', '/customer/my-dashboard');
  await testRole('surveyor@demo.com', '/surveyor/dashboard');
  await testRole('admin@demo.com', '/admin/dashboard');
  console.log('\n🚀 ALL 3 ROLES (CUSTOMER, SURVEYOR, ADMIN) LOGIN AND NAVIGATE 100% CLEANLY IN BROWSER!');
}

run().catch(console.error);
