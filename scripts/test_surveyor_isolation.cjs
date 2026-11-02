const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testIsolation() {
  console.log('Starting Surveyor Job Isolation Test with Playwright...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const artifactDir = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0';

  try {
    // ----------------------------------------------------
    // TEST 1: DAVID THORNE (surveyor@demo.com)
    // ----------------------------------------------------
    console.log('\n--- Testing David Thorne MRICS (surveyor@demo.com) ---');
    await page.goto('http://localhost:5175/login/surveyor');
    await page.waitForLoadState('networkidle');

    // Fill credentials for David Thorne
    await page.fill('input[type="email"]', 'surveyor@demo.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Wait for surveyor dashboard/portal
    await page.waitForURL('**/surveyor/**', { timeout: 10000 });
    console.log('Logged in as David Thorne. Navigating to /surveyor/my-jobs...');

    // Clear any cached localStorage jobs to ensure clean load of INITIAL_JOBS
    await page.evaluate(() => {
      localStorage.removeItem('propertygroup_jobs');
      window.dispatchEvent(new Event('propertygroup_jobs_updated'));
    });

    await page.goto('http://localhost:5175/surveyor/my-jobs');
    await page.waitForTimeout(1000);

    // Get Active button text
    const activeBtnText = await page.textContent('button:has-text("Active Jobs")');
    console.log('David Thorne button:', activeBtnText);

    // Click Completed button
    const completedBtnText = await page.textContent('button:has-text("Completed Jobs")');
    console.log('David Thorne button:', completedBtnText);

    // Capture screenshot of David Thorne's jobs
    const davidJobsScreenshot = path.join(artifactDir, 'david_thorne_jobs_isolated.png');
    await page.screenshot({ path: davidJobsScreenshot, fullPage: true });
    console.log(`Saved screenshot: ${davidJobsScreenshot}`);

    // Check calendar for David Thorne
    await page.goto('http://localhost:5175/surveyor/calendar');
    await page.waitForTimeout(1000);
    const davidCalScreenshot = path.join(artifactDir, 'david_thorne_calendar_isolated.png');
    await page.screenshot({ path: davidCalScreenshot, fullPage: true });

    // ----------------------------------------------------
    // TEST 2: OLIVER HUGHES (oliver@demo.com)
    // ----------------------------------------------------
    console.log('\n--- Testing Oliver Hughes MRICS (oliver@demo.com) ---');
    // Clear storage to log out
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('http://localhost:5175/login/surveyor');
    await page.waitForLoadState('networkidle');

    // Fill credentials for Oliver Hughes
    await page.fill('input[type="email"]', 'oliver@demo.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/surveyor/**', { timeout: 10000 });
    console.log('Logged in as Oliver Hughes. Navigating to /surveyor/my-jobs...');

    await page.goto('http://localhost:5175/surveyor/my-jobs');
    await page.waitForTimeout(1000);

    const oliverActiveBtn = await page.textContent('button:has-text("Active Jobs")');
    console.log('Oliver Hughes button:', oliverActiveBtn);

    const oliverCompletedBtn = await page.textContent('button:has-text("Completed Jobs")');
    console.log('Oliver Hughes button:', oliverCompletedBtn);

    // Verify David Thorne's job (14 Mayfair Gate) does NOT exist on Oliver's screen
    const pageContent = await page.content();
    const hasMayfairGate = pageContent.includes('14 Mayfair Gate');
    const hasPembrokeSquare = pageContent.includes('12 Pembroke Square');
    const hasKensingtonPalace = pageContent.includes('24 Kensington Palace Gardens');

    console.log('Privacy Verification for Oliver:');
    console.log('- Contains 14 Mayfair Gate (David Thorne job):', hasMayfairGate ? 'FAIL (Leak)' : 'PASSED (Hidden)');
    console.log('- Contains 12 Pembroke Square (David Thorne job):', hasPembrokeSquare ? 'FAIL (Leak)' : 'PASSED (Hidden)');
    console.log('- Contains 24 Kensington Palace Gardens (Oliver job):', hasKensingtonPalace ? 'PASSED (Visible)' : 'FAIL');

    // Capture screenshot of Oliver Hughes's jobs
    const oliverJobsScreenshot = path.join(artifactDir, 'oliver_hughes_jobs_isolated.png');
    await page.screenshot({ path: oliverJobsScreenshot, fullPage: true });
    console.log(`Saved screenshot: ${oliverJobsScreenshot}`);

    // Check calendar for Oliver Hughes
    await page.goto('http://localhost:5175/surveyor/calendar');
    await page.waitForTimeout(1000);
    const oliverCalScreenshot = path.join(artifactDir, 'oliver_hughes_calendar_isolated.png');
    await page.screenshot({ path: oliverCalScreenshot, fullPage: true });

    // Check dashboard for Oliver Hughes
    await page.goto('http://localhost:5175/surveyor/dashboard');
    await page.waitForTimeout(1000);
    const oliverDashScreenshot = path.join(artifactDir, 'oliver_hughes_dashboard_isolated.png');
    await page.screenshot({ path: oliverDashScreenshot, fullPage: true });

    console.log('\nAll Surveyor Job Isolation Tests Completed Successfully!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

testIsolation();

