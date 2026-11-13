const fs = require('fs');
const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

// SVG definition
const generateSvg = (fgColor = '#002B5C', bgColor = 'transparent', withBadge = true) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&amp;family=Inter:wght@700;800;900&amp;display=swap');
      .roof-stroke { stroke: ${fgColor}; stroke-width: 17; stroke-linecap: square; stroke-linejoin: miter; fill: none; }
      .chimney { fill: ${fgColor}; }
      .window-pane { fill: ${fgColor}; }
      .brand-njs { font-family: 'Inter', 'Montserrat', -apple-system, sans-serif; font-weight: 900; fill: ${fgColor}; }
      .brand-title { font-family: 'Inter', 'Montserrat', -apple-system, sans-serif; font-weight: 900; fill: ${fgColor}; letter-spacing: 0.06em; }
      .brand-sub { font-family: 'Inter', 'Montserrat', -apple-system, sans-serif; font-weight: 800; fill: ${fgColor}; letter-spacing: 0.14em; }
    </style>
  </defs>

  ${withBadge ? `
  <!-- White Badge Background / Sticker Contour -->
  <path d="
    M 300 24
    L 490 148
    L 462 168
    L 508 172
    C 525 174, 538 188, 538 206
    L 538 334
    C 538 352, 524 366, 506 366
    L 94 366
    C 76 366, 62 352, 62 334
    L 62 206
    C 62 188, 75 174, 92 172
    L 138 168
    L 110 148
    Z"
    fill="#FFFFFF"
    filter="drop-shadow(0 4px 14px rgba(0,0,0,0.22))"
  />` : ''}

  <!-- Chimney -->
  <rect x="238" y="72" width="22" height="60" class="chimney" />

  <!-- Roof Gable Outline -->
  <!-- Left eave at (142, 148), Peak at (300, 48), Right eave at (458, 148) -->
  <path d="M 146 150 L 300 50 L 454 150" class="roof-stroke" />

  <!-- 4-Pane Window under peak -->
  <g transform="translate(283, 94)">
    <rect x="0" y="0" width="15" height="15" class="window-pane" rx="1" />
    <rect x="19" y="0" width="15" height="15" class="window-pane" rx="1" />
    <rect x="0" y="19" width="15" height="15" class="window-pane" rx="1" />
    <rect x="19" y="19" width="15" height="15" class="window-pane" rx="1" />
  </g>

  <!-- NJS Monogram -->
  <!-- N -->
  <path d="
    M 172 254
    L 172 178
    L 194 178
    L 222 222
    L 222 178
    L 242 178
    L 242 254
    L 220 254
    L 192 210
    L 192 254
    Z" fill="${fgColor}" />

  <!-- J (Vertical stem extending up to chimney line at y=116) -->
  <path d="
    M 238 116
    L 260 116
    L 260 226
    C 260 246, 246 256, 226 256
    L 218 256
    L 218 238
    L 225 238
    C 234 238, 238 234, 238 224
    Z" fill="${fgColor}" />

  <!-- S -->
  <path d="
    M 334 186
    C 334 180, 342 176, 355 176
    C 368 176, 378 182, 380 192
    L 358 195
    C 357 192, 354 190, 348 190
    C 342 190, 338 193, 338 198
    C 338 204, 343 207, 356 211
    C 374 216, 384 223, 384 236
    C 384 249, 371 257, 352 257
    C 334 257, 323 249, 321 235
    L 343 233
    C 344 239, 348 242, 355 242
    C 361 242, 365 239, 365 234
    C 365 228, 360 225, 347 221
    C 329 215, 319 207, 319 196
    Z" fill="${fgColor}" transform="matrix(1.28 0 0 1.28 -108 -50)" />

  <!-- PROPERTY GROUP -->
  <text x="300" y="295" text-anchor="middle" font-size="34" class="brand-title">PROPERTY GROUP</text>

  <!-- SURVEYING • EXPERT WITNESS • DISREPAIR -->
  <text x="300" y="328" text-anchor="middle" font-size="16.5" class="brand-sub">SURVEYING  •  EXPERT WITNESS  •  DISREPAIR</text>
</svg>
`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Save SVG
  const svgContent = generateSvg('#002B5C', 'transparent', true);
  fs.writeFileSync('frontend/public/images/njs-logo-badge.svg', svgContent);

  const svgNavyOnly = generateSvg('#002B5C', 'transparent', false);
  fs.writeFileSync('frontend/public/images/njs-logo-navy.svg', svgNavyOnly);

  // Render to 1200x760 high-res PNG
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:transparent;">
        <div id="container" style="width:1200px; height:760px; display:flex; align-items:center; justify-content:center;">
          ${svgContent}
        </div>
      </body>
    </html>
  `);
  await page.waitForTimeout(1000); // Wait for fonts

  await page.screenshot({
    path: 'scratch/njs_svg_badge_highres.png',
    omitBackground: true
  });

  // Also render against dark header background to see how it looks on the website!
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:#0B1528; padding:30px; display:flex; align-items:center; gap:40px;">
        <div style="width:240px;">
          ${svgContent}
        </div>
        <div style="color:white; font-family:sans-serif;">
          <h2>Header Navbar Dark Preview</h2>
          <p>Official NJS Brand Badge with White Contour &amp; Modern Typography</p>
        </div>
      </body>
    </html>
  `);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'scratch/header_dark_preview.png' });

  // Also render against white background
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:#FFFFFF; padding:30px; display:flex; align-items:center; gap:40px;">
        <div style="width:240px;">
          ${svgNavyOnly}
        </div>
        <div style="color:#002B5C; font-family:sans-serif;">
          <h2>Login / Invoice White Preview</h2>
          <p>Official Pure Navy Blue Monogram &amp; Tagline</p>
        </div>
      </body>
    </html>
  `);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'scratch/white_card_preview.png' });

  await browser.close();
  console.log('SVG rendering test complete');
})();

