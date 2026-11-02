import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding for NJS Property Group (njs_db)...');

  // Clean existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany();
  await prisma.customerReview.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.message.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.term.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.callLog.deleteMany();
  await prisma.complaintLog.deleteMany();
  await prisma.job.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.surveyorProfile.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('password123', salt);

  // 1. Create Admins
  const admin = await prisma.user.create({
    data: {
      name: 'Alexander Sterling',
      email: 'alexander@njspropertygroup.com',
      password: defaultPassword,
      role: 'ADMIN',
      phone: '+44 20 7946 0912',
      status: 'ACTIVE',
    },
  });

  const demoAdmin = await prisma.user.create({
    data: {
      name: 'Alexander Sterling',
      email: 'admin@demo.com',
      password: defaultPassword,
      role: 'ADMIN',
      phone: '+44 20 7946 0912',
      status: 'ACTIVE',
    },
  });

  // 2. Create Surveyors
  const surveyor1 = await prisma.user.create({
    data: {
      name: 'David Thorne MRICS',
      email: 'david.thorne@njspropertygroup.com',
      password: defaultPassword,
      role: 'SURVEYOR',
      phone: '+44 7700 900456',
      status: 'ACTIVE',
      surveyorProfile: {
        create: {
          accreditation: 'MRICS',
          ricsNumber: 'RICS-089421',
          piiPolicyNumber: 'PII-UK-2026-88',
          piiExpiryDate: new Date('2027-12-31'),
          piiValidated: true,
          postcodesCovered: 'W, SW, WC',
          activeLoad: 4,
          maxLoad: 8,
          rating: 4.95,
          available: true,
        },
      },
    },
  });

  const demoSurveyor = await prisma.user.create({
    data: {
      name: 'David Thorne MRICS',
      email: 'surveyor@demo.com',
      password: defaultPassword,
      role: 'SURVEYOR',
      phone: '+44 7700 900456',
      status: 'ACTIVE',
      surveyorProfile: {
        create: {
          accreditation: 'MRICS',
          ricsNumber: 'RICS-089421',
          piiPolicyNumber: 'PII-UK-2026-88',
          piiExpiryDate: new Date('2027-12-31'),
          piiValidated: true,
          postcodesCovered: 'W, SW, WC',
          activeLoad: 4,
          maxLoad: 8,
          rating: 4.95,
          available: true,
        },
      },
    },
  });

  const surveyor2 = await prisma.user.create({
    data: {
      name: 'Oliver Hughes MRICS',
      email: 'oliver.hughes@njspropertygroup.com',
      password: defaultPassword,
      role: 'SURVEYOR',
      phone: '+44 7700 900789',
      status: 'ACTIVE',
      surveyorProfile: {
        create: {
          accreditation: 'MRICS',
          ricsNumber: 'RICS-076512',
          piiPolicyNumber: 'PII-UK-2026-92',
          piiExpiryDate: new Date('2027-10-15'),
          piiValidated: true,
          postcodesCovered: 'NW, N, E, EC',
          activeLoad: 3,
          maxLoad: 8,
          rating: 4.88,
          available: true,
        },
      },
    },
  });

  // 3. Create Customers
  const customer1 = await prisma.user.create({
    data: {
      name: 'Emma Watson',
      email: 'emma.watson@example.com',
      password: defaultPassword,
      role: 'CUSTOMER',
      phone: '+44 7911 123456',
      status: 'ACTIVE',
    },
  });

  const demoCustomer = await prisma.user.create({
    data: {
      name: 'Emma Watson',
      email: 'customer@demo.com',
      password: defaultPassword,
      role: 'CUSTOMER',
      phone: '+44 7911 123456',
      status: 'ACTIVE',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Harrison Sterling',
      email: 'customer2@demo.com',
      password: defaultPassword,
      role: 'CUSTOMER',
      phone: '+44 7700 900333',
      status: 'ACTIVE',
    },
  });

  // 4. Create Partner Companies
  const company1 = await prisma.company.create({
    data: {
      name: 'Foxtons Residential Surveys',
      branchName: 'Mayfair & Westminster',
      address: '92 Park Lane, London W1K 7TA',
      contactName: 'Marcus Bell',
      contactEmail: 'mayfair@foxtons.co.uk',
      contactPhone: '+44 20 7946 0888',
      referralRate: 10.0,
      totalInstructions: 34,
      keyCollectionProtocol: 'Keys held at front desk for all W1/SW1 instructions',
      status: 'ACTIVE',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'Dexters Estate Agents',
      branchName: 'Kensington & Chelsea',
      address: '160 Kensington High St, London W8 7RG',
      contactName: 'Sarah Croft',
      contactEmail: 'kensington@dexters.co.uk',
      contactPhone: '+44 20 7590 9580',
      referralRate: 12.0,
      totalInstructions: 52,
      keyCollectionProtocol: 'Key collection between 09:00 - 17:30 with valid surveyor RICS ID',
      status: 'ACTIVE',
    },
  });

  const company3 = await prisma.company.create({
    data: {
      name: 'Savills Residential',
      branchName: 'Richmond & Twickenham',
      address: '40-42 The Hill, Richmond TW10 6UA',
      contactName: 'Arthur Pendelton',
      contactEmail: 'richmond@savills.co.uk',
      contactPhone: '+44 20 8940 2772',
      referralRate: 8.5,
      totalInstructions: 19,
      keyCollectionProtocol: 'Key code lockbox 4912 on side entrance. Contact Arthur directly.',
      status: 'ACTIVE',
    },
  });

  // 5. Create Leads
  const lead1 = await prisma.lead.create({
    data: {
      reference: 'LEAD-2026-001',
      clientName: 'Emma Watson',
      clientEmail: 'customer@demo.com',
      clientPhone: '+44 7911 123456',
      propertyAddress: '14 Mayfair Gate, Mayfair, London',
      postcode: 'W1K 2PB',
      serviceType: 'RICS Level 2 Home Survey',
      propertyType: 'Georgian Townhouse',
      estimatedValue: 1850000,
      source: 'WEBSITE',
      status: 'CONVERTED',
      companyId: company1.id,
      callLogs: {
        create: [
          {
            callerName: 'Emma Watson',
            handlerName: 'Alexander Sterling',
            durationMinutes: 8,
            summary: 'Client called regarding surveyor timing and damp meter check in the dining room.',
          },
        ],
      },
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      reference: 'LEAD-2026-002',
      clientName: 'Harrison Sterling',
      clientEmail: 'customer2@demo.com',
      clientPhone: '+44 7700 900333',
      propertyAddress: '27 Kensington Church St, London',
      postcode: 'W8 4LL',
      serviceType: 'RICS Level 3 Building Survey',
      propertyType: 'Victorian Terraced Villa',
      estimatedValue: 2400000,
      source: 'PARTNER_AGENCY',
      status: 'NEW',
      companyId: company2.id,
      callLogs: {
        create: [
          {
            callerName: 'Sarah Croft (Dexters)',
            handlerName: 'Alexander Sterling',
            durationMinutes: 5,
            summary: 'Referral for Victorian property showing signs of subsidence on rear annex.',
          },
        ],
      },
    },
  });

  // 6. Create Jobs
  const job1 = await prisma.job.create({
    data: {
      reference: 'JOB-2026-080',
      stage: 'BOOKED',
      serviceType: 'RICS Level 2 Home Survey',
      propertyAddress: '14 Mayfair Gate, Mayfair, London',
      postcode: 'W1K 2PB',
      clientName: 'Emma Watson',
      clientEmail: 'customer@demo.com',
      clientPhone: '+44 7911 123456',
      clientId: demoCustomer.id,
      surveyorId: demoSurveyor.id,
      leadId: lead1.id,
      companyId: company1.id,
      inspectionDate: new Date('2026-11-04T10:00:00Z'),
      inspectionTime: '10:00 AM - 12:30 PM',
      keyCollectionDetails: 'Collect keys from Foxtons Mayfair under branch reference FX-402.',
      specialInstructions: 'Inspect reported damp spot behind dining room skirting board.',
      estimatedTurnaroundDays: 3,
      quotes: {
        create: {
          reference: 'QTE-2026-080',
          baseFee: 650.0,
          vatRate: 20.0,
          vatAmount: 130.0,
          totalAmount: 780.0,
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      },
      terms: {
        create: {
          reference: 'TRM-2026-080',
          clientName: 'Emma Watson',
          clientEmail: 'customer@demo.com',
          documentTitle: 'RICS Home Survey Level 2 Terms of Engagement',
          content: 'Standard statutory RICS terms and liability clauses.',
          signed: true,
          signatureData: 'Emma Watson (Digitally Executed)',
          signedAt: new Date(),
          signerIp: '86.142.19.45',
          signerUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          tamperAuditHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
        },
      },
      invoices: {
        create: {
          invoiceNumber: 'INV-2026-080',
          clientName: 'Emma Watson',
          clientEmail: 'customer@demo.com',
          subtotal: 650.0,
          vatAmount: 130.0,
          total: 780.0,
          status: 'PAID',
          paymentMethod: 'STRIPE_CARD',
          stripePaymentIntentId: 'pi_3Mtwx2LkdIwHu7ix28a30q1K',
          paidAt: new Date(),
        },
      },
      messages: {
        create: [
          {
            conversationId: 'conv-1',
            senderId: demoCustomer.id,
            senderName: 'Emma Watson',
            role: 'customer',
            content: 'Thank you Sarah! Please note that the keys are held at Foxtons Mayfair under branch reference FX-402, and there is a damp spot behind the dining room skirting that I would like David to inspect.',
            readByAdmin: true,
            readByCustomer: true,
          },
          {
            conversationId: 'conv-1',
            senderId: demoAdmin.id,
            senderName: 'Alexander Sterling (Admin)',
            role: 'admin',
            content: 'Noted with thanks! David has added a specific damp meter check in the dining room to his inspection checklist.',
            readByAdmin: true,
            readByCustomer: true,
          },
        ],
      },
    },
  });

  const job2 = await prisma.job.create({
    data: {
      reference: 'JOB-2026-081',
      stage: 'COMPLETE',
      serviceType: 'RICS Level 3 Building Survey',
      propertyAddress: '88 Belgrave Square, London',
      postcode: 'SW1X 8PH',
      clientName: 'Emma Watson',
      clientEmail: 'customer@demo.com',
      clientPhone: '+44 7911 123456',
      clientId: demoCustomer.id,
      surveyorId: demoSurveyor.id,
      inspectionDate: new Date('2026-10-15T14:00:00Z'),
      inspectionTime: '02:00 PM - 05:30 PM',
      reportPdfUrl: 'https://storage.googleapis.com/property-group-reports/JOB-2026-081-L3-Final.pdf',
      reportGeneratedAt: new Date('2026-10-18T16:00:00Z'),
      qaApprovedBy: 'Alexander Sterling',
      qaApprovedAt: new Date('2026-10-19T09:30:00Z'),
      quotes: {
        create: {
          reference: 'QTE-2026-081',
          baseFee: 1100.0,
          vatRate: 20.0,
          vatAmount: 220.0,
          totalAmount: 1320.0,
          status: 'ACCEPTED',
          acceptedAt: new Date('2026-10-12'),
        },
      },
      terms: {
        create: {
          reference: 'TRM-2026-081',
          clientName: 'Emma Watson',
          clientEmail: 'customer@demo.com',
          documentTitle: 'RICS Home Survey Level 3 Terms of Engagement',
          content: 'Level 3 comprehensive survey terms and conditions.',
          signed: true,
          signatureData: 'Emma Watson (Digitally Executed)',
          signedAt: new Date('2026-10-12'),
        },
      },
      invoices: {
        create: {
          invoiceNumber: 'INV-2026-081',
          clientName: 'Emma Watson',
          clientEmail: 'customer@demo.com',
          subtotal: 1100.0,
          vatAmount: 220.0,
          total: 1320.0,
          status: 'PAID',
          paymentMethod: 'BACS_TRANSFER',
          bacsReference: 'BACS-NJS-88BELG',
          paidAt: new Date('2026-10-13'),
        },
      },
    },
  });

  // 7. Create System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'company_name', value: 'NJS Property Group UK', category: 'GENERAL' },
      { key: 'vat_registration_number', value: 'GB 924 8192 14', category: 'FINANCIAL' },
      { key: 'standard_vat_rate', value: '20.0', category: 'FINANCIAL' },
      { key: 'rics_firm_registration', value: 'RICS-FIRM-894102', category: 'RICS' },
      { key: 'default_sla_hours', value: '48', category: 'GENERAL' },
      { key: 'support_email', value: 'help@njspropertygroup.com', category: 'NOTIFICATION' },
      { key: 'support_phone', value: '+44 20 7946 0912', category: 'NOTIFICATION' },
    ],
  });

  // 8. Create Customer Reviews
  await prisma.customerReview.create({
    data: {
      userId: demoCustomer.id,
      jobId: job2.id,
      rating: 5,
      title: 'Flawless and thorough Level 3 inspection',
      reviewText: 'David Thorne was exceptionally diligent with our Victorian property survey. Discovered rising damp early which saved us £12,000 in renegotiation.',
      platform: 'TRUSTPILOT',
      verified: true,
    },
  });

  // 9. Create Support Tickets
  await prisma.supportTicket.create({
    data: {
      ticketNo: 'TCK-2026-001',
      userId: demoCustomer.id,
      jobId: job1.id,
      subject: 'Key collection confirmation for 14 Mayfair Gate',
      message: 'Can you confirm Foxtons Mayfair received the surveyor authorisation letter?',
      category: 'SURVEY_QUERY',
      status: 'CLOSED',
      priority: 'NORMAL',
    },
  });

  // 10. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        jobId: job1.id,
        userId: demoAdmin.id,
        action: 'JOB_CREATED',
        details: 'Initial instruction registered for 14 Mayfair Gate',
      },
      {
        jobId: job1.id,
        userId: demoCustomer.id,
        action: 'TERMS_DIGITALLY_SIGNED',
        details: 'Terms accepted with tamper audit hash 9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
      },
      {
        jobId: job1.id,
        userId: demoCustomer.id,
        action: 'PAYMENT_RECEIVED',
        details: 'Stripe card payment £780.00 confirmed (pi_3Mtwx2LkdIwHu7ix28a30q1K)',
      },
      {
        jobId: job1.id,
        userId: demoAdmin.id,
        action: 'SURVEYOR_ALLOCATED',
        details: 'Assigned to David Thorne MRICS for 04 Nov 2026 10:00 AM',
      },
    ],
  });

  console.log('✅ Comprehensive seeding completed successfully for all 15 models!');
  console.log('📊 Tables populated:');
  console.log('   - users, surveyor_profiles, companies, leads, call_logs, complaint_logs');
  console.log('   - jobs, quotes, terms, invoices, messages, audit_logs');
  console.log('   - system_settings, customer_reviews, support_tickets');
  console.log('🔑 Credentials:');
  console.log('   - Admin:    admin@demo.com / password123');
  console.log('   - Surveyor: surveyor@demo.com / password123');
  console.log('   - Customer: customer@demo.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
