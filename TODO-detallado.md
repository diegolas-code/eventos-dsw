# TODO-detallado: Plan de trabajo paso a paso

Este documento extiende `TODO.md` con pasos operativos, comandos y sugerencias prácticas.

Principios generales
- Entregar rápido: construir una versión desplegada y mejorar iterativamente.
- CI/CD desde el primer commit: lint, tests y deploy automático.
- Mantener secretos fuera del repo.

Herramientas recomendadas
- Backend: Node.js 18+, Express, Prisma (Postgres).
- Frontend: React + Vite, React Router, React Query.
- Auth: Supabase Auth.
- Storage: URL externas (inicial), Cloudflare R2 (final).

FASE 0 — Despliegue inicial y CRUD público

1) Inicializar repo y ramas (`main`, `dev`).

2) Backend mínimo (API REST)
- `npm install express cors prisma @prisma/client`
- Prisma: esquema inicial con `Evento`, `Comentario` y `PerfilEntidad` (simplificado).

3) Seed data: 10 eventos y algunas entidades.

4) Frontend mínimo (React + Vite)
- Implementar páginas: `Home`, `EventDetail`, `EventForm`.

FASE 1 — Autenticación y roles

1) Supabase Auth: FE login, BE JWT validation.
2) Middlewares: `checkRole(['admin','moderador'])` centralizado.
3) UI: login/register y protección de rutas.

FASE 2 — Pool de publicaciones y moderación

1) DB: estado `PENDIENTE|PUBLICADO|RECHAZADO|ARCHIVADO` en `Evento`.
2) Flow: publicar crea `PENDIENTE`; panel de moderación para acciones.

FASE 3 — Perfiles de Entidades (Unificado)

1) DB: modelo `PerfilEntidad` (tipo: 'artista' | 'lugar').
2) Dashboard: gestionar eventos propios y perfil.
3) Imágenes: URLs externas por ahora.

FASE 4 — Votaciones, Seguimiento y Duplicados

1) Duplicados: check simple (Lugar + Día + Artista).
2) DB: `VotoEvento`, `VotoComentario`, `Seguimiento`.
3) UI: Updates optimistas para votos y seguir.
