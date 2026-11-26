import { chromium } from 'playwright';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5175';

async function runSmoke() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log(`[Smoke] Navigating to ${FRONTEND_URL}/login ...`);
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const emailInput = page.locator('input[type="email"]:visible').first();
    const passInput = page.locator('input[type="password"]:visible').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });

    // Check login form renders cleanly
    if (!(await emailInput.isVisible()) || !(await passInput.isVisible())) {
      throw new Error('Login form inputs not visible');
    }

    // Attempt login if demo/test credentials are provided via env
    const testEmail = process.env.SMOKE_CUSTOMER_EMAIL;
    const testPassword = process.env.SMOKE_CUSTOMER_PASSWORD;
    if (testEmail && testPassword) {
      await emailInput.fill(testEmail);
      await passInput.fill(testPassword);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL('**/customer/**', { timeout: 15000 });

      // Navigate to Quotations & Terms pages to verify they render without crash
      await page.goto(`${FRONTEND_URL}/customer/quotations`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.goto(`${FRONTEND_URL}/customer/terms-to-sign`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const bodyText = await page.locator('body').innerText();
      if (!bodyText || bodyText.trim().length < 20) {
        throw new Error('Terms page rendered empty body');
      }
      console.log('[Smoke] Logged-in customer quotations & terms pages verified.');
    } else {
      console.log('[Smoke] Login page verified (set SMOKE_CUSTOMER_EMAIL & SMOKE_CUSTOMER_PASSWORD to run authenticated quote/terms flow).');
    }

    console.log('[Smoke] PASSED');
  } finally {
    await browser.close();
  }
}

runSmoke().catch((err) => {
  console.error('[Smoke] FAILED:', err);
  process.exit(1);
});
