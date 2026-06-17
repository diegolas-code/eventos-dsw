# Registro de Historia 17: Fase 2 - Pool de Publicaciones y Moderación de Contenido

**Fecha:** 17 de Junio, 2026
**Autor:** Antigravity (AI Coding Assistant)
**Objetivo:** Implementar la Fase 2 del plan, la cual incluye el flujo de publicación con estado inicial `PENDIENTE`, el filtrado de eventos en la cartelera pública para mostrar solo aquellos que estén `PUBLICADO`, el diseño y migración de la base de datos para registrar auditorías de moderación, los endpoints del backend protegidos por rol, y el panel de moderación en el frontend con controles de aprobación/rechazo/archivo.

## 📝 Resumen de Cambios

1. **Esquema de BD y Migraciones ([schema.prisma](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/prisma/schema.prisma)):**
   - Agregado el modelo `AccionModeracion` con relaciones a `Usuario` (moderador) y `Evento`.
   - Agregado el enum `TipoAccionModeracion` (`APROBAR`, `RECHAZAR`, `ARCHIVAR`).
   - Aplicada la migración de base de datos a PostgreSQL (`20260617123127_add_moderation_model`).

2. **Filtrado de Cartelera Pública ([store.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts)):**
   - Modificación de la función `listEventos()` para que retorne únicamente aquellos eventos cuyo campo `estado` sea `PUBLICADO`. Los eventos nuevos creados mediante `createEvento()` por defecto se inicializan como `PENDIENTE`.

3. **Backend API ([moderacion.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/moderacion.ts)):**
   - Implementación del router de moderación montado en `/api/v1/moderacion`.
   - Endpoint `GET /pendientes` para listar eventos pendientes.
   - Endpoint `POST /acciones` para aprobar, rechazar o archivar eventos transaccionalmente, escribiendo el registro de auditoría en la tabla `AccionModeracion`.
   - Ambas rutas protegidas bajo los middlewares `requireAuth` y `requireRole(['moderador', 'admin'])`.

4. **Pruebas de Integración ([test-auth.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/scripts/test-auth.ts)):**
   - Ampliación del script de pruebas para validar el flujo completo de moderación:
     1. Creación de evento y verificación del estado inicial `PENDIENTE`.
     2. Verificación de que el evento pendiente está oculto de la cartelera pública.
     3. Verificación del bloqueo de acceso (403 Forbidden) para usuarios de rol `miembro`.
     4. Comprobación del correcto funcionamiento de las acciones de aprobación y rechazo por parte de un usuario con rol `moderador`.
     5. Comprobación de que el estado en base de datos se actualiza y se escribe el registro de auditoría en `AccionModeracion` con la nota correspondiente.
     6. Verificación de que el evento aprobado se vuelve visible públicamente.

5. **Servicios del Frontend ([moderationService.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/moderationService.ts)):**
   - Creado el servicio para consumir los nuevos endpoints de la API de moderación: `getPendingEvents` y `applyModerationAction`.

6. **Interfaz de Moderación y Rutas ([web](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src)):**
   - **[ProtectedRoute.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/routes/AppRoutes/ProtectedRoute.tsx):** Modificado para soportar restricciones basadas en un listado de roles autorizados (`allowedRoles`).
   - **[AppRoutes.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/routes/AppRoutes/AppRoutes.tsx):** Registrada la ruta `/moderacion` bajo protección estricta para roles `moderador` y `admin`.
   - **[ModerationPage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ModerationPage/ModerationPage.tsx):** Creada la interfaz de usuario del dashboard de moderación utilizando TanStack Query, componentes visuales premium con animaciones e iconos de Lucide, listando tarjetas con datos del evento y permitiendo agregar una nota opcional de decisión.
   - **[Navbar.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Components/layout/Navbar.tsx):** Modificado para mostrar dinámicamente un enlace animado al panel `/moderacion` si el usuario ingresado cuenta con permisos de moderador o administrador.
   - **[LoginForm.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/LoginForm.tsx) y [RegisterForm.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/RegisterForm.tsx):** Modificados para guardar el rol del usuario en `localStorage` tras la autenticación exitosa, habilitando la comprobación en el cliente.

## ⚠️ Dificultades y Soluciones

1. **PgBouncer y Migraciones de Prisma:**
   - *Problema:* El modo transacción de PgBouncer (puerto `6543`) causa fallos al correr migraciones con Prisma debido a la falta de soporte para advisory locks.
   - *Solución:* Utilizar `DIRECT_URL` (puerto `5432`) en el archivo `.env` del backend para la ejecución directa de migraciones.

2. **Bloqueos de Archivos (EPERM) en Windows:**
   - *Problema:* Durante el desarrollo local, procesos activos de Node (`npm run dev`) o Prisma Studio retienen el archivo del motor binario de consultas de Prisma, generando errores `EPERM` al ejecutar `prisma generate`.
   - *Solución:* Detener temporalmente los servidores de desarrollo y procesos Node bloqueantes antes de correr la regeneración de clientes Prisma.

## ✅ Verificación y Estado

- Las pruebas automatizadas en `backend/src/scripts/test-auth.ts` pasan exitosamente.
- El typecheck general compila de forma limpia.
- El build de Vite para producción en el cliente web se realiza sin advertencias ni fallos.
