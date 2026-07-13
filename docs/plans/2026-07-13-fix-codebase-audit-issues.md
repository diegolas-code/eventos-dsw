# Codebase Audit Issues Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all security vulnerabilities, performance blockers, configuration bugs, session redundancies, and functional gaps identified during the codebase audit.

**Architecture:**

1. Secure backend routes by injecting `requireAuth` and comparing resource author/creator IDs against the session token user ID.
2. Resolve performance issues by handling emails asynchronously and importing cron jobs.
3. Align frontend session management to read credentials directly from the decoded JWT token rather than legacy local storage keys.
4. Add missing DB models (`VotoEvento`, `Favorito`) and implement the event editing form on the dashboard.

**Tech Stack:** Node.js, Express, TypeScript, Prisma, PostgreSQL, React, Tailwind CSS, React Query.

## Global Constraints

- Target Node/Express for the backend, Vite/React/TypeScript/React Query for the frontend.
- Do not introduce breaking changes to existing models or interfaces.
- Keep commits atomic and test each task independently.

---

### Task 1: API Security & Authorization Fixes

**Files:**

- Modify: `backend/src/routes/usuarios.ts`
- Modify: `backend/src/routes/comentarios.ts`
- Modify: `backend/src/routes/eventos.ts`
- Modify: `backend/src/routes/perfiles.ts`

**Interfaces:**

- Consumes: `requireAuth`, `requireRole` from `backend/src/middleware/auth.ts`
- Produces: Protected endpoint mutations verifying ownership of resources.

- [ ] **Step 1: Write verification test for protected endpoints**
      Modify the integration tests to check that modifying a comment/event without a token returns a 401.
      Add this to `backend/src/scripts/test-auth.ts`:

  ```typescript
  // Test code to run in integration checks
  async function testUnauthorizedAccess() {
    const response = await fetch('http://localhost:3001/api/v1/eventos/some-id', {
      method: 'DELETE',
    });
    if (response.status !== 401) {
      throw new Error('Security check failed: DELETE /eventos/:id should require auth');
    }
    console.log('✅ Security verification test passed.');
  }
  ```

- [ ] **Step 2: Run verification test to confirm it fails**
      Run: `npx tsx backend/src/scripts/test-auth.ts`
      Expected: FAIL (returns 204/404 instead of 401 because endpoints are currently public).

