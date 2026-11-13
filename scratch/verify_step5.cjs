const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('PAGE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:5175/contact#coverage...');
  await page.goto('http://localhost:5175/contact#coverage', { waitUntil: 'networkidle' });

  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  // 1. Screenshot London coverage showing Ealing, Hillingdon, Barnet, Ilford
  const coverageCard = await page.locator('.coverage-card').first();
  await coverageCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/coverage_london.png' });
  fs.copyFileSync('scratch/coverage_london.png', `${artifactsDir}/coverage_london.png`);
  console.log('Saved coverage_london.png');

  // 2. Click Buckinghamshire tab
  await page.click('button[role="tab"]:has-text("Buckinghamshire")');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/coverage_bucks.png' });
  fs.copyFileSync('scratch/coverage_bucks.png', `${artifactsDir}/coverage_bucks.png`);
  console.log('Saved coverage_bucks.png');

  // 3. Click Berkshire tab
  await page.click('button[role="tab"]:has-text("Berkshire")');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/coverage_berks.png' });
  fs.copyFileSync('scratch/coverage_berks.png', `${artifactsDir}/coverage_berks.png`);
  console.log('Saved coverage_berks.png');

  // 4. Verify count of CHP sections on the page
  const chpCount = await page.locator('#complaints').count();
  console.log('Count of #complaints sections on page:', chpCount);

  // 5. Screenshot Single clean CHP section
  const chpSection = await page.locator('#complaints').first();
  await chpSection.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'scratch/single_chp_section.png' });
  fs.copyFileSync('scratch/single_chp_section.png', `${artifactsDir}/single_chp_section.png`);
  console.log('Saved single_chp_section.png');

  // 6. Screenshot FAQ turnaround time
  const faqBtn = await page.locator('button:has-text("How quickly can a survey be booked")').first();
  if (await faqBtn.isVisible()) {
    await faqBtn.click();
    await page.waitForTimeout(300);
  }
  const faqSection = await page.locator('#faqs').first();
  await faqSection.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'scratch/faq_turnaround_verified.png' });
  fs.copyFileSync('scratch/faq_turnaround_verified.png', `${artifactsDir}/faq_turnaround_verified.png`);
  console.log('Saved faq_turnaround_verified.png');

  await browser.close();
  console.log('Done verifying Step 5.');
})();

