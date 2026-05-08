# SPEC LLM (compact)

## Context
- Project: Cartelera web de eventos locales (DSW 2026)
- Goal: publish/consume local events; community interaction; artists/venues manage profiles
- Access: read-only for visitors; actions require auth

## Roles
- Visitor: read feed + event detail only
- Member: publish events, comment, vote, favorite, follow, manage profile
- Artist/Rep: member + manage artist profile + stats
- Venue: member + manage venue profile + stats + operational info
- Moderator: member + approve/reject events, moderate comments, manage reports
- Admin: full access + role assignment + categories/tags

## Core UX
- Feed: filters by category/date/venue/artist; sort by recency only
- Event detail: description, date/time, venue, artists, comments, votes
- Profiles: artist/venue pages with info + upcoming/past events
- Follow: alerts for new events; alerts can be muted per entity

## Tech stack
- Frontend: React + Vite
- Backend: Node.js (Express or Fastify)
- DB: PostgreSQL + Prisma
- Auth: Supabase Auth (FE login; BE validates JWT)
- Hosting: Vercel (FE), Render (BE), Supabase Postgres
- Storage: Cloudflare R2 (images)
- CI/CD: GitHub Actions (lint + build; tests later)
- Docker: optional, can be omitted

## Event lifecycle
- States: PENDIENTE -> PUBLICADO / RECHAZADO / ARCHIVADO
- Moderation required before PUBLICADO
- Rejection includes reason; creator can fix and resubmit

## Duplicate detection (events)
- Signals: title similarity, time window (same day; 6h=high, 24h=medium), same venue, overlapping artists, admin override
- Flow: show candidates -> user links or continues -> if continue, mark posible_duplicado

## Interaction
- Comments: threaded replies (simple)
- Votes: allowed on events and comments; do NOT affect feed order
- Reports: users can report; moderators manage; auto-hide on threshold

## Entities (high level)
- USUARIO(id, email, nombre_mostrar, rol, timestamps)
- PERFIL_ARTISTA(id, usuario_id, nombre, biografia, redes, reclamado, creado_en)
- PERFIL_LUGAR(id, usuario_id, nombre, descripcion, direccion, gmaps_url, horarios, servicios, fotos, reclamado, creado_en)
- EVENTO(id, creado_por_usuario_id, titulo, descripcion, inicia_en, termina_en, estado, lugar_id, timestamps)
- EVENTO_ARTISTA(evento_id, artista_id)
- EVENTO_MEDIA(id, evento_id, url, tipo)
- SEGUIMIENTO(usuario_id, tipo_objetivo, objetivo_id, creado_en)
- FAVORITO(usuario_id, evento_id, creado_en)
- COMENTARIO(id, evento_id, usuario_id, padre_id, cuerpo, creado_en)
- VOTO_EVENTO(usuario_id, evento_id, creado_en)
- VOTO_COMENTARIO(usuario_id, comentario_id, creado_en)
- REPORTE(id, denunciante_usuario_id, tipo_objetivo, objetivo_id, motivo, estado, creado_en)
- ACCION_MODERACION(id, moderador_usuario_id, tipo_objetivo, objetivo_id, accion, nota, creado_en)
- SUGERENCIA_DUPLICADO(id, nuevo_evento_id, evento_existente_id, confianza, creado_en)

## Permissions matrix (summary)
- Visitor: read only
- Member/Artist/Venue: publish + comment + vote + favorite + follow + manage own profile
- Moderator: moderate events/comments (non-admin content)
- Admin: full + manage users/categories/tags

## API v1 (REST)
- Base: /api/v1
- Pagination: page/pageSize
- Sort: recencia only
- Filters: fechaDesde/fechaHasta/categoria/lugarId/artistaId
- Events: GET list, GET by id, POST, PATCH, DELETE, POST publish/reject/archive
- Comments: GET for event, POST, PATCH, DELETE
- Votes: POST/DELETE for event and comment
- Favorites: GET my, POST/DELETE by event
- Follow: GET my, POST, DELETE by id
- Profiles: GET/UPDATE artist or venue, POST claim
- Moderation: GET pendientes, POST acciones
- Reports: GET/POST
- Admin: manage users/roles, categories

## Data constraints + indexes
- Unique: USUARIO.email; VOTO_EVENTO(user,event); VOTO_COMENTARIO(user,comment); SEGUIMIENTO(user,target)
- Required: EVENTO.titulo, EVENTO.inicia_en, EVENTO.lugar_id, COMENTARIO.cuerpo, USUARIO.nombre_mostrar
- Index: EVENTO(inicia_en, estado, lugar_id), EVENTO_ARTISTA(artista_id), SEGUIMIENTO(usuario_id), FAVORITO(usuario_id), COMENTARIO(evento_id), REPORTE(estado)
- Search: text index on EVENTO.titulo + EVENTO.descripcion

## Staged plan
- Phase 1 Prototype: feed + detail + publish + manual moderation + basic profiles + comments (no advanced metrics)
- Phase 2 MVP: follow/alerts, votes (visibility only), duplicate warnings, claim profiles
- Phase 3 Production: metrics/reporting, performance/monitoring, moderation audit

## NFR
- Performance: feed load <2s; critical actions <500ms
- Availability: 99.5% monthly
- Privacy: minimal PII; TLS; audit log retention 180 days
- Accessibility: WCAG 2.1 AA

## Frontend guidelines
- Design: readable typography, consistent spacing scale, small palette with states (success, error, warning)
- State: React Query for remote data; local state with hooks; cache main views
- Forms: required-field validation; clear errors; loading/empty/error states per screen
- Routes: /, /eventos/:id, /publicar, /artistas/:id, /lugares/:id, /moderacion
- Access: show/hide actions by role; protect publish/moderation routes

## Key flows (compact)
- Publish event: validate -> duplicate warning -> create PENDIENTE -> moderation
- Moderate: approve/reject + note; comments can hide/restore
- Claim profile: request -> admin review -> link profile to user
- Follow/notify: follow -> alerts -> mute per entity
- Votes: update counters only; no feed reorder
- Duplicate detection: signals -> candidates -> link/continue -> possible_duplicado flag

## Implementation prep (Phase 1/2)
- Phase 1 screens: feed, event detail, publish event, moderation panel
- Phase 1 endpoints: list events, event detail, create event, approve/reject
- Auth: basic login for member/moderator
- Acceptance: publish -> PENDIENTE -> moderation -> visible if approved
- Seed data: 10 events, 5 artists, 5 venues, 1 moderator, 1 admin
- Env: DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY, R2_SECRET_KEY

## Moderation policy (summary)
- Thresholds: multiple reports -> auto-hide pending review
- SLA: pending events reviewed within 48h (MVP)
- Escalation: repeats/conflicts -> admin with moderation note
- Audit: actions logged with moderator, reason, timestamp
