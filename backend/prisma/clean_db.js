import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 [NJS Database Cleaner] Wiping test data for clean client testing...');

  // 1. Delete all operational data in safe foreign key order
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
  await prisma.notification.deleteMany();

  console.log('✅ Cleared: leads, jobs, quotes, invoices, terms, messages, notifications, reviews, logs');

  // 2. Retain ONLY 1 primary Admin account
  const keepEmails = [
    'njsadmin@gmail.com',
  ];

  await prisma.surveyorProfile.deleteMany({
    where: {
      user: {
        email: { notIn: keepEmails },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: { notIn: keepEmails },
    },
  });

  // Ensure standard password for all retained accounts
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);
  await prisma.user.updateMany({
    data: { password: passwordHash, status: 'ACTIVE' },
  });

  // Ensure surveyor profiles exist and active load is reset to 0
  const surveyors = await prisma.user.findMany({
    where: { role: 'SURVEYOR' },
    include: { surveyorProfile: true },
  });

  for (const s of surveyors) {
    if (!s.surveyorProfile) {
      await prisma.surveyorProfile.create({
        data: {
          userId: s.id,
          accreditation: 'MRICS',
          ricsNumber: 'RICS-089421',
          piiPolicyNumber: 'PII-UK-2026-88',
          piiExpiryDate: new Date('2027-12-31'),
          piiValidated: true,
          postcodesCovered: 'W, SW, WC, EC, NW',
          activeLoad: 0,
          maxLoad: 10,
          rating: 4.95,
          available: true,
        },
      });
    } else {
      await prisma.surveyorProfile.update({
        where: { id: s.surveyorProfile.id },
        data: { activeLoad: 0, available: true },
      });
    }
  }

  console.log('\n--- VERIFICATION OF CLEAN DATABASE ---');
  const tables = [
    'lead', 'job', 'quote', 'invoice', 'term', 'message',
    'notification', 'auditLog', 'supportTicket', 'customerReview'
  ];
  for (const t of tables) {
    const c = await prisma[t].count();
    console.log(t.padEnd(16), ':', c);
  }

  const remainingUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
  console.log('\nRetained Verified Portal Users:');
  console.table(remainingUsers);
}

cleanDatabase()
  .catch((e) => {
    console.error('Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
