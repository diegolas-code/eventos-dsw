# TODO-detallado: Plan de trabajo paso a paso

Este documento extiende `TODO.md` con pasos operativos, comandos y sugerencias prácticas
para que el equipo pueda avanzar por fases y desplegar desde el inicio.

Principios generales
- Entregar rápido: construir una versión desplegada (aunque limitada) y mejorar iterativamente.
- Código en GitHub: ramas `main` (producción), `dev` (integración) y feature branches.
- CI/CD desde el primer commit: lint, tests y deploy automático para `main`.
- Mantener secretos fuera del repo: usar `.env.example` y GitHub Secrets.

Herramientas recomendadas
- Backend: Node.js 18+, Fastify o Express, Prisma (Postgres).
- Frontend: React + Vite, React Router, React Query.
- Auth (fase posterior): Supabase Auth (recomendado) o JWT propio.
- Storage: Cloudflare R2 (imágenes), con SDK o URL firmadas.
- Deploy: Vercel (frontend), Render (backend) o similar.

Estructura inicial sugerida

repo/
- backend/
  - package.json
  - src/
    - index.ts (server)
    - routes/
    - controllers/
    - prisma/ (cliente)
  - prisma/schema.prisma
  - prisma/seed.ts
- web/
  - package.json
  - src/
    - App.tsx
    - pages/
    - components/
    - services/api.ts
  - vite.config.ts
- .github/
  - workflows/ci.yml
  - spec.md
  - copilot-instructions.md

FASE 0 — Despliegue inicial y CRUD público (detallado)

1) Inicializar repo y ramas
- Comandos:
```bash
git init
git checkout -b dev
git add .
git commit -m "chore: repo inicial"
gh repo create <owner/repo> --public
git push -u origin dev
```

2) Backend mínimo (API REST)
- Crear proyecto y dependencias:
```bash
mkdir backend && cd backend
npm init -y
npm install fastify @fastify/cors prisma @prisma/client
npx prisma init --datasource-provider postgresql
```
- Prisma: esquema inicial (ejemplo reducido) — añadir a `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Evento {
  id        String   @id @default(uuid())
  titulo    String
  descripcion String?
  inicia_en DateTime
  termina_en DateTime?
  creado_en DateTime @default(now())
}

model Comentario {
  id        String   @id @default(uuid())
  eventoId  String
  cuerpo    String
  creado_en DateTime @default(now())
}
```
- Migraciones y cliente:
```bash
npx prisma migrate dev --name init
```
- Implementar endpoints REST (ejemplo): `POST /eventos`, `GET /eventos`,
  `GET /eventos/:id`, `PATCH /eventos/:id`, `DELETE /eventos/:id`.

3) Seed data
- `prisma/seed.ts` con script que cree 10 eventos y algunos comentarios.
- Ejecutar con `node prisma/seed.js` o integrar en `package.json`.

4) Frontend mínimo (React + Vite)
- Crear app:
```bash
cd ..
npm create vite@latest web -- --template react-ts
cd web
npm install axios react-query
```
- Implementar páginas: `Home` (lista), `EventDetail`, `EventForm`.
- `services/api.ts` con funciones fetch hacia el backend.

5) Deploy inicial (desplegar lo mínimo para tener URL pública)
- Crear GitHub Actions workflow `.github/workflows/ci.yml` con:
  - Node.js setup
  - Lint
  - Build backend (opcional)
  - Deploy: usar Render/GitHub integration or Vercel for frontend
- Configurar secrets de DB y endpoints en panel de la plataforma.

FASE 1 — Autenticación y roles (detallado)

Objetivo: añadir usuarios y proteger acciones.

1) Elegir método: Supabase Auth recomendado
- Registro rápido: crear proyecto en Supabase, habilitar providers necesarios.
- En frontend: instalar `@supabase/supabase-js` y usar `supabase.auth` para login.
- En backend: validar JWT de Supabase en cada request protegido.

2) DB: tabla `Usuario`
- Añadir a Prisma:
```prisma
model Usuario {
  id String @id @default(uuid())
  email String @unique
  nombre_mostrar String
  rol String @default("miembro")
}
```
- Migrar y agregar scripts para crear usuarios de prueba.

3) Middlewares y permisos
- Backend: middleware `ensureAuth` que extrae token Authorization Bearer y valida.
- Middleware `requireRole(['admin','moderador'])` para endpoints de moderación.

4) UI: login/register
- Páginas: `Login`, `Register`, `Profile`.
- Guardar token en `localStorage` o `cookie` (httpOnly recomendado con backend proxy).

FASE 2 — Pool de publicaciones y moderación (detallado)

1) DB: añadir estado en `Evento`
```prisma
enum EstadoEvento { PENDIENTE PUBLICADO RECHAZADO ARCHIVADO }

model Evento {
  id String @id @default(uuid())
  titulo String
  estado EstadoEvento @default(PENDIENTE)
  ...
}
```

2) Flow: publicar -> PENDIENTE
- Endpoint `POST /eventos` guarda `PENDIENTE` si el usuario no es admin.
- Endpoint `POST /moderacion/acciones` con body `{ objetivoId, accion, nota }`.

3) Registro de acciones
- `ACCION_MODERACION` en Prisma para auditar.

4) UI de moderación
- Panel con paginación y filtros; acciones rápidas (aprobar/rechazar) con modal.

FASE 3 — Perfiles de artistas y dashboard (detallado)

1) DB: modelos `PerfilArtista` y `PerfilLugar` en Prisma.
2) Endpoints: CRUD y `POST /artistas/:id/reclamar`.
3) Dashboard: `Mis eventos`, `Crear evento`, `Editar perfil`, `Estadísticas`.
4) Almacenamiento de media: integrar R2; endpoints que generen URL firmadas.

FASE 4 — Votaciones y seguimiento (detallado)

1) DB: `VotoEvento`, `VotoComentario`, `Seguimiento`.
2) Reglas: unicidad por `usuarioId` + `eventoId`.
3) Endpoints: `POST /eventos/:id/votos` y `DELETE /eventos/:id/votos`.
4) UI: optimismo en actualización y manejo de errores; deshabilitar botón tras votar.

Pruebas y calidad
- Unit tests: Jest + ts-jest (backend) para lógica crítica.
- Integración: Supertest para endpoints REST.
- E2E: Cypress para flujos principales (publicar evento, moderación).
- Linting: ESLint + Prettier config compartida.

CI/CD (ejemplo básico de pasos)
- Run linter
- Install deps
- Run tests
- Build
- Deploy to staging/production on `main`.

Buenas prácticas y consejos
- Mantener `feature flags` si decides exponer UI antes de backend completo.
- Evitar exponer secretos: usar GitHub Secrets y paneles de hosting.
- Crear PR pequeño y frecuente: facilita revisión y despliegue.
- Documentar endpoints en `docs/api.md` o usar OpenAPI/Swagger.

Siguientes acciones concretas para hoy
1. Confirmar stack (Express vs Fastify, TypeScript sí/no).
2. Yo creo el scaffold inicial del backend + Prisma + script de seed.
3. Creo scaffold del frontend con Vite y conexión básica a la API.

-----
Archivo creado automáticamente por la herramienta de asistencia. Pregunta si quieres que genere los scripts concretos o los issues en GitHub.
