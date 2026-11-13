const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  // 1366x650 simulating laptop
  const page = await browser.newPage({ viewport: { width: 1366, height: 650 } });

  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  console.log('Navigating to http://localhost:5175...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  // 1. Service Coverage - Top position
  console.log('Opening Service Coverage dropdown...');
  const coverageTrigger = page.locator('button:has-text("Service Coverage")').first();
  await coverageTrigger.hover();
  await page.waitForTimeout(400);

  const coverageMenu = page.locator('.coverage-dropdown-menu').first();
  await coverageMenu.waitFor({ state: 'visible' });

  await page.screenshot({ path: 'scratch/dropdown_scrollable_top.png' });
  fs.copyFileSync('scratch/dropdown_scrollable_top.png', path.join(artifactsDir, 'dropdown_scrollable_top.png'));
  console.log('Saved dropdown_scrollable_top.png');

  // 2. Scroll dropdown down halfway
  console.log('Scrolling Service Coverage dropdown down...');
  await coverageMenu.evaluate(el => {
    el.scrollTop = 120;
  });
  await page.waitForTimeout(400);

  await page.screenshot({ path: 'scratch/dropdown_scrollable_mid.png' });
  fs.copyFileSync('scratch/dropdown_scrollable_mid.png', path.join(artifactsDir, 'dropdown_scrollable_mid.png'));
  console.log('Saved dropdown_scrollable_mid.png');

  // 3. Scroll dropdown to bottom
  console.log('Scrolling Service Coverage dropdown to bottom...');
  await coverageMenu.evaluate(el => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(400);

  await page.screenshot({ path: 'scratch/dropdown_scrollable_bottom.png' });
  fs.copyFileSync('scratch/dropdown_scrollable_bottom.png', path.join(artifactsDir, 'dropdown_scrollable_bottom.png'));
  console.log('Saved dropdown_scrollable_bottom.png');

  // 4. About / Contact dropdown
  console.log('Opening About / Contact dropdown...');
  const aboutTrigger = page.locator('button:has-text("About / Contact")').first();
  await aboutTrigger.hover();
  await page.waitForTimeout(400);

  await page.screenshot({ path: 'scratch/about_dropdown_scrollable.png' });
  fs.copyFileSync('scratch/about_dropdown_scrollable.png', path.join(artifactsDir, 'about_dropdown_scrollable.png'));
  console.log('Saved about_dropdown_scrollable.png');

  await browser.close();
  console.log('Verification completed!');
})();
