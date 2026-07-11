import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Timing Test ---');

  console.time('Database Connection & QueryRaw');
  try {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.timeEnd('Database Connection & QueryRaw');
    console.log('Result:', result);
  } catch (err) {
    console.error('Error in QueryRaw:', err);
  }

  console.time('Second QueryRaw (Cached Connection)');
  try {
    await prisma.$queryRaw`SELECT 2 as result`;
    console.timeEnd('Second QueryRaw (Cached Connection)');
  } catch (err) {
    console.error('Error in Second QueryRaw:', err);
  }

  console.time('Query event count');
  try {
    const count = await prisma.evento.count();
    console.timeEnd('Query event count');
    console.log('Events count:', count);
  } catch (err) {
    console.error('Error in Event count:', err);
  }

  await prisma.$disconnect();
}

main();
