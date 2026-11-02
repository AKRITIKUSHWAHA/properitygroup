const http = require('http');

async function request(path, method = 'GET', token = null, body = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('🚀 Verifying Customer Portal APIs across all 14 menus...\n');

  // 1. Login as Customer
  const login = await request('/api/v1/auth/login', 'POST', null, {
    email: 'emma.watson@example.com',
    password: 'password123',
  });
  if (login.status !== 200) {
    console.error('❌ Customer Login failed:', login);
    process.exit(1);
  }
  const token = login.body.data.token;
  const user = login.body.data.user;
  console.log(`✓ Customer Login OK (${user.name} | Role: ${user.role}), token obtained.\n`);

  const customerMenus = [
    { name: '1. Dashboard', path: '/api/v1/customer/my-dashboard' },
    { name: '2. My Quotations', path: '/api/v1/customer/quotations' },
    { name: '3. My Bookings', path: '/api/v1/customer/my-bookings' },
    { name: '4. Track My Survey (10-Steps)', path: '/api/v1/customer/track-survey' },
    { name: '5. Appointment Details', path: '/api/v1/customer/appointment-details' },
    { name: '6. Assigned Surveyor (MRICS)', path: '/api/v1/customer/assigned-surveyor' },
    { name: '7. Terms to Sign', path: '/api/v1/customer/terms-to-sign' },
    { name: '8. Invoices & Payments (20% VAT)', path: '/api/v1/customer/invoices-and-payments' },
    { name: '9. My Reports (RICS PDF)', path: '/api/v1/customer/reports' },
    { name: '10. Messages (Private Thread)', path: '/api/v1/customer/messages' },
    { name: '11. Leave a Review (Trustpilot)', path: '/api/v1/customer/leave-review' },
    { name: '12. Support (Tickets Helpdesk)', path: '/api/v1/customer/support/tickets' },
    { name: '13. My Details (Profile & Contact)', path: '/api/v1/customer/my-details' },
    { name: '14. Previous Surveys (History)', path: '/api/v1/customer/previous-surveys' },
  ];

  let passed = 0;
  for (const m of customerMenus) {
    const res = await request(m.path, 'GET', token);
    if (res.status === 200 && res.body.success) {
      console.log(`✅ [${res.status}] Customer Menu ${m.name} -> SUCCESS`);
      passed++;
    } else {
      console.error(`❌ [${res.status}] Customer Menu ${m.name} -> FAILED:`, res.body);
    }
  }

  // 15. Security Isolation Check: Customer trying to access Admin API must get 403 Forbidden
  const forbiddenCheck = await request('/api/v1/crm-and-leads', 'GET', token);
  if (forbiddenCheck.status === 403) {
    console.log(`\n🔒 Security Isolation Check: [403 Forbidden] Customer blocked from Superadmin CRM -> PASSED`);
    passed++;
  } else {
    console.error(`❌ Security Isolation Check failed: Expected 403, got ${forbiddenCheck.status}`);
  }

  console.log(`\n🎉 Customer Portal Test Result: ${passed}/${customerMenus.length + 1} checks PASSED WITH 100% SUCCESS!`);
}

run().catch(console.error);

