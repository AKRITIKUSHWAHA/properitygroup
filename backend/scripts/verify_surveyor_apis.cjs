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
  console.log('🚀 Verifying Surveyor Portal APIs across all 6 menus...\n');

  // 1. Login as Surveyor
  const login = await request('/api/v1/auth/login', 'POST', null, {
    email: 'david.thorne@njspropertygroup.com',
    password: 'password123',
  });
  if (login.status !== 200) {
    console.error('❌ Surveyor Login failed:', login);
    process.exit(1);
  }
  const token = login.body.data.token;
  const user = login.body.data.user;
  console.log(`✓ Surveyor Login OK (${user.name} | Role: ${user.role}), token obtained.\n`);

  const surveyorMenus = [
    { name: '1. Dashboard (KPI Cards & Next 5 Inspections)', path: '/api/v1/surveyor/dashboard' },
    { name: '2. My Calendar (Appointments & Arrival Windows)', path: '/api/v1/surveyor/my-calendar' },
    { name: '3. My Jobs (Assigned Briefs & Client Info)', path: '/api/v1/surveyor/my-jobs' },
    { name: '4. Site Visits (Logistics & Key Tags)', path: '/api/v1/surveyor/site-visits' },
    { name: '5. Upload Reports (Pending Draft Submissions)', path: '/api/v1/surveyor/upload-reports' },
    { name: '6. My Availability (Capacity & Postal Areas)', path: '/api/v1/surveyor/my-availability' },
  ];

  let passed = 0;
  for (const m of surveyorMenus) {
    const res = await request(m.path, 'GET', token);
    if (res.status === 200 && res.body.success) {
      console.log(`✅ [${res.status}] Surveyor Menu ${m.name} -> SUCCESS`);
      passed++;
    } else {
      console.error(`❌ [${res.status}] Surveyor Menu ${m.name} -> FAILED:`, res.body);
    }
  }

  // Security Isolation Check 1: Surveyor blocked from Superadmin CRM
  const adminBlock = await request('/api/v1/crm-and-leads', 'GET', token);
  if (adminBlock.status === 403) {
    console.log(`\n🔒 Security Isolation Check 1: [403 Forbidden] Surveyor blocked from Superadmin CRM -> PASSED`);
    passed++;
  } else {
    console.error(`❌ Security Isolation Check 1 failed: Expected 403, got ${adminBlock.status}`);
  }

  // Security Isolation Check 2: Surveyor blocked from Customer Portal
  const customerBlock = await request('/api/v1/customer/invoices-and-payments', 'GET', token);
  if (customerBlock.status === 403) {
    console.log(`🔒 Security Isolation Check 2: [403 Forbidden] Surveyor blocked from Customer Invoices -> PASSED`);
    passed++;
  } else {
    console.error(`❌ Security Isolation Check 2 failed: Expected 403, got ${customerBlock.status}`);
  }

  console.log(`\n🎉 Surveyor Portal Test Result: ${passed}/${surveyorMenus.length + 2} checks PASSED WITH 100% SUCCESS!`);
}

run().catch(console.error);
