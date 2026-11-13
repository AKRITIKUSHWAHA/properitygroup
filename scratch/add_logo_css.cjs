const fs = require('fs');
let css = fs.readFileSync('frontend/src/styles/components.css', 'utf8');

const logoCss = `
/* Official NJS Brand Logo Sizing per Client Spec */
.site-logo-img {
  height: 52px;
  width: auto;
  max-width: 95px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4)) brightness(1.1);
  transition: transform 0.2s ease, filter 0.2s ease;
  flex-shrink: 0;
}

.site-logo:hover .site-logo-img {
  transform: scale(1.05);
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5)) brightness(1.2);
}

@media (max-width: 768px) {
  .site-logo-img {
    height: 42px;
    max-width: 75px;
  }
}
`;

if (!css.includes('.site-logo-img {')) {
  css = css.replace('.site-logo {', logoCss + '\n.site-logo {');
  fs.writeFileSync('frontend/src/styles/components.css', css, 'utf8');
  console.log('✓ components.css updated with .site-logo-img styles');
} else {
  console.log('Notice: .site-logo-img already in components.css');
}

