const { PrismaClient } = require('../node_modules/@prisma/client');
const prisma = new PrismaClient();

async function clearDummyData() {
  console.log('--- Checking Current DB Counts ---');
  console.log('Users:', await prisma.user.count());
  console.log('SurveyorProfiles:', await prisma.surveyorProfile.count());
  console.log('Companies:', await prisma.company.count());
  console.log('Leads:', await prisma.lead.count());
  console.log('Jobs:', await prisma.job.count());
  console.log('Quotes:', await prisma.quote.count());
  console.log('Terms:', await prisma.term.count());
  console.log('Invoices:', await prisma.invoice.count());
  console.log('Messages:', await prisma.message.count());
  console.log('CallLogs:', await prisma.callLog.count());
  console.log('ComplaintLogs:', await prisma.complaintLog.count());
  console.log('CustomerReviews:', await prisma.customerReview.count());
  console.log('SupportTickets:', await prisma.supportTicket.count());
  console.log('AuditLogs:', await prisma.auditLog.count());

  console.log('\n--- Hard Deleting Dummy Records (Preserving Users) ---');
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
  await prisma.company.deleteMany();

  console.log('\n--- DB Counts After Hard Delete ---');
  console.log('Users (Preserved):', await prisma.user.count());
  console.log('SurveyorProfiles (Preserved):', await prisma.surveyorProfile.count());
  console.log('Companies:', await prisma.company.count());
  console.log('Leads:', await prisma.lead.count());
  console.log('Jobs:', await prisma.job.count());
  console.log('Quotes:', await prisma.quote.count());
  console.log('Terms:', await prisma.term.count());
  console.log('Invoices:', await prisma.invoice.count());
  console.log('Messages:', await prisma.message.count());
  console.log('CallLogs:', await prisma.callLog.count());
  console.log('ComplaintLogs:', await prisma.complaintLog.count());
  console.log('CustomerReviews:', await prisma.customerReview.count());
  console.log('SupportTickets:', await prisma.supportTicket.count());

  console.log('\nDB dummy data successfully wiped!');
  await prisma.$disconnect();
}

clearDummyData().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});

