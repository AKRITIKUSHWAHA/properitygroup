import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({ executablePath: EDGE_PATH, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const images = [
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1920&q=85'
  ];

  for (let i = 0; i < images.length; i++) {
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle0' });
    await page.evaluate((img) => {
      const el = document.querySelector('.luxury-hero-manor-bg');
      if (el) el.style.backgroundImage = `url("${img}")`;
    }, images[i]);
    await sleep(1000);
    await page.screenshot({ path: `C:/Users/91980/.gemini/antigravity/brain/3369d1fe-9d8f-4501-ba48-5d96559a95d7/manor_candidate_${i}.png` });
  }
  await browser.close();
  console.log('Done testing candidate images');
}
run();
