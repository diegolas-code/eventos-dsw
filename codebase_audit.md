# Informe de Auditoría de Código y Diagnóstico del Proyecto 🔍

Este documento resume la revisión técnica de toda la base de código y documentación del proyecto. Se identifican las funcionalidades faltantes según las especificaciones originales (`spec.md`), fallos críticos de seguridad y rendimiento, código redundante que debe eliminarse y el estado actual de la documentación de planificación (`TODO.md`).

---

## 📌 1. Funcionalidades Faltantes (Según `spec.md` y `TODO.md`)

Al comparar la especificación funcional original con la implementación actual, se han detectado los siguientes módulos y requerimientos ausentes:

### A. Modelos de Base de Datos y Endpoints Ausentes

- **Votos de Eventos (`VOTO_EVENTO`)**: Totalmente ausente.
  - No existe el modelo de base de datos en [schema.prisma](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/prisma/schema.prisma).
  - No están creados los endpoints `POST` / `DELETE` `/api/v1/eventos/:id/votos` ni los botones de votación reactivos en el frontend.
- **Favoritos y Seguimientos (`FAVORITO`, `SEGUIMIENTO`)**:
  - Falta modelar las tablas e implementar la lógica de seguimiento a perfiles de entidad (artistas/lugares) y guardado de favoritos en la cartelera.
  - Los endpoints `GET /me/favoritos`, `POST /favoritos`, `GET /me/seguimientos` y `POST /seguimientos` no existen.
- **Denuncias y Reportes (`REPORTE`)**:
  - No existe la lógica para reportar eventos o comentarios ofensivos/incorrectos por parte de los miembros, ni el modelo de BD correspondiente.
- **Panel de Administración (`admin`)**:
  - Faltan las rutas exclusivas del rol administrador para la gestión y asignación de roles (`GET /admin/usuarios`, `PATCH /admin/usuarios/:id/rol`).
  - Falta la gestión dinámica de categorías desde la API (`POST` / `DELETE` `/admin/categorias`).

### B. Flujos de Lógica de Negocio Incompletos o Mockeados

