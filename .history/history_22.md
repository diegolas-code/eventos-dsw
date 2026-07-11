# Registro de Historia 22: Implementación Real de Cambio de Contraseña 🔐

**Fecha:** 11 de Julio, 2026  
**Autores:** Melisa Segura (Colaboradora), Diegolas (Colaborador) y Antigravity (AI Coding Assistant)  
**Objetivo:** Reemplazar el simulador (mock) del panel de seguridad de la cuenta por un flujo transaccional y seguro para cambiar la contraseña del usuario.

---

## 📝 Descripción del Problema

En la entrega anterior de seguridad, la función `handlePasswordChange` en el frontend ([DashboardView.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/DashboardView.tsx)) estaba simulada con un retardo temporal de 1 segundo:

```typescript
// Mock anterior
try {
  await new Promise(resolve => setTimeout(resolve, 1000));
  setPasswordMsg({ tipo: 'ok', texto: 'Contraseña actualizada correctamente.' });
  ...
```

Esto se debía a que no existía lógica en el backend para procesar el cambio de contraseña de forma segura ni endpoints expuestos para este fin.

---

## 🔧 Cambios Implementados

Para resolver este vacío funcional de manera segura, se implementaron los siguientes módulos:

### 1. Lógica de Negocio y Seguridad en el Backend

- **Validación de Credenciales ([store.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts)):** Se añadió la función `cambiarClaveUsuario` que:
  1. Busca al usuario en la base de datos por su identificador primario.
  2. Compara de forma segura la contraseña actual provista por el usuario contra el hash almacenado utilizando `comparePassword` (bcryptjs).
  3. Si la comparación falla, retorna `false` (impidiendo accesos no autorizados).
  4. Si coincide, hashea la nueva contraseña usando `hashPassword` (bcryptjs con salt=10) y actualiza el campo `contrasena_hash` en la base de datos mediante Prisma.

### 2. Exposición del Endpoint Seguro

- **Controlador del API ([usuarios.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/usuarios.ts)):** Se creó la ruta `POST /api/v1/usuarios/:id/cambiar-clave`.
  - **Protección mediante `requireAuth`:** Asegura que la petición sea autenticada mediante un token JWT válido.
  - **Validación de Identidad:** Compara el `id` en los parámetros de la URL con el `id` del usuario decodificado en el token de autenticación JWT (`request.user.id`). Si no coinciden, retorna `403 Forbidden` para impedir que un usuario altere las credenciales de otro.
  - **Validación de Entrada:** Asegura que ambos campos estén presentes y que la nueva contraseña tenga una longitud mínima de 6 caracteres.

### 3. Integración en el Cliente

- **Llamada Dinámica en el Dashboard ([DashboardView.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/DashboardView.tsx)):** Se actualizó el formulario para realizar un envío `POST` a `/api/v1/usuarios/:id/cambiar-clave`.
  - Se añadieron validaciones de longitud mínima previas al envío.
  - Se interceptaron los errores de la respuesta HTTP (ej: "La clave actual ingresada es incorrecta.") para mostrarlos dinámicamente en el banner de estado del panel.

### 4. Actualización de Documentos de Proyecto

- Se registró la finalización de esta tarea en [TODO.md](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/TODO.md).

---

## 🧪 Verificación y Compilación

- **Backend:** La compilación mediante `tsc -p tsconfig.json` en `backend` pasa de forma limpia.
- **Web:** El build de producción mediante `vite build` en `web` finaliza con éxito sin fallos ni advertencias.
