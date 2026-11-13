const fs = require('fs');

let contact = fs.readFileSync('frontend/src/pages/public/ContactPage.jsx', 'utf8');

// Match each complaints section:
// <section id="complaints" ...> ... </section>
const chpRegex = /\{\/\* Complaints Handling Procedure Section \(RICS Rule 7 Compliant\) \*\/\}[\s\S]*?<section id="complaints"[\s\S]*?<\/section>/g;

const matches = contact.match(chpRegex);
console.log('Total CHP sections found:', matches ? matches.length : 0);

if (matches && matches.length > 1) {
  // Keep only the last one or place one at the bottom before closing </main> or </div>
  const singleChp = matches[0];
  // Remove all occurrences
  contact = contact.replace(chpRegex, '');
  // Insert the single CHP section right after privacy section
  const privacyEnd = '</section>'; // Find where privacy section ends
  const privacyIdx = contact.indexOf('id="privacy"');
  if (privacyIdx !== -1) {
    const afterPrivacy = contact.indexOf('</section>', privacyIdx);
    if (afterPrivacy !== -1) {
      contact = contact.substring(0, afterPrivacy + 10) + '\n\n      ' + singleChp + contact.substring(afterPrivacy + 10);
      console.log('✓ Successfully consolidated into a single clean CHP section after Privacy Notice');
    }
  }
  fs.writeFileSync('frontend/src/pages/public/ContactPage.jsx', contact, 'utf8');
}