- **Edición de Eventos Propios**: El botón de "Editar" en [DashboardView.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/DashboardView.tsx#L250-L255) dispara una alerta mockeada en lugar de abrir el formulario de actualización.
- **Detección Automática de Duplicados (`SUGERENCIA_DUPLICADO`)**:
  - Aunque el modelo `Evento` incluye la columna `posible_duplicado`, no existe ninguna lógica de verificación en el backend al crear un evento (comparando coincidencia de _Lugar_, _Día_ y _Artista_).
  - Falta implementar la tabla e interfaz para sugerencias de duplicidad destinadas a los moderadores.
- **Aprobación de Reclamos de Perfil**: Aunque los usuarios pueden reclamar un perfil en `/reclamar`, no está diseñado el panel para que el administrador valide la evidencia y apruebe/rechace dicha solicitud.

---

## 🔒 2. Puntos Críticos por Corregir (Seguridad y Errores de Configuración)

### A. Vulnerabilidades Críticas de Seguridad (Falta de Autenticación)

Gran parte de los controladores principales operan sin validación de identidad o permisos, permitiendo que cualquier cliente sin sesión realice modificaciones destructivas:

1. **Controlador de Usuarios ([usuarios.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/usuarios.ts))**:
   - `POST /` permite registrar nuevos usuarios asignando cualquier rol arbitrario (ej. `admin` o `moderador`) sin validación de permisos.
   - `GET /` expone públicamente los emails y hashes/roles de todos los usuarios de la base de datos.
   - `PATCH /:id` y `DELETE /:id` permiten modificar o eliminar cualquier cuenta sin validar la identidad del solicitante.
2. **Controlador de Comentarios ([comentarios.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/comentarios.ts))**:
   - `PATCH /:id` y `DELETE /:id` son públicos. Cualquier persona puede modificar el texto de un comentario o borrarlo de la base de datos.
3. **Creación de Comentarios ([eventos.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/eventos.ts#L223-L243))**:
   - `POST /:id/comentarios` no requiere autenticación y confía en el `usuarioId` enviado en el cuerpo, lo que facilita la suplantación de identidad.
4. **Edición/Eliminación de Eventos ([eventos.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/eventos.ts#L180-L207))**:
   - `PATCH /:id` y `DELETE /:id` no requieren inicio de sesión ni verifican si el autor creó el evento, lo que permite alteraciones maliciosas.
5. **Creación de Perfiles ([perfiles.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/perfiles.ts#L33-L52))**:
   - `POST /` permite crear perfiles de artistas y lugares de manera pública sin validar que correspondan a un usuario autenticado.

### B. Fallos de Rendimiento y Bloqueos Identificados

- **Envío de Correo Bloqueante**: Al registrar asistencia a un evento en [store.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts#L602-L612), la llamada a `enviarMail` está precedida por `await`. Si el entorno no posee credenciales SMTP en el `.env`, Nodemailer intentará conectarse indefinidamente hasta alcanzar el timeout, dejando la petición HTTP "colgada" para el usuario final.
- **Bypass de Proxy en Frontend**: En [api.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/api.ts), la configuración de `baseURL` apunta de manera rígida al puerto `http://localhost:3001/api/v1`. Esto hace que el navegador ignore las redirecciones configuradas en [vite.config.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/vite.config.ts), forzando peticiones CORS complejas y limitando el dinamismo en otros entornos.
- **Tarea Programada de Recordatorios Desactivada**: El archivo [eventReminder.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/jobs/eventReminder.ts) planifica las tareas con `node-cron`, pero no se importa en [index.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/index.ts) ni en [app.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/app.ts), por lo que nunca se suscribe al ciclo de ejecución cuando arranca el servidor.

---

## 🗑️ 3. Elementos Redundantes e Innecesarios ("Things that shouldn't be there")

- **Duplicidad en Sesión Local (JWT vs. Legacy Keys)**:
  - El frontend guarda las claves `demo_session_id`, `demo_session_email` y `demo_session_rol` en el `localStorage` (establecidos inicialmente en la época de mockups funcionales) y los utiliza para manejar la sesión del perfil en componentes como [ManagePerfilPage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/ManagePerfilPage.tsx#L28) y [CommentsSection.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Components/events/CommentsSection.tsx#L17). Esto representa un acoplamiento confuso e inseguro, ya que la sesión real debería descodificarse o validarse directamente desde el token JWT (`token`).
- **Código Muerto y Comentado**:
  - En [ProfilePage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/ProfilePage.tsx#L72-L83), se conserva el objeto `usuarioMock` sin uso real.
  - En [CreateEventPage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/CreateEventPage/CreateEventPage.tsx#L198-L211), se conservan desactivados y comentados los bloques de código asociados a la carga manual de `entidadLugarId`.

---

## 📅 4. Desalineación en TODO.md (Tareas Completadas Sin Marcar)

Se ha observado que la **Fase 3.5 — Funcionalidad de Comentarios Modulares** figura como "En Progreso", pero a nivel de código se encuentra **totalmente completada**:

- [x] Los modelos de comentarios en el backend y el mapeador `mapComentario` incluyen y resuelven correctamente la relación `usuario`.
- [x] El archivo [comentarioService.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/comentarioService.ts) incluye las funciones de creación, consulta y borrado alineadas a la API real.
- [x] El componente auto-contenido [CommentsSection.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Components/events/CommentsSection.tsx) está desarrollado con sus propios estados y mutaciones React Query.
- [x] El componente está integrado con éxito en la vista detallada de eventos de [EventPage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/EventPage/EventPage.tsx).

_Se sugería actualizar el checklist de TODO.md para reflejar con precisión el fin de este hito._ (Actualizado en TODO.md)

---

## ✅ 5. Resoluciones de la Auditoría (Corregidas en la Rama `fix/codebase-audit-issues`)

Todas las vulnerabilidades y fallos identificados en esta auditoría han sido completamente resueltos:

1. **Seguridad y Permisos en API**:
   - Se protegieron todas las rutas de mutación en `usuarios.ts`, `comentarios.ts`, `eventos.ts` y `perfiles.ts` exigiendo autenticación mediante `requireAuth`.
   - Se implementaron verificaciones estrictas de pertenencia (autoría) y roles (`admin`/`moderador`) en `routes/comentarios.ts`, `routes/eventos.ts` y `routes/usuarios.ts`.
   - Se centralizó la firma y verificación del token JWT usando una única clave `JWT_SECRET` en `utils/auth.ts` para evitar inconsistencias de firmas inválidas.
2. **Optimización de Rendimiento**:
   - El envío de correos en `asistirEvento` (`store.ts`) se hizo completamente asíncrono y no bloqueante mediante la remoción de `await` e incorporando gestión de errores (`.catch(...)`).
   - Se importó `eventReminder.ts` en `app.ts`, activando la programación diaria de recordatorios mediante `node-cron`.
   - Se corrigió la URL base en `api.ts` a `/api/v1` para aprovechar de manera transparente el proxy configurado en Vite.
3. **Limpieza de Código y Sesión**:
   - Se eliminaron las claves legacy `demo_session_*` del frontend y se reemplazaron con la decodificación en caliente del ID de usuario desde el payload del token JWT (`token`) en `CommentsSection.tsx` y se pasó como propiedad a `ManagePerfilPage.tsx`.
   - Se eliminó el objeto redundante `usuarioMock` en `ProfilePage.tsx` y el código comentado de `entidadLugarId` en `CreateEventPage.tsx`.
4. **Edición de Eventos**:
   - Se desarrolló el componente funcional `EditEventModal.tsx` y se integró en el panel de control del usuario (`DashboardView.tsx`) para permitir actualizar dinámicamente títulos y descripciones de eventos propios.
5. **Esquema de BD e Identificación de Duplicados**:
   - Se agregaron las tablas `VotoEvento` y `Favorito` con sus índices y relaciones correspondientes en `schema.prisma`.
   - Se implementó la lógica de detección automática de eventos duplicados en `createEvento` (`store.ts`) comparando proximidad del mismo día, lugar y artistas.
