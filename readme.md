# Cartelera Web de eventos de la ciudad de Mar del Plata

Alumnos: GUARAZ Diego, MEDINA Víctor, SEGURA Melisa | Desarrollo de Sistemas Web – 2026 | ISFT N° 204

## Descripción

El desarrollo consiste en una aplicación web para publicar y consumir eventos locales en formato de cartelera. La plataforma permite consultar eventos próximos (conciertos, exposiciones, talleres, etc.), ver detalles completos, interactuar con la comunidad y publicar nuevos eventos. Artistas y lugares pueden registrarse y gestionar su información pública para mantener sus perfiles actualizados.

## Estado Actual (Fase 0 - Completada)

Actualmente, el proyecto cuenta con una infraestructura base sólida y funcional:

- **Backend:** API REST construida con **Node.js + Express** y tipado estricto con **TypeScript**.
- **Base de Datos:** Persistencia real en la nube utilizando **PostgreSQL (Supabase)** y el ORM **Prisma**.
- **Frontend:** Aplicación básica con **React + Vite** configurada para consumir la API.
- **Calidad:** Configuración de **ESLint**, **Prettier** y **Husky** para mantener estándares de código.

### Próximos pasos:

- Implementación de **Autenticación (Phase 1)**.
- Creación de formularios de publicación y perfiles de usuario.
- Panel de moderación de eventos.

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
