const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.$queryRawUnsafe('SELECT id, name, email, role FROM users LIMIT 5;');
  console.log('USERS:', users);

  const jobs = await prisma.$queryRawUnsafe('SELECT COUNT(*) as job_count FROM jobs;');
  console.log('JOBS COUNT:', jobs);

  const companies = await prisma.$queryRawUnsafe('SELECT COUNT(*) as company_count FROM companies;');
  console.log('COMPANIES COUNT:', companies);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
