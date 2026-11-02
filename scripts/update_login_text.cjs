const fs = require('fs');
const path = require('path');

// 1. Update src/pages/auth/LoginPage.jsx
const loginPath = path.join(__dirname, '../src/pages/auth/LoginPage.jsx');
let loginContent = fs.readFileSync(loginPath, 'utf8');

loginContent = loginContent.replace("badge: 'Client Self-Service',", "badge: 'Customer Self-Service',");
loginContent = loginContent.replace("title: 'Client Portal Sign In',", "title: 'Customer Login',");
loginContent = loginContent.replace("demoName: 'Demo Client Account',", "demoName: 'Demo Customer Account',");
loginContent = loginContent.replace("buttonText: 'Sign In to Client Portal',", "buttonText: 'Customer Login',");
loginContent = loginContent.replace("Need a client survey account?", "Need a customer survey account?");

fs.writeFileSync(loginPath, loginContent, 'utf8');
console.log('Successfully updated LoginPage.jsx');

// 2. Update src/components/layout/MobileNavigation.jsx
const mobileNavPath = path.join(__dirname, '../src/components/layout/MobileNavigation.jsx');
let mobileContent = fs.readFileSync(mobileNavPath, 'utf8');
mobileContent = mobileContent.replace("<span>Client Portal</span>", "<span>Customer Login</span>");
fs.writeFileSync(mobileNavPath, mobileContent, 'utf8');
console.log('Successfully updated MobileNavigation.jsx');
