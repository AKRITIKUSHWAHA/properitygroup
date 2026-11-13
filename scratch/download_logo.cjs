const https = require('https');
const fs = require('fs');

const url = 'https://njspropertygroup.com/wp-content/uploads/2023/09/logo-njspropertygroup-1.png';
const file = fs.createWriteStream('scratch/downloaded_client_logo.png');

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded logo successfully. Size:', fs.statSync('scratch/downloaded_client_logo.png').size);
  });
}).on('error', (err) => {
  console.error('Error downloading logo:', err.message);
});

