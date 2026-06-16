# Local JWT Auth Implementation Plan

> **For Gemini:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement full local JWT authentication and authorization by migrating the Prisma database schema, completing backend auth endpoints, adding Axios token interceptors, integrating login/register frontend views, and securing routing.

**Architecture:** Use a `contrasena_hash` field on the `Usuario` table. High-level routing in Express mounts the `/api/v1/auth` endpoints. Axios interceptors automatically append `Authorization: Bearer <token>` in the frontend. `ProtectedRoute` checks localStorage for active tokens.

**Tech Stack:** Express, Prisma (PostgreSQL), bcryptjs, jsonwebtoken, React (Vite), Axios.

---

### Task 1: Update Database Schema and Migrate

**Files:**

- Modify: `backend/prisma/schema.prisma`

**Step 1: Modify the schema file**
Add `contrasena_hash String` to the `Usuario` model.

```prisma
model Usuario {
  id                String            @id @default(uuid())
  email             String            @unique
  contrasena_hash   String
  nombre_mostrar    String
  rol               RolUsuario        @default(miembro)
  creado_en         DateTime          @default(now())
  actualizado_en    DateTime          @updatedAt

  // Relaciones
  eventos_creados   Evento[]          @relation("EventosCreados")
  comentarios       Comentario[]
  perfiles          PerfilEntidad[]

  @@index([rol])
}
```

**Step 2: Run migration**
Run: `npm run prisma:migrate -- --name add_contrasena_hash` inside `backend` folder.
Expected: Migration created and applied successfully.

**Step 3: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat(db): add contrasena_hash field to Usuario schema and migrate"
```

---

### Task 2: Mount Auth Router in Express app

**Files:**

- Modify: `backend/src/app.ts`

**Step 1: Add import and mount route**
Import `authRouter` and mount it under `/api/v1/auth`.

```typescript
import authRouter from './routes/auth.js';
// ...
app.use('/api/v1/auth', authRouter);
```

**Step 2: Verify build**
Run: `npm run typecheck` inside `backend` folder.
Expected: Successful build (still warnings about `as any` in routes/auth.ts).

**Step 3: Commit**

```bash
git add backend/src/app.ts
git commit -m "feat(backend): mount auth router in application"
```

---

### Task 3: Clean up backend auth routes and remove temporary castings

**Files:**

- Modify: `backend/src/routes/auth.ts`

**Step 1: Remove `as any` casting**
Change instances of `(prisma.usuario as any)` and `(usuario as any)` to use standard types since `contrasena_hash` is now in the generated client.
Line 50:

```typescript
const nuevoUsuario = await prisma.usuario.create({
  data: {
    email,
    contrasena_hash: hashedPassword,
    nombre_mostrar: nombreMostrar,
  },
});
```

Line 100:

```typescript
const contrasenaHash = usuario.contrasena_hash;
```

**Step 2: Run typecheck**
Run: `npm run typecheck` inside `backend` folder.
Expected: PASS (no typescript errors).

**Step 3: Commit**

```bash
git add backend/src/routes/auth.ts
git commit -m "refactor(backend): clean up type casting in auth routes"
```

---

### Task 4: Create automated Node.js test script for Auth Endpoints

**Files:**

- Create: `backend/src/scripts/test-auth.ts`

**Step 1: Write test script**
Create `test-auth.ts` to test signing up, logging in, and verifying the token.

```typescript
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
    const regData = await regRes.json();
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
    const loginData = await loginRes.json();
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
```

**Step 2: Run test script**
Run: `npx tsx src/scripts/test-auth.ts` in `backend` folder.
Expected: Prints `✅ Auth endpoints tests passed successfully!`

**Step 3: Commit**

```bash
git add backend/src/scripts/test-auth.ts
git commit -m "test(backend): add automated integration tests for register and login"
```

---

### Task 5: Configure Frontend Axios Interceptor

**Files:**

- Modify: `web/src/services/api.ts`

**Step 1: Add request interceptor**
Configure Axios to attach the authorization token from `localStorage` to all API requests if it exists.

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Step 2: Verify build**
Run: `npm run build` in `web` folder.
Expected: Build passes.

**Step 3: Commit**

```bash
git add web/src/services/api.ts
git commit -m "feat(frontend): configure axios interceptor to attach bearer token"
```

---

### Task 6: Connect Register and Login Views on Frontend

**Files:**

- Modify: `web/src/Pages/LoginPage/LoginPage.tsx` (or similar file)
- Modify: `web/src/Pages/RegisterPage/RegisterPage.tsx` (or similar file)
- Modify: `web/src/Pages/ProfilePage/ProfilePage.tsx` (or similar file)

_Note: Let's check files in `web/src/Pages` to locate actual Login/Register/Profile components._

**Step 2: Connect endpoints and handle session storage**
Replace mock sign-in logic with `register` / `login` from `authService.ts`. Save the user profile and the token to `localStorage` or session state upon success.

**Step 3: Verify build**
Run: `npm run build` in `web` folder.
Expected: Build passes.

**Step 4: Commit**

```bash
git add web/src/Pages/...
git commit -m "feat(frontend): integrate login, register, and profile pages with jwt auth service"
```

---

### Task 7: Secure Frontend ProtectedRoute using JWT

**Files:**

- Modify: `web/src/Pages/ProtectedRoute/ProtectedRoute.tsx` (or similar file)

**Step 1: Refactor ProtectedRoute**
Change the logic in `ProtectedRoute` to parse or verify the presence of the `token` in `localStorage` instead of looking for mock session.

**Step 2: Verify build**
Run: `npm run build` in `web` folder.
Expected: Build passes.

**Step 3: Commit**

```bash
git add web/src/Pages/...
git commit -m "feat(frontend): secure ProtectedRoute with local storage token check"
```
