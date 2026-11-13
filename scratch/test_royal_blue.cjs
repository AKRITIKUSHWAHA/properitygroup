const fs = require('fs');
const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const imgPath = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/.user_uploaded/media_1794030310178_080419d8.png';
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0; background:transparent;">
        <canvas id="c1"></canvas>
        <canvas id="c2"></canvas>
      </body>
    </html>
  `);

  const outputs = await page.evaluate(async (b64) => {
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

    const scale = 4;
    const sx = 45, sy = 25, sw = 290, sh = 180;
    const finalW = sw * scale;
    const finalH = sh * scale;

    const buildTransparentLogo = async (canvasId, targetR, targetG, targetB) => {
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

          if (y >= 172) {
            cd[idx + 3] = 0;
            continue;
          }

          if (bgMask[pos] === 1) {
            cd[idx + 3] = 0;
          } else {
            const r = d[idx], g = d[idx+1], b = d[idx+2];
            if (b - r >= 10) {
              const alphaNorm = Math.min(1, Math.max(0, (255 - r) / 230));
              const alpha = alphaNorm > 0.72 ? 255 : Math.round(alphaNorm * 255);
              cd[idx] = targetR;
              cd[idx + 1] = targetG;
              cd[idx + 2] = targetB;
              cd[idx + 3] = alpha;
            } else {
              cd[idx + 3] = 0;
            }
          }
        }
      }
      c1ctx.putImageData(c1data, 0, 0);

      const outCanvas = document.getElementById(canvasId);
      outCanvas.width = finalW;
      outCanvas.height = finalH;
      const octx = outCanvas.getContext('2d');
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = 'high';

      octx.drawImage(clean1x, sx, sy, sw, sh, 0, 0, finalW, finalH);

      await document.fonts.ready;
      const centerX = (195.5 - sx) * scale;
      octx.fillStyle = `rgb(${targetR}, ${targetG}, ${targetB})`;
      octx.font = '900 37px "Montserrat", sans-serif';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      const text = 'SURVEYING  •  EXPERT WITNESS  •  DISREPAIR';
      octx.letterSpacing = '4.2px';
      octx.fillText(text, centerX, (181 - sy) * scale);

      return outCanvas.toDataURL('image/png');
    };

    const trimCanvas = async (dataUrl) => {
      const im = new Image();
      im.src = dataUrl;
      await new Promise(r => im.onload = r);
      const c = document.createElement('canvas');
      c.width = im.width;
      c.height = im.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(im, 0, 0);
      const id = ctx.getImageData(0, 0, c.width, c.height);
      const px = id.data;
      let minX = c.width, maxX = 0, minY = c.height, maxY = 0;
      for (let y = 0; y < c.height; y++) {
        for (let x = 0; x < c.width; x++) {
          if (px[(y * c.width + x) * 4 + 3] > 5) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      const pad = 16;
      const cx = Math.max(0, minX - pad);
      const cy = Math.max(0, minY - pad);
      const cw = Math.min(c.width - cx, (maxX - minX) + pad * 2);
      const ch = Math.min(c.height - cy, (maxY - minY) + pad * 2);
      const out = document.createElement('canvas');
      out.width = cw;
      out.height = ch;
      out.getContext('2d').drawImage(c, cx, cy, cw, ch, 0, 0, cw, ch);
      return out.toDataURL('image/png');
    };

    // Royal Luminous Blue (#4FA8FF -> rgb(79, 168, 255)) vs Navy (#032954 -> rgb(3, 41, 84))
    const royalUrl = await trimCanvas(await buildTransparentLogo('c1', 79, 168, 255));
    const exactNavyUrl = await trimCanvas(await buildTransparentLogo('c2', 3, 41, 84));
    return { royalUrl, exactNavyUrl };
  }, imgBase64);

  fs.writeFileSync('scratch/njs_royal_transparent.png', Buffer.from(outputs.royalUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
  fs.writeFileSync('scratch/njs_exact_navy_transparent.png', Buffer.from(outputs.exactNavyUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));

  // Test royalUrl on actual dark header
  await page.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await page.evaluate((b64) => {
    const img = document.querySelector('.site-logo-img');
    if (img) {
      img.src = 'data:image/png;base64,' + b64;
      img.style.filter = 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))';
    }
  }, outputs.royalUrl.replace(/^data:image\/png;base64,/, ''));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/actual_header_royal_blue.png', clip: { x: 0, y: 0, width: 1440, height: 220 } });

  await browser.close();
  console.log('Done testing royal blue');
})();

