const fs = require('fs');
const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  
  // Use the client's exact original uploaded logo image
  const imgPath = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/.user_uploaded/media_1794030310178_080419d8.png';
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0; background:transparent;">
        <canvas id="c_navy"></canvas>
        <canvas id="c_white"></canvas>
        <canvas id="c_bright"></canvas>
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

    // Sticker region bounds mask (from previous flood fill logic so we don't accidentally pick up anything outside)
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
    // Tightly around logo content: x from 64 to 326, y from 33 to 192
    const sx = 45, sy = 25, sw = 290, sh = 180;
    const finalW = sw * scale;
    const finalH = sh * scale;

    // Helper to build transparent logo with a target ink RGB color
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

          // Ignore anything below y=172 because we'll re-draw the bottom line cleanly in crisp vector text
          if (y >= 172) {
            cd[idx + 3] = 0;
            continue;
          }

          if (bgMask[pos] === 1) {
            cd[idx + 3] = 0;
          } else {
            const r = d[idx], g = d[idx+1], b = d[idx+2];
            // Only keep blue artwork! White background (and interior white) becomes transparent!
            // Blue strength factor: how far from white it is
            if (b - r >= 10) {
              // Convert luminance/blueness to alpha so edges are smoothly antialiased!
              // In white bg (255,255,255), r is 255. In solid navy (3,41,84), r is 3.
              const alphaNorm = Math.min(1, Math.max(0, (255 - r) / 230));
              // Boost alpha slightly so solid fills are 255
              const alpha = alphaNorm > 0.75 ? 255 : Math.round(alphaNorm * 255);
              cd[idx] = targetR;
              cd[idx + 1] = targetG;
              cd[idx + 2] = targetB;
              cd[idx + 3] = alpha;
            } else {
              // Pure transparent! No white background!
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
      octx.font = '900 35px "Montserrat", sans-serif';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      const text = 'SURVEYING  •  EXPERT WITNESS  •  DISREPAIR';
      octx.letterSpacing = '4.5px';
      octx.fillText(text, centerX, (181 - sy) * scale);

      return outCanvas.toDataURL('image/png');
    };

    // Also crop tightly to actual bounding box after drawing
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

    const navyUrl = await trimCanvas(await buildTransparentLogo('c_navy', 3, 41, 84));
    const whiteUrl = await trimCanvas(await buildTransparentLogo('c_white', 255, 255, 255));
    const brightBlueUrl = await trimCanvas(await buildTransparentLogo('c_bright', 56, 152, 255));

    return { navyUrl, whiteUrl, brightBlueUrl };
  }, imgBase64);

  fs.writeFileSync('scratch/njs_transparent_navy.png', Buffer.from(outputs.navyUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
  fs.writeFileSync('scratch/njs_transparent_white.png', Buffer.from(outputs.whiteUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
  fs.writeFileSync('scratch/njs_transparent_brightblue.png', Buffer.from(outputs.brightBlueUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('Generated all 3 transparent versions');

  // Create a visual comparison on dark navbar (#1D222D) and white card (#FFFFFF)
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; font-family:sans-serif; padding:30px; background:#f1f5f9;">
        <h3>Comparison on Dark Navbar (#1D222D)</h3>
        <div style="display:flex; gap:30px; background:#1D222D; padding:30px; border-radius:12px; align-items:center;">
          <div style="text-align:center;">
            <img src="${outputs.navyUrl}" style="height:85px;" />
            <p style="color:#94a3b8; font-size:12px;">1. Exact Navy (#032954) on Dark</p>
          </div>
          <div style="text-align:center;">
            <img src="${outputs.whiteUrl}" style="height:85px;" />
            <p style="color:#94a3b8; font-size:12px;">2. Crisp White (#FFFFFF) on Dark</p>
          </div>
          <div style="text-align:center;">
            <img src="${outputs.brightBlueUrl}" style="height:85px;" />
            <p style="color:#94a3b8; font-size:12px;">3. Bright Blue on Dark</p>
          </div>
        </div>

        <h3 style="margin-top:30px;">Comparison on White Background (#FFFFFF - Login/PDF)</h3>
        <div style="display:flex; gap:30px; background:#FFFFFF; padding:30px; border-radius:12px; border:1px solid #cbd5e1; align-items:center;">
          <div style="text-align:center;">
            <img src="${outputs.navyUrl}" style="height:85px;" />
            <p style="color:#475569; font-size:12px;">1. Exact Navy (#032954) on White</p>
          </div>
        </div>
      </body>
    </html>
  `);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scratch/transparent_logo_comparison.png' });

  await browser.close();
})();

