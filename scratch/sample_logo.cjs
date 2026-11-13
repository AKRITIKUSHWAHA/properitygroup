const fs = require('fs');
const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const imgPath = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/.user_uploaded/media_1794030310178_080419d8.png';
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');

  const report = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await new Promise(r => img.onload = r);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = idata.data;
    
    // Let's sample colors at various coordinates
    // (10, 10) - background
    const bg1 = [d[10*4*canvas.width + 10*4], d[10*4*canvas.width + 10*4 + 1], d[10*4*canvas.width + 10*4 + 2]];
    // Center of 'N' - approx (140, 120)
    // Let's find darkest pixels (Navy)
    let minBrightness = 255, darkPixel = null, darkCoords = null;
    let whitePixelCount = 0;
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4;
        const r = d[idx], g = d[idx+1], b = d[idx+2];
        const br = 0.299*r + 0.587*g + 0.114*b;
        if (br < minBrightness) {
          minBrightness = br;
          darkPixel = [r, g, b];
          darkCoords = [x, y];
        }
        if (r > 250 && g > 250 && b > 250) {
          whitePixelCount++;
        }
      }
    }

    return {
      w: canvas.width,
      h: canvas.height,
      bgSample: bg1,
      darkestPixel: darkPixel,
      darkestCoords: darkCoords,
      whitePixelCount,
      totalPixels: canvas.width * canvas.height
    };
  }, imgBase64);

  console.log('Sample report:', report);
  await browser.close();
})();

