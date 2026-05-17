# Historia de cambios — history_2

Fecha: 2026-05-16

Resumen de lo trabajado desde el historial anterior:

- Se dejó documentado el flujo de trabajo con commits, pushes, linting y formatting en `/.history/history_1.md`.
- Se siguió avanzando con el setup base del proyecto para Fase 0.
- Se creó y validó el scaffold inicial del backend en Express + TypeScript.
- Se fijó Prisma 6 en el backend para mantener la sintaxis clásica de `schema.prisma`.
- Se añadieron scripts estándar para Prisma en `backend/package.json`.
- Se dejó una API base con rutas de eventos y comentarios, junto con almacenamiento temporal en memoria para arrancar rápido.

Configuración que debe existir antes de seguir el workflow normal:

- Node.js 18+ y `npm` instalados localmente.
- Dependencias instaladas en la raíz y en `backend/`.
- Git configurado con acceso al remoto.
- Rama `dev` creada y usada como rama de integración.
- Husky activado con el hook `pre-commit`.
- `lint-staged` y Prettier configurados para correr en archivos staged.
- Prisma 6 instalado en `backend/`.

Workflow recomendado para seguir trabajando:

1. Crear una feature branch:

```powershell
git checkout -b feat/nombre-corto
```

2. Hacer cambios y validar:

```powershell
npm run lint
npm run format
npm run typecheck
```

3. Revisar estado antes de commitear:

```powershell
git status
```

4. Commit con mensaje corto y claro:

```powershell
git add .
git commit -m "feat: descripcion breve"
```

5. Push de la rama actual:

```powershell
git push -u origin HEAD
```

6. Abrir PR contra `dev` y dejar que CI valide lint/build.

Comandos útiles para el backend:

```powershell
npm run dev --prefix backend
npm run build --prefix backend
npm run prisma:generate --prefix backend
npm run prisma:migrate --prefix backend
npm run prisma:studio --prefix backend
```

Troubleshooting rápido:

- Si Prisma marca `url = env("DATABASE_URL")` como inválido, confirmar que `backend/package.json` sigue fijado en Prisma 6 y reinstalar dependencias.
- Si `npm` no aparece en la terminal, instalar Node.js y reabrir VS Code.
- Si Husky o lint-staged no corren, revisar que `npm install` se haya ejecutado en la raíz del repo.
- Si el editor sigue mostrando errores viejos, recargar la ventana o reiniciar el servidor de lenguaje.
- Si un commit falla por formateo, ejecutar `npm run format` y volver a commitear.

Notas pendientes:

- Falta instalar dependencias locales para que el entorno quede completamente operativo.
- El siguiente paso lógico sigue siendo el frontend con Vite + React + TypeScript.
- Más adelante habrá que conectar frontend y backend para el CRUD real de eventos y comentarios.
