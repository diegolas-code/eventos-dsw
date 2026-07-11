# Plan de Implementación: Cambio de Contraseña Real en el Perfil 🛠️

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir la simulación (mock) de cambio de contraseña en el frontend por una funcionalidad real que valide la contraseña actual en el backend y persista el hash de la nueva contraseña en la base de datos PostgreSQL utilizando Prisma y bcryptjs.

**Architecture:**

1. **Backend Storage:** Implementar `cambiarClaveUsuario` en `backend/src/store.ts` para verificar la clave actual contra el hash actual (vía `comparePassword`) y guardar el nuevo hash (vía `hashPassword`).
2. **Backend API:** Crear una nueva ruta `POST /api/v1/usuarios/:id/cambiar-clave` protegida por `requireAuth` en `backend/src/routes/usuarios.ts` que valide el payload, compruebe que el usuario no intente modificar a otro usuario, y ejecute el cambio.
3. **Frontend Integration:** Actualizar `handlePasswordChange` en `web/src/Pages/ProfilePage/DashboardView.tsx` para llamar a este endpoint y procesar las respuestas de error/éxito de la API.

**Tech Stack:** Node.js, Express, Prisma, bcryptjs, TypeScript, React, React-Query, Axios

## Global Constraints

- Utilizar la instancia global de `api` de Axios para llamadas del frontend.
- Utilizar `comparePassword` y `hashPassword` de `backend/src/utils/auth.ts` para el manejo de credenciales.
- Retornar códigos de estado HTTP apropiados (`200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `500 Internal Error`).

---

### Task 1: Implementar Lógica de Base de Datos para Actualización de Contraseña

**Files:**

- Modify: `backend/src/store.ts`

**Interfaces:**

- Produces: `cambiarClaveUsuario(usuarioId: string, claveActual: string, nuevaClave: string): Promise<boolean>`

- [ ] **Step 1: Importar utilidades de autenticación**
      Abrir [store.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts) e importar `comparePassword` y `hashPassword` al principio del archivo:
      `typescript
  import { comparePassword, hashPassword } from './utils/auth.js';
  `

- [ ] **Step 2: Crear el método `cambiarClaveUsuario`**
      Agregar el método al final de la sección de usuarios o al final del archivo [store.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts):
      ```typescript
      export const cambiarClaveUsuario = async (
      usuarioId: string,
      claveActual: string,
      nuevaClave: string
      ): Promise<boolean> => {
      const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
      if (!usuario || !usuario.contrasena_hash) {
      return false;
      }

        const matches = await comparePassword(claveActual, usuario.contrasena_hash);
        if (!matches) {
          return false;
        }

        const nuevoHash = await hashPassword(nuevaClave);
        await prisma.usuario.update({
          where: { id: usuarioId },
          data: { contrasena_hash: nuevoHash },
        });

        return true;
      };
      ```

- [ ] **Step 3: Verificar compilación del backend**
      Ejecutar compilación en el servidor.
      Run: `npm run build` en el directorio `backend`
      Expected: Compilación exitosa sin errores de tipado TypeScript.

- [ ] **Step 4: Commitear cambios**
      `bash
  git add backend/src/store.ts
  git commit -m "feat(backend): add cambiarClaveUsuario storage logic in store.ts"
  `

---

### Task 2: Exponer Endpoint en el Router de Usuarios

**Files:**

- Modify: `backend/src/routes/usuarios.ts`

**Interfaces:**

- Consumes: `cambiarClaveUsuario` de `store.ts` y `requireAuth` de `auth.js` middleware
- Produces: Endpoint `POST /api/v1/usuarios/:id/cambiar-clave`

- [ ] **Step 1: Importar middlewares e imports requeridos**
      Abrir [usuarios.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/usuarios.ts) y añadir la importación de `requireAuth` y `cambiarClaveUsuario`:
      `typescript
  import { requireAuth } from '../middleware/auth.js';
  import { cambiarClaveUsuario } from '../store.js';
  `

- [ ] **Step 2: Implementar la ruta de cambio de contraseña**
      Añadir el controlador de la ruta `/:id/cambiar-clave` antes de la exportación final en [usuarios.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/usuarios.ts):
      ```typescript
      /\*_ POST /api/v1/usuarios/:id/cambiar-clave - Cambiar contraseña del usuario _/
      router.post('/:id/cambiar-clave', requireAuth, async (request: ExRequest, response: ExpressResponse) => {
      const { id } = request.params;
      const { claveActual, nuevaClave } = request.body ?? {};

        // Validar que el usuario autenticado sólo pueda cambiarse la clave a sí mismo
        const authUser = (request as any).user;
        if (authUser.id !== id) {
          response.status(403).json({ error: 'Prohibido. No podés cambiar la clave de otro usuario.' });
          return;
        }

        if (!claveActual || !nuevaClave) {
          response.status(400).json({ error: 'La clave actual y la nueva clave son obligatorias.' });
          return;
        }

        if (nuevaClave.length < 6) {
          response.status(400).json({ error: 'La nueva clave debe tener al menos 6 caracteres.' });
          return;
        }

        try {
          const exito = await cambiarClaveUsuario(id, claveActual, nuevaClave);
          if (!exito) {
            response.status(400).json({ error: 'La clave actual ingresada es incorrecta.' });
            return;
          }
          response.json({ message: 'Contraseña actualizada correctamente.' });
        } catch (error) {
          console.error('Error en endpoint cambiar-clave:', error);
          response.status(500).json({ error: 'Error interno del servidor al procesar la actualización.' });
        }
      });
      ```

- [ ] **Step 3: Verificar compilación completa de backend**
      Ejecutar compilación en el servidor.
      Run: `npm run build` en el directorio `backend`
      Expected: Compilación exitosa sin errores de tipado TypeScript.

- [ ] **Step 4: Commitear cambios**
      `bash
  git add backend/src/routes/usuarios.ts
  git commit -m "feat(backend): implement POST /api/v1/usuarios/:id/cambiar-clave endpoint"
  `

---

### Task 3: Integrar Petición en el Frontend

**Files:**

- Modify: `web/src/Pages/ProfilePage/DashboardView.tsx`

**Interfaces:**

- Consumes: Endpoint `POST /api/v1/usuarios/:id/cambiar-clave` vía Axios `api`

- [ ] **Step 1: Modificar `handlePasswordChange`**
      Abrir [DashboardView.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/DashboardView.tsx) y reemplazar la implementación de `handlePasswordChange` para realizar la petición real a la API:
      ```typescript
      const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      if (nuevaClave.length < 6) {
      setPasswordMsg({ tipo: 'error', texto: 'La nueva clave debe tener al menos 6 caracteres.' });
      return;
      }
      setPasswordLoading(true);
      setPasswordMsg(null);

        try {
          await api.post(`/usuarios/${usuarioData.id}/cambiar-clave`, {
            claveActual,
            nuevaClave,
          });
          setPasswordMsg({ tipo: 'ok', texto: 'Contraseña actualizada correctamente.' });
          setClaveActual('');
          setNuevaClave('');
        } catch (err: any) {
          console.error(err);
          const errorMsg = err.response?.data?.error || 'Ocurrió un error al intentar cambiar la clave.';
          setPasswordMsg({ tipo: 'error', texto: errorMsg });
        } finally {
          setPasswordLoading(false);
        }
      };
      ```

- [ ] **Step 2: Verificar compilación del frontend**
      Ejecutar build en el cliente.
      Run: `npm run build` en el directorio `web`
      Expected: Compilación exitosa sin errores de tipado TypeScript.

- [ ] **Step 3: Commitear cambios**
      `bash
  git add web/src/Pages/ProfilePage/DashboardView.tsx
  git commit -m "feat(frontend): integrate real API call for password change inside DashboardView"
  `

---

### Task 4: Actualizar TODO y Crear Historia de Cambio

**Files:**

- Modify: `TODO.md`
- Create: `.history/history_22.md`

- [ ] **Step 1: Actualizar TODO.md**
      Abrir [TODO.md](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/TODO.md) e incluir la corrección del cambio de clave real como hito completado de la Fase 3.
- [ ] **Step 2: Crear history_22.md**
      Crear [.history/history_22.md](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/.history/history_22.md) y documentar todo el proceso de esta nueva funcionalidad de cambio de clave.
- [ ] **Step 3: Commitear cambios**
      `bash
  git add TODO.md .history/history_22.md
  git commit -m "docs: add history_22.md and update TODO.md with password update functionality"
  `
