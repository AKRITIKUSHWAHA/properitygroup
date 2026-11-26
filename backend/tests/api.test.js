import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { issueQuote } from '../src/services/quoteService.js';
import { sendQuoteProposalEmail } from '../src/services/emailService.js';

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

let adminUser, customerA, customerB, surveyorA, surveyorB;
let adminToken, tokenA, tokenB, srvTokenA, srvTokenB;

async function resetTestDb() {
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.customerReview.deleteMany({});
  await prisma.callLog.deleteMany({});
  await prisma.complaintLog.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.term.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.surveyorProfile.deleteMany({});
  await prisma.user.deleteMany({});
}

beforeAll(async () => {
  await resetTestDb();

  adminUser = await prisma.user.create({
    data: {
      name: 'Test Admin',
      email: 'admin-test@njspropertygroup.com',
      password: 'hashed_password_not_used_here',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  customerA = await prisma.user.create({
    data: {
      name: 'Alice Customer',
      email: 'alice-test@example.com',
      password: 'hashed_password_not_used_here',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });
  customerB = await prisma.user.create({
    data: {
      name: 'Bob Customer',
      email: 'bob-test@example.com',
      password: 'hashed_password_not_used_here',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });
  surveyorA = await prisma.user.create({
    data: {
      name: 'Surveyor Alpha',
      email: 'surveyor-a@njspropertygroup.com',
      password: 'hashed_password_not_used_here',
      role: 'SURVEYOR',
      status: 'ACTIVE',
    },
  });
  surveyorB = await prisma.user.create({
    data: {
      name: 'Surveyor Beta',
      email: 'surveyor-b@njspropertygroup.com',
      password: 'hashed_password_not_used_here',
      role: 'SURVEYOR',
      status: 'ACTIVE',
    },
  });

  adminToken = signToken(adminUser);
  tokenA = signToken(customerA);
  tokenB = signToken(customerB);
  srvTokenA = signToken(surveyorA);
  srvTokenB = signToken(surveyorB);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('1. Auth & Impersonation & Cross-Customer Isolation', () => {
  it('rejects requests without a JWT token with 401', async () => {
    const res = await request(app).get('/api/v1/customer/quotations');
    expect(res.status).toBe(401);
  });

  it('ignores x-user-email / x-user-name headers without a token (401)', async () => {
    const res = await request(app)
      .get('/api/v1/customer/quotations')
      .set('x-user-email', adminUser.email)
      .set('x-user-name', adminUser.name);
    expect(res.status).toBe(401);
  });

  it('ignores x-user-email impersonation even with a valid customer token', async () => {
    const leadB = await prisma.lead.create({
      data: {
        reference: 'LED-TEST-IMP',
        clientName: customerB.name,
        clientEmail: customerB.email,
        propertyAddress: '99 Secret Lane',
        postcode: 'SW1A 2AA',
        serviceType: 'RICS Level 2 Home Survey',
        status: 'NEW',
      },
    });
    await issueQuote({
      leadId: leadB.id,
      baseFee: 500,
      discount: 0,
      serviceType: 'RICS Level 2 Home Survey',
      issuedBy: adminUser.id,
    });

    // Customer A tries to impersonate Customer B via header
    const res = await request(app)
      .get('/api/v1/customer/quotations')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-user-email', customerB.email);

    expect(res.status).toBe(200);
    const quotes = res.body?.data?.quotations || res.body?.data?.quotes || [];
    expect(quotes.some((q) => q.clientEmail === customerB.email)).toBe(false);
  });

  it('prevents Customer A from accepting, signing, or paying Customer B records (403/404)', async () => {
    const jobB = await prisma.job.create({
      data: {
        reference: 'JOB-TEST-ISOLATION',
        stage: 'QUOTE_ISSUED',
        serviceType: 'RICS Level 2 Home Survey',
        propertyAddress: '200 Isolated Road',
        postcode: 'E1 6AN',
        clientName: customerB.name,
        clientEmail: customerB.email,
        clientId: customerB.id,
      },
    });
    const quoteB = await prisma.quote.create({
      data: {
        reference: 'QTE-TEST-ISOL',
        job: { connect: { id: jobB.id } },
        baseFee: 500,
        vatAmount: 100,
        totalAmount: 600,
        status: 'SENT',
      },
    });
    const termB = await prisma.term.create({
      data: {
        reference: 'TRM-TEST-ISOL',
        jobId: jobB.id,
        clientName: customerB.name,
        clientEmail: customerB.email,
        documentTitle: 'Test Terms',
        content: 'Test Content',
        signed: false,
      },
    });
    const invB = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-TEST-ISOL',
        jobId: jobB.id,
        clientName: customerB.name,
        clientEmail: customerB.email,
        subtotal: 500,
        vatAmount: 100,
        total: 600,
        status: 'PENDING',
      },
    });

    const accRes = await request(app)
      .post(`/api/v1/customer/quotations/${quoteB.id}/accept`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect([403, 404]).toContain(accRes.status);

    const signRes = await request(app)
      .post(`/api/v1/customer/terms-to-sign/${termB.id}/sign`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ signatureData: 'Alice Fraud' });
    expect([403, 404]).toContain(signRes.status);

    const payRes = await request(app)
      .post(`/api/v1/customer/invoices/${invB.id}/pay`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ paymentMethod: 'bacs', transferReference: 'HACK' });
    expect([403, 404]).toContain(payRes.status);
  });
});

describe('2. Quote Issuance Deduplication & Expiry', () => {
  it('issuing quote 3 times on 1 lead leaves only 1 SENT quote, 2 EXPIRED, and 1 notification', async () => {
    const lead = await prisma.lead.create({
      data: {
        reference: 'LED-TEST-Q3',
        clientName: customerA.name,
        clientEmail: customerA.email,
        propertyAddress: '10 Downing St',
        postcode: 'SW1A 2AA',
        serviceType: 'RICS Level 2 Home Survey',
        status: 'NEW',
      },
    });

    const r1 = await issueQuote({ leadId: lead.id, baseFee: 400, discount: 0, serviceType: 'RICS Level 2 Home Survey', issuedBy: adminUser.id });
    const r2 = await issueQuote({ leadId: lead.id, baseFee: 450, discount: 0, serviceType: 'RICS Level 2 Home Survey', issuedBy: adminUser.id });
    const r3 = await issueQuote({ leadId: lead.id, baseFee: 500, discount: 0, serviceType: 'RICS Level 2 Home Survey', issuedBy: adminUser.id });

    const allQuotes = await prisma.quote.findMany({ where: { leadId: lead.id } });
    expect(allQuotes.length).toBe(3);
    expect(allQuotes.filter((q) => q.status === 'SENT').length).toBe(1);
    expect(allQuotes.filter((q) => q.status === 'SUPERSEDED').length).toBe(2);
    expect(allQuotes.find((q) => q.status === 'SENT').id).toBe(r3.quote.id);

    // Latest quote notification exists once for its reference
    const latestNotifs = await prisma.notification.findMany({
      where: {
        userId: customerA.id,
        desc: { contains: r3.quote.reference },
      },
    });
    expect(latestNotifs.length).toBe(1);
    expect(r1.quote.id).not.toBe(r2.quote.id);
  });
});

describe('3. Quote Accept, Terms Dispatch Guard & Payment Guards', () => {
  let jobFlow, quoteFlow, termFlow, invoiceFlow;

  it('rejects Terms dispatch when job has no ACCEPTED quote (400)', async () => {
    const unacceptedJob = await prisma.job.create({
      data: {
        reference: 'JOB-TEST-NOACC',
        stage: 'QUOTE_ISSUED',
        serviceType: 'RICS Level 2 Home Survey',
        propertyAddress: '5 Unaccepted Way',
        postcode: 'NW1 1AA',
        clientName: customerA.name,
        clientEmail: customerA.email,
        clientId: customerA.id,
      },
    });

    const res = await request(app)
      .post('/api/v1/terms-and-documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ jobId: unacceptedJob.id });

    expect(res.status).toBe(400);
  });

  it('accepts quote (£600 total) and creates Term & Invoice with exact £600 amount (never default)', async () => {
    const lead = await prisma.lead.create({
      data: {
        reference: 'LED-TEST-600',
        clientName: customerA.name,
        clientEmail: customerA.email,
        propertyAddress: '600 Exact Fee Rd',
        postcode: 'W1A 1AA',
        serviceType: 'RICS Level 3 Building Survey',
        status: 'NEW',
      },
    });

    // baseFee 500 + 20% VAT = 600
    const issued = await issueQuote({
      leadId: lead.id,
      baseFee: 500,
      discount: 0,
      serviceType: 'RICS Level 3 Building Survey',
      issuedBy: adminUser.id,
    });
    quoteFlow = issued.quote;
    expect(quoteFlow.totalAmount).toBe(600);

    const accRes = await request(app)
      .post(`/api/v1/customer/quotations/${quoteFlow.id}/accept`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(accRes.status).toBe(200);
    jobFlow = await prisma.job.findFirst({ where: { leadId: lead.id } });
    expect(jobFlow).toBeTruthy();
    expect(jobFlow.stage).toBe('QUOTE_ACCEPTED');

    invoiceFlow = await prisma.invoice.findFirst({ where: { jobId: jobFlow.id } });
    expect(invoiceFlow).toBeTruthy();
    expect(invoiceFlow.total).toBe(600);
    expect(invoiceFlow.subtotal).toBe(500);

    termFlow = await prisma.term.findFirst({ where: { jobId: jobFlow.id } });
    expect(termFlow).toBeTruthy();
    expect(termFlow.signed).toBe(false);
  });

  it('rejects invoice payment when Terms are NOT signed (400)', async () => {
    const res = await request(app)
      .post(`/api/v1/customer/invoices/${invoiceFlow.id}/pay`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ paymentMethod: 'card' });

    expect(res.status).toBe(400);
  });

  it('does NOT mark invoice PAID on card payment without Stripe verification', async () => {
    // Sign terms first
    const signRes = await request(app)
      .post(`/api/v1/customer/terms-to-sign/${termFlow.id}/sign`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ signatureData: 'Alice Customer' });
    expect(signRes.status).toBe(200);

    // Attempt card payment without Stripe configured/verified
    const cardRes = await request(app)
      .post(`/api/v1/customer/invoices/${invoiceFlow.id}/pay`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ paymentMethod: 'card' });

    expect(cardRes.status).toBeGreaterThanOrEqual(400);
    const invCheck = await prisma.invoice.findUnique({ where: { id: invoiceFlow.id } });
    expect(invCheck.status).toBe('PENDING');
  });

  it('marks invoice PAID when Admin settles via BACS', async () => {
    const bacsRes = await request(app)
      .post(`/api/v1/quotations-and-payments/invoices/${invoiceFlow.id}/settle-bacs`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bacsReference: 'BACS-TEST-600' });

    expect(bacsRes.status).toBe(200);
    const invCheck = await prisma.invoice.findUnique({ where: { id: invoiceFlow.id } });
    expect(invCheck.status).toBe('PAID');
  });
});

describe('4. Stage Transitions & Surveyor Isolation', () => {
  it('rejects invalid stage jump (QUOTE_ISSUED -> COMPLETE) with 400', async () => {
    const job = await prisma.job.create({
      data: {
        reference: 'JOB-TEST-STAGE',
        stage: 'QUOTE_ISSUED',
        serviceType: 'RICS Level 2 Home Survey',
        propertyAddress: '12 Stage Jump St',
        postcode: 'N1 1AA',
        clientName: customerA.name,
        clientEmail: customerA.email,
        clientId: customerA.id,
      },
    });

    const res = await request(app)
      .patch(`/api/v1/survey-jobs/${job.id}/stage`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newStage: 'COMPLETE' });

    expect(res.status).toBe(400);
  });

  it('enforces strict surveyor isolation (Surveyor B cannot see or complete Surveyor A job)', async () => {
    const jobA = await prisma.job.create({
      data: {
        reference: 'JOB-TEST-SRVA',
        stage: 'BOOKED',
        serviceType: 'RICS Level 2 Home Survey',
        propertyAddress: '42 Alpha Close',
        postcode: 'SE1 1AA',
        clientName: customerA.name,
        clientEmail: customerA.email,
        clientId: customerA.id,
        surveyorId: surveyorA.id,
        inspectionDate: new Date(),
      },
    });

    const listB = await request(app)
      .get('/api/v1/surveyor/my-jobs')
      .set('Authorization', `Bearer ${srvTokenB}`);
    expect(listB.status).toBe(200);
    expect((listB.body?.data?.jobs || []).some((j) => j.id === jobA.id)).toBe(false);

    const completeB = await request(app)
      .post(`/api/v1/surveyor/site-visits/${jobA.id}/complete`)
      .set('Authorization', `Bearer ${srvTokenB}`);
    expect(completeB.status).toBe(404);
  });
});

describe('5. Email Service Honesty', () => {
  it('returns success: false when RESEND_API_KEY is missing', async () => {
    const res = await sendQuoteProposalEmail({
      to: customerA.email,
      clientName: customerA.name,
      quoteRef: 'QTE-TEST-NOKEY',
      propertyAddress: '1 Test St',
      surveyType: 'RICS Level 2 Home Survey',
      baseFee: 500,
      discount: 0,
      vatAmount: 100,
      totalAmount: 600,
    });
    expect(res.success).toBe(false);
    expect(res.emailSent).toBe(false);
  });
});
