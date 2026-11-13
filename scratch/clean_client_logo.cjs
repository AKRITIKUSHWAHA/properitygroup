const fs = require('fs');
const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const imgPath = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/.user_uploaded/media_1794030310178_080419d8.png';
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');

  const processedDataUrl = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await new Promise(r => img.onload = r);

    const w = img.naturalWidth;
    const h = img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const srcData = ctx.getImageData(0, 0, w, h);
    const d = srcData.data;

    // The sticker is surrounded by doodle background.
    // Notice that anywhere inside the sticker:
    // Either the pixel is Navy: (r < 70 && g < 100 && b < 140)
    // Or it is White (the sticker body & border): (r > 230 && g > 230 && b > 230)
    // BUT the doodle background outside has warm yellowish/beige tone:
    // Specifically, doodle background has:
    // r is around 245, g is around 241, b is around 235.
    // Notice: r - b is >= 7! (Because it's warm beige/yellow, red is much higher than blue!)
    // Whereas pure white sticker has r - b <= 2! (Neutral white!)
    // Also doodle lines have r ~ 220-235, g ~ 215-230, b ~ 205-220 (r - b >= 10).
    
    // Let's do a flood fill starting from (0,0) that removes any pixel where (r - b >= 4 || is not inside sticker)
    // First, let's find the sticker mask.
    const isBackground = (x, y) => {
      const idx = (y * w + x) * 4;
      const r = d[idx], g = d[idx+1], b = d[idx+2];
      
      // If it's navy, it is definitely NOT background
      if (r < 75 && g < 110 && b > r) return false;

      // Pure white is sticker:
      // In JPEG/PNG artifacts, white sticker has r > 248, g > 248, b > 248, and abs(r - b) <= 4.
      if (r >= 248 && g >= 248 && b >= 248 && Math.abs(r - b) <= 4) {
        return false; // Sticker!
      }

      // Otherwise it's the warm beige/doodle background
      return true;
    };

    // Breadth-first search from all borders
    const visited = new Uint8Array(w * h);
    const bgMask = new Uint8Array(w * h);
    const queue = [];

    // Push all borders
    for (let x = 0; x < w; x++) {
      queue.push(x, 0); visited[x] = 1;
      queue.push(x, h - 1); visited[(h - 1) * w + x] = 1;
    }
    for (let y = 0; y < h; y++) {
      queue.push(0, y); visited[y * w] = 1;
      queue.push(w - 1, y); visited[y * w + (w - 1)] = 1;
    }

    let head = 0;
    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];
      const cpos = cy * w + cx;

      if (isBackground(cx, cy)) {
        bgMask[cpos] = 1;

        const neighbors = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const npos = ny * w + nx;
            if (!visited[npos]) {
              visited[npos] = 1;
              queue.push(nx, ny);
            }
          }
        }
      }
    }

    // Now, every pixel where bgMask is 1 is outer background: make it transparent!
    // And for any pixel INSIDE the sticker (bgMask === 0):
    // If it's navy: keep the crisp navy color (#002B5C).
    // If it's not navy: make it pure clean solid white (#FFFFFF)!
    // This removes any doodle showing through the roof or letters!
    
    // Find bounding box of sticker
    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pos = y * w + x;
        const idx = pos * 4;
        if (bgMask[pos] === 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          const r = d[idx], g = d[idx+1], b = d[idx+2];
          // Check if navy
          if (r < 75 && g < 110 && b > r) {
            // Keep navy or enhance to deep crisp navy
            d[idx] = Math.min(r, 10);
            d[idx+1] = Math.min(g, 48);
            d[idx+2] = Math.max(Math.min(b, 105), 85);
            d[idx+3] = 255;
          } else {
            // White body of the sticker
            d[idx] = 255;
            d[idx+1] = 255;
            d[idx+2] = 255;
            d[idx+3] = 255;
          }
        } else {
          // Transparent
          d[idx+3] = 0;
        }
      }
    }

    // Add 6px margin
    const pad = 6;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(w - cropX, (maxX - minX) + pad * 2);
    const cropH = Math.min(h - cropY, (maxY - minY) + pad * 2);

    // Create 4x upscaled super-crisp canvas
    const scale = 4;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = cropW * scale;
    outCanvas.height = cropH * scale;
    const outCtx = outCanvas.getContext('2d');
    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = 'high';

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropW;
    tempCanvas.height = cropH;
    const tempCtx = tempCanvas.getContext('2d');
    
    ctx.putImageData(srcData, 0, 0);
    tempCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // Draw scaled
    outCtx.drawImage(tempCanvas, 0, 0, outCanvas.width, outCanvas.height);

    return outCanvas.toDataURL('image/png');
  }, imgBase64);

  fs.writeFileSync('scratch/njs_official_logo_perfect.png', Buffer.from(processedDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('Saved scratch/njs_official_logo_perfect.png');

  await browser.close();
})();

