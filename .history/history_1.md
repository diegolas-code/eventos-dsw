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

---

## Flujo de commits, linting y push — pasos y comandos

Los pasos siguientes describen el workflow estándar para commits y pushes con linting/formatting automático (husky + lint-staged) y la verificación en CI.

Requisitos previos (configurar antes de usar el flujo):

- Tener instalado Node.js 18+ y `npm`.
- Haber corrido `npm install` en la raíz del repo para instalar dependencias dev (eslint, prettier, husky, lint-staged, typescript).
- Configurar credenciales Git y acceso al remoto (ya creado en este repo).
- (Opcional) Crear la rama `dev` y configurarla como rama de integración: `git checkout -b dev` y `git push -u origin dev`.
- Ejecutar una vez: `npx husky install` para activar hooks.
- Crear el hook pre-commit que ejecuta lint-staged (si no existe):

```powershell
npx husky add .husky/pre-commit "npx lint-staged"
```

Workflow diario (pasos y comandos):

1. Trabajar en una feature branch:

```powershell
git checkout -b feat/mi-feature
```

2. Hacer cambios y verificarlos localmente (lint y format opcionalmente):

```powershell
npm run lint        # corre eslint (no hace fixes for all)
npm run format      # formatea todo con prettier
```

3. Añadir y commitear. Al hacer `git commit` Husky ejecutará `lint-staged`:

```powershell
git add .
git commit -m "feat: descripcion corta de la feature"
```

Notas sobre `lint-staged`: solo los archivos staged serán pasados a `eslint --fix` y `prettier --write` según la configuración en `package.json`.

4. Hacer push y abrir Pull Request contra `dev` o `main` según el flujo:

```powershell
git push -u origin HEAD
# o si subes a la rama remota con nombre diferente
git push -u origin feat/mi-feature
```

5. CI en GitHub Actions correrá `npm ci` y `npm run lint` (configurado en `.github/workflows/ci.yml`). Asegurate que el PR esté limpio antes de mergear.

Consejos y buenas prácticas:

- Commit pequeños y atómicos; mensajes claros (ej. Conventional Commits: `feat:`, `fix:`, `chore:`).
- Si `npm run lint` falla en CI por errores de lint, arreglalos localmente o ejecuta `npx eslint . --fix` y vuelve a commitear.
- No subas `.env` ni secretos; usa GitHub Secrets y variables de entorno en los despliegues.
- Si necesitás desactivar temporalmente los hooks (no recomendado): `git commit --no-verify`.

Comandos útiles de recuperación:

```powershell
git status
git diff
git restore --staged <file>
git log --oneline
```

Con esto tenés el flujo completo para trabajar en features, garantizar formateo y linting automático en commits, y validar en CI antes del merge.
