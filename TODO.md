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
  - [x] Configurar JWT y credenciales locales:
    - [x] Modificar el modelo `Usuario` en `schema.prisma` para incluir `contrasena_hash`.
    - [x] Ejecutar la migración correspondiente (`prisma migrate dev`).
    - [x] Instalar dependencias para hashing (ej: `bcryptjs`) y tokens (ej: `jsonwebtoken`).
    - [x] Crear utilidades en el backend para hash de contraseñas y firma/verificación de tokens JWT.
  - [x] Implementar rutas de autenticación en backend:
    - [x] `POST /api/v1/auth/register` (Registrar y hashear contraseña).
    - [x] `POST /api/v1/auth/login` (Verificar credenciales y firmar token JWT).
  - [x] Crear middleware de autenticación y autorización en backend:
    - [x] Middleware para validar el token JWT proveniente de `Authorization: Bearer <token>`.
    - [x] Middleware para validar roles específicos y proteger rutas de modificación (POST/PATCH/DELETE).
  - [x] Integrar autenticación real en frontend:
    - [x] Configurar interceptores de Axios en `api.ts` para adjuntar el token de `localStorage`.
    - [x] Modificar formulario de registro para enviar peticiones al backend y guardar el token.
    - [x] Modificar formulario de login para solicitar token al backend e iniciar sesión.
    - [x] Actualizar `ProtectedRoute` y el estado del perfil para usar la sesión/JWT real.
  - [x] Añadir endpoints para gestión de usuarios y asignación de roles.
  - [x] Actualizar UI: login, registro y perfil (Estructura base funcional en `ProfilePage`).
  - [x] Implementar navegación segura con `ProtectedRoute`.
  - [x] Crear formulario de publicación con validación avanzada y subida de imágenes (`CreateEventPage`).
  - [x] Integrar carga de imágenes (posters) usando Cloudinary en el backend y previsualización en frontend.
  - [x] Implementar soporte para ubicación manual (campo `lugar_manual` en BD y API).
  - [x] Añadir tests básicos de integración para auth y permisos.
  - [ ] **Agregar funcionalidad Recuperar contraseña** (restablecimiento de credenciales locales).
    - [x] Actualizar modelo `Usuario` en `schema.prisma` con campos de token.
    - [ ] Implementar endpoints `POST /forgot-password` y `POST /reset-password` en backend.
    - [ ] Conectar flujo de olvido de contraseña en `LoginForm.tsx`.
    - [ ] Crear página de formulario de restablecimiento `ResetPasswordPage.tsx` y registrar su ruta.
  - [ ] **Agregar funcionalidad Asignar roles** (interfaz para administradores).

Fase 2 — Pool de publicaciones y moderación

- Objetivo: separar flujo de publicación y añadir panel de moderación.
- Tareas:
  - [x] Diseñar y migrar base de datos para auditoría:
    - [x] Agregar el modelo `AccionModeracion` y el enum `TipoAccionModeracion` en `schema.prisma`.
    - [x] Actualizar relaciones en los modelos `Usuario` y `Evento`.
    - [x] Ejecutar la migración de base de datos (`prisma migrate dev`).
  - [x] Filtrar cartelera pública:
    - [x] Modificar `listEventos()` en `store.ts` para retornar únicamente eventos en estado `PUBLICADO`.
  - [x] Implementar endpoints de moderación en backend:
    - [x] Crear el router `routes/moderacion.ts` protegido con `requireAuth` y `requireRole`.
    - [x] Endpoint `GET /api/v1/moderacion/pendientes` para listar eventos con estado `PENDIENTE`.
    - [x] Endpoint `POST /api/v1/moderacion/acciones` para aprobar/rechazar/archivar transaccionalmente.
    - [x] Registrar la ruta en `app.ts`.
  - [x] Desarrollar pruebas de integración de moderación:
    - [x] Ampliar `test-auth.ts` con flujos de creación, listado y aprobación/rechazo de moderación.
  - [x] Integrar moderación en frontend:
    - [x] Crear el servicio `moderationService.ts` en el cliente de Axios.
    - [x] Configurar la ruta `/moderacion` en `AppRoutes.tsx` protegida por rol.
    - [x] Implementar la interfaz `ModerationPage.tsx` con listado y controles de aprobación/rechazo.
    - [ ] **Corregir página moderacion** (optimizando ModerationPage.tsx para asegurar estabilidad y mejor reporte de errores).

Fase 2.5 — Filtros, Galería de Imágenes y Navegación Responsive (Completada) ✅

