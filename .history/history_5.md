# Historial: Corrección de Prisma v6 en el workspace

Fecha: 2026-05-17
Autor: Automatizado (asistente de desarrollo)

Resumen breve

- Se detectó que el archivo `backend/prisma/schema.prisma` marcaba errores por incompatibilidad de sintaxis entre Prisma v6 y el parser por defecto.
- Se aplicó una corrección de configuración en el workspace para forzar el uso de Prisma v6 desde la extensión de VS Code y se verificó que `prisma generate` funciona localmente.

Cambios realizados

- Modificado: `.vscode/settings.json`
  - Se unificaron entradas JSON duplicadas y se agregó la clave:
    - `prisma.pinToPrisma6: true`
- Verificado: `backend/package.json` ya fija `prisma` y `@prisma/client` en la serie `^6.x`.
- Ejecutado localmente: `npm run prisma:generate --prefix backend` → Prisma Client v6 generado correctamente.

Recomendaciones y pasos para que el equipo reproduzca el ambiente correctamente

1. Clonar el repositorio y abrir la carpeta del workspace (para que `.vscode/settings.json` del workspace se aplique automáticamente).
2. Instalar dependencias y generar cliente Prisma:

```bash
npm run setup
# o, si preferís hacerlo por pasos:
# npm install --prefix backend
# npm run prisma:generate --prefix backend
```

3. Crear un archivo `backend/.env` basado en `.env.example` y rellenar `DATABASE_URL` con la cadena de conexión a Postgres/Supabase.
4. Ejecutar las migraciones y arrancar el servidor de desarrollo:

```bash
npm run prisma:migrate --prefix backend
npm run dev --prefix backend
```

5. Si VS Code marca errores en `schema.prisma`, pedir al compañero que haga:

- Command Palette → `Developer: Reload Window` (recargar ventana)
- Command Palette → `TypeScript: Restart TS Server`
- Command Palette → `Prisma: Restart Language Server` (si no aparece, cerrar y reabrir el workspace)

Advertencias y notas

- Hay una actualización mayor de Prisma disponible (v7). No actualizar sin revisar la guía de migración oficial.
- Recomendación de Node.js: usar `v22.22.1+` para evitar warnings con `lint-staged` u otros paquetes. Si aparece `EBADENGINE`, actualizar Node o ignorar la advertencia si no afecta la ejecución.

Archivos relevantes

- `.vscode/settings.json` (ajuste `prisma.pinToPrisma6`)
- `backend/package.json` (dependencias Prisma v6)
- `backend/prisma/schema.prisma`
- `.env.example` (plantilla de variables de entorno)

Cómo revertir

- Para volver al comportamiento por defecto de la extensión de Prisma, borrar o establecer en `false` la propiedad `prisma.pinToPrisma6` en `.vscode/settings.json`.

Mensaje de commit sugerido

- `docs(history): add Prisma v6 workspace fix and setup instructions`

---

Archivo generado automáticamente por el asistente. Si querés que incluya más detalles (salida de comandos, logs, o pasos en Windows), decímelo y actualizo el registro.