- [ ] **Step 3: Secure the routes in backend code**

  Modify `backend/src/routes/usuarios.ts` to add authorization checks:

  ```typescript
  // Apply requireAuth to all sensitive operations
  router.get('/', requireAuth, requireRole([RolUsuario.admin]), async (_request: Req, response: ExpressResponse) => { ... });
  router.get('/:id', requireAuth, async (request: Req, response: ExpressResponse) => {
    const authUser = (request as any).user;
    if (authUser.id !== request.params.id && authUser.rol !== RolUsuario.admin && authUser.rol !== RolUsuario.moderador) {
      response.status(403).json({ error: 'Prohibido.' });
      return;
    }
    // ...
  });
  router.post('/', requireAuth, requireRole([RolUsuario.admin]), async (request: ReqPostUsuario, response: ExpressResponse) => { ... });
  router.patch('/:id', requireAuth, async (request: ReqPatchUsuario, response: ExpressResponse) => {
    const authUser = (request as any).user;
    if (authUser.id !== request.params.id && authUser.rol !== RolUsuario.admin) {
      response.status(403).json({ error: 'Prohibido.' });
      return;
    }
    // ...
  });
  router.delete('/:id', requireAuth, async (request: Req, response: ExpressResponse) => {
    const authUser = (request as any).user;
    if (authUser.id !== request.params.id && authUser.rol !== RolUsuario.admin) {
      response.status(403).json({ error: 'Prohibido.' });
      return;
    }
    // ...
  });
  ```

  Modify `backend/src/routes/comentarios.ts` to verify author ownership:

  ```typescript
  import { requireAuth } from '../middleware/auth.js';

  router.patch(
    '/:id',
    requireAuth,
    async (request: ReqPatchComentario, response: ExpressResponse) => {
      const { cuerpo } = request.body ?? {};
      const authUser = (request as any).user;

      const comentario = await getComentario(request.params.id);
      if (!comentario) {
        response.status(404).json({ error: 'Comentario no encontrado' });
        return;
      }
      if (comentario.usuarioId !== authUser.id) {
        response.status(403).json({ error: 'Prohibido. No eres el autor de este comentario.' });
        return;
      }

      const actualizado = await updateComentario(request.params.id, cuerpo);
      response.json({ data: actualizado });
    }
  );

  router.delete('/:id', requireAuth, async (request: Req, response: ExpressResponse) => {
    const authUser = (request as any).user;
    const comentario = await getComentario(request.params.id);
    if (!comentario) {
      response.status(404).json({ error: 'Comentario no encontrado' });
      return;
    }
    if (
      comentario.usuarioId !== authUser.id &&
      authUser.rol !== 'admin' &&
      authUser.rol !== 'moderador'
    ) {
      response.status(403).json({ error: 'Prohibido. No tienes permisos.' });
      return;
    }
    await deleteComentario(request.params.id);
    response.status(204).send();
  });
  ```

  Modify `backend/src/routes/eventos.ts` to protect event changes and comments:

  ```typescript
  router.patch('/:id', requireAuth, async (request: Req, response: ExpressResponse) => {
    const authUser = (request as any).user;
    const evento = await getEvento(request.params.id);
    if (!evento) {
      response.status(404).json({ error: 'Evento no encontrado' });
      return;
    }
    if (
      evento.creadoPorUsuarioId !== authUser.id &&
      authUser.rol !== 'admin' &&
      authUser.rol !== 'moderador'
    ) {
      response.status(403).json({ error: 'Prohibido. No tienes permisos.' });
      return;
    }
    const patch = await updateEvento(request.params.id, request.body ?? {});
    response.json({ data: patch });
  });

  router.delete('/:id', requireAuth, async (request: Req, response: ExpressResponse) => {
    const authUser = (request as any).user;
    const evento = await getEvento(request.params.id);
    if (!evento) {
      response.status(404).json({ error: 'Evento no encontrado' });
      return;
    }
    if (
      evento.creadoPorUsuarioId !== authUser.id &&
      authUser.rol !== 'admin' &&
      authUser.rol !== 'moderador'
    ) {
      response.status(403).json({ error: 'Prohibido. No tienes permisos.' });
      return;
    }
    await deleteEvento(request.params.id);
    response.status(204).send();
  });

  router.post(
    '/:id/comentarios',
    requireAuth,
    async (request: ReqCreateComentario, response: ExpressResponse) => {
      const { cuerpo, padreId } = request.body ?? {};
      const authUser = (request as any).user;

      if (typeof cuerpo !== 'string' || cuerpo.trim().length === 0) {
        response.status(400).json({ error: 'cuerpo es obligatorio' });
        return;
      }

      const comentario = await createComentario(request.params.id, {
        cuerpo,
        usuarioId: authUser.id,
        padreId: typeof padreId === 'string' ? padreId : undefined,
      });

      response.status(201).json({ data: comentario });
    }
  );
  ```

  Modify `backend/src/routes/perfiles.ts` to require authentication for profile creation:

  ```typescript
  router.post('/', requireAuth, async (request: ReqPostPerfil, response: ExpressResponse) => {
    const authUser = (request as any).user;
    const { nombre, tipo } = request.body ?? {};

    if (
      typeof nombre !== 'string' ||
      nombre.trim().length === 0 ||
      !['ARTISTA', 'LUGAR'].includes(tipo)
    ) {
      response.status(400).json({ error: 'nombre y tipo son obligatorios' });
      return;
    }
    const nuevoPerfil = await CreatePerfilEntidad({
      ...request.body,
      usuarioId: authUser.id,
    });
    response.status(201).json({ data: nuevoPerfil });
  });
  ```

