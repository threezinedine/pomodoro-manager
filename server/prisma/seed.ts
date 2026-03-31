import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  await prisma.user.upsert({
    where: { id: SYSTEM_USER_ID },
    update: {},
    create: { id: SYSTEM_USER_ID },
  });

  console.log(`Seed complete. System user: ${SYSTEM_USER_ID}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
