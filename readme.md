# Cartelera Web de eventos de la ciudad de Mar del Plata

Alumnos: GUARAZ Diego, MEDINA Víctor, SEGURA Melisa | Desarrollo de Sistemas Web – 2026 | ISFT N° 204

## Descripción

El desarrollo consiste en una aplicación web para publicar y consumir eventos locales en formato de cartelera. La plataforma permite consultar eventos próximos (conciertos, exposiciones, talleres, etc.), ver detalles completos, interactuar con la comunidad y publicar nuevos eventos. Artistas y lugares pueden registrarse y gestionar su información pública para mantener sus perfiles actualizados.

[Especificaciones](./spec.md) | [TODO](./TODO.md)

## Estado Actual (Fase 2 y Fase 2.5 Completadas)

Actualmente, el proyecto ha completado exitosamente la **Fase 2 (Pool de Publicaciones y Moderación)** y la **Fase 2.5 (Filtros, Galería de Imágenes y Navegación Responsive)**:

- **Backend:** API REST robusta con **Node.js + Express**, **Prisma** y **PostgreSQL**.
  - Autenticación real con JWT (`jsonwebtoken`) y cifrado de contraseñas (`bcryptjs`).
  - Middlewares de autenticación y protección de rutas según rol del usuario.
  - Endpoints de autenticación operativos (`POST /api/v1/auth/register` y `POST /api/v1/auth/login`).
  - Carga de posters de eventos y múltiples imágenes adicionales (galería) implementada con **Cloudinary**.
  - Flujo de moderación con auditoría transaccional (`AccionModeracion`) y protección de accesos.
  - Categorización de eventos mediante el enum `CategoriaEvento`.
- **Frontend:**
  - **Autenticación real integrada:** Formularios de Login, Registro y Perfil conectados al backend, almacenando el JWT localmente.
  - **Axios Interceptor:** Interceptor configurado en [api.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/api.ts) para adjuntar el token de forma automática en cabeceras de peticiones autorizadas.
  - **Navegación & Seguridad:** Rutas protegidas (`ProtectedRoute`) y barra de navegación responsive y glassmorphic con menú hamburguesa adaptado a móviles.
  - **Panel de Moderación:** Dashboard completo y visual en `/moderacion` para aprobaciones y auditorías de eventos.
  - **Eventos:** Formulario de creación (`CreateEventPage`) moderno que permite seleccionar categorías y subir fotos secundarias con previsualizaciones.
  - **Filtros e Imágenes:** Página de inicio con buscador textual global y botones interactivos de categoría. Detalles del evento en [EventPage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/EventPage/EventPage.tsx) con carrusel dinámico usando `Swiper`.
- **Estabilidad:** Scripts de test de integración de API ([test-auth.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/scripts/test-auth.ts)) agregados y pasando exitosamente.

### Próximos pasos (Fase 3):

- **Perfiles de Entidades:** Implementación de entidad `PERFIL_ENTIDAD` para artistas y lugares de forma unificada.
- **Flujo de Reclamación:** Flujo para que usuarios autorizados reclamen el control de una entidad y verificación por administrador.
- **Dashboard Personal:** Panel de control propio para entidades donde gestionar sus publicaciones y perfiles.

---

## Cómo empezar (Desarrollo)

### Requisitos previos

- **Node.js** (versión 20 o superior recomendada).
- Una cuenta en **Supabase** (o una base de datos PostgreSQL compatible).

### Instalación rápida

1. Clona el repositorio.
2. Ejecuta el comando de configuración centralizada:
   ```bash
   npm run setup
   ```
   _Este comando instalará todas las dependencias (raíz, backend y frontend) y generará el cliente de Prisma._

### Configuración de variables de entorno

Crea un archivo `.env` en la carpeta `backend/` (puedes basarte en `backend/.env.example`) y completa los siguientes datos:

- `DATABASE_URL`: Tu cadena de conexión a PostgreSQL (con la contraseña codificada para URL).
- Credenciales de Supabase y Cloudflare R2 (opcionales para esta fase, obligatorias en futuras).

### Ejecución

Para iniciar los servidores de desarrollo, abre dos terminales:

**Terminal 1 (Backend):**

```bash
npm run dev:backend
```

El servidor correrá en `http://localhost:3000`.

**Terminal 2 (Frontend):**

```bash
cd web
npm run dev
```

La web estará disponible en `http://localhost:5173`.

---

_Nota: Todo el código fuente incluye comentarios extensos en español para facilitar la colaboración del equipo._
