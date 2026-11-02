const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  const result = await prisma.user.updateMany({
    data: { password: hash },
  });
  console.log(`✅ Updated ${result.count} users password to Password123!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