- [ ] **Step 4: Run verification test to verify it passes**
      Run: `npx tsx backend/src/scripts/test-auth.ts`
      Expected: PASS

- [ ] **Step 5: Commit changes**
  ```bash
  git add backend/src/routes/usuarios.ts backend/src/routes/comentarios.ts backend/src/routes/eventos.ts backend/src/routes/perfiles.ts
  git commit -m "security: enforce authentication and ownership checks on api routes"
  ```

---

### Task 2: Performance, Mailer, & Build Configuration Fixes

**Files:**

- Modify: `backend/src/store.ts`
- Modify: `backend/src/app.ts`
- Modify: `web/src/services/api.ts`

**Interfaces:**

- Consumes: Nodemailer SMTP variables, Vite dev server port.
- Produces: Asynchronous (non-blocking) emails, active cron reminders, relative path requests to avoid CORS.

- [ ] **Step 1: Write a test for proxy paths**
      Verify that the api client is targeting relative paths.
      Edit `web/src/services/api.ts` to test that `/api/v1` is utilized.

- [ ] **Step 2: Run verification**
      Confirm compile succeeds with relative pathing.

- [ ] **Step 3: Modify code**

  In `backend/src/store.ts`, change `asistirEvento` to not await email transmission:

  ```typescript
  // Replace: await enviarMail({ ... });
  // With:
  enviarMail({
    to: usuario.email,
    subject: `Confirmaste tu asistencia a ${evento.titulo}`,
    html: asistenciaTemplate({
      titulo: evento.titulo,
      imagenUrl: evento.imagen_url ?? undefined,
      iniciaEn: evento.inicia_en,
      lugar: evento.lugar_manual ?? undefined,
      linkEntradas: evento.link_entradas ?? undefined,
    }),
  }).catch(err => console.error('Failed to send attendance email asynchronously:', err));
  ```

  In `backend/src/app.ts`, import the reminders job:

  ```typescript
  // Line 12: Add import
  import './jobs/eventReminder.js';
  ```

  In `web/src/services/api.ts`, change `baseURL`:

  ```typescript
  // Replace: baseURL: 'http://localhost:3001/api/v1',
  // With:
  const api = axios.create({
    baseURL: '/api/v1',
  });
  ```

- [ ] **Step 4: Verify tests pass**
      Run: `npm run lint` and `npm run typecheck`
      Expected: PASS

- [ ] **Step 5: Commit changes**
  ```bash
  git add backend/src/store.ts backend/src/app.ts web/src/services/api.ts
  git commit -m "fix: make email asynchronous, register cron reminders, and fix vite proxy baseURL"
  ```

---

### Task 3: Session Management & Cleanup

**Files:**

- Modify: `web/src/Pages/ProfilePage/ProfilePage.tsx`
- Modify: `web/src/Pages/ProfilePage/ManagePerfilPage.tsx`
- Modify: `web/src/Components/events/CommentsSection.tsx`
- Modify: `web/src/Pages/CreateEventPage/CreateEventPage.tsx`

**Interfaces:**

- Consumes: Valid session data props.
- Produces: Decoupled JWT-driven session checking, removing legacy mock states.

- [ ] **Step 1: Test interface compile check**
      Run typecheck on frontend before code updates.

- [ ] **Step 2: Verify results**
      Expected: PASS

