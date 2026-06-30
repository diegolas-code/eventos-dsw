# Victor and Meli Branch Integration Plan

> **For Gemini:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge `origin/victor-part` and `origin/feature/dashboard-y-perfil` into the active branch `merge-victor-meli` and fix all integration issues, compile errors, and runtime bugs.

**Architecture:** We will merge both remote branches sequentially. We will resolve all merge conflicts manually, convert Meli's new components to use the default export of `api`, implement entity event filtering on the backend, update frontend queries to target existing/updated endpoints, and fix the entity profile creation form to capture and send the required `tipo` and `usuarioId` values.

**Tech Stack:** React, Vite, Axios, Prisma, Node.js, Express, React Query

---

### Task 1: Merge Victor's Branch

**Files:**

- Modify: Git Branch Integration (no specific code files)

**Step 1: Merge Victor's remote branch**
Run: `git merge remotes/origin/victor-part --no-commit --no-ff`
Expected: Merges Victor's changes or prompts for conflicts. If conflicts arise, resolve them and commit.

**Step 2: Commit Victor's merge**
Run: `git commit -m "merge: merge Victor's branch containing attendance logic"`

---

### Task 2: Merge Meli's Branch

**Files:**

- Modify: Git Branch Integration (no specific code files)

**Step 1: Merge Meli's remote branch**
Run: `git merge remotes/origin/feature/dashboard-y-perfil --no-commit --no-ff`
Expected: Conflicted files will need manual resolution.

**Step 2: Resolve merge conflicts**
Review and edit the conflicted files (specifically in `web/src/Pages/ProfilePage/ProfilePage.tsx` and others). Make sure to keep both Meli's dashboard views and Victor's default export changes in `LoginForm.tsx` or similar files.

**Step 3: Commit Meli's merge**
Run: `git commit -m "merge: merge Meli's branch containing profile dashboard views"`

---

### Task 3: Fix Import Mismatch of Axios API

**Files:**

- Modify: `web/src/Pages/ProfilePage/ProfilePage.tsx`
- Modify: `web/src/Pages/ProfilePage/ProfileView.tsx`
- Modify: `web/src/Pages/ProfilePage/DashboardView.tsx`
- Modify: `web/src/Pages/ProfilePage/ManagePerfilPage.tsx`

**Step 1: Update Named Imports to Default Imports**
In the above files, replace:

```typescript
import { api } from '../../services/api';
```

with:

```typescript
import api from '../../services/api';
```

**Step 2: Verify compile status**
Run type-checks on the frontend:
Run: `npm run --prefix web typecheck` (or build if no typecheck script exists)
Expected: Compile success (except for missing routes/params which we will fix next).

---

### Task 4: Implement Backend Filtering for Entity Events

**Files:**

- Modify: `backend/src/store.ts`
- Modify: `backend/src/routes/eventos.ts`

**Step 1: Update `listEventos` to accept `entidadId`**
In `backend/src/store.ts`, update `listEventos`:

```typescript
export const listEventos = async (usuarioId?: string, entidadId?: string): Promise<Evento[]> => {
  const data = await prisma.evento.findMany({
    where: {
      estado: 'PUBLICADO',
      ...(entidadId ? { entidadLugarId: entidadId } : {}),
    },
    include: {
      artistas: {
        include: { artista: true },
      },
      imagenes: true,
      asistentes: usuarioId
        ? {
            where: {
              usuario_id: usuarioId,
            },
            select: {
              usuario_id: true,
            },
          }
        : false,
    },
    orderBy: { inicia_en: 'asc' },
  });

  return data.map(e => ({
    ...mapEvento(e),
    isAsistiendo: usuarioId ? e.asistentes.length > 0 : false,
  }));
};
```

**Step 2: Update `GET /api/v1/eventos` Route**
In `backend/src/routes/eventos.ts`, update the route:

```typescript
router.get('/', requireAuth, async (request: any, response: ExpressResponse) => {
  const usuarioId = request.user!.id;
  const entidadId = request.query.entidadId as string | undefined;

  const eventos = await listEventos(usuarioId, entidadId);

  response.json({ data: eventos });
});
```

