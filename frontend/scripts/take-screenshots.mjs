import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\91980\\.gemini\\antigravity\\brain\\3369d1fe-9d8f-4501-ba48-5d96559a95d7';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('Launching Edge from:', EDGE_PATH);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // 1. Desktop Homepage Hero Viewport
  console.log('Capturing Desktop Homepage Hero...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'redesign_homepage_desktop.png') });

  // 2. Desktop Services Section
  console.log('Capturing Desktop Services Section...');
  const servicesEl = await page.$('#services');
  if (servicesEl) {
    await servicesEl.scrollIntoView();
    await sleep(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'redesign_services_grid.png') });
  }

  // 3. Desktop Comparison Matrix Section
  console.log('Capturing Comparison Section...');
  const comparisonEl = await page.$('.survey-comparison-section');
  if (comparisonEl) {
    await comparisonEl.scrollIntoView();
    await sleep(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'redesign_comparison_matrix.png') });
  }

  // 4. Desktop Dedicated Quote Suite
  console.log('Capturing Dedicated Quote Suite...');
  const quoteEl = await page.$('#quote-section');
  if (quoteEl) {
    await quoteEl.scrollIntoView();
    await sleep(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'redesign_quote_suite.png') });
  }

  // 5. Mobile Homepage Viewport
  console.log('Capturing Mobile Homepage...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(800);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'redesign_homepage_mobile.png') });

  // 6. Level 2 Service Page Desktop
  console.log('Capturing Level 2 Service Page...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:5175/services/homebuyer-survey-level-2', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(800);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'redesign_service_level2.png') });

  // 7. Mobile Level 2 Service Page
  console.log('Capturing Mobile Level 2 Service Page...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5175/services/homebuyer-survey-level-2', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(800);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'redesign_service_level2_mobile.png') });

  await browser.close();
  console.log('All targeted screenshots captured successfully!');
}

main().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
