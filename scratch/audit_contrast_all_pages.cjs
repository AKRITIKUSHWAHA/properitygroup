const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

const ROUTES = [
  '/',
  '/contact',
  '/about-us',
  '/which-survey-do-i-need',
  '/expert-witness',
  '/services/homebuyer-survey-level-2',
  '/services/building-survey-level-3',
  '/services/snagging-report',
  '/services/valuation-report',
  '/services/damp-survey',
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const route of ROUTES) {
    await page.goto('http://127.0.0.1:5175' + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const issues = await page.evaluate(() => {
      const parseRgb = (str) => {
        const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!m) return null;
        return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
      };
      const lum = ({ r, g, b }) => {
        const a = [r, g, b].map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
      };
      const contrast = (c1, c2) => {
        const l1 = lum(c1);
        const l2 = lum(c2);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };
      const getEffectiveBg = (el) => {
        let cur = el;
        while (cur && cur.nodeType === 1) {
          const st = getComputedStyle(cur);
          if (st.backgroundImage && st.backgroundImage.includes('gradient')) {
            // Sample first color in gradient
            const gm = st.backgroundImage.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (gm) return { r: +gm[1], g: +gm[2], b: +gm[3], a: 1 };
          }
          const bg = parseRgb(st.backgroundColor);
          if (bg && bg.a > 0.4) return bg;
          cur = cur.parentElement;
        }
        return { r: 6, g: 11, b: 19, a: 1 };
      };

      const bad = [];
      const els = document.querySelectorAll('h1, h2, h3, h4, h5, p, span, strong, li, label, a, button');
      for (const el of els) {
        if (!el.innerText || !el.innerText.trim()) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        const style = getComputedStyle(el);
        const fg = parseRgb(style.color);
        const bg = getEffectiveBg(el);
        if (!fg || !bg) continue;

        const ratio = contrast(fg, bg);
        if (ratio < 3.0) {
          bad.push({
            tag: el.tagName,
            cls: el.className ? String(el.className).slice(0, 60) : '',
            text: el.innerText.trim().slice(0, 60),
            fg: style.color,
            bg: `rgb(${bg.r},${bg.g},${bg.b})`,
            ratio: ratio.toFixed(2),
          });
        }
      }
      return bad;
    });

    if (issues.length > 0) {
      console.log(`\n=== ROUTE ${route} (${issues.length} contrast issues) ===`);
      issues.slice(0, 15).forEach((x) => {
        console.log(`  [${x.ratio}] <${x.tag} class="${x.cls}"> "${x.text}" | fg:${x.fg} on bg:${x.bg}`);
      });
    } else {
      console.log(`ROUTE ${route}: OK (0 contrast issues)`);
    }
  }

  // Capture close-ups on /contact
  await page.goto('http://127.0.0.1:5175/contact', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  const chp = await page.$('.complaints-procedure-card');
  if (chp) {
    await chp.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await chp.screenshot({
      path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_contact_chp_fixed.png'
    });
  }

  const privacy = await page.$('.privacy-notice-card');
  if (privacy) {
    await privacy.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await privacy.screenshot({
      path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_contact_privacy_fixed.png'
    });
  }

  const grid = await page.$('.contact-detail-grid');
  if (grid) {
    await grid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await grid.screenshot({
      path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_contact_info_fixed.png'
    });
  }

  await browser.close();
})();
