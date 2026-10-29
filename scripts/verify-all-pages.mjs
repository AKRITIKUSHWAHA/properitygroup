import puppeteer from 'puppeteer-core';
import path from 'path';
import { createServer } from 'vite';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\91980\\.gemini\\antigravity\\brain\\3369d1fe-9d8f-4501-ba48-5d96559a95d7';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('1. Starting Vite programmatic server...');
  const server = await createServer({
    configFile: path.resolve('vite.config.js'),
    root: path.resolve('.'),
    server: { port: 5173, host: '127.0.0.1' }
  });
  await server.listen();
  console.log('Vite server listening on http://127.0.0.1:5173/');

  console.log('2. Launching Edge browser...');
  const uniqueUserDataDir = path.join(ARTIFACT_DIR, 'scratch', 'puppeteer-profile-' + Date.now());
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    userDataDir: uniqueUserDataDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    // A. Desktop Homepage Hero
    console.log('Capturing Desktop Homepage Hero...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await desktopPage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1500);
    await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_hero_verified.png') });

    // B. Desktop Comparison Matrix
    console.log('Capturing Desktop Comparison Matrix...');
    const compEl = await desktopPage.$('#comparison-matrix');
    if (compEl) {
      await compEl.scrollIntoView();
      await sleep(800);
      await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_comparison_verified.png') });
    }

    // C. Desktop Quote Suite
    console.log('Capturing Desktop Quote Suite...');
    const quoteEl = await desktopPage.$('#quote-section');
    if (quoteEl) {
      await quoteEl.scrollIntoView();
      await sleep(800);
      await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_quote_verified.png') });
    }

    // D. Desktop Level 2 Service Page
    console.log('Capturing Desktop Service Page...');
    await desktopPage.goto('http://127.0.0.1:5173/services/homebuyer-survey-level-2', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1500);
    await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_service_desktop_verified.png') });
    await desktopPage.close();

    // E. Mobile Homepage
    console.log('Capturing Mobile Homepage...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await mobilePage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1500);
    await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_glass_mobile_verified.png') });

    // F. Mobile Service Page (Homebuyer Survey Level 2)
    console.log('Capturing Mobile Service Page (Fixing Image 3 Cutoff)...');
    await mobilePage.goto('http://127.0.0.1:5173/services/homebuyer-survey-level-2', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1500);
    await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_service_mobile_verified.png') });

    // G. Mobile Service Page Scrolled Down to Content & Form
    console.log('Capturing Mobile Service Page Content & Form...');
    await mobilePage.evaluate(() => window.scrollBy(0, 600));
    await sleep(800);
    await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'luxury_service_mobile_content_verified.png') });
    await mobilePage.close();

    console.log('All verification screenshots captured successfully!');
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
