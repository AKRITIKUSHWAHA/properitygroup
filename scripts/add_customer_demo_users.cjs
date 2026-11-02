const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../src/mock/users.js');
let content = fs.readFileSync(usersPath, 'utf8');

const customerBlock = `  'customer@demo.com': {
    id: 'usr_customer',
    email: 'customer@demo.com',
    name: 'Emma Watson',
    role: 'customer',
    roleLabel: 'Property Client',
    department: 'Private Client',
    company: 'Watson Holdings UK',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    phone: '+44 7700 900147',
    currency: 'GBP',
    dateJoined: '02/09/2025',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  'customer2@demo.com': {
    id: 'usr_customer_2',
    email: 'customer2@demo.com',
    name: 'Harrison Croft',
    role: 'customer',
    roleLabel: 'Property Client',
    department: 'Private Client',
    company: 'Croft Residential',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    phone: '+44 7700 900512',
    currency: 'GBP',
    dateJoined: '15/10/2026',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  'harrison@demo.com': {
    id: 'usr_customer_2',
    email: 'harrison@demo.com',
    name: 'Harrison Croft',
    role: 'customer',
    roleLabel: 'Property Client',
    department: 'Private Client',
    company: 'Croft Residential',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    phone: '+44 7700 900512',
    currency: 'GBP',
    dateJoined: '15/10/2026',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },`;

content = content.replace(/\s+'customer@demo\.com':\s*\{[\s\S]*?badgeColor:[^\n]+\n\s*\},/, '\n' + customerBlock);
fs.writeFileSync(usersPath, content, 'utf8');
console.log('Successfully updated src/mock/users.js with Customer B (Harrison Croft)');
