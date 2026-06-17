# Cartelera Web de eventos de la ciudad de Mar del Plata

Alumnos: GUARAZ Diego, MEDINA Víctor, SEGURA Melisa | Desarrollo de Sistemas Web – 2026 | ISFT N° 204

## Descripción

El desarrollo consiste en una aplicación web para publicar y consumir eventos locales en formato de cartelera. La plataforma permite consultar eventos próximos (conciertos, exposiciones, talleres, etc.), ver detalles completos, interactuar con la comunidad y publicar nuevos eventos. Artistas y lugares pueden registrarse y gestionar su información pública para mantener sus perfiles actualizados.

[Especificaciones](./spec.md) | [TODO](./TODO.md)

## Estado Actual (Fase 1 Completada - Autenticación JWT Lista)

Actualmente, el proyecto ha completado exitosamente la **Fase 1 (Autenticación y Roles)**:

- **Backend:** API REST robusta con **Node.js + Express**, **Prisma** y **PostgreSQL**.
  - Autenticación real con JWT (`jsonwebtoken`) y cifrado de contraseñas (`bcryptjs`).
  - Middlewares de autenticación y protección de rutas según rol del usuario.
  - Endpoints de autenticación operativos (`POST /api/v1/auth/register` y `POST /api/v1/auth/login`).
  - Carga de posters de eventos implementada con **Cloudinary** ([cloudinary.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/config/cloudinary.ts)).
- **Frontend:**
  - **Autenticación real integrada:** Formularios de Login, Registro y Perfil conectados al backend, almacenando el JWT localmente.
  - **Axios Interceptor:** Interceptor configurado en [api.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/api.ts) para adjuntar el token de forma automática en cabeceras de peticiones autorizadas.
  - **Navegación & Seguridad:** Rutas protegidas (`ProtectedRoute`) basadas en la existencia del JWT local.
  - **Eventos:** Formulario de creación (`CreateEventPage`) moderno, con widget de previsualización y subida directa de imágenes.
- **Estabilidad:** Scripts de test de integración de API ([test-auth.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/scripts/test-auth.ts)) agregados y pasando exitosamente.

### Próximos pasos (Fase 2):

- **Estados de Publicación:** Añadir estados a eventos (`PENDIENTE`, `PUBLICADO`, `RECHAZADO`, `ARCHIVADO`).
- **Endpoints de Moderación:** Rutas especiales para listar y accionar sobre eventos pendientes.
- **Panel del Moderador:** Interfaz del frontend para que moderadores/admin aprueben o rechacen eventos con comentarios de auditoría.

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
