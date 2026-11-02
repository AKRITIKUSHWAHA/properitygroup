const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Logging in as Admin...');
  await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@demo.com');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin/**', { timeout: 10000 });
  await page.goto('http://localhost:5175/admin/surveyors', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Capture screenshot of the new cards
  const cardsGrid = page.locator('div.grid.grid-cols-1.sm\\:grid-cols-3').first();
  if (await cardsGrid.isVisible()) {
    await cardsGrid.screenshot({ path: path.join(ARTIFACTS_DIR, 'surveyors_cards_compact_refined.png') });
    console.log('Saved surveyors_cards_compact_refined.png');
  }

  // Also capture page view including header and table
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_surveyors_refined_full.png') });
  console.log('Saved admin_surveyors_refined_full.png');

  await browser.close();
}

run();

