# Comparativa de Esquemas Prisma

Este documento analiza la implementación actual del esquema de Prisma frente a la sugerencia externa ("Sugerencia ChatGPT") para determinar la mejor ruta a seguir en el desarrollo de **Eventos DSW**.

## Análisis de las Opciones

### 1. Esquema Actual (Implementado)

- **Simplicidad:** Es directo y fácil de entender.
- **Limitaciones:**
  - Usa `String` para roles y estados, lo que puede llevar a errores de tipeo y datos inconsistentes.
  - Relación 1-a-1 entre Usuario y Perfil (un usuario solo puede ser un "artista" O un "lugar", no ambos).
  - Falta de relación muchos-a-muchos para artistas en eventos (solo contempla un `entidad_lugar_id`).
  - La recursividad de comentarios no está explícitamente definida en Prisma (falta la relación `@relation` para `padre_id`).

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
