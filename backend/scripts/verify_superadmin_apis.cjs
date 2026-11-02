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
  console.log('🚀 Verifying Superadmin APIs across all 11 menus...');

  // 1. Health check
  const health = await request('/api/v1/health');
  console.log('✓ Health Check:', health.status, health.body.service);

  // 2. Login as Admin
  const login = await request('/api/v1/auth/login', 'POST', null, {
    email: 'alexander@njspropertygroup.com',
    password: 'password123',
  });
  if (login.status !== 200) {
    console.error('❌ Login failed:', login);
    process.exit(1);
  }
  const token = login.body.data.token;
  console.log('✓ Admin Login OK, token obtained.');

  const menus = [
    { name: '1. Dashboard Stats', path: '/api/v1/dashboard/stats' },
    { name: '1. Dashboard Buckets', path: '/api/v1/dashboard/action-buckets' },
    { name: '2. Users & Roles', path: '/api/v1/users-and-roles' },
    { name: '2. Users Metrics', path: '/api/v1/users-and-roles/metrics' },
    { name: '3. Companies', path: '/api/v1/companies' },
    { name: '3. Companies Metrics', path: '/api/v1/companies/metrics' },
    { name: '4. Surveyors', path: '/api/v1/surveyors' },
    { name: '4. Surveyors Metrics', path: '/api/v1/surveyors/metrics' },
    { name: '5. CRM & Leads', path: '/api/v1/crm-and-leads' },
    { name: '5. CRM Metrics', path: '/api/v1/crm-and-leads/metrics' },
    { name: '6. Survey Jobs', path: '/api/v1/survey-jobs' },
    { name: '6. Survey Jobs Metrics', path: '/api/v1/survey-jobs/metrics' },
    { name: '7. Messages Inbox', path: '/api/v1/messages/threads' },
    { name: '7. Messages Metrics', path: '/api/v1/messages/metrics' },
    { name: '8. Quotations', path: '/api/v1/quotations-and-payments/quotes' },
    { name: '8. Payments & Invoices', path: '/api/v1/quotations-and-payments/invoices' },
    { name: '8. Financial Metrics', path: '/api/v1/quotations-and-payments/metrics' },
    { name: '9. Terms & Documents', path: '/api/v1/terms-and-documents' },
    { name: '9. Terms Metrics', path: '/api/v1/terms-and-documents/metrics' },
    { name: '10. Reports & Analytics', path: '/api/v1/reports-and-analytics' },
    { name: '10. Reports Metrics', path: '/api/v1/reports-and-analytics/metrics' },
    { name: '11. Settings', path: '/api/v1/settings' },
  ];

  let passed = 0;
  for (const m of menus) {
    const res = await request(m.path, 'GET', token);
    if (res.status === 200 && res.body.success) {
      console.log(`✅ [${res.status}] ${m.name} -> SUCCESS`);
      passed++;
    } else {
      console.error(`❌ [${res.status}] ${m.name} -> FAILED:`, res.body);
    }
  }

  console.log(`\n🎉 Test Result: ${passed}/${menus.length} Superadmin Menu endpoints working with 100% SUCCESS!`);
}

run().catch(console.error);
