const fs = require('fs');

let header = fs.readFileSync('frontend/src/components/layout/Header.jsx', 'utf8');

const target = `<Link to="/" className="site-logo" aria-label="NJS Property Group - Home">
              <img
                src="/images/njs-logo.png"
                alt="NJS Property Group - Chartered Building Surveyors"
                className="site-logo-img"
              />
            </Link>`;

const replacement = `<Link to="/" className="site-logo" aria-label="NJS Property Group - Home">
              <img
                src="/images/njs-logo.png"
                alt="NJS Property Group Logo"
                className="site-logo-img"
                style={{ height: "48px", width: "auto", maxHeight: "48px", objectFit: "contain" }}
              />
              <div className="logo-text-group">
                <span className="logo-title font-serif">NJS Property Group</span>
                <span className="logo-subtitle">RICS Regulated Surveyors</span>
              </div>
            </Link>`;

header = header.replace(target, replacement);
fs.writeFileSync('frontend/src/components/layout/Header.jsx', header, 'utf8');

console.log('✓ Updated Header.jsx with logo + text');