- [ ] **Step 3: Refactor session checking**

  In `web/src/Pages/ProfilePage/ProfilePage.tsx`:
  Remove `const usuarioMock = { ... };` and clean up commented lines.

  In `web/src/Pages/ProfilePage/ManagePerfilPage.tsx`:
  Add `usuarioId` as a prop and use it.

  ```typescript
  interface ManagePerfilPageProps {
    usuarioId: string;
    perfilInicial?: any;
    onBack: () => void;
  }
  export default function ManagePerfilPage({
    usuarioId,
    perfilInicial,
    onBack,
  }: ManagePerfilPageProps) {
    // Replace: const usuarioId = localStorage.getItem('demo_session_id') || undefined;
    // ...
  }
  ```

  In `web/src/Components/events/CommentsSection.tsx`:
  Read `currentUserId` by decoding the JWT token (or parse from local storage 'token' if stored as part of login payloads, or pass down from parent `EventPage`). Let's pass the user info as a prop or read from localStorage 'token' payload.

  ```typescript
  // Helper to parse JWT payload
  const getUserIdFromToken = (): string | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.id;
    } catch {
      return null;
    }
  };
  const currentUserId = getUserIdFromToken();
  const isUserLoggedIn = !!currentUserId;
  ```

  In `web/src/Pages/CreateEventPage/CreateEventPage.tsx`:
  Remove commented-out code for `entidadLugarId`.

- [ ] **Step 4: Verify frontend typechecks**
      Run: `npx tsc -p web/tsconfig.json --noEmit`
      Expected: PASS

- [ ] **Step 5: Commit changes**
  ```bash
  git add web/src/Pages/ProfilePage/ProfilePage.tsx web/src/Pages/ProfilePage/ManagePerfilPage.tsx web/src/Components/events/CommentsSection.tsx web/src/Pages/CreateEventPage/CreateEventPage.tsx
  git commit -m "refactor: remove legacy session localStorage references and clean up dead code"
  ```

---

### Task 4: Implement Event Editing on Dashboard

**Files:**

- Modify: `web/src/Pages/ProfilePage/DashboardView.tsx`
- Create: `web/src/Pages/ProfilePage/EditEventModal.tsx`

**Interfaces:**

- Consumes: `PATCH /api/v1/eventos/:id` API call.
- Produces: Populated modal editing form submitting changes to the database.

- [ ] **Step 1: Create failing modal compile test**
      Reference the modal inside `DashboardView.tsx` and run typecheck.

- [ ] **Step 2: Run verification**
      Expected: FAIL (Modal file not found).

- [ ] **Step 3: Implement `EditEventModal.tsx` and integrate it**
      Create `web/src/Pages/ProfilePage/EditEventModal.tsx`:

  ```typescript
  import { useState } from 'react';
  import { useMutation, useQueryClient } from '@tanstack/react-query';
  import api from '../../services/api';

  interface EditEventModalProps {
    evento: any;
    onClose: () => void;
    usuarioId: string;
  }

  export default function EditEventModal({ evento, onClose, usuarioId }: EditEventModalProps) {
    const queryClient = useQueryClient();
    const [titulo, setTitulo] = useState(evento.titulo);
    const [descripcion, setDescripcion] = useState(evento.descripcion || '');

    const mutation = useMutation({
      mutationFn: async (data: any) => {
        await api.patch(`/eventos/${evento.id}`, data);
      },
      onSuccess: () => {
        alert('Evento editado con éxito.');
        queryClient.invalidateQueries({ queryKey: ['dashboard-eventos', usuarioId] });
        onClose();
      },
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      mutation.mutate({ titulo, descripcion });
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4">
          <h3 className="font-bold text-lg">Editar Evento</h3>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} required className="w-full border p-2 rounded-xl" />
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full border p-2 rounded-xl" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="border p-2 rounded-xl">Cancelar</button>
            <button type="submit" className="bg-violet-600 text-white p-2 rounded-xl">Guardar</button>
          </div>
        </form>
      </div>
    );
  }
  ```

  Integrate in `web/src/Pages/ProfilePage/DashboardView.tsx`:

  ```typescript
  // Import EditEventModal
  import EditEventModal from './EditEventModal';
  // ...
  const [editingEvento, setEditingEvento] = useState<any | null>(null);
  // ...
  // Replace: onClick={() => alert(`Redireccionar a edición de evento ${evento.id}`)}
  // With:
  onClick={() => setEditingEvento(evento)}
  // ...
  // Render modal conditionally at the bottom of the JSX:
  {editingEvento && (
    <EditEventModal
      evento={editingEvento}
      onClose={() => setEditingEvento(null)}
      usuarioId={usuarioData.id}
    />
  )}
  ```

