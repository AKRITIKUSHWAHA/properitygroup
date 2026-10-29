import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\91980\\.gemini\\antigravity\\brain\\3369d1fe-9d8f-4501-ba48-5d96559a95d7';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. Desktop Page
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(1500);

  // Desktop Hero
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_hero_desktop.png') });

  // Desktop Expertise Section
  const expEl = await page.$('#expertise');
  if (expEl) {
    await expEl.scrollIntoView();
    await sleep(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_expertise_light_desktop.png') });
  }

  // Desktop Comparison Matrix
  const compEl = await page.$('#comparison-matrix');
  if (compEl) {
    await compEl.scrollIntoView();
    await sleep(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_comparison_light_desktop.png') });
  }

  // Desktop Workflow Process
  const procEl = await page.$('.workflow-process-section');
  if (procEl) {
    await procEl.scrollIntoView();
    await sleep(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_process_light_desktop.png') });
  }

  // Desktop Regional Coverage
  const covEl = await page.$('.regional-coverage-section');
  if (covEl) {
    await covEl.scrollIntoView();
    await sleep(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_coverage_light_desktop.png') });
  }

  // Desktop Quote Suite
  const quoteEl = await page.$('#quote-section');
  if (quoteEl) {
    await quoteEl.scrollIntoView();
    await sleep(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_quote_light_desktop.png') });
  }

  // Desktop Closing Banner
  const ctaEl = await page.$('.final-cta-section');
  if (ctaEl) {
    await ctaEl.scrollIntoView();
    await sleep(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_final_cta_light_desktop.png') });
  }

  await page.close();

  // 2. Mobile Page
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await mobilePage.goto('http://localhost:5175/', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(1500);

  // Mobile Hero
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_mobile.png') });

  // Mobile Quote
  const mobileQuote = await mobilePage.$('#quote-section');
  if (mobileQuote) {
    await mobileQuote.scrollIntoView();
    await sleep(800);
    await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_mobile_quote.png') });
  }

  // 3. Service Page (Desktop)
  const serviceDeskPage = await browser.newPage();
  await serviceDeskPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await serviceDeskPage.goto('http://localhost:5175/services/homebuyer-survey-level-2', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(1500);
  await serviceDeskPage.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_service_desktop.png') });
  await serviceDeskPage.close();

  // 4. Service Page (Mobile - Verifying No Horizontal Overflow)
  await mobilePage.goto('http://localhost:5175/services/homebuyer-survey-level-2', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(1500);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_service_mobile.png') });

  // Scroll down to check overview cards and stacked quote form
  await mobilePage.evaluate(() => window.scrollBy(0, 500));
  await sleep(800);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_service_mobile_content.png') });

  await mobilePage.close();
  await browser.close();
  console.log('Screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
