# Plan de entregables y pasos (por fases)

Este TODO describe los hitos y tareas necesarias para desarrollar el proyecto en las etapas que solicitaste. Está basado en `/.github/spec.md` y `.github/copilot-instructions.md`.

Resumen de entregables por fase

Fase 0 — Despliegue inicial y CRUD público
- Objetivo: permitir que cualquier persona cree, modifique y elimine publicaciones en la base de datos y comente publicaciones.
- Tareas:
  - Inicializar repositorio y ramas: `main`, `dev`.
  - Crear API mínima (Node.js + Express/Fastify) con endpoints: `POST /eventos`, `GET /eventos`, `GET /eventos/:id`, `PATCH /eventos/:id`, `DELETE /eventos/:id`.
  - Añadir comentarios: `POST /eventos/:id/comentarios`, `GET /eventos/:id/comentarios`.
  - Definir esquema de BD (Postgres + Prisma) y migraciones iniciales.
  - Crear seed data (10 eventos, 5 artistas, 5 lugares) y script de carga.
  - Frontend mínimo (React + Vite): formularios y vistas para CRUD y comentarios.
  - Configurar despliegue continuo básico (GitHub Actions) y despliegue a plataformas que elijas (Vercel/Render). Empezar con variables de entorno en `env` de plataforma.
  - Documentar cómo ejecutar localmente y variables requeridas (`.env.example`).

Fase 1 — Autenticación y roles
- Objetivo: añadir autenticación y roles definidos en la spec (`miembro`, `artista`, `lugar`, `moderador`, `admin`).
- Tareas:
  - Integrar Supabase Auth (o JWT propio) en frontend y backend.
  - Añadir middleware de autorización en API y proteger endpoints de modificación para usuarios autenticados.
  - Añadir endpoints para gestión de usuarios y asignación de roles.
  - Actualizar UI: login, registro, gestión de perfil básico.
  - Añadir tests básicos de integración para auth y permisos.

Fase 2 — Pool de publicaciones y moderación
- Objetivo: separar flujo de publicación y añadir panel de moderación.
- Tareas:
  - Añadir estado `PENDIENTE|PUBLICADO|RECHAZADO|ARCHIVADO` a `EVENTO`.
  - Cambiar flujo: publicar crea `PENDIENTE`; añadir endpoints de moderación: `GET /moderacion/pendientes`, `POST /moderacion/acciones`.
  - Implementar panel de moderador en frontend (lista y acciones: aprobar/rechazar/archivar con nota).
  - Registrar acciones de moderación (`ACCION_MODERACION`) para auditoría.
  - Añadir tests de flujo publicación → moderación.

Fase 3 — Perfiles de artistas y dashboard personal
- Objetivo: perfiles reclamables y panel personal para artistas/lugares.
- Tareas:
  - Crear entidades `PERFIL_ARTISTA` y `PERFIL_LUGAR` con endpoints CRUD mínimos.
  - Implementar flujo de reclamo de perfil y verificación por admin.
  - Dashboard personal: listar eventos propios, editar perfil, ver estadísticas básicas (vistas/favoritos si aplica).
  - Añadir endpoints y UI para subir/mostrar media (Cloudflare R2 o storage elegido).

Fase 4 — Votaciones y seguimiento
- Objetivo: añadir votaciones y seguimiento de artistas/lugares.
- Tareas:
  - Diseñar tablas `VOTO_EVENTO`, `VOTO_COMENTARIO` y `SEGUIMIENTO` (únicas por usuario/objeto).
  - Endpoints para votar/seguir y para obtener conteos.
  - UI: botones de voto y seguir, actualizaciones optimistas.
  - Considerar denormalizar `vote_count` en `EVENTO` para lecturas rápidas.
  - Tests de concurrencia y seguridad (evitar doble voto).

Operaciones transversales (siempre)
- Configuración de CI: GitHub Actions para lint, test y build.
- Documentación mínima: `README.md`, `CONTRIBUTING.md`, `TODO.md`, `CHANGELOG.md` por hitos.
- Seguridad: mantener `.env` fuera del repositorio; guardar secrets en GitHub y en los paneles de hosting.
- Monitoreo y logs: instrumentar logs básicos en backend (JSON) y errores centralizados si procede.
- Backups: plan simple para la base de datos en entorno productivo.

Despliegue continuo desde el inicio
- Recomendación: abrir repositorio en GitHub, configurar GitHub Actions y desplegar la rama `main` a un entorno público (Vercel para frontend, Render/Heroku para backend), así trabajas sobre un despliegue real desde el primer commit.

Checklist rápido para comenzar (primeros pasos)
1. Inicializar repo y commit inicial con `.gitignore`, `README.md`, `.env.example`.
2. Crear proyecto backend con endpoints mínimos y esquema Prisma.
3. Crear proyecto frontend con vistas CRUD y conexión al API.
4. Añadir GitHub Actions (ci: lint + test + build) y conectar deploy automático.
5. Iterar: añadir auth, moderación, perfiles y votaciones por fases.

Notas finales
- Las fases priorizan el flujo visible (crear/editar/eliminar + comentarios) y la entrega continua. La votación y métricas se dejan para el final según tu plan.
- Si quieres, puedo convertir cada tarea en issues de GitHub y/o generar plantillas de PR y de issues.