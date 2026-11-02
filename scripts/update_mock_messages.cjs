const fs = require('fs');
const path = require('path');

// Update src/mock/messages.js
const msgPath = path.join(__dirname, '../src/mock/messages.js');
let msgContent = fs.readFileSync(msgPath, 'utf8');

const conv3 = `  {
    id: 'conv-3',
    jobId: 'JOB-2026-082',
    clientEmail: 'harrison@demo.com',
    clientName: 'Harrison Croft',
    clientPhone: '+44 7700 900512',
    property: '12 Pembroke Square, Kensington, London W8 6PA',
    surveyType: 'RICS Level 3 Building Survey',
    surveyor: 'David Thorne MRICS',
    unreadAdmin: 0,
    unreadClient: 0,
    messages: [
      {
        id: 1,
        sender: 'NJS Admin Team (Alexander)',
        role: 'admin',
        text: 'Hello Harrison, your quotation for RICS Level 3 Building Survey at 12 Pembroke Square (£1,450 + VAT) has been approved. Please review and sign your digital terms of engagement.',
        time: '28/10/2026, 11:00',
      },
      {
        id: 2,
        sender: 'Harrison Croft',
        role: 'client',
        text: 'Thank you Alexander. I will review the inclusions and sign the terms today.',
        time: '28/10/2026, 11:30',
      },
    ],
  },
];`;

msgContent = msgContent.replace(/\s*\n\];\s*\nconst STORAGE_KEY/, '\n' + conv3 + '\n\nconst STORAGE_KEY');
fs.writeFileSync(msgPath, msgContent, 'utf8');
console.log('Successfully added conv-3 for Harrison Croft in src/mock/messages.js');

// Update src/mock/jobs.js JOB-2026-082 customerEmail to include harrison@demo.com
const jobsPath = path.join(__dirname, '../src/mock/jobs.js');
let jobsContent = fs.readFileSync(jobsPath, 'utf8');
jobsContent = jobsContent.replace(
  "customerEmail: 'harrison.croft@example.co.uk',",
  "customerEmail: 'harrison@demo.com',\n    customerAltEmail: 'harrison.croft@example.co.uk',\n    customerDemoEmail: 'customer2@demo.com',"
);
fs.writeFileSync(jobsPath, jobsContent, 'utf8');
console.log('Successfully updated JOB-2026-082 emails in src/mock/jobs.js');
