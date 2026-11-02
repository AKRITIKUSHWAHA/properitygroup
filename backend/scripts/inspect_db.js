const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dbs = await prisma.$queryRawUnsafe('SHOW DATABASES;');
  console.log('DATABASES:', dbs);

  const currentDb = await prisma.$queryRawUnsafe('SELECT DATABASE() as current_db;');
  console.log('CURRENT DB:', currentDb);

  const tables = await prisma.$queryRawUnsafe('SHOW TABLES;');
  console.log('TABLES IN CURRENT DB:', tables);

  const usersCount = await prisma.users.count().catch(err => `Error: ${err.message}`);
  console.log('USERS COUNT:', usersCount);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

