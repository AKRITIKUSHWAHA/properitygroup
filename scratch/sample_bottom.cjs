const fs = require('fs');
const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const imgPath = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/.user_uploaded/media_1794030310178_080419d8.png';
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');

  const bottomPixels = await page.evaluate(async (b64) => {
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
    const w = canvas.width;

    // Sample from y = 175 to 186
    const samples = [];
    for (let y = 175; y <= 186; y++) {
      for (let x = 65; x <= 325; x++) {
        const idx = (y * w + x) * 4;
        const r = d[idx], g = d[idx+1], b = d[idx+2];
        const br = 0.299*r + 0.587*g + 0.114*b;
        if (br < 160) {
          samples.push({ x, y, r, g, b, br });
        }
      }
    }
    return {
      count: samples.length,
      sampleDark: samples.slice(0, 10),
      maxR: Math.max(...samples.map(s => s.r)),
      maxG: Math.max(...samples.map(s => s.g)),
      maxB: Math.max(...samples.map(s => s.b)),
      maxBr: Math.max(...samples.map(s => s.br))
    };
  }, imgBase64);

  console.log('Bottom text samples:', bottomPixels);
  await browser.close();
})();

