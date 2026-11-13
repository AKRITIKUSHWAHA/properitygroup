const fs = require('fs');
const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const imgPath = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/.user_uploaded/media_1794030310178_080419d8.png';
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');

  const transparentDataUrl = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await new Promise(r => img.onload = r);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const w = canvas.width;
    const h = canvas.height;

    // Flood fill from corners: anything not pure/bright white of the sticker is background
    // Let's inspect what colors belong to background vs sticker
    // Background has R around 245, G around 241, B around 235, or doodle lines (R ~ 230, G ~ 220, B ~ 210)
    // The sticker is pure white: R > 250, G > 250, B > 250.
    // The logo inside is Navy: R < 50, G < 80, B < 140.
    
    // Breadth-first search flood fill starting from outer edge pixels
    const visited = new Uint8Array(w * h);
    const queue = [];

    // Push all borders to queue
    for (let x = 0; x < w; x++) {
      queue.push(x, 0);
      queue.push(x, h - 1);
      visited[x] = 1;
      visited[(h - 1) * w + x] = 1;
    }
    for (let y = 0; y < h; y++) {
      queue.push(0, y);
      queue.push(w - 1, y);
      visited[y * w] = 1;
      visited[y * w + (w - 1)] = 1;
    }

    let head = 0;
    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];
      const idx = (cy * w + cx) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // If it is pure white (the sticker boundary, e.g. r > 252 && g > 252 && b > 252), STOP expanding
      // Note: background doodle is yellowish/beige: r ~ 240-248, g ~ 235-244, b ~ 225-238
      // Pure white sticker is r > 252 && g > 252 && b > 252
      const isPureWhite = (r >= 253 && g >= 253 && b >= 253);

      if (!isPureWhite) {
        // This is background! Make it transparent
        data[idx + 3] = 0;

        // Explore neighbors
        const neighbors = [
          [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
        ];
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

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }, imgBase64);

  const base64Data = transparentDataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('scratch/logo_extracted_transparent.png', Buffer.from(base64Data, 'base64'));
  console.log('Saved scratch/logo_extracted_transparent.png');

  await browser.close();
})();

