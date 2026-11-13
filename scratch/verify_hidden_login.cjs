const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Homepage check
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  const desktopLoginLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button'));
    return links
      .filter((el) => {
        const href = (el.getAttribute('href') || '').toLowerCase();
        const txt = (el.innerText || '').toLowerCase();
        return href.includes('/login') || href.includes('/backoffice') || txt.includes('customer login') || txt.includes('back-office');
      })
      .map((el) => ({ tag: el.tagName, href: el.getAttribute('href'), text: el.innerText.trim() }));
  });
  console.log('Desktop visible login/portal links:', desktopLoginLinks);

  await page.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_header_no_login_desktop.png',
    clip: { x: 0, y: 0, width: 1440, height: 240 }
  });

  // 2. Mobile check (including drawer)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:5175/', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(1000);

  await mobilePage.screenshot({
    path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_header_no_login_mobile.png',
    clip: { x: 0, y: 0, width: 390, height: 180 }
  });

  const toggle = await mobilePage.$('.mobile-nav-toggle');
  if (toggle) {
    await toggle.click();
    await mobilePage.waitForTimeout(400);
    const drawerLoginLinks = await mobilePage.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      return links
        .filter((el) => {
          const href = (el.getAttribute('href') || '').toLowerCase();
          const txt = (el.innerText || '').toLowerCase();
          return href.includes('/login') || href.includes('/backoffice') || txt.includes('customer login') || txt.includes('back-office');
        })
        .map((el) => ({ tag: el.tagName, href: el.getAttribute('href'), text: el.innerText.trim() }));
    });
    console.log('Mobile + Drawer visible login/portal links:', drawerLoginLinks);

    await mobilePage.screenshot({
      path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_drawer_no_login_mobile.png',
      clip: { x: 0, y: 0, width: 390, height: 650 }
    });
  }

  // 3. Direct /login route still works cleanly for CRM testing
  await page.goto('http://127.0.0.1:5175/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const loginHeading = await page.textContent('h1');
  console.log('Direct /login heading intact:', loginHeading ? loginHeading.trim() : 'MISSING');

  await browser.close();
})();

