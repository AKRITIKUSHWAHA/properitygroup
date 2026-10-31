const fs = require('fs');
const path = require('path');

const srcDir = 'D:\\kiaan\\Property-Surveying-Platform\\properitygroup\\src';
const replacements = [
  {
    from: 'UK Property Surveying Practice',
    to: 'NJS Property Group'
  }
];

function getAllFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, exts));
    } else {
      if (exts.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = getAllFiles(srcDir, ['.jsx', '.js', '.ts', '.tsx', '.css', '.html']);
let totalChanged = 0;
const changedFiles = [];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    changedFiles.push(filePath.replace('D:\\kiaan\\Property-Surveying-Platform\\properitygroup\\src\\', ''));
    totalChanged++;
  }
});

console.log(`\n✅ Done! Changed ${totalChanged} files:\n`);
changedFiles.forEach(f => console.log('  -', f));
