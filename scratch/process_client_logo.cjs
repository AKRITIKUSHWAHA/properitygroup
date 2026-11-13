const fs = require('fs');
const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const imgPath = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/.user_uploaded/media_1794030310178_080419d8.png';
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');

  const results = await page.evaluate(async (b64) => {
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

    // 1. Identify navy pixels
    // In the image, navy blue is #02264E or #042E61.
    // Red < 55, Green < 85, Blue < 135, and brightness < 75.
    const isNavy = (x, y) => {
      const idx = (y * w + x) * 4;
      const r = d[idx], g = d[idx+1], b = d[idx+2];
      const br = 0.299*r + 0.587*g + 0.114*b;
      return br < 80 && b >= r;
    };

    // 2. Identify sticker region:
    // Distance field from navy pixels! The sticker is a smooth outline of ~6 to 10px radius around all navy pixels.
    // Any pixel within distance R of a navy pixel is part of the logo badge.
    // Inside the badge:
    // - If it's navy, it is navy (#002855).
    // - If it's between navy pixels or in the sticker border, it is pure crisp white (#FFFFFF, alpha=255)!
    // - Outside the badge, it is 100% transparent (alpha=0)!

    // Compute binary navy grid
    const navyGrid = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (isNavy(x, y)) navyGrid[y * w + x] = 1;
      }
    }

    // Distance transform / dilation to get the exact white sticker contour
    // Radius of sticker is approx 6.5 pixels
    const radius = 6.5;
    const badgeGrid = new Uint8Array(w * h);
    const radSq = radius * radius;
    const rCeil = Math.ceil(radius);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (navyGrid[y * w + x]) {
          for (let dy = -rCeil; dy <= rCeil; dy++) {
            for (let dx = -rCeil; dx <= rCeil; dx++) {
              if (dx*dx + dy*dy <= radSq) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                  badgeGrid[ny * w + nx] = 1;
                }
              }
            }
          }
        }
      }
    }

    // Also close small internal gaps (e.g. between window & roof or inside letters)
    // Create Badge Canvas (with white contour on transparent background)
    // Crop tightly to sticker bounds:
    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (badgeGrid[y * w + x]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Add 4px padding
    const pad = 4;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(w - cropX, (maxX - minX) + pad * 2);
    const cropH = Math.min(h - cropY, (maxY - minY) + pad * 2);

    // High-res output canvas (scale 3x for super sharpness)
    const scale = 3;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = cropW * scale;
    outCanvas.height = cropH * scale;
    const outCtx = outCanvas.getContext('2d');
    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = 'high';

    // Temporary canvas for 1x cropped badge
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropW;
    tempCanvas.height = cropH;
    const tempCtx = tempCanvas.getContext('2d');
    const tempImgData = tempCtx.createImageData(cropW, cropH);
    const td = tempImgData.data;

    for (let cy = 0; cy < cropH; cy++) {
      for (let cx = 0; cx < cropW; cx++) {
        const sx = cropX + cx;
        const sy = cropY + cy;
        const tidx = (cy * cropW + cx) * 4;

        if (sx < w && sy < h && badgeGrid[sy * w + sx]) {
          if (navyGrid[sy * w + sx]) {
            // Navy pixel: pure client navy #002B5C
            td[tidx] = 0;     // R
            td[tidx + 1] = 43; // G
            td[tidx + 2] = 92; // B
            td[tidx + 3] = 255;
          } else {
            // White sticker pixel
            td[tidx] = 255;
            td[tidx + 1] = 255;
            td[tidx + 2] = 255;
            td[tidx + 3] = 255;
          }
        } else {
          // Transparent
          td[tidx + 3] = 0;
        }
      }
    }

    tempCtx.putImageData(tempImgData, 0, 0);

    // Draw to scaled canvas
    outCtx.drawImage(tempCanvas, 0, 0, outCanvas.width, outCanvas.height);

    // Also create pure navy version (no white border, for white backgrounds)
    const navyCanvas = document.createElement('canvas');
    navyCanvas.width = outCanvas.width;
    navyCanvas.height = outCanvas.height;
    const navyCtx = navyCanvas.getContext('2d');

    const tempNavyCanvas = document.createElement('canvas');
    tempNavyCanvas.width = cropW;
    tempNavyCanvas.height = cropH;
    const tempNavyCtx = tempNavyCanvas.getContext('2d');
    const tempNavyImgData = tempNavyCtx.createImageData(cropW, cropH);
    const tnd = tempNavyImgData.data;

    for (let cy = 0; cy < cropH; cy++) {
      for (let cx = 0; cx < cropW; cx++) {
        const sx = cropX + cx;
        const sy = cropY + cy;
        const tidx = (cy * cropW + cx) * 4;

        if (sx < w && sy < h && navyGrid[sy * w + sx]) {
          tnd[tidx] = 0;
          tnd[tidx + 1] = 43;
          tnd[tidx + 2] = 92;
          tnd[tidx + 3] = 255;
        } else {
          tnd[tidx + 3] = 0;
        }
      }
    }
    tempNavyCtx.putImageData(tempNavyImgData, 0, 0);
    navyCtx.drawImage(tempNavyCanvas, 0, 0, navyCanvas.width, navyCanvas.height);

    return {
      badgeDataUrl: outCanvas.toDataURL('image/png'),
      navyDataUrl: navyCanvas.toDataURL('image/png')
    };
  }, imgBase64);

  fs.writeFileSync('scratch/njs_badge_clean.png', Buffer.from(results.badgeDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
  fs.writeFileSync('scratch/njs_navy_clean.png', Buffer.from(results.navyDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('Saved scratch/njs_badge_clean.png and scratch/njs_navy_clean.png');

  await browser.close();
})();

