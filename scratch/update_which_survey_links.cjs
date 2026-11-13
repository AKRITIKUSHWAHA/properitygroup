const fs = require('fs');

// 1. navigation.js
let nav = fs.readFileSync('frontend/src/config/navigation.js', 'utf8');
nav = nav.replace('path: "/#which-survey",', 'path: "/which-survey-do-i-need",\n            badge: "Interactive Tool",');
fs.writeFileSync('frontend/src/config/navigation.js', nav, 'utf8');
console.log('✓ navigation.js updated');

// 2. MobileNavigation.jsx
let mob = fs.readFileSync('frontend/src/components/layout/MobileNavigation.jsx', 'utf8');
mob = mob.replace('to="/#which-survey"', 'to="/which-survey-do-i-need"');
fs.writeFileSync('frontend/src/components/layout/MobileNavigation.jsx', mob, 'utf8');
console.log('✓ MobileNavigation.jsx updated');

// 3. Header.jsx - Mega Menu: Add special highlight for Which Survey Do I Need
let header = fs.readFileSync('frontend/src/components/layout/Header.jsx', 'utf8');
// Check if header needs extra styling on the which survey item
const oldMegaItem = `<div className="dropdown-item-title">{item.name}</div>`;
const newMegaItem = `<div className="dropdown-item-title flex items-center justify-between">
                                <span>{item.name}</span>
                                {item.badge && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    {item.badge}
                                  </span>
                                )}
                              </div>`;

if (header.includes(oldMegaItem)) {
  header = header.replace(oldMegaItem, newMegaItem);
  fs.writeFileSync('frontend/src/components/layout/Header.jsx', header, 'utf8');
  console.log('✓ Header.jsx updated with badge display');
} else {
  console.log('Notice: Header.jsx mega item structure differed or already updated');
}

