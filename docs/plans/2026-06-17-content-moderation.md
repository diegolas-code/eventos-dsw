# Content Moderation Implementation Plan

> **For Gemini:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a secure moderation flow where newly created events default to `PENDIENTE` state, are filtered out from the public cartelera, can be listed and audited by admins/moderators in a dedicated dashboard, and get approved or rejected with notes.

**Architecture:** Create an `AccionModeracion` model for audit trail. Apply role protection middleware on `/api/v1/moderacion` endpoints. Filter the public `/api/v1/eventos` route to show only `PUBLICADO` events. Build a secure `/moderacion` panel in the React client.

**Tech Stack:** Express, Prisma (PostgreSQL), React, Axios.

---

### Task 1: Create Moderation Audit Model in Database Schema

**Files:**

- Modify: `backend/prisma/schema.prisma`

**Step 1: Modify the schema file**
Add the `TipoAccionModeracion` enum and the `AccionModeracion` model, and reference it in the `Evento` and `Usuario` models.

```prisma
enum TipoAccionModeracion {
  APROBAR
  RECHAZAR
  ARCHIVAR
}

model AccionModeracion {
  id              String               @id @default(uuid())
  evento_id       String
  evento          Evento               @relation(fields: [evento_id], references: [id], onDelete: Cascade)
  moderador_id    String
  moderador       Usuario              @relation(fields: [moderador_id], references: [id], onDelete: Cascade)
  tipo_accion     TipoAccionModeracion
  nota            String?
  creado_en       DateTime             @default(now())

  @@index([evento_id])
  @@index([moderador_id])
}
```

Update model `Usuario`:

```prisma
model Usuario {
  // ...
  acciones_moderacion AccionModeracion[]
}
```

Update model `Evento`:

```prisma
model Evento {
  // ...
  acciones_moderacion AccionModeracion[]
}
```

**Step 2: Run migration**
Run: `npm run prisma:migrate -- --name add_moderation_model` in the `backend` folder.
Expected: Migration executes successfully using the direct connection.

**Step 3: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat(db): add AccionModeracion model and migrate"
```

---

### Task 2: Filter Public Event Listings by State

**Files:**

- Modify: `backend/src/store.ts`

**Step 1: Update event store queries**
Filter the `listEventos()` function to only return events where `estado` is `PUBLICADO`.

```typescript
export async function listEventos() {
  return prisma.evento.findMany({
    where: { estado: 'PUBLICADO' },
    orderBy: { inicia_en: 'asc' },
    include: {
      lugar: true,
      artistas: { include: { artista: true } },
    },
  });
}
```

**Step 2: Run typecheck**
Run: `npm run typecheck` in the `backend` folder.
Expected: Compile succeeds.

**Step 3: Commit**

```bash
git add backend/src/store.ts
git commit -m "feat(backend): filter public event listing by state"
```

---

### Task 3: Implement Backend Moderation Router

**Files:**

- Create: `backend/src/routes/moderacion.ts`
- Modify: `backend/src/app.ts`

**Step 1: Write Moderation routes**
Implement routes to fetch pending events and post moderation actions. Protect routes with `requireAuth` and `requireRole(['moderador', 'admin'])`.

```typescript
import { Router } from 'express';
import { PrismaClient, EstadoEvento, TipoAccionModeracion } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/moderacion/pendientes
router.get('/pendientes', requireAuth, requireRole(['moderador', 'admin']), async (req, res) => {
  try {
    const pendientes = await prisma.evento.findMany({
      where: { estado: 'PENDIENTE' },
      include: {
        lugar: true,
        artistas: { include: { artista: true } },
      },
    });
    res.json({ data: pendientes });
  } catch (err) {
    res.status(500).json({ error: 'Error al listar eventos pendientes' });
  }
});

