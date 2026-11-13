const fs = require('fs');
let nav = fs.readFileSync('frontend/src/config/navigation.js', 'utf8');

const target = `    children: [
      {
        id: "contact-hub",`;

const replacement = `    children: [
      {
        id: "about-us-link",
        name: "About Us (Leadership)",
        shortName: "About Us",
        badge: "Director Profile",
        path: "/about-us",
        description: "Director Natasha Shergill, company profile & practice ethics."
      },
      {
        id: "contact-hub",`;

nav = nav.replace(/\r\n/g, '\n');
if (nav.includes(target)) {
  nav = nav.replace(target, replacement);
  fs.writeFileSync('frontend/src/config/navigation.js', nav, 'utf8');
  console.log('✓ navigation.js updated with About Us');
} else {
  console.log('Target not matched');
}

