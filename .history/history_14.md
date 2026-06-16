# Registro de Historia 14: Implementación de la Infraestructura de Autenticación Local con JWT

**Fecha:** 16 de Junio, 2026
**Autor:** Antigravity (AI Coding Assistant)
**Objetivo:** Implementar la lógica del backend para el hashing de contraseñas, firma/verificación de tokens JWT, middlewares de autenticación/autorización y endpoints de registro/login, además del servicio inicial de autenticación en el frontend.

## 📝 Resumen de Cambios

1. **Instalación de Dependencias de Seguridad (Backend):**
   - Instalación de `bcryptjs` y `jsonwebtoken` junto con sus respectivos tipos de TypeScript (`@types/bcryptjs`, `@types/jsonwebtoken`) en el backend.

2. **Utilidades de Autenticación ([auth.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/utils/auth.ts)):**
   - Creación de funciones helper para:
     - `hashPassword(password)`: Hashear contraseñas usando `bcryptjs`.
     - `comparePassword(password, storedHash)`: Comparar contraseñas ingresadas con el hash almacenado.
     - `signJwt(payload, secret, expiresIn)`: Firmar y generar tokens JWT.
     - `verifyJwt(token, secret)`: Verificar y decodificar tokens JWT.

3. **Middleware de Autenticación y Autorización ([auth.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/middleware/auth.ts)):**
   - `requireAuth`: Middleware que extrae el token del encabezado `Authorization: Bearer <token>`, valida su firma e inyecta la información del usuario en el objeto `Request`.
   - `requireRole`: Middleware para restringir el acceso a rutas específicas basado en una lista de roles permitidos (`RolUsuario`).

4. **Rutas de Registro y Login ([auth.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/auth.ts)):**
   - Implementación de los controladores y rutas:
     - `POST /api/v1/auth/register`: Valida datos de entrada, hashea la contraseña, guarda el usuario en la BD (usando casting temporal a `any` hasta aplicar la migración del esquema Prisma) y retorna el usuario con su token JWT.
     - `POST /api/v1/auth/login`: Busca al usuario por email, valida la contraseña hasheada y retorna un token JWT válido.

5. **Servicios de Cliente ([authService.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/authService.ts)):**
   - Creación de wrappers de API en el frontend para realizar peticiones de registro (`register`) e inicio de sesión (`login`) utilizando el cliente de Axios.

## 🛠️ Estado Actual y Próximos Pasos

El backend cuenta con toda la infraestructura de autenticación escrita, y el frontend tiene los hooks del servicio. Sin embargo, para completar el flujo se requiere:

1. Modificar el modelo `Usuario` en [schema.prisma](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/prisma/schema.prisma) agregando `contrasena_hash String` y ejecutar `prisma migrate dev` para persistir el cambio en la base de datos real.
2. Eliminar los castings `as any` temporales utilizados en las rutas de autenticación del backend.
3. Integrar la autenticación real en el frontend (configurar interceptores de Axios en `api.ts`, guardar/leer token de `localStorage` y actualizar `ProtectedRoute`).
