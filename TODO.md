# Plan de entregables y pasos (por fases)

Este TODO describe los hitos y tareas necesarias para desarrollar el proyecto en las etapas que solicitaste. Está basado en `/.github/spec.md` y `.github/copilot-instructions.md`.

Resumen de entregables por fase

Fase 0 — Despliegue inicial y CRUD público

- Objetivo: permitir que cualquier persona cree, modifique y elimine publicaciones en la base de datos y comente publicaciones.
- Tareas:
  - [x] Inicializar repositorio y ramas: `main`, `dev`.
  - [x] Crear API mínima (Node.js + Express) con endpoints: `POST /eventos`, `GET /eventos`, `GET /eventos/:id`, `PATCH /eventos/:id`, `DELETE /eventos/:id`.
  - [x] Añadir comentarios: `POST /eventos/:id/comentarios`, `GET /eventos/:id/comentarios`.
  - [x] Definir esquema de BD (Postgres + Prisma) y migraciones iniciales.
  - [x] Crear seed data y script de carga persistente.
  - [x] Frontend moderno (React + Vite): Estructura de rutas, Tailwind CSS y React Query.
  - [x] Configurar despliegue continuo básico (GitHub Actions).
  - [x] Documentar cómo ejecutar localmente y variables requeridas (`.env.example`).

Fase 0.5 — Refactorización de Esquema y Tipado (Completada) ✅

- Objetivo: Robustecer la base de datos y el tipado del backend antes de escalar a Auth.
- Tareas:
  - [x] Migrar estados (`estado`), roles (`rol`) y tipos de entidad (`tipo`) a **Enums de Prisma**.
  - [x] Implementar relación **Muchos-a-Muchos** para artistas en eventos mediante tabla intermedia.
  - [x] Configurar **recursividad real** en el modelo de comentarios (`padre_id` con `@relation`).
  - [x] Refactorizar `backend/src/store.ts` para soportar los nuevos Enums y estructuras de datos.
  - [x] Actualizar DTOs y mapeadores para mantener consistencia camelCase.
  - [x] Ejecutar migración de limpieza (`prisma migrate reset`) y regenerar cliente.
  - [x] Validar esquema con creación de evento real (M:N artistas).

Fase 1 — Autenticación y roles

- Objetivo: añadir autenticación y roles definidos en la spec (`miembro`, `artista`, `lugar`, `moderador`, `admin`).
- Tareas:
  - [ ] Integrar JWT/Auth real en frontend y backend (reemplazar demo local).
  - [ ] Añadir middleware de autorización en API y proteger endpoints de modificación.
  - [x] Añadir endpoints para gestión de usuarios y asignación de roles.
  - [x] Actualizar UI: login, registro y perfil (Estructura base funcional en `ProfilePage`).
  - [x] Implementar navegación segura con `ProtectedRoute`.
  - [x] Crear formulario de publicación con validación avanzada (`CreateEventPage`).
  - [ ] Añadir tests básicos de integración para auth y permisos.

Fase 2 — Pool de publicaciones y moderación

- Objetivo: separar flujo de publicación y añadir panel de moderación.
- Tareas:
  - Añadir estado `PENDIENTE|PUBLICADO|RECHAZADO|ARCHIVADO` a `EVENTO`.
  - Cambiar flujo: publicar crea `PENDIENTE`; añadir endpoints de moderación: `GET /moderacion/pendientes`, `POST /moderacion/acciones`.
  - Implementar panel de moderador en frontend (lista y acciones: aprobar/rechazar/archivar con nota).
  - Registrar acciones de moderación (`ACCION_MODERACION`) para auditoría.
  - Añadir tests de flujo publicación → moderación.

Fase 3 — Perfiles de Entidades (Artistas/Lugares) y Dashboard

- Objetivo: perfiles reclamables y panel personal para entidades.
- Tareas:
  - Crear entidad `PERFIL_ENTIDAD` (unificada para artistas y lugares) con CRUD mínimo.
  - Implementar flujo de reclamo de perfil y verificación por admin.
  - Dashboard personal: listar eventos propios y editar perfil.
  - (Opcional/Postergado) Gestión de imágenes real (Cloudflare R2).

Fase 4 — Votaciones, Seguimiento y Duplicados

- Objetivo: añadir interactividad y detección de duplicados simple.
- Tareas:
  - Implementar detección de duplicados básica (mismo lugar + mismo día + mismo artista).
  - Diseñar tablas `VOTO_EVENTO`, `VOTO_COMENTARIO` y `SEGUIMIENTO`.
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