// POST /api/v1/moderacion/acciones
router.post('/acciones', requireAuth, requireRole(['moderador', 'admin']), async (req, res) => {
  const { eventoId, accion, nota } = req.body ?? {};
  const user = (req as any).user;

  if (!eventoId || !accion) {
    res.status(400).json({ error: 'eventoId y accion son obligatorios.' });
    return;
  }

  const nuevoEstado: EstadoEvento =
    accion === 'APROBAR' ? 'PUBLICADO' : accion === 'RECHAZAR' ? 'RECHAZADO' : 'ARCHIVADO';

  const tipoAccion: TipoAccionModeracion =
    accion === 'APROBAR' ? 'APROBAR' : accion === 'RECHAZAR' ? 'RECHAZADO' : 'ARCHIVAR';

  try {
    await prisma.$transaction(async tx => {
      // 1. Update event state
      await tx.evento.update({
        where: { id: eventoId },
        data: { estado: nuevoEstado },
      });

      // 2. Record audit log
      await tx.accionModeracion.create({
        data: {
          evento_id: eventoId,
          moderador_id: user.id,
          tipo_accion: tipoAccion,
          nota,
        },
      });
    });

    res.json({ message: 'Moderación aplicada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la acción de moderación.' });
  }
});

export default router;
```

Mount it in `backend/src/app.ts`:

```typescript
import moderacionRouter from './routes/moderacion.js';
// ...
app.use('/api/v1/moderacion', moderacionRouter);
```

**Step 2: Verify typecheck**
Run: `npm run typecheck` inside `backend`.
Expected: Build passes.

**Step 3: Commit**

```bash
git add backend/src/routes/moderacion.ts backend/src/app.ts
git commit -m "feat(backend): implement and mount moderation router"
```

---

### Task 4: Add Integration Tests for Moderation Flow

**Files:**

- Modify: `backend/src/scripts/test-auth.ts` (or extend to test moderation)

**Step 1: Write test scenarios**
Add code to `test-auth.ts` to test:

1. Creating an event (should have state `PENDIENTE` by default).
2. Trying to fetch pending list as a standard user (should return 403 or 401).
3. Fetching pending list as an admin (should succeed).
4. Approving the event as an admin (should update state and create log).
5. Fetching public events list (approved event should now be visible).

**Step 2: Run tests**
Run: `npx tsx src/scripts/test-auth.ts`
Expected: Output contains `✅ Auth & Moderation endpoints tests passed successfully!`

**Step 3: Commit**

```bash
git add backend/src/scripts/test-auth.ts
git commit -m "test(backend): integrate moderation test scenarios"
```

---

### Task 5: Configure Frontend API and Route Guard for Moderation

**Files:**

- Create: `web/src/services/moderationService.ts`
- Modify: `web/src/routes/AppRoutes/AppRoutes.tsx`

**Step 1: Implement Moderation Service and Route Guard**
Create `moderationService.ts` to make calls to GET `/moderacion/pendientes` and POST `/moderacion/acciones`.
Add a `/moderacion` route to `AppRoutes.tsx`, protected by a check that verifies the user has the role `admin` or `moderador`.

**Step 2: Verify build**
Run: `npm run build` in `web`.
Expected: Build passes.

**Step 3: Commit**

```bash
git add web/src/services/moderationService.ts web/src/routes/AppRoutes/AppRoutes.tsx
git commit -m "feat(frontend): create moderation service and add router route"
```

---

### Task 6: Implement Moderation Dashboard UI

**Files:**

- Create: `web/src/Pages/ModerationPage/ModerationPage.tsx`

**Step 1: Create Dashboard UI**
Build a dashboard showing a list of pending events.
For each event, render details, images, and action buttons. Clicking "Rechazar" shows an input for a rejection note.

**Step 2: Verify build**
Run: `npm run build` in `web`.
Expected: Build passes.

**Step 3: Commit**

```bash
git add web/src/Pages/ModerationPage/ModerationPage.tsx
git commit -m "feat(frontend): implement moderation dashboard page"
```