- Objetivo: Mejorar la experiencia de usuario con búsqueda, categorización y visualización de galerías.
- Tareas:
  - [x] Agregar enum `CategoriaEvento` y relaciones en `schema.prisma`.
  - [x] Implementar la relación y tabla intermedia `EventoImagen` para soportar galerías de imágenes.
  - [x] Actualizar `POST /api/v1/eventos` para soportar carga múltiple de imágenes (portada y galería) a Cloudinary.
  - [x] Crear el endpoint `GET /api/v1/eventos/categorias/listado` para consultar categorías.
  - [x] Crear selector de categorías e inputs de subida múltiple en `CreateEventPage.tsx` con vista previa.
  - [x] Crear filtro dinámico de categorías y barra de búsqueda en `Homepage.tsx` y `HeroSection.tsx` (búsqueda por evento, artista, descripción o lugar).
  - [x] Integrar visor de imágenes interactivo en `EventPage.tsx` utilizando la librería `Swiper`.
  - [x] Rediseñar el `Navbar.tsx` con efecto glassmorphic y hacerlo completamente adaptable para móviles mediante menú hamburguesa responsive.
  - [ ] **Eliminar boton explorar** (redundante de la barra de navegación Navbar.tsx).

Fase 3 — Perfiles de Entidades (Artistas/Lugares) y Dashboard

- Objetivo: perfiles reclamables y panel personal para entidades.
- Tareas:
  - [x] Crear endpoints backend para reclamos (`POST /:id/reclamar`) y actualizaciones (`PATCH /:id`) de perfiles.
  - [x] Diseñar la interfaz de usuario en el cliente para crear/editar perfil de entidad (`ManagePerfilPage.tsx`).
  - [x] Implementar la lógica de creación completa de perfiles en el cliente (POST a la API y selector de `tipo` de entidad).
  - [ ] Flujo de verificación de perfiles por parte del administrador.
  - [x] Dashboard personal de entidades: listar eventos propios y editar perfil.
  - [x] **Terminar página perfil** (ProfilePage.tsx, para mostrar información de la cuenta).
  - [x] **Agregar funcionalidad Editar información de usuario** (cuenta personal).
  - [x] **Corregir bug de eliminación de cuenta** (limpieza de sesión local).
  - [x] **Agregar funcionalidad Cambiar contraseña** (real, con validación de clave actual en backend).
  - [x] **Agregar funcionalidad Editar/Eliminar eventos** propios desde el dashboard personal (Edición stubbed, Eliminación implementada).
  - [ ] **Agregar funcionalidad Alertas y notificaciones** internas por nuevos eventos.
  - (Opcional/Postergado) Gestión de imágenes real (Cloudflare R2).

Fase 3.5 — Funcionalidad de Comentarios Modulares (En Progreso) ⏳

- Objetivo: Implementar sistema de comentarios auto-contenido en frontend y asociar identidades de usuario en backend.
- Tareas:
  - [ ] Actualizar modelos y mapeadores de comentarios en backend (`backend/src/store.ts`) para incluir relación `usuario`.
  - [ ] Alinear payloads de creación de comentarios en el servicio frontend (`comentarioService.ts`) y añadir método de borrado.
  - [ ] Crear el componente auto-contenido `<CommentsSection />` en frontend con estado, queries y mutaciones propias.
  - [ ] Integrar el componente `<CommentsSection />` en la vista de detalle de eventos (`EventPage.tsx`) y validar el flujo localmente.

Fase 4 — Votaciones, Seguimiento y Duplicados (Opcional)

- Objetivo: añadir interactividad y detección de duplicados simple.
- Tareas:
  - Implementar detección de duplicados básica (mismo lugar + mismo día + mismo artista).
  - Diseñar tablas `VOTO_EVENTO` y `SEGUIMIENTO`.
  - Endpoints para votar/seguir y para obtener conteos.
  - UI: botones de voto y seguir, actualizaciones optimistas.
  - [x] **Agregar funcionalidad boton asistir/seguir etc.** (botones interactivos en el frontend con RSVP).
  - Considerar denormalizar `vote_count` en `EVENTO` para lecturas rápidas.
  - Tests de concurrencia y seguridad (evitar doble voto).

Operaciones transversales (siempre)

- Configuración de CI: GitHub Actions para lint, test y build.
  - [x] **Corregir punto y coma** en `backend/src/jobs/eventReminder.ts`.
  - [x] **Corregir pipeline de CI** en `.github/workflows/ci.yml` para instalar dependencias de subcarpetas y compilar Prisma.
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
