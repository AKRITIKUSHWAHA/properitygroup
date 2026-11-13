const { chromium } = require('../frontend/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });

  const metrics = await page.evaluate(() => {
    const hero = document.querySelector('.luxury-hero-container');
    const heroInner = document.querySelector('.luxury-hero-inner');
    const heroCanvas = document.querySelector('.luxury-hero-canvas');
    const textBlock = document.querySelector('.luxury-hero-text-block');
    const confidenceStrip = document.querySelector('.hero-confidence-strip');
    const services = document.querySelector('.services-overview-section');
    const servicesHeader = document.querySelector('.services-overview-header');

    return {
      hero: hero ? {
        height: hero.offsetHeight,
        paddingBottom: window.getComputedStyle(hero).paddingBottom,
        marginBottom: window.getComputedStyle(hero).marginBottom,
        rect: hero.getBoundingClientRect()
      } : null,
      heroCanvas: heroCanvas ? {
        height: heroCanvas.offsetHeight,
        rect: heroCanvas.getBoundingClientRect()
      } : null,
      textBlock: textBlock ? {
        height: textBlock.offsetHeight,
        marginBottom: window.getComputedStyle(textBlock).marginBottom,
        rect: textBlock.getBoundingClientRect()
      } : null,
      confidenceStrip: confidenceStrip ? {
        rect: confidenceStrip.getBoundingClientRect()
      } : null,
      services: services ? {
        paddingTop: window.getComputedStyle(services).paddingTop,
        marginTop: window.getComputedStyle(services).marginTop,
        rect: services.getBoundingClientRect()
      } : null,
      servicesHeader: servicesHeader ? {
        rect: servicesHeader.getBoundingClientRect()
      } : null,
      gapBetweenConfidenceAndServicesHeader: (servicesHeader && confidenceStrip)
        ? (servicesHeader.getBoundingClientRect().top - confidenceStrip.getBoundingClientRect().bottom)
        : null
    };
  });

  console.log(JSON.stringify(metrics, null, 2));

  await browser.close();
})();

