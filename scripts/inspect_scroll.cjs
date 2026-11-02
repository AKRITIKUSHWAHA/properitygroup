const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@demo.com');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin/**', { timeout: 10000 });
  await page.goto('http://localhost:5175/admin/messages', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const scrollData = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const main = document.querySelector('main');
    const header = document.querySelector('header');
    
    return {
      windowHeight: window.innerHeight,
      docScrollHeight: doc.scrollHeight,
      bodyScrollHeight: body.scrollHeight,
      mainScrollHeight: main?.scrollHeight,
      mainClientHeight: main?.clientHeight,
      headerHeight: header?.offsetHeight,
      canScrollWindow: doc.scrollHeight > window.innerHeight,
      elementsWithScroll: Array.from(document.querySelectorAll('*'))
        .filter(el => el.scrollHeight > el.clientHeight && getComputedStyle(el).overflowY === 'auto')
        .map(el => ({ tag: el.tagName, className: el.className, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }))
    };
  });

  console.log('Scroll Inspection:', JSON.stringify(scrollData, null, 2));
  await browser.close();
}

check();
