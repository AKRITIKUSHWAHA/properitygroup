const fs = require('fs');

let home = fs.readFileSync('frontend/src/pages/public/HomePage.jsx', 'utf8');

const oldLogoStrip = `<div className="flex items-center justify-center flex-wrap gap-6 sm:gap-8">
              <div className="h-12 px-3 py-1.5 rounded-xl bg-white/95 flex items-center justify-center shadow-xs">
                <img src="/images/rics-regulated-logo.jpeg" alt="Regulated by RICS" className="h-9 w-auto object-contain" />
              </div>
              <div className="h-12 px-3 py-1.5 rounded-xl bg-white/95 flex items-center justify-center shadow-xs">
                <img src="/images/rics-valuer-logo.png" alt="RICS Registered Valuer" className="h-9 w-auto object-contain" />
              </div>
              <div className="h-12 px-3 py-1.5 rounded-xl bg-white/95 flex items-center justify-center shadow-xs">
                <img src="/images/ciob-logo.png" alt="CIOB" className="h-9 w-auto object-contain" />
              </div>
              <div className="h-12 px-3 py-1.5 rounded-xl bg-white/95 flex items-center justify-center shadow-xs">
                <img src="/images/rpsa-logo.png" alt="RPSA" className="h-9 w-auto object-contain" />
              </div>
            </div>`;

const newLogoStrip = `<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
              <div className="h-16 px-4 py-2 rounded-2xl bg-white flex items-center justify-center shadow-md border border-slate-100">
                <img src="/images/rics-regulated-logo.jpeg" alt="Regulated by RICS" style={{ maxHeight: "40px", maxWidth: "120px", width: "auto", height: "auto", objectFit: "contain" }} />
              </div>
              <div className="h-16 px-4 py-2 rounded-2xl bg-white flex items-center justify-center shadow-md border border-slate-100">
                <img src="/images/rics-valuer-logo.png" alt="RICS Registered Valuer" style={{ maxHeight: "40px", maxWidth: "120px", width: "auto", height: "auto", objectFit: "contain" }} />
              </div>
              <div className="h-16 px-4 py-2 rounded-2xl bg-white flex items-center justify-center shadow-md border border-slate-100">
                <img src="/images/ciob-logo.png" alt="CIOB" style={{ maxHeight: "40px", maxWidth: "120px", width: "auto", height: "auto", objectFit: "contain" }} />
              </div>
              <div className="h-16 px-4 py-2 rounded-2xl bg-white flex items-center justify-center shadow-md border border-slate-100">
                <img src="/images/rpsa-logo.png" alt="RPSA" style={{ maxHeight: "40px", maxWidth: "120px", width: "auto", height: "auto", objectFit: "contain" }} />
              </div>
            </div>`;

home = home.replace(oldLogoStrip, newLogoStrip);
fs.writeFileSync('frontend/src/pages/public/HomePage.jsx', home, 'utf8');
console.log('✓ Fixed logo strip in HomePage.jsx');

