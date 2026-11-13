const fs = require('fs');

let config = fs.readFileSync('frontend/src/config/siteConfig.js', 'utf8');

// 1. London
const oldLondon = 'principalTowns: ["Westminster", "Kensington & Chelsea", "Camden", "Richmond", "Wandsworth", "Islington", "Greenwich", "Hammersmith & Fulham"],';
const newLondon = 'principalTowns: ["Westminster", "Kensington & Chelsea", "Camden", "Richmond", "Wandsworth", "Islington", "Greenwich", "Hammersmith & Fulham", "Ealing", "Hillingdon", "Barnet", "Ilford"],';

if (config.includes(oldLondon)) {
  config = config.replace(oldLondon, newLondon);
  console.log('✓ London towns updated with Ealing, Hillingdon, Barnet, Ilford');
}

// 2. Buckinghamshire
const oldBucks = 'principalTowns: ["Milton Keynes", "Aylesbury", "High Wycombe", "Marlow", "Beaconsfield", "Amersham", "Gerrards Cross"],';
const newBucks = 'principalTowns: ["Milton Keynes", "Aylesbury", "High Wycombe", "Marlow", "Beaconsfield", "Amersham", "Gerrards Cross", "Iver"],';

if (config.includes(oldBucks)) {
  config = config.replace(oldBucks, newBucks);
  console.log('✓ Buckinghamshire towns updated with Iver');
}

// 3. Berkshire
const oldBerks = 'principalTowns: ["Reading", "Windsor", "Maidenhead", "Slough", "Bracknell", "Newbury", "Ascot", "Wokingham"],';
const newBerks = 'principalTowns: ["Reading", "Windsor", "Maidenhead", "Slough", "Bracknell", "Newbury", "Ascot", "Wokingham", "Langley"],';

if (config.includes(oldBerks)) {
  config = config.replace(oldBerks, newBerks);
  console.log('✓ Berkshire towns updated with Langley');
}

fs.writeFileSync('frontend/src/config/siteConfig.js', config, 'utf8');
console.log('✓ siteConfig.js successfully updated with all client coverage areas');

