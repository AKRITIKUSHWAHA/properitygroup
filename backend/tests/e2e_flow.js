import request from 'supertest';
import jwt from 'jsonwebtoken';

// Enforce isolated test database BEFORE importing app/prisma
const testDbUrl =
  process.env.DATABASE_URL_TEST ||
  'mysql://root:@127.0.0.1:3306/njs_db_test';

const dbNameMatch = testDbUrl.match(/\/([^/?]+)(?:\?|$)/);
const dbName = dbNameMatch ? dbNameMatch[1] : '';

if (!dbName || !dbName.toLowerCase().includes('test')) {
  console.error(`[TEST DB GUARD] Refusing to run E2E flow against non-test DB "${dbName}".`);
  process.exit(1);
}

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testDbUrl;
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'njs_test_secret_key_for_vitest_only_12345';
process.env.ENABLE_BOOKING_REMINDER_JOB = 'false';

const { default: app } = await import('../src/app.js');
const { prisma } = await import('../src/config/db.js');

const assert = (cond, msg) => {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
};

async function run() {
  console.log('--- Starting 10-Step E2E Flow Test (njs_db_test) ---');

  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.term.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Seed Admin + Customer
  const admin = await prisma.user.create({
    data: {
      name: 'E2E Admin',
      email: 'e2e-admin@njspropertygroup.com',
      password: 'x',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  const customer = await prisma.user.create({
    data: {
      name: 'E2E Client',
      email: 'e2e-client@example.com',
      password: 'x',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });

  const adminToken = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  const customerToken = jwt.sign(
    { id: customer.id, email: customer.email, role: customer.role, name: customer.name },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  // 2. Create Lead
  const leadRes = await request(app)
    .post('/api/v1/crm-and-leads')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      clientName: customer.name,
      clientEmail: customer.email,
      propertyAddress: '10 E2E Flow Gardens',
      postcode: 'SW1A 1AA',
      serviceType: 'RICS Level 2 Home Survey',
      source: 'Website',
    });
  assert(leadRes.status === 201, `Create lead expected 201, got ${leadRes.status}`);
  const lead = leadRes.body.data.lead;
  console.log('1. Lead created:', lead.reference);

  // 3. Issue Quote (£500 + 20% VAT = £600)
  const quoteRes = await request(app)
    .post('/api/v1/quotations-and-payments/quotes')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      leadId: lead.id,
      baseFee: 500,
      discount: 0,
      serviceType: 'RICS Level 2 Home Survey',
    });
  assert(quoteRes.status === 201, `Issue quote expected 201, got ${quoteRes.status}`);
  const quote = quoteRes.body.data.quote;
  assert(quote.totalAmount === 600, `Expected quote totalAmount 600, got ${quote.totalAmount}`);
  console.log('2. Quote issued (£600):', quote.reference);

  // 4. Customer views & accepts Quote (auto-creates Job, Term, and Invoice)
  const accRes = await request(app)
    .post(`/api/v1/customer/quotations/${quote.id}/accept`)
    .set('Authorization', `Bearer ${customerToken}`);
  assert(accRes.status === 200, `Accept quote expected 200, got ${accRes.status}`);
  const jobId = accRes.body.data.jobId;
  console.log('3. Quote accepted by customer (jobId:', jobId, ')');

  // 5. Verify Terms page API returns term
  const termsListRes = await request(app)
    .get('/api/v1/customer/terms-to-sign')
    .set('Authorization', `Bearer ${customerToken}`);
  assert(termsListRes.status === 200, `Get terms expected 200, got ${termsListRes.status}`);
  const term = termsListRes.body.data.term;
  assert(term && term.id, 'Expected term to be created');
  console.log('4. Terms fetched:', term.reference);

  // Verify Invoice created for £600
  const invListRes = await request(app)
    .get('/api/v1/customer/invoices')
    .set('Authorization', `Bearer ${customerToken}`);
  assert(invListRes.status === 200, `Get invoices expected 200, got ${invListRes.status}`);
  const invoice = (invListRes.body.data.invoices || [])[0];
  assert(invoice && invoice.total === 600, `Expected invoice total 600, got ${invoice?.total}`);
  console.log('5. Invoice verified (£600):', invoice.invoiceNumber);

  // 6. Customer signs Terms
  const signRes = await request(app)
    .post(`/api/v1/customer/terms-to-sign/${term.id}/sign`)
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ signatureData: 'E2E Client Signature' });
  assert(signRes.status === 200, `Sign terms expected 200, got ${signRes.status}`);
  console.log('6. Terms digitally signed');

  // 7. Customer submits BACS claim -> Admin notification created
  const bacsClaimRes = await request(app)
    .post(`/api/v1/customer/invoices/${invoice.id}/pay`)
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ paymentMethod: 'bacs', transferReference: 'E2E-BACS-600' });
  assert(bacsClaimRes.status === 200, `BACS claim expected 200, got ${bacsClaimRes.status}`);
  console.log('7. Customer BACS claim submitted');

  // 8. Admin settles BACS payment -> PAID
  const settleRes = await request(app)
    .post(`/api/v1/quotations-and-payments/invoices/${invoice.id}/settle-bacs`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ bacsReference: 'E2E-BACS-600' });
  assert(settleRes.status === 200, `Admin BACS settle expected 200, got ${settleRes.status}`);
  console.log('8. Admin settled BACS payment (PAID)');

  // 9. Verify Admin notification exists
  const adminNotifs = await prisma.notification.findMany({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'desc' },
  });
  assert(adminNotifs.length >= 1, 'Expected at least 1 ADMIN notification');
  console.log(`9. Admin notifications verified (${adminNotifs.length} found)`);

  console.log('--- 10-Step E2E Flow PASSED ---');
  await prisma.$disconnect();
}

run().catch(async (err) => {
  console.error('E2E Flow FAILED:', err);
  await prisma.$disconnect();
  process.exit(1);
});
