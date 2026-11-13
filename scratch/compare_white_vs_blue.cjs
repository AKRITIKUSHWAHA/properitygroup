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
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0; background:transparent;"></body>
    </html>
  `);

  const blueDataUrl = await page.evaluate(async (b64) => {
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
    const d = sctx.getImageData(0, 0, w, h).data;

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
      const cx = queue[head++], cy = queue[head++];
      const cpos = cy * w + cx, idx = cpos * 4;
      const r = d[idx], g = d[idx+1], b = d[idx+2];
      const isStickerWhite = (r >= 248 && g >= 248 && b >= 248 && Math.abs(r - b) <= 4);
      const isBlue = (b - r >= 15);
      if (!isStickerWhite && !isBlue) {
        bgMask[cpos] = 1;
        for (const [nx, ny] of [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]]) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const npos = ny * w + nx;
            if (!visited[npos]) { visited[npos] = 1; queue.push(nx, ny); }
          }
        }
      }
    }

    let pgMinX = w, pgMaxX = 0;
    for (let y = 148; y <= 171; y++) {
      for (let x = 0; x < w; x++) {
        const pos = y * w + x;
        if (bgMask[pos] === 0) {
          const idx = pos * 4;
          if (d[idx+2] - d[idx] >= 20 && (255 - d[idx]) > 100) {
            if (x < pgMinX) pgMinX = x;
            if (x > pgMaxX) pgMaxX = x;
          }
        }
      }
    }
    const pgCenter = (pgMinX + pgMaxX) / 2;
    const pgWidth = pgMaxX - pgMinX;

    await document.fonts.ready;
    const scale = 5;
    const canvasW = w * scale;
    const canvasH = (h + 20) * scale;

    // Color: Clean Bright Royal Blue (#55AAFF -> 85, 170, 255) or #60B2FF (96, 178, 255)
    const targetR = 88, targetG = 172, targetB = 255;

    const clean1x = document.createElement('canvas');
    clean1x.width = w; clean1x.height = h;
    const c1ctx = clean1x.getContext('2d');
    const c1data = c1ctx.createImageData(w, h);
    const cd = c1data.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pos = y * w + x, idx = pos * 4;
        if (y >= 172 || bgMask[pos] === 1) { cd[idx + 3] = 0; continue; }
        const r = d[idx], b = d[idx+2];
        if (b - r >= 10) {
          const alphaNorm = Math.min(1, Math.max(0, (255 - r) / 230));
          const alpha = alphaNorm > 0.72 ? 255 : Math.round(alphaNorm * 255);
          cd[idx] = targetR; cd[idx + 1] = targetG; cd[idx + 2] = targetB; cd[idx + 3] = alpha;
        } else {
          cd[idx + 3] = 0;
        }
      }
    }
    c1ctx.putImageData(c1data, 0, 0);

    const work = document.createElement('canvas');
    work.width = canvasW; work.height = canvasH;
    const wctx = work.getContext('2d');
    wctx.imageSmoothingEnabled = true; wctx.imageSmoothingQuality = 'high';
    wctx.drawImage(clean1x, 0, 0, w, h, 0, 0, w * scale, h * scale);

    const text = 'SURVEYING  •  EXPERT WITNESS  •  DISREPAIR';
    const targetWidthPx = pgWidth * scale;
    let fontSize = 42, letterSpacing = 4;
    wctx.textAlign = 'center'; wctx.textBaseline = 'middle';
    wctx.fillStyle = `rgb(${targetR}, ${targetG}, ${targetB})`;
    wctx.font = `800 ${fontSize}px "Montserrat", sans-serif`;
    wctx.letterSpacing = `${letterSpacing}px`;
    while (wctx.measureText(text).width > targetWidthPx && fontSize > 24) {
      fontSize -= 1; letterSpacing = Math.max(1.5, letterSpacing - 0.15);
      wctx.font = `800 ${fontSize}px "Montserrat", sans-serif`;
      wctx.letterSpacing = `${letterSpacing}px`;
    }
    wctx.fillText(text, pgCenter * scale, 181.5 * scale);

    const px = wctx.getImageData(0, 0, canvasW, canvasH).data;
    let minX = canvasW, maxX = 0, minY = canvasH, maxY = 0;
    for (let y = 0; y < canvasH; y++) {
      for (let x = 0; x < canvasW; x++) {
        if (px[(y * canvasW + x) * 4 + 3] > 5) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    const pad = 18;
    const cx = Math.max(0, minX - pad), cy = Math.max(0, minY - pad);
    const cw = Math.min(canvasW - cx, (maxX - minX) + pad * 2);
    const ch = Math.min(canvasH - cy, (maxY - minY) + pad * 2);
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = cw; finalCanvas.height = ch;
    finalCanvas.getContext('2d').drawImage(work, cx, cy, cw, ch, 0, 0, cw, ch);
    return finalCanvas.toDataURL('image/png');
  }, imgBase64);

  fs.writeFileSync('scratch/njs_royal_v2.png', Buffer.from(blueDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));

  // Capture Header with White vs Blue next to hero
  await page.goto('http://127.0.0.1:5175', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  // Test White
  const whiteB64 = fs.readFileSync('frontend/public/images/njs-logo-white.png').toString('base64');
  await page.evaluate((b64) => {
    const img = document.querySelector('.site-logo-img');
    if (img) {
      img.src = 'data:image/png;base64,' + b64;
      img.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))';
    }
  }, whiteB64);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/compare_full_white.png', clip: { x: 0, y: 0, width: 1440, height: 350 } });

  // Test Royal Blue V2
  await page.evaluate((b64) => {
    const img = document.querySelector('.site-logo-img');
    if (img) {
      img.src = 'data:image/png;base64,' + b64;
      img.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))';
    }
  }, blueDataUrl.replace(/^data:image\/png;base64,/, ''));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/compare_full_blue.png', clip: { x: 0, y: 0, width: 1440, height: 350 } });

  await browser.close();
  console.log('Full comparison screenshots created');
})();

