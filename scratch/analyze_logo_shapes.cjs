const fs = require('fs');
const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const imgPath = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/.user_uploaded/media_1794030310178_080419d8.png';
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');

  const analysis = await page.evaluate(async (b64) => {
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
    const h = canvas.height;

    // Classify each pixel:
    // 0 = background (warm cream/doodle)
    // 1 = white sticker border
    // 2 = navy blue artwork
    const map = new Uint8Array(w * h);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = d[idx], g = d[idx+1], b = d[idx+2];
        
        // Navy: r < 60 && g < 90 && b < 140 (and br < 90)
        const br = 0.299*r + 0.587*g + 0.114*b;
        if (br < 80 && b >= r) {
          map[y * w + x] = 2; // Navy
        } else if (r > 248 && g > 248 && b > 248) {
          map[y * w + x] = 1; // Pure White
        } else {
          map[y * w + x] = 0; // Background / Doodle
        }
      }
    }

    // Let's find bounding box of navy pixels
    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (map[y * w + x] === 2) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Also bounding box of white sticker
    let wminX = w, wmaxX = 0, wminY = h, wmaxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (map[y * w + x] === 1 || map[y * w + x] === 2) {
          if (x < wminX) wminX = x;
          if (x > wmaxX) wmaxX = x;
          if (y < wminY) wminY = y;
          if (y > wmaxY) wmaxY = y;
        }
      }
    }

    return {
      w, h,
      navyBBox: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
      stickerBBox: { wminX, wmaxX, wminY, wmaxY, width: wmaxX - wminX, height: wmaxY - wminY }
    };
  }, imgBase64);

  console.log('Analysis:', analysis);
  await browser.close();
})();

