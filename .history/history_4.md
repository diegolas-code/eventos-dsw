## History 004 — Phase 0: scaffold, typing fixes, and editor stability

Date: 2026-05-17

Resumen breve

- Scaffold inicial Phase 0: API backend (Express + TypeScript) y frontend mínimo (Vite + React + TypeScript).
- Se fijó Prisma a la versión 6 (prisma & @prisma/client ^6.16.2) para conservar compatibilidad con el schema actual.
- Backend: app factory, rutas CRUD públicas para EVENTO y COMENTARIO, store en memoria con datos semilla para desarrollo.
- DTOs: añadidos tipos estrictos para requests (CreateEventoInput, CreateComentarioInput, PatchComentarioInput) y se tiparon handlers usando genéricos de express para eliminar implicit any.
- Root endpoint `/` devuelve JSON con endpoints y estado útil para desarrolladores.
- Frontend: scaffold Vite + React + TypeScript; proxy de `/api` a `http://localhost:3001` en `vite.config.ts`.
- Editor/TS fixes: añadida `web/src/env.d.ts` con declaraciones para imports de CSS y se incluyó explícitamente en `web/tsconfig.json` (`files: ["src/env.d.ts"]`) para estabilizar el TypeScript Server.
- ESLint / tooling: se configuraron reglas separadas para backend (`.eslintrc.cjs`) y frontend (`.eslintrc.web.cjs`), se añadieron plugins necesarios (react, hooks, @typescript-eslint). Prettier, Husky y lint-staged configurados.

Por qué se hizo

- Evitar errores de tipado en TypeScript y asegurar que el editor reconozca ambient types (CSS imports).
- Mantener compatibilidad con Prisma v6 y evitar roturas por cambios de parser en v7.
- Proveer un entorno de desarrollo rápido y reproducible para Phase 0 (sin DB obligatoria).

Cambios notables por archivo (resumen)

- backend/src/app.ts: app factory, raíz JSON, middleware y 404 handler.
- backend/src/index.ts: arranque del servidor en puerto 3001.
- backend/src/store.ts: store en memoria y seedDemoData().
- backend/src/routes/eventos.ts: CRUD para eventos (list, create, get, update, delete) y subruta de comentarios.
- backend/src/routes/comentarios.ts: patch/delete para comentarios.
- backend/src/dtos.ts: definiciones de tipos para request bodies.
- prisma/schema.prisma: datasource con env("DATABASE_URL") (Prisma v6 compatible).
- web/: scaffold Vite + React + TypeScript (src/main.tsx, src/App.tsx, styles.css, vite.config.ts, package.json, tsconfig.json).
- web/src/env.d.ts: declaraciones para `*.css` y assets.
- web/tsconfig.json: añadido `files: ["src/env.d.ts"]` para forzar inclusión de ambient types.
- .eslintrc.cjs / .eslintrc.web.cjs: configuraciones separadas para evitar conflictos entre proyectos.

Cómo verificar localmente

1. Backend: instalar dependencias y (opcional) generar Prisma client:
   - `npm install --prefix backend`
   - `npm run prisma:generate --prefix backend`
   - `npm run dev --prefix backend` (arranca en :3001)
2. Frontend: instalar y arrancar:
   - `npm install --prefix web`
   - `npm run dev --prefix web` (Vite en :5173 por defecto, proxya `/api` a backend)
3. Ver endpoints:
   - `curl http://localhost:3001/` → JSON con endpoints y estado.
   - `curl http://localhost:3001/api/v1/eventos` → lista de eventos seed.
4. En VS Code: seleccionar "Use Workspace Version" para TypeScript y reiniciar TS Server si aparecen errores (Ctrl/Cmd+Shift+P → "TypeScript: Restart TS Server").

Notas y riesgos conocidos

- Queda por instalar dependencias en `backend/` y `web/` en el equipo local; Prisma client no estará disponible hasta que se ejecute `prisma generate`.
- La gestión de puertos (3001, 5173) puede chocar con procesos locales; usar `netstat`/`taskkill` si hay EADDRINUSE.
- Autenticación y RBAC serán implementadas en Phase 1; actualmente no hay auth en las rutas.

Próximos pasos recomendados

1. Ejecutar `npm install` en `backend/` y `web/` y generar Prisma client.
2. Añadir `.vscode/settings.json` para forzar uso de la versión workspace de TypeScript si el equipo lo desea.
3. Implementar persistencia (Postgres + Prisma) y migraciones en Phase 1.

---

Archivo generado por: GitHub Copilot (GPT-5.4 mini) — resumen creado desde cambios aplicados en la rama dev.
