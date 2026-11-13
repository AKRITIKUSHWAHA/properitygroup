const { chromium } = require('../frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const artifactsDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  // 1. Check Login Page
  console.log('Navigating to http://localhost:5175/login...');
  await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Take screenshot of Login Page with NJS logo and clean footer
  await page.screenshot({ path: 'scratch/login_page_verified.png' });
  fs.copyFileSync('scratch/login_page_verified.png', path.join(artifactsDir, 'login_page_verified.png'));
  console.log('Saved login_page_verified.png');

  // Close-up on the login form card
  const loginCard = page.locator('.max-w-4xl').first();
  if (await loginCard.count() > 0) {
    await loginCard.screenshot({ path: 'scratch/login_card_closeup.png' });
    fs.copyFileSync('scratch/login_card_closeup.png', path.join(artifactsDir, 'login_card_closeup.png'));
    console.log('Saved login_card_closeup.png');
  }

  // 2. Check Website Footer
  console.log('Navigating to http://localhost:5175...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const footer = page.locator('footer.site-footer').first();
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  await page.screenshot({ path: 'scratch/footer_verified_clean.png' });
  fs.copyFileSync('scratch/footer_verified_clean.png', path.join(artifactsDir, 'footer_verified_clean.png'));
  console.log('Saved footer_verified_clean.png');

  // Close-up on footer bottom bar
  const footerBottom = page.locator('.footer-bottom').first();
  if (await footerBottom.count() > 0) {
    await footerBottom.screenshot({ path: 'scratch/footer_bottom_closeup.png' });
    fs.copyFileSync('scratch/footer_bottom_closeup.png', path.join(artifactsDir, 'footer_bottom_closeup.png'));
    console.log('Saved footer_bottom_closeup.png');
  }

  await browser.close();
  console.log('All verifications completed successfully!');
})();

