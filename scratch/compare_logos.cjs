const fs = require('fs');
const path = require('path');
const { chromium } = require(path.resolve('frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  
  const imgPath = 'C:/Users/lenovo/.gemini/antigravity/brain/c60405a5-0e8b-4a69-8dc1-6dd62d0e4ec0/.user_uploaded/media_1794030310178_080419d8.png';
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Inter:wght@800;900&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0; background:#222; display:flex; justify-content:center; align-items:center; height:100vh;">
        <!-- Container showing original and new side-by-side -->
        <div style="display:flex; gap:30px; align-items:center;">
          <div>
            <h4 style="color:#FFF; font-family:sans-serif; text-align:center;">Client Uploaded Image</h4>
            <img src="data:image/png;base64,${imgBase64}" style="width:335px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.5);">
          </div>
          <div>
            <h4 style="color:#FFF; font-family:sans-serif; text-align:center;">High-Resolution Vector Recreation</h4>
            <div id="vector-container" style="width:335px; height:211px; background:#0B1528; display:flex; align-items:center; justify-content:center; border-radius:12px;">
              <svg viewBox="0 0 340 215" width="310" height="195" xmlns="http://www.w3.org/2000/svg">
                <!-- White sticker background contour matching client's exact outline -->
                <path d="
                  M 170 12
                  L 266 76
                  L 254 90
                  L 264 92
                  C 278 95, 290 108, 290 122
                  L 290 188
                  C 290 196, 284 202, 276 202
                  L 64 202
                  C 56 202, 50 196, 50 188
                  L 50 122
                  C 50 108, 62 95, 76 92
                  L 86 90
                  L 74 76
                  Z"
                  fill="#FFFFFF"
                  filter="drop-shadow(0 2px 6px rgba(0,0,0,0.18))"
                />

                <!-- Chimney on left roof slope -->
                <rect x="135" y="24" width="13" height="42" fill="#002D62" />

                <!-- Roof Gable Outline -->
                <!-- Left overhang (80, 90), Apex (170, 24), Right overhang (260, 90) -->
                <path d="M 80 90 L 170 24 L 260 90" fill="none" stroke="#002D62" stroke-width="11" stroke-linecap="square" stroke-linejoin="miter" />

                <!-- 4-Pane Window under peak -->
                <g transform="translate(160, 48)">
                  <rect x="0" y="0" width="8.5" height="8.5" fill="#002D62" rx="0.5" />
                  <rect x="11.5" y="0" width="8.5" height="8.5" fill="#002D62" rx="0.5" />
                  <rect x="0" y="11.5" width="8.5" height="8.5" fill="#002D62" rx="0.5" />
                  <rect x="11.5" y="11.5" width="8.5" height="8.5" fill="#002D62" rx="0.5" />
                </g>

                <!-- Monogram NJS -->
                <!-- N -->
                <path d="
                  M 92 144
                  L 92 98
                  L 106 98
                  L 124 126
                  L 124 98
                  L 136 98
                  L 136 144
                  L 122 144
                  L 104 116
                  L 104 144
                  Z" fill="#002D62" />

                <!-- J: Stem extends vertically upward to chimney line at y=60 -->
                <path d="
                  M 135 60
                  L 148 60
                  L 148 126
                  C 148 138, 140 145, 126 145
                  L 122 145
                  L 122 134
                  L 126 134
                  C 132 134, 135 131, 135 125
                  Z" fill="#002D62" />

                <!-- S: Bold modern sans-serif with horizontal terminals -->
                <path d="
                  M 194 104
                  C 194 99, 201 96, 211 96
                  C 222 96, 229 101, 230 108
                  L 216 110
                  C 215 107, 213 106, 210 106
                  C 206 106, 203 108, 203 111
                  C 203 115, 206 117, 215 120
                  C 226 123, 233 128, 233 136
                  C 233 145, 223 150, 210 150
                  C 197 150, 189 144, 188 135
                  L 202 133
                  C 203 138, 206 140, 210 140
                  C 214 140, 217 138, 217 135
                  C 217 131, 214 129, 205 126
                  C 193 122, 187 116, 187 109
                  Z" fill="#002D62" transform="scale(1.15) translate(-36, -18)" />

                <!-- PROPERTY GROUP -->
                <text x="170" y="168" text-anchor="middle" font-family="'Inter', 'Montserrat', sans-serif" font-weight="900" font-size="22" fill="#002D62" letter-spacing="0.05em">
                  PROPERTY GROUP
                </text>

                <!-- SURVEYING • EXPERT WITNESS • DISREPAIR -->
                <text x="170" y="188" text-anchor="middle" font-family="'Inter', 'Montserrat', sans-serif" font-weight="800" font-size="9.5" fill="#002D62" letter-spacing="0.12em">
                  SURVEYING  •  EXPERT WITNESS  •  DISREPAIR
                </text>
              </svg>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scratch/side_by_side_comparison.png' });
  await browser.close();
  console.log('Side-by-side comparison saved');
})();