**Step 3: Update `CreatePerfilEntidad` in `store.ts` to set `reclamado`**
In `backend/src/store.ts`, update `CreatePerfilEntidad` to set `reclamado: !!input.usuarioId`:

```typescript
export const CreatePerfilEntidad = async (
  input: CreatePerfilEntidadInput
): Promise<PerfilEntidad> => {
  const data = await prisma.perfilEntidad.create({
    data: {
      usuario_id: input.usuarioId ?? null,
      nombre: input.nombre,
      tipo: input.tipo,
      descripcion: input.descripcion ?? null,
      direccion: input.direccion ?? null,
      gmaps_url: input.gmapsUrl ?? null,
      imagen_url: input.imagenUrl ?? null,
      reclamado: !!input.usuarioId,
    },
  });
  return mapPerfilEntidad(data);
};
```

---

### Task 5: Align Frontend Queries in Dashboard

**Files:**

- Modify: `web/src/Pages/ProfilePage/DashboardView.tsx`

**Step 1: Replace non-existent endpoints**
In `web/src/Pages/ProfilePage/DashboardView.tsx`, update the query function to use the correct endpoints:

```typescript
const {
  data: eventos,
  isLoading,
  error,
} = useQuery({
  queryKey: ['dashboard-eventos', usuarioData?.id],
  queryFn: async () => {
    if (esEntidad) {
      // Es artista/lugar: traer eventos creados por esta entidad
      const response = await api.get('/eventos', {
        params: { entidadId: perfilId },
      });
      return response.data.data;
    } else {
      // Si es usuario común, traer eventos a los que asistirá
      const response = await api.get('/asistencias/mis-eventos');
      return response.data;
    }
  },
  enabled: !!usuarioData?.id,
});
```

---

### Task 6: Add Entity Type Selector to Profile Form

**Files:**

- Modify: `web/src/Pages/ProfilePage/ManagePerfilPage.tsx`

**Step 1: Add `tipo` state and select dropdown**
In `web/src/Pages/ProfilePage/ManagePerfilPage.tsx`:

1. Add `tipo` state:
   ```typescript
   const [tipo, setTipo] = useState<'ARTISTA' | 'LUGAR'>(perfilInicial?.tipo ?? 'ARTISTA');
   ```
2. Retrieve the logged-in `usuarioId` from `localStorage`:
   ```typescript
   const usuarioId = localStorage.getItem('demo_session_id') || undefined;
   ```
3. Update `mutationFn` to pass `usuarioId` and `tipo` when creating:
   ```typescript
       mutationFn: (data: any) => {
         if (perfilInicial?.id) {
           return updatePerfilEntidad(perfilInicial?.id, data);
         } else {
           return createPerfilEntidad({
             usuarioId,
             nombre: data.nombre,
             tipo: data.tipo,
             descripcion: data.descripcion,
             direccion: data.direccion,
             gmapsUrl: data.gmapsUrl,
             imagenUrl: data.imagenUrl,
           });
         }
       },
   ```
4. Update `handleSubmit` to pass `tipo` to `mutation.mutate`:
   ```typescript
   mutation.mutate({
     nombre,
     tipo,
     descripcion,
     direccion,
     gmapsUrl,
     imagenUrl,
   });
   ```
5. Add the HTML select element for `tipo` if `!perfilInicial` (creating mode):
   ```tsx
   {
     !perfilInicial && (
       <div>
         <label className="block text-sm font-semibold text-zinc-700 mb-1">Tipo de Entidad *</label>
         <select
           value={tipo}
           onChange={e => setTipo(e.target.value as 'ARTISTA' | 'LUGAR')}
           className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-zinc-900"
           required
         >
           <option value="ARTISTA">Artista / Banda</option>
           <option value="LUGAR">Lugar / Espacio</option>
         </select>
       </div>
     );
   }
   ```

---

### Task 7: Verify Build and Integration

**Files:**

- Test: Build and compiler checks

**Step 1: Verify Backend compiles**
Run: `npm run --prefix backend build`
Expected: Compile success.

**Step 2: Verify Frontend compiles**
Run: `npm run --prefix web build`
Expected: Compile success.
