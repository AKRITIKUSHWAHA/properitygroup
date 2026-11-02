import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for NJS Property Group (njs_db)...');

  // Clean existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany();
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

  // 1. Create Admin
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
          piiValidated: true,
          postcodesCovered: 'W, SW, WC',
          activeLoad: 4,
          maxLoad: 8,
          rating: 4.95,
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
          piiValidated: true,
          postcodesCovered: 'NW, N, E, EC',
          activeLoad: 3,
          maxLoad: 8,
          rating: 4.88,
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

  const customer2 = await prisma.user.create({
    data: {
      name: 'Kensington Estates PLC',
      email: 'contact@kensingtonestates.co.uk',
      password: defaultPassword,
      role: 'CUSTOMER',
      phone: '+44 20 7123 4567',
      status: 'ACTIVE',
    },
  });

  // 4. Create Partner Companies
  const company1 = await prisma.company.create({
    data: {
      name: 'Foxtons Estate Agents',
      branchName: 'Mayfair Branch',
      address: '92 Park Lane, Mayfair, London W1K 7TA',
      contactName: 'James Sinclair',
      contactEmail: 'mayfair@foxtons.co.uk',
      contactPhone: '+44 20 7973 2000',
      referralRate: 10.0,
      totalInstructions: 48,
      keyCollectionProtocol: 'Key tag FX-402 held at reception. Photo ID required upon collection.',
    },
  });

  // 5. Create Leads
  const lead1 = await prisma.lead.create({
    data: {
      reference: 'LEAD-2026-001',
      clientName: 'Emma Watson',
      clientEmail: 'emma.watson@example.com',
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

  // 6. Create Jobs
  const job1 = await prisma.job.create({
    data: {
      reference: 'JOB-2026-080',
      stage: 'BOOKED',
      serviceType: 'RICS Level 2 Home Survey',
      propertyAddress: '14 Mayfair Gate, Mayfair, London',
      postcode: 'W1K 2PB',
      clientName: 'Emma Watson',
      clientEmail: 'emma.watson@example.com',
      clientPhone: '+44 7911 123456',
      clientId: customer1.id,
      surveyorId: surveyor1.id,
      leadId: lead1.id,
      companyId: company1.id,
      inspectionDate: new Date('2026-11-04T10:00:00Z'),
      inspectionTime: '10:00 AM - 12:30 PM',
      keyCollectionDetails: 'Collect keys from Foxtons Mayfair under branch reference FX-402.',
      specialInstructions: 'Inspect reported damp spot behind dining room skirting board.',
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
          clientEmail: 'emma.watson@example.com',
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
          clientEmail: 'emma.watson@example.com',
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
            senderId: customer1.id,
            senderName: 'Emma Watson',
            role: 'customer',
            content:
              'Thank you Sarah! Please note that the keys are held at Foxtons Mayfair under branch reference FX-402, and there is a damp spot behind the dining room skirting that I would like David to inspect.',
            readByAdmin: true,
            readByCustomer: true,
          },
          {
            conversationId: 'conv-1',
            senderId: admin.id,
            senderName: 'Alexander Sterling (Admin)',
            role: 'admin',
            content:
              'Noted with thanks! David has added a specific damp meter check in the dining room to his inspection checklist.',
            readByAdmin: true,
            readByCustomer: true,
          },
        ],
      },
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('Credentials:');
  console.log(' - Admin:    alexander@njspropertygroup.com / password123');
  console.log(' - Surveyor: david.thorne@njspropertygroup.com / password123');
  console.log(' - Customer: emma.watson@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

