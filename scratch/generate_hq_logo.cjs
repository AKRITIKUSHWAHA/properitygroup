const fs = require('fs');
const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  
  const imgPath = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/.user_uploaded/media_1794030310178_080419d8.png';
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0; background:transparent;">
        <canvas id="c"></canvas>
      </body>
    </html>
  `);

  const renderedBase64 = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await new Promise(r => img.onload = r);

    const w = img.naturalWidth;
    const h = img.naturalHeight;

    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = w;
    srcCanvas.height = h;
    const sctx = srcCanvas.getContext('2d');
    sctx.drawImage(img, 0, 0);

    const sdata = sctx.getImageData(0, 0, w, h);
    const d = sdata.data;

    // Classify background outside sticker using flood-fill from border
    const visited = new Uint8Array(w * h);
    const bgMask = new Uint8Array(w * h);
    const queue = [];

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
      const idx = cpos * 4;

      const r = d[idx], g = d[idx+1], b = d[idx+2];
      const isStickerWhite = (r >= 248 && g >= 248 && b >= 248 && Math.abs(r - b) <= 4);
      const isBlue = (b - r >= 15);

      if (!isStickerWhite && !isBlue) {
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

    // High resolution composite canvas: 4x scale
    const scale = 4;
    // Bounds of sticker in original: x from 45 to 332, y from 20 to 205
    const sx = 45, sy = 20, sw = 290, sh = 188;
    const finalW = sw * scale;
    const finalH = sh * scale;

    const outCanvas = document.getElementById('c');
    outCanvas.width = finalW;
    outCanvas.height = finalH;
    const octx = outCanvas.getContext('2d');
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = 'high';

    // Build clean 1x canvas
    const clean1x = document.createElement('canvas');
    clean1x.width = w;
    clean1x.height = h;
    const c1ctx = clean1x.getContext('2d');
    const c1data = c1ctx.createImageData(w, h);
    const cd = c1data.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pos = y * w + x;
        const idx = pos * 4;

        if (bgMask[pos] === 1) {
          cd[idx + 3] = 0;
        } else {
          const r = d[idx], g = d[idx+1], b = d[idx+2];
          
          if (b - r >= 15) {
            // Enhanced deep navy
            const factor = Math.max(0, Math.min(1, (255 - b) / 160));
            cd[idx] = Math.round(0 * (1 - factor) + 0 * factor);
            cd[idx + 1] = Math.round(43 * factor + 200 * (1 - factor));
            cd[idx + 2] = Math.round(92 * factor + 255 * (1 - factor));
            cd[idx + 3] = 255;
          } else {
            cd[idx] = 255;
            cd[idx + 1] = 255;
            cd[idx + 2] = 255;
            cd[idx + 3] = 255;
          }
        }
      }
    }
    c1ctx.putImageData(c1data, 0, 0);

    // Draw scaled 1x to high-res canvas
    octx.drawImage(clean1x, sx, sy, sw, sh, 0, 0, finalW, finalH);

    await document.fonts.ready;

    // Clear bottom text capsule completely with pure white
    const bottomStartY = (173 - sy) * scale;
    const bottomEndY = (190 - sy) * scale;
    octx.fillStyle = '#FFFFFF';
    octx.fillRect(0, bottomStartY, finalW, bottomEndY - bottomStartY + 10);

    // Center of text
    const centerX = (195.5 - sx) * scale;
    
    // Draw the crystal-clear bottom text
    octx.fillStyle = '#002B5C';
    octx.font = '900 35px "Montserrat", sans-serif';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    
    const text = 'SURVEYING  •  EXPERT WITNESS  •  DISREPAIR';
    octx.letterSpacing = '4.5px';
    octx.fillText(text, centerX, (182 - sy) * scale);

    return outCanvas.toDataURL('image/png');
  }, imgBase64);

  const base64Data = renderedBase64.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('frontend/public/images/njs-logo.png', Buffer.from(base64Data, 'base64'));
  fs.writeFileSync('scratch/njs-logo-verified-hq.png', Buffer.from(base64Data, 'base64'));
  console.log('Regenerated full-width njs-logo.png');

  await browser.close();
})();
