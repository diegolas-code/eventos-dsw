# Historia de cambios — history_1

Fecha: 2026-05-16

Resumen de acciones realizadas en el repositorio hasta este punto:

- Creación de `.env.example` con explicación y variables de ejemplo.
- Añadidos documentos de planificación: `TODO.md` y `TODO-detallado.md` con entregables por fases y pasos detallados.
- Añadida instrucción del proyecto en `/.github/copilot-instructions.md` y verificada su contenido.
- Configuración de formato y linting:
  - `.prettierrc`, `.prettierignore`
  - `.eslintrc.cjs`, `.eslintignore`
  - `package.json` base con scripts y `lint-staged` config
  - Husky preparado (instalación pendiente en local)
- Añadido workflow básico de CI: `.github/workflows/ci.yml` (ejecuta lint en push/PR).
- Actualización del archivo `spec.md` y creación de `TODO.md` y `TODO-detallado.md` basados en los requisitos del proyecto.
- Revisión de seguridad: se ejecutaron comprobaciones de `npm audit` y se verificó que el proyecto ya no muestra vulnerabilidades.

Notas operativas:

- Se recomendó usar Express + TypeScript para el backend, React + Vite para el frontend, PostgreSQL + Prisma, y Supabase Auth en fases posteriores.
- Se configuró ESLint + Prettier y un flujo con `lint-staged` para formateo automático en commits.
- Pendiente: scaffold del backend (`backend/`) y frontend (`web/`), instalación de Husky local y creación de branch `dev` remota.

Próximos pasos sugeridos:

1. Ejecutar `npm install` y `npx husky install` localmente.
2. Crear scaffold inicial del backend (Express + TypeScript + Prisma).
3. Crear scaffold inicial del frontend (Vite React TS) y conectar al API.
