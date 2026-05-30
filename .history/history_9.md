# Historial de Cambios #9: Refactorización de Esquema, Enums y Relaciones M:N

Este documento registra la ejecución de la **Fase 0.5**, una etapa crítica de refactorización técnica que dota al backend de una estructura de datos robusta, tipada y escalable antes de proceder con la integración de autenticación (Fase 1).

## Resumen de la Actualización

La actualización transformó el modelo de datos de uno basado en strings libres a uno basado en **Enums de Prisma**, y expandió las capacidades de relación entre entidades.

### 1. Migración a Enums

Se eliminó el uso de `String` para campos categóricos, sustituyéndolos por Enums nativos de PostgreSQL gestionados por Prisma:

- **RolUsuario:** `miembro`, `artista`, `lugar`, `moderador`, `admin`.
- **TipoEntidad:** `ARTISTA`, `LUGAR`.
- **EstadoEvento:** `PENDIENTE`, `PUBLICADO`, `RECHAZADO`, `ARCHIVADO`.

**Beneficio:** Integridad de datos garantizada a nivel de base de datos y tipado fuerte en TypeScript, eliminando errores por strings inválidos.

### 2. Relación Muchos-a-Muchos (Evento <-> Artista)

Se implementó la tabla intermedia `EventoArtista` para permitir que un evento tenga múltiples artistas participantes.

- **Estructura:** El modelo `Evento` ya no depende de un campo único para artistas. Ahora se vinculan mediante una relación `EventoArtista` que conecta con `PerfilEntidad`.
- **Flexibilidad:** Fundamental para festivales, fechas compartidas o eventos con múltiples protagonistas.

### 3. Recursividad en Comentarios

Se definió correctamente la relación `@relation` para el campo `padre_id` en el modelo `Comentario`.

- **Cambio:** Permite a Prisma entender la jerarquía de hilos, facilitando consultas recursivas y garantizando que al borrar un comentario padre, sus respuestas se gestionen adecuadamente (`Cascade`).

---

## Decisiones Arquitectónicas y Técnica

### Refactorización del Store (`store.ts`)

Se realizó una cirugía profunda en el corazón del acceso a datos:

- **Interfaces:** Actualizadas para incluir Enums y el nuevo array de `artistas` en la interfaz `Evento`.
- **Mapeadores:** `mapEvento` ahora procesa la estructura anidada de la relación muchos-a-muchos para devolver una lista plana de artistas al API.
- **Consultas:** Se incluyó `include` en `findMany` y `findUnique` para obtener los artistas de forma automática.
- **Seed Data:** Se actualizó `seedDemoData` para poblar la base de datos limpia con un ejemplo completo que utiliza todas las nuevas relaciones y Enums.

### Sincronización de DTOs y Rutas

- Se actualizaron los DTOs para importar los Enums directamente de `@prisma/client`.
- Los routers de `eventos`, `usuarios` y `perfiles` fueron adaptados para validar y pasar los tipos correctos al `store.ts`.

---

## Cómo Verificar la Fase 0.5

1. **Base de Datos:** Ejecutar `npx prisma studio` para ver los nuevos Enums y la tabla intermedia `EventoArtista`.
2. **Build:** El comando `npm run build` en el backend debe completarse sin errores de tipo.
3. **API:**
   - `GET /api/v1/eventos` ahora devuelve una propiedad `artistas` como array en cada evento.
   - `POST /api/v1/eventos` acepta un array `artistasIds` para vincular artistas en la creación.

---

## Próximos Pasos (Phase 1)

Con una base de datos sólida y tipada, el siguiente paso es la **Fase 1: Autenticación y Roles**, donde se integrará Supabase Auth para proteger estos nuevos modelos y restringir acciones según el `RolUsuario`.

---

_Documento generado por Gemini CLI tras completar la Fase 0.5 del roadmap._
