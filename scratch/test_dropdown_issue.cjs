const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  // Using 1366x650 to simulate a laptop with 125% scaling (similar to user's screenshot)
  const page = await browser.newPage({ viewport: { width: 1366, height: 650 } });

  console.log('Navigating to http://localhost:5175...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  // Hover or click "Service Coverage"
  console.log('Hovering on Service Coverage button...');
  const coverageTrigger = page.locator('button:has-text("Service Coverage")').first();
  await coverageTrigger.hover();
  await page.waitForTimeout(500);

  // Take screenshot of before state
  await page.screenshot({ path: 'scratch/dropdown_before_fix.png' });
  console.log('Saved dropdown_before_fix.png');

  await browser.close();
})();

