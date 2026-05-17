# Estado del Proyecto - Pausa de Desarrollo

Este documento resume el progreso actual para que cualquier integrante del equipo (o tú mismo al despertar) pueda retomar el trabajo sin perder el hilo.

## 🟢 Lo que ya está hecho (Fase 0 Finalizada al 90%)

### **1. Backend (Node.js + Express + TypeScript)**

- **Arquitectura:** Servidor modular con `app factory` y rutas separadas.
- **Endpoints:** CRUD completo para **Eventos** y **Comentarios** funcionando (`/api/v1/eventos` y `/api/v1/comentarios`).
- **Tipado:** Uso de **DTOs** (`dtos.ts`) y genéricos de Express para evitar errores de tipo y asegurar consistencia.
- **Datos de prueba:** Sistema de `seed` en memoria para ver datos nada más arrancar.

### **2. Frontend (React + Vite + TypeScript)**

- **Scaffold:** Estructura de carpetas lista en el directorio `web/`.
- **Conectividad:** Configurado un **Proxy** en `vite.config.ts` para que el frontend hable con el backend sin problemas de CORS.
- **UI Inicial:** Listado simple de eventos que ya consume datos reales de la API.

### **3. Base de Datos (Prisma)**

- **Esquema:** `schema.prisma` definido con modelos unificados (`Usuario`, `PerfilEntidad`, `Evento`, `Comentario`).
- **Simplificación:** Se unificaron artistas y lugares en una sola entidad para agilizar el desarrollo.

### **4. DX & Tooling (Experiencia de Desarrollador)**

- **Script de Setup:** `npm run setup` en la raíz instala TODO y genera el cliente de Prisma.
- **Calidad de código:** ESLint (con configs separadas para FE y BE), Prettier, Husky y lint-staged configurados.
- **Documentación:** Registro histórico detallado en la carpeta `.history/`.

---

## 🚀 Próximos Pasos (Pendientes)

### **1. Persistencia Real (Base de Datos)**

- **Configurar `.env`:** Crear `backend/.env` con la `DATABASE_URL` real.
- **Migración:** Ejecutar `npm run prisma:migrate --prefix backend` para crear las tablas en la nube/local.
- **Refactor Store:** Cambiar la lógica de `backend/src/store.ts` para que use `prisma.evento.findMany()`, etc., en lugar de los Mapas en memoria.

### **2. Fase 1: Autenticación**

- Integrar **Supabase Auth**.
- Crear el middleware de **RBAC** (Control de Acceso Basado en Roles) para proteger las rutas de creación y moderación.

### **3. Frontend: Formularios**

- Crear la vista de "Publicar Evento" conectada al `POST /eventos`.

---

## 📝 Notas para el equipo

- Los comentarios en el código están en **Español** para facilitar la lectura.
- El backend corre en el puerto **3001** y el frontend en el **5173**.
- Toda la lógica de "Detección de duplicados" se ha simplificado a una comparación básica de Lugar/Día/Artista.

**¡Descansa! El proyecto tiene una base muy sólida.** 🛌✨
