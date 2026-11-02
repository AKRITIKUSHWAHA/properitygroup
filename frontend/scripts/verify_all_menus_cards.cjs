const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Logging in as Super Admin...');
  await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@demo.com');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/**', { timeout: 10000 });

  const routes = [
    { name: 'companies', url: 'http://localhost:5175/admin/companies' },
    { name: 'surveyors', url: 'http://localhost:5175/admin/surveyors' },
    { name: 'jobs', url: 'http://localhost:5175/admin/jobs' },
    { name: 'leads', url: 'http://localhost:5175/admin/leads' },
    { name: 'quotes', url: 'http://localhost:5175/admin/quotes' },
    { name: 'reports', url: 'http://localhost:5175/admin/reports' },
    { name: 'terms', url: 'http://localhost:5175/admin/terms' },
  ];

  for (const r of routes) {
    console.log(`Checking ${r.name} at ${r.url}...`);
    await page.goto(r.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, `card_menu_${r.name}.png`), fullPage: false });
    console.log(`Saved card_menu_${r.name}.png`);
  }

  // Also check customer dashboard
  console.log('Logging in as Customer...');
  await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'customer@demo.com');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/customer/**', { timeout: 10000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'card_menu_customer_dashboard.png'), fullPage: false });
  console.log('Saved card_menu_customer_dashboard.png');

  await browser.close();
  console.log('=== All menus card verification complete! ===');
}

run();

