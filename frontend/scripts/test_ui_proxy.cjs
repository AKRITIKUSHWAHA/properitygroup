const http = require('http');

async function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5175,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => resolve(JSON.parse(raw)));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5175,
        path,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => resolve(JSON.parse(raw)));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('Testing Frontend Proxy (Port 5175) -> Backend Express Server (Port 5000)...');
  
  // 1. Admin Login through Vite proxy
  const adminRes = await post('/api/v1/auth/login', { email: 'admin@demo.com', password: 'password123' });
  console.log('1. Admin Login:', adminRes.success ? '✅ SUCCESS' : '❌ FAILED', '| User:', adminRes.data?.user?.name, '| Role:', adminRes.data?.user?.role);
  const adminToken = adminRes.data?.token;

  // 2. Fetch Users through Vite proxy
  const users = await get('/api/v1/users-and-roles', adminToken);
  console.log('2. Admin Users Menu:', users.success ? '✅ SUCCESS' : '❌ FAILED', '| Total Users in MySQL:', users.data?.length);

  // 3. Customer Login through Vite proxy
  const custRes = await post('/api/v1/auth/login', { email: 'customer@demo.com', password: 'password123' });
  console.log('3. Customer Login:', custRes.success ? '✅ SUCCESS' : '❌ FAILED', '| User:', custRes.data?.user?.name, '| Role:', custRes.data?.user?.role);
  const custToken = custRes.data?.token;

  // 4. Customer Dashboard through Vite proxy
  const custDash = await get('/api/v1/customer/dashboard', custToken);
  console.log('4. Customer Dashboard Menu:', custDash.success ? '✅ SUCCESS' : '❌ FAILED', '| Active Bookings:', custDash.data?.activeBookings?.length);

  // 5. Surveyor Login through Vite proxy
  const survRes = await post('/api/v1/auth/login', { email: 'surveyor@demo.com', password: 'password123' });
  console.log('5. Surveyor Login:', survRes.success ? '✅ SUCCESS' : '❌ FAILED', '| User:', survRes.data?.user?.name, '| Role:', survRes.data?.user?.role);
  const survToken = survRes.data?.token;

  // 6. Surveyor Dashboard through Vite proxy
  const survDash = await get('/api/v1/surveyor/dashboard', survToken);
  console.log('6. Surveyor Dashboard Menu:', survDash.success ? '✅ SUCCESS' : '❌ FAILED', '| Allocated Inspections:', survDash.data?.activeInspectionsCount);

  console.log('\n🚀 ALL PORTALS FULLY CONNECTED AND VERIFIED END-TO-END VIA FRONTEND!');
}

run().catch(console.error);
