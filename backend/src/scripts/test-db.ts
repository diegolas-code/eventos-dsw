import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Connecting to database...');
  try {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('✅ Connection successful. Query result:', result);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
