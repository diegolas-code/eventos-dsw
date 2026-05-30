# Comparativa de Esquemas Prisma

Este documento analiza la implementación actual del esquema de Prisma frente a la sugerencia externa ("Sugerencia ChatGPT") para determinar la mejor ruta a seguir en el desarrollo de **Eventos DSW**.

## Análisis de las Opciones

### 1. Esquema Actual (Post backend-update)

Esta es la versión implementada tras la integración de la rama `backend-update`. Aunque representó un avance significativo al introducir usuarios y perfiles, mantiene deudas técnicas importantes:

- **Simplicidad:** Es directo y fácil de entender, pero rígido.
- **Limitaciones:**
  - **Tipado Débil:** Usa `String` para roles (`rol`) y estados (`estado`), lo que impide que la base de datos valide los valores permitidos y obliga a manejar uniones de tipos manuales en TypeScript.
  - **Relación 1-a-1 Rígida:** La relación entre `Usuario` y `PerfilEntidad` es única (`@unique`). Esto impide que un usuario real sea, por ejemplo, un artista que también gestiona su propio local de eventos.
  - **Evento con Artista Único:** Solo contempla un `entidad_lugar_id`. No hay forma de registrar múltiples artistas en un mismo evento (como en un festival o fecha compartida).
  - **Recursividad Incompleta:** Existe el campo `padre_id` en `Comentario`, pero al no estar definida la `@relation` en Prisma, no se pueden realizar consultas recursivas eficientes ni garantizar integridad referencial en las respuestas.

### 2. Sugerencia Externa (ChatGPT)

- **Robustez:** Utiliza `Enum` para roles, tipos de entidad y estados.
- **Flexibilidad:** Permite que un usuario tenga múltiples perfiles (ej. un usuario que es artista y también gestiona un local).
- **Realismo:** Introduce `EventoArtista` (muchos-a-muchos), permitiendo que un evento tenga múltiples artistas invitados, lo cual es fundamental para festivales o fechas compartidas.
- **Mejores Prácticas:** Incluye índices (`@@index`) para optimizar búsquedas por estado y fecha, y define comportamientos de borrado (`onDelete: Cascade/SetNull`).
- **Recursividad:** Define correctamente la relación de comentarios para permitir hilos de conversación.

## Conclusión: La Solución Superadora

La **Sugerencia Externa** es técnicamente superior y proporciona una base mucho más sólida para el crecimiento de la aplicación. Adoptar este esquema ahora evitará refactorizaciones dolorosas en el futuro cercano (especialmente cuando se quiera implementar el soporte para múltiples artistas por evento).

### Propuesta de Integración

Se recomienda adoptar el esquema sugerido con las siguientes consideraciones para el código ya implementado:

1.  **Refactor en `store.ts`:**
    - Actualizar los tipos de TypeScript para que coincidan con los nuevos `Enums` generados por Prisma.
    - Ajustar el mapeo de `mapEvento` para incluir la lógica de múltiples artistas si se requiere en el feed.
    - Aprovechar el `@updatedAt` automático de Prisma y remover actualizaciones manuales de fechas si las hubiera.

2.  **Migración de Datos:**
    - Dado que estamos en etapa de desarrollo inicial, se sugiere un `npx prisma migrate reset` para aplicar el nuevo esquema de forma limpia.

3.  **Frontend:**
    - Ajustar los servicios del frontend para manejar la estructura de artistas como un array en lugar de un campo único (si se decide exponerlo así en el API).

## Veredicto Final

**La opción sugerida (ChatGPT) es la mejor.** Es una "solución superadora" por diseño, ya que contempla casos de uso reales que el esquema actual simplificó demasiado. La implementación actual del backend es lo suficientemente pequeña como para que el costo de adaptación sea mínimo frente al beneficio a largo plazo.

---

_Documento generado por Gemini CLI en base al análisis de los archivos del proyecto y sugerencias externas._
