import assert from 'node:assert';
import { createApp } from '../app.js';
import { PrismaClient, EstadoEvento, TipoAccionModeracion } from '@prisma/client';

const prisma = new PrismaClient();

async function runTests() {
  console.log('Running auth and moderation tests...');
  const app = createApp();
  const server: any = app.listen(3333);

  try {
    // 0. Clean test data
    await prisma.evento.deleteMany({
      where: {
        titulo: { in: ['Test Moderation Event Approved', 'Test Moderation Event Rejected'] },
      },
    });
    await prisma.usuario.deleteMany({
      where: {
        email: { in: ['testauth@example.com', 'testmod@example.com'] },
      },
    });

    // 1. Test Register Miembro
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
    const miembroToken = regData.data.token;
    assert.strictEqual(regData.data.user.email, 'testauth@example.com');

    // 2. Test Login Miembro
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

    // 3. Register Moderator & Elevate Role in DB
    const regModRes = await fetch('http://localhost:3333/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testmod@example.com',
        password: 'password123',
        nombreMostrar: 'Test Moderator',
      }),
    });
    assert.strictEqual(regModRes.status, 201);
    const regModData: any = await regModRes.json();
    const modUserId = regModData.data.user.id;

    // Elevate role directly in DB
    await prisma.usuario.update({
      where: { id: modUserId },
      data: { rol: 'moderador' },
    });

    // Login as Moderator to get JWT with new role
    const loginModRes = await fetch('http://localhost:3333/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testmod@example.com',
        password: 'password123',
      }),
    });
    assert.strictEqual(loginModRes.status, 200);
    const loginModData: any = await loginModRes.json();
    const modToken = loginModData.data.token;

    console.log('✅ Moderator registered and authenticated.');

    // 4. Create a PENDIENTE event
    const createEventRes = await fetch('http://localhost:3333/api/v1/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: 'Test Moderation Event Approved',
        iniciaEn: new Date(Date.now() + 86400000).toISOString(), // mañana
        descripcion: 'Un evento para probar aprobación de moderación',
        creadoPorUsuarioId: regData.data.user.id,
      }),
    });
    assert.strictEqual(createEventRes.status, 201);
    const createEventData: any = await createEventRes.json();
    const approvedEventoId = createEventData.data.id;
    assert.strictEqual(createEventData.data.estado, 'PENDIENTE');

    console.log('✅ Event created with default state: PENDIENTE.');

    // 5. Verify PENDIENTE event is hidden from public API
    const publicListRes = await fetch('http://localhost:3333/api/v1/eventos');
    assert.strictEqual(publicListRes.status, 200);
    const publicListData: any = await publicListRes.json();
    const isFoundPublicly = publicListData.data.some((ev: any) => ev.id === approvedEventoId);
    assert.strictEqual(isFoundPublicly, false, 'Pending event should not be in public list');

    console.log('✅ Verified pending event is hidden from public cartelera.');

    // 6. Test access restriction for non-privileged roles (miembro)
    const listPendientesForbiddenRes = await fetch(
      'http://localhost:3333/api/v1/moderacion/pendientes',
      {
        headers: { Authorization: `Bearer ${miembroToken}` },
      }
    );
    assert.strictEqual(
      listPendientesForbiddenRes.status,
      403,
      'Miembro should be forbidden from listing pending'
    );

    const actionForbiddenRes = await fetch('http://localhost:3333/api/v1/moderacion/acciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${miembroToken}`,
      },
      body: JSON.stringify({
        eventoId: approvedEventoId,
        accion: 'APROBAR',
      }),
    });
    assert.strictEqual(
      actionForbiddenRes.status,
      403,
      'Miembro should be forbidden from moderating events'
    );

    console.log('✅ Verified access restrictions (403 Forbidden) for non-privileged roles.');

    // 7. Test moderation list visibility for moderators
    const listPendientesRes = await fetch('http://localhost:3333/api/v1/moderacion/pendientes', {
      headers: { Authorization: `Bearer ${modToken}` },
    });
    assert.strictEqual(listPendientesRes.status, 200);
    const listPendientesData: any = await listPendientesRes.json();
    const isFoundInPendientes = listPendientesData.data.some(
      (ev: any) => ev.id === approvedEventoId
    );
    assert.strictEqual(isFoundInPendientes, true, 'Pending event should be in moderation list');

    console.log('✅ Verified moderator can see pending events.');

    // 8. Approve event and check DB state & audit trail
    const approveActionRes = await fetch('http://localhost:3333/api/v1/moderacion/acciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${modToken}`,
      },
      body: JSON.stringify({
        eventoId: approvedEventoId,
        accion: 'APROBAR',
        nota: 'Se ve excelente, aprobado.',
      }),
    });
    assert.strictEqual(approveActionRes.status, 200);

    // Verify DB state of event
    const eventInDb = await prisma.evento.findUnique({
      where: { id: approvedEventoId },
    });
    assert.strictEqual(eventInDb?.estado, EstadoEvento.PUBLICADO);

    // Verify audit log
    const auditLogs = await prisma.accionModeracion.findMany({
      where: { evento_id: approvedEventoId },
    });
    assert.strictEqual(auditLogs.length, 1);
    assert.strictEqual(auditLogs[0].tipo_accion, TipoAccionModeracion.APROBAR);
    assert.strictEqual(auditLogs[0].moderador_id, modUserId);
    assert.strictEqual(auditLogs[0].nota, 'Se ve excelente, aprobado.');

    console.log(
      '✅ Event successfully approved. Audit log created and state changed to PUBLICADO.'
    );

    // 9. Verify event is now visible on public listing
    const publicListAfterRes = await fetch('http://localhost:3333/api/v1/eventos');
    assert.strictEqual(publicListAfterRes.status, 200);
    const publicListAfterData: any = await publicListAfterRes.json();
    const isFoundPubliclyAfter = publicListAfterData.data.some(
      (ev: any) => ev.id === approvedEventoId
    );
    assert.strictEqual(isFoundPubliclyAfter, true, 'Approved event should be in public list');

    console.log('✅ Verified approved event is now visible on public cartelera.');

    // 10. Test Rejection flow
    const createEventRejectRes = await fetch('http://localhost:3333/api/v1/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: 'Test Moderation Event Rejected',
        iniciaEn: new Date(Date.now() + 86400000).toISOString(),
        descripcion: 'Un evento para probar rechazo de moderación',
        creadoPorUsuarioId: regData.data.user.id,
      }),
    });
    assert.strictEqual(createEventRejectRes.status, 201);
    const createEventRejectData: any = await createEventRejectRes.json();
    const rejectedEventoId = createEventRejectData.data.id;

    const rejectActionRes = await fetch('http://localhost:3333/api/v1/moderacion/acciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${modToken}`,
      },
      body: JSON.stringify({
        eventoId: rejectedEventoId,
        accion: 'RECHAZAR',
        nota: 'Falta información o incumple normas.',
      }),
    });
    assert.strictEqual(rejectActionRes.status, 200);

    const rejectedEventInDb = await prisma.evento.findUnique({
      where: { id: rejectedEventoId },
    });
    assert.strictEqual(rejectedEventInDb?.estado, EstadoEvento.RECHAZADO);

    const rejectAuditLogs = await prisma.accionModeracion.findMany({
      where: { evento_id: rejectedEventoId },
    });
    assert.strictEqual(rejectAuditLogs.length, 1);
    assert.strictEqual(rejectAuditLogs[0].tipo_accion, TipoAccionModeracion.RECHAZAR);

    console.log(
      '✅ Event successfully rejected. Audit log created and state changed to RECHAZADO.'
    );

    console.log('✅ All auth and moderation integration tests passed successfully!');
  } catch (err) {
    console.error('❌ Integration tests failed:', err);
    process.exit(1);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests();
