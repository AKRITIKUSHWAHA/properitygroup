const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5175/contact', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Find address container on contact page
  const addressElem = await page.$('.contact-details-grid, .contact-info, #contact-info');
  if (addressElem) {
    await addressElem.screenshot({
      path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_contact_address_card.png'
    });
  } else {
    // Screenshot mid section of contact page
    await page.screenshot({
      path: 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/verified_contact_address_card.png',
      clip: { x: 0, y: 550, width: 1440, height: 650 }
    });
  }

  await browser.close();
  console.log('Contact address card screenshot captured');
})();

