# SPEC LLM (compact)

## Context
- Project: Cartelera web de eventos locales (DSW 2026)
- Goal: publish/consume local events; community interaction; entities manage profiles
- Access: read-only for visitors; actions require auth

## Roles
- Visitor: read feed + event detail only
- Member: publish events, comment, vote, favorite, follow, manage profile
- Entity (Artist/Venue): member + manage entity profile (unified)
- Moderator: member + moderate events/comments
- Admin: full access

## Core UX
- Feed: filters by category/date/entity; sort by recency only
- Event detail: description, date/time, venue, artists, comments, votes
- Profiles: entity pages with info + upcoming/past events
- Follow: alerts for new events; alerts can be muted per entity

## Tech stack
- Frontend: React + Vite
- Backend: Node.js (Express preferred)
- DB: PostgreSQL + Prisma
- Auth: Supabase Auth (FE login; BE validates JWT)
- Hosting: Vercel (FE), Render (BE), Supabase Postgres
- Storage: External URLs (initial); Cloudflare R2 (late stage)
- CI/CD: GitHub Actions (lint + build; tests later)

## Event lifecycle
- States: PENDIENTE -> PUBLICADO / RECHAZADO / ARCHIVADO
- Moderation required before PUBLICADO

## Duplicate detection (simplified)
- Check: Same Venue + Same Day + Same Artist. No scores.
- Flow: Mark `posible_duplicado` if matching.

## Interaction
- Comments: threaded replies (simple)
- Votes: allowed on events and comments; do NOT affect feed order
- Reports: users can report; auto-hide on threshold

## Entities (high level)
- USUARIO(id, email, nombre_mostrar, rol, timestamps)
- PERFIL_ENTIDAD(id, usuario_id, nombre, tipo [artista|lugar], descripcion, direccion, gmaps_url, redes, horarios, servicios, reclamado, creado_en)
- EVENTO(id, creado_por_usuario_id, titulo, descripcion, inicia_en, termina_en, estado, entidad_lugar_id, timestamps)
- EVENTO_ARTISTA(evento_id, entidad_artista_id)
- SEGUIMIENTO(usuario_id, tipo_objetivo, objetivo_id, creado_en)
- FAVORITO(usuario_id, evento_id, creado_en)
- COMENTARIO(id, evento_id, usuario_id, padre_id, cuerpo, creado_en)
- VOTO_EVENTO(usuario_id, evento_id, creado_en)
- VOTO_COMENTARIO(usuario_id, comentario_id, creado_en)
- REPORTE(id, denunciante_usuario_id, tipo_objetivo, objetivo_id, motivo, estado, creado_en)
- ACCION_MODERACION(id, moderador_usuario_id, tipo_objetivo, objetivo_id, accion, nota, creado_en)

## Auth & Authorization
- Use a centralized Middleware for role-based access control (RBAC).
- Validate Supabase JWT in Backend.

## Staged plan
- Phase 1 Prototype: feed + detail + publish + manual moderation + basic entity profiles + comments
- Phase 2 MVP: follow/alerts, votes, simple duplicate warnings, claim profiles
- Phase 3 Production: metrics/reporting, performance/monitoring, moderation audit
