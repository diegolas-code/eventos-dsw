# Registro de Historia 13: Migración de Supabase Auth a JWT Local

**Fecha:** 16 de Junio, 2026
**Autor:** Antigravity (AI Coding Assistant)
**Objetivo:** Cambiar la especificación y planificación de autenticación del proyecto, reemplazando la dependencia externa de Supabase Auth por un sistema local de tokens JWT.

## 📝 Resumen de Cambios

1. **Actualización de la Especificación Técnica ([spec.md](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/spec.md)):**
   - Reemplazo de la sección de infraestructura de Supabase Auth por autenticación local con JWT.
   - Adición del campo `contrasena_hash` al modelo `USUARIO` en la sección de esquema de base de datos.
   - Definición de los nuevos endpoints del backend para auth: `POST /api/v1/auth/register` y `POST /api/v1/auth/login`.
   - Modificación de variables de entorno requeridas: reemplazo de `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` por `JWT_SECRET` y `JWT_EXPIRES_IN`.

2. **Refinamiento del Plan de Trabajo ([TODO.md](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/TODO.md)):**
   - Sustitución de la tarea genérica de integración de autenticación real por una lista detallada de tareas específicas para JWT.
   - Desglose de tareas del backend: migración de la base de datos para la contraseña, utilidades de hashing (`bcryptjs` / `jsonwebtoken`), endpoints de auth y middlewares de autenticación y autorización por rol.
   - Desglose de tareas del frontend: configuración de interceptores de Axios, conexión de formularios (registro/login) y adaptación del `ProtectedRoute`.

## 🛠️ Próximos Pasos (Fase 1)

1. Modificar el modelo `Usuario` en `backend/prisma/schema.prisma` agregando `contrasena_hash String`.
2. Generar y ejecutar la migración de base de datos.
3. Instalar `jsonwebtoken` y `bcryptjs` (con sus respectivos tipos) en el backend.
4. Implementar los endpoints de registro y login.
5. Desarrollar el middleware de verificación de JWT para el backend.
