const path = require('path');
const fs = require('fs');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5175');

  // Crop logo using canvas in browser
  const croppedDataUrl = await page.evaluate(async () => {
    const img = new Image();
    img.src = '/images/njs-logo.png';
    await new Promise(r => img.onload = r);

    // Bounding box from previous measure: minX: 139, minY: 90, maxX: 826, maxY: 503
    const pad = 12;
    const cropX = Math.max(0, 139 - pad);
    const cropY = Math.max(0, 90 - pad);
    const cropW = Math.min(img.naturalWidth - cropX, (826 - 139) + pad * 2);
    const cropH = Math.min(img.naturalHeight - cropY, (503 - 90) + pad * 2);

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    return canvas.toDataURL('image/png');
  });

  const base64Data = croppedDataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('frontend/public/images/njs-logo-clean.png', Buffer.from(base64Data, 'base64'));
  console.log('Saved frontend/public/images/njs-logo-clean.png');

  await browser.close();
})();

