const fs = require('fs');
let header = fs.readFileSync('frontend/src/components/layout/Header.jsx', 'utf8');

const target = `<Link to="/" className="site-logo" aria-label="NJS Property Group - Home">
              <img src="/images/njs-logo.png" alt="NJS Property Group" className="site-logo-img" />
              <div className="logo-text-group">
                <span className="logo-title font-serif">NJS Property Group</span>
                <span className="logo-subtitle">RICS Regulated Surveyors</span>
              </div>
            </Link>`;

const replacement = `<Link to="/" className="site-logo" aria-label="NJS Property Group - Home">
              <img
                src="/images/njs-logo.png"
                alt="NJS Property Group - Chartered Building Surveyors"
                className="site-logo-img"
              />
            </Link>`;

header = header.replace(/\r\n/g, '\n');
if (header.includes(target)) {
  header = header.replace(target, replacement);
  fs.writeFileSync('frontend/src/components/layout/Header.jsx', header, 'utf8');
  console.log('✓ Header.jsx updated to standalone logo');
} else {
  console.log('Target still not found');
}
