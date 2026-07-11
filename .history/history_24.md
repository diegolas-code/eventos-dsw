# Registro de Historia 24: Implementación de Recuperación de Contraseña Real ✉️

**Fecha:** 11 de Julio, 2026  
**Autores:** Melisa Segura (Colaboradora), Diegolas (Colaborador) y Antigravity (AI Coding Assistant)  
**Objetivo:** Desarrollar e integrar de forma segura el flujo completo de recuperación de contraseña ("Olvidé mi contraseña") desde el formulario de login hasta el formulario de restablecimiento por token único.

---

## 📝 Descripción de la Tarea

Anteriormente, el flujo de "Restablecer Clave" en [LoginForm.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/LoginForm.tsx) estaba simulado mediante un retraso temporal local (`setTimeout`), mostrando un mensaje de éxito sin realizar ninguna validación ni persistencia real en el backend.

Para convertirlo en un flujo seguro estándar de producción, se requirió:

1. Almacenar temporalmente los tokens de verificación y sus expiraciones en la base de datos de usuarios.
2. Crear controladores API para solicitar el restablecimiento (generar token y enviar correo) y para procesar el restablecimiento (validar token y guardar nueva contraseña hasheada).
3. Rediseñar la experiencia en el frontend para ocultar el campo de contraseña durante la solicitud de recuperación, crear una nueva página dedicada al ingreso de la nueva clave y habilitar rutas de navegación parametrizadas por token.

---

## 🔧 Cambios Implementados

### 1. Extensión del Esquema de Datos

- **Base de Datos ([schema.prisma](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/prisma/schema.prisma)):** Se añadieron los campos `token_recuperacion` (String?) y `token_recuperacion_expira` (DateTime?) al modelo `Usuario`.
- **Migración:** Se aplicó la migración automática `20260711200215_add_recovery_token_fields` en PostgreSQL. Se regeneró el cliente de Prisma de forma exitosa.

### 2. Desarrollo de Endpoints en el Backend ([auth.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/auth.ts))

Se expusieron dos nuevas rutas públicas en el enrutador de autenticación:

- **`POST /api/v1/auth/forgot-password`:**
  - Recibe el email del usuario. Si existe, genera un identificador único seguro `randomUUID()`.
  - Guarda el token y setea su fecha de expiración para 1 hora en el futuro.
  - Envía un correo electrónico estructurado con HTML utilizando el servicio SMTP de [email.service.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/services/email.service.ts).
  - **Pruebas Locales Robustas:** Se integró un bloque `try/catch` para capturar fallos de envío de correos (en caso de no poseer variables de servidor SMTP configuradas en local) y se inyectó un fallback que imprime el enlace completo con el token directamente en la consola del servidor (`stdout`).
- **`POST /api/v1/auth/reset-password`:**
  - Recibe el token y la `nuevaClave`.
  - Busca al usuario que posea ese token y cuya fecha de expiración sea mayor o igual a la hora actual.
  - Hashea la nueva contraseña con bcryptjs (`hashPassword`) y limpia los campos de recuperación (`token_recuperacion: null` y `token_recuperacion_expira: null`) de forma transaccional.

### 3. Rediseño del Login en el Cliente ([LoginForm.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/LoginForm.tsx))

- Se modificó el formulario para que al presionar "¿Olvidaste la contraseña?", el campo de contraseña se oculte completamente.
- El botón principal cambia su texto a "Enviar enlace de recuperación" y, al hacer submit, realiza un post real a `/auth/forgot-password` enviando únicamente el email, capturando y renderizando la respuesta del servidor.

### 4. Creación de la Vista de Restablecimiento

- **Nueva Página ([ResetPasswordPage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/ResetPasswordPage.tsx)):** Se implementó una interfaz limpia que recupera el token de los parámetros de búsqueda de la URL (`?token=...` usando `useSearchParams`), solicita la nueva contraseña, realiza validaciones básicas de longitud mínima y envía la actualización a `/auth/reset-password`, redirigiendo al usuario al login tras 3 segundos de éxito.
- **Ruta ([AppRoutes.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/routes/AppRoutes/AppRoutes.tsx)):** Se registró la ruta `/restablecer-clave` apuntando a `ResetPasswordPage`.

### 5. Documentación de Proyecto

- Se marcaron como completadas las tareas correspondientes en [TODO.md](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/TODO.md).

---

## 🧪 Verificación y Compilación

Se corrieron los comandos de construcción en el monorepo local:

- Servidor backend compila y tipa correctamente (`npm run build` en `backend`).
- Cliente web empaqueta correctamente (`npm run build` en `web`).
