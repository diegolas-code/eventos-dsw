# Cartelera Web de eventos de la ciudad de Mar del Plata

Alumnos: GUARAZ Diego, MEDINA Víctor, SEGURA Melisa | Desarrollo de Sistemas Web – 2026 | ISFT N° 204

## Descripción

El desarrollo consiste en una aplicación web para publicar y consumir eventos locales en formato de cartelera. La plataforma permite consultar eventos próximos (conciertos, exposiciones, talleres, etc.), ver detalles completos, interactuar con la comunidad y publicar nuevos eventos. Artistas y lugares pueden registrarse y gestionar su información pública para mantener sus perfiles actualizados.

[Especificaciones](./spec.md) | [TODO](./TODO.md)

## Estado Actual (Fase 1 - Autenticación en Progreso)

Actualmente, el proyecto ha completado la **Fase 0.5 (Refactorización de Esquema)** y se encuentra integrando la **Fase 1 (Autenticación)**:

- **Backend:** API REST robusta con **Node.js + Express**, **Prisma** y **PostgreSQL**.
  - Refactorización de esquema completada (Enums, Relaciones M:N).
  - CRUD refinado para usuarios y perfiles de entidad.
  - Validación estricta de roles y tipos de entidad.
- **Frontend:**
  - **Navegación & Seguridad:** Rutas protegidas (`ProtectedRoute`) que redirigen al login si no hay sesión activa.
  - **Eventos:** Formulario de creación (`CreateEventPage`) funcional con validación y formateo de fecha/hora.
  - **Auth UI:** Maquetación completa de Login, Registro y Vista de Perfil (Demo activa).
  - **Estilos:** Tailwind CSS integrado con diseño moderno y minimalista.
- **Integración:** Ramas de UI y Backend unificadas en la rama `dev`.

### Próximos pasos (Fase 1):

- Implementación de **JWT/Auth real** en el backend para reemplazar la sesión demo.
- Conexión del formulario de eventos con el ID del usuario autenticado.
- Subida de imágenes para eventos y perfiles (Cloudflare R2).

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
