const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVendor() {
  const id = 'a19e0c54-7af4-45d8-aa61-a3b2f050951b';
  const vendor = await prisma.user.findUnique({
    where: { id },
    include: { stylists: true }
  });
  console.log('Vendor:', JSON.stringify(vendor, null, 2));
  process.exit(0);
}

checkVendor().catch(err => {
  console.error(err);
  process.exit(1);
});
