const https = require('https');

https.get('https://njspropertygroup.com', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|svg|webp)/gi);
    if (matches) {
      const logos = matches.filter(m => m.toLowerCase().includes('logo') || m.toLowerCase().includes('njs'));
      console.log('Logos found:\n', [...new Set(logos)].join('\n'));
    } else {
      console.log('No image matches, status code:', res.statusCode);
    }
  });
}).on('error', err => console.log('Error:', err.message));

