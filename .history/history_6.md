## History 006 — Phase 0: Database Persistence & Prisma Integration

Date: 2026-05-17

Resumen breve

- Se completó la transición de almacenamiento en memoria a **persistencia real** usando **PostgreSQL (Supabase)** y **Prisma**.
- Se aplicó la migración inicial (`init_schema`) creando las tablas `Usuario`, `PerfilEntidad`, `Evento` y `Comentario`.
- Refactor de `backend/src/store.ts`: se eliminaron los `Map` en memoria y se reemplazaron por llamadas asíncronas al cliente de Prisma.
- Refactor de rutas: todos los endpoints de `eventos.ts` y `comentarios.ts` ahora son `async` y manejan correctamente las Promesas del store.
- Se corrigió un error crítico de conexión (P1013) asegurando que la `DATABASE_URL` esté correctamente codificada para manejar caracteres especiales en la contraseña (`*`, `#`, `^`, `$`).

Cambios realizados

- **backend/.env**: Actualizado con la URL codificada y puerto 5432.
- **backend/src/store.ts**: Implementación completa de métodos CRUD usando `prisma.model.findMany`, `create`, `update`, etc. Incluye mapeo de `snake_case` (BD) a `camelCase` (API).
- **backend/src/routes/eventos.ts** & **comentarios.ts**: Actualizados a funciones `async`.
- **backend/src/app.ts**: El sembrado de datos (`seedDemoData`) ahora es asíncrono.
- **prisma/migrations/**: Creada la primera migración de esquema.

Lecciones aprendidas / Troubleshooting

- **Prioridad de Variables de Entorno**: Se detectó que si existe una variable `DATABASE_URL` en la sesión de la terminal/sistema, esta **anula** al archivo `.env`. Se recomienda limpiar variables de entorno globales si hay errores de "puerto inválido".
- **Codificación de Contraseñas**: Prisma requiere que los caracteres especiales en la URL de conexión estén en formato hexadecimal (ej: `#` -> `%23`).

Cómo verificar

1. Levantar el backend: `npm run dev:backend`.
2. Verificar el log: debería decir `🌱 Sembrando datos iniciales en la DB...` si la base de datos está vacía.
3. Consultar: `curl http://localhost:3000/api/v1/eventos`. Deberías ver el "Evento Inicial Supabase".

Próximos pasos

1. **Fase 1: Autenticación**: Comenzar la integración con Supabase Auth para proteger los endpoints de creación y edición.
2. **Frontend UI**: Empezar a crear formularios para que los usuarios puedan interactuar con la base de datos real desde el navegador.

---

Archivo generado automáticamente — Fase 0 cerrada con éxito. 🚀
