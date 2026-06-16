import assert from 'node:assert';
import { createApp } from '../app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTests() {
  console.log('Running auth tests...');
  const app = createApp();
  const server = app.listen(3333);

  try {
    // 1. Clean test user
    await prisma.usuario.deleteMany({ where: { email: 'testauth@example.com' } });

    // 2. Test Register
    const regRes = await fetch('http://localhost:3333/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testauth@example.com',
        password: 'password123',
        nombreMostrar: 'Test User',
      }),
    });

    assert.strictEqual(regRes.status, 201);
    const regData: any = await regRes.json();
    assert.ok(regData.data.token);
    assert.strictEqual(regData.data.user.email, 'testauth@example.com');

    // 3. Test Login
    const loginRes = await fetch('http://localhost:3333/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testauth@example.com',
        password: 'password123',
      }),
    });

    assert.strictEqual(loginRes.status, 200);
    const loginData: any = await loginRes.json();
    assert.ok(loginData.data.token);

    console.log('✅ Auth endpoints tests passed successfully!');
  } catch (err) {
    console.error('❌ Auth endpoints tests failed:', err);
    process.exit(1);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests();
