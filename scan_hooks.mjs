import fs from 'fs';
import path from 'path';

const hooks = ['useJobs', 'useLeads', 'useQuotes', 'useTerms', 'useMessages', 'useClientProfiles'];
const hookUsage = {};
hooks.forEach(h => hookUsage[h] = []);

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const rel = path.relative('frontend/src', full).replace(/\\/g, '/');
      hooks.forEach(h => {
        if (content.includes(h) && !rel.startsWith('mock/')) {
          hookUsage[h].push(rel);
        }
      });
    }
  }
}

scan('frontend/src');

for (const [h, files] of Object.entries(hookUsage)) {
  console.log(`\n=== ${h} (${files.length} files) ===`);
  files.forEach(f => console.log(`  - ${f}`));
}
