# Cartelera Web de eventos de la ciudad de Mar del Plata

Alumnos: GUARAZ Diego, MEDINA Víctor, SEGURA Melisa | Desarrollo de Sistemas Web – 2026 | ISFT N° 204

## Descripción

El desarrollo consiste en una aplicación web para publicar y consumir eventos locales en formato de cartelera. La plataforma permite consultar eventos próximos (conciertos, exposiciones, talleres, etc.), ver detalles completos, interactuar con la comunidad y publicar nuevos eventos. Artistas y lugares pueden registrarse y gestionar su información pública para mantener sus perfiles actualizados.

[Especificaciones](./spec.md) | [TODO](./TODO.md)

## Estado Actual (Fase 0.5 - Prototipo Avanzado)

Actualmente, el proyecto ha superado la base inicial y cuenta con una arquitectura de frontend moderna y escalable:

- **Backend:** API REST robusta con **Node.js + Express**, **Prisma** y **PostgreSQL**.
- **Frontend (Refactorizado):**
  - **Navegación:** Implementada con `react-router-dom` (Home, Detalles, Creación, Perfil).
  - **Gestión de Datos:** Uso de `@tanstack/react-query` para fetching y caché eficiente.
  - **Estilos:** Integración completa de **Tailwind CSS**.
  - **Estructura:** Organización por páginas y componentes reutilizables (Navbar, Layouts).
- **Documentación:** El archivo [spec.md](./spec.md) se ha movido a la raíz para facilitar su consulta.
- **Calidad:** Pipeline de CI configurado con GitHub Actions.

### Próximos pasos:

- Integración de **Autenticación (Phase 1)** con Supabase Auth.
- Implementación de formularios de publicación con validación.
- Lógica de moderación y estados de eventos.

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