- [ ] **Step 4: Run frontend typecheck**
      Run: `npx tsc -p web/tsconfig.json --noEmit`
      Expected: PASS

- [ ] **Step 5: Commit changes**
  ```bash
  git add web/src/Pages/ProfilePage/DashboardView.tsx web/src/Pages/ProfilePage/EditEventModal.tsx
  git commit -m "feat: implement event editing modal on the dashboard"
  ```

---

### Task 5: Schema Update, Votes & Favorites backend structures

**Files:**

- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/src/store.ts`

**Interfaces:**

- Consumes: Prisma Client queries.
- Produces: `VotoEvento` and `Favorito` models, plus automatic duplicate checks in `createEvento`.

- [ ] **Step 1: Write a Prisma query check**
      Write a query inside a test script to fetch votes and check it throws compilation error.

- [ ] **Step 2: Run verification**
      Expected: FAIL (models do not exist).

- [ ] **Step 3: Update Database Schema & Store logic**

  In `backend/prisma/schema.prisma`, add:

  ```prisma
  model VotoEvento {
    usuario_id String
    evento_id  String
    creado_en  DateTime @default(now())

    usuario    Usuario @relation(fields: [usuario_id], references: [id], onDelete: Cascade)
    evento     Evento  @relation(fields: [evento_id], references: [id], onDelete: Cascade)

    @@id([usuario_id, evento_id])
  }

  model Favorito {
    usuario_id String
    evento_id  String
    creado_en  DateTime @default(now())

    usuario    Usuario @relation(fields: [usuario_id], references: [id], onDelete: Cascade)
    evento     Evento  @relation(fields: [evento_id], references: [id], onDelete: Cascade)

    @@id([usuario_id, evento_id])
  }
  ```

  Add the relation fields `votos VotoEvento[]` and `favoritos Favorito[]` to the `Usuario` and `Evento` models.

  Run schema migration:

  ```bash
  npx prisma migrate dev --name add_votes_and_favorites
  ```

  In `backend/src/store.ts`, implement duplicate checks inside `createEvento`:

  ```typescript
  // Check for duplicate events before creating the new one
  const startsAt = new Date(input.iniciaEn);
  const startOfDay = new Date(startsAt.getFullYear(), startsAt.getMonth(), startsAt.getDate());
  const endOfDay = new Date(
    startsAt.getFullYear(),
    startsAt.getMonth(),
    startsAt.getDate(),
    23,
    59,
    59
  );

  const duplicateCandidates = await prisma.evento.findFirst({
    where: {
      inicia_en: {
        gte: startOfDay,
        lte: endOfDay,
      },
      OR: [
        { entidad_lugar_id: input.entidadLugarId ?? undefined },
        { lugar_manual: input.lugar ?? undefined },
      ],
      artistas: input.artistasIds?.length
        ? {
            some: {
              artista_id: {
                in: input.artistasIds,
              },
            },
          }
        : undefined,
    },
  });

  const posibleDuplicado = !!duplicateCandidates;
  ```

  Pass `posible_duplicado: posibleDuplicado` inside the `prisma.evento.create` data mapping block.

- [ ] **Step 4: Verify compile & Prisma generation**
      Run: `npm run build`
      Expected: PASS

- [ ] **Step 5: Commit changes**
  ```bash
  git add backend/prisma/schema.prisma backend/src/store.ts
  git commit -m "db: add votes and favorites models to prisma schema and implement duplicate checking during event creation"
  ```
