# Historial de Cambios #8: Expansión de Identidad y Gestión de Usuarios

Este documento registra la implementación del sistema de gestión de usuarios, perfiles de entidad y las mejoras en la API de comentarios, integradas desde la rama `backend-update` hacia `dev`. Estas adiciones transforman el backend de un simple catálogo de eventos a una plataforma con identidad y capacidad de interacción.

## Resumen de la Actualización

La actualización se centró en dotar a la aplicación de una estructura de usuarios real y un sistema de perfiles diferenciados (Artistas/Lugares), permitiendo una lógica de negocio más profunda (quién crea qué, quién comenta, quién es el dueño de un espacio).

### 1. Gestión de Usuarios (CRUD Completo)

Se implementaron los endpoints necesarios para el ciclo de vida de las cuentas de usuario:

- **Endpoints:** `GET /api/v1/usuarios`, `POST /api/v1/usuarios`, `PATCH /api/v1/usuarios/:id`, `DELETE /api/v1/usuarios/:id`.
- **Lógica:** Validación de campos obligatorios (`email`, `nombreMostrar`) y manejo de roles básicos como strings (valor por defecto: `miembro`).

### 2. Perfiles de Entidad (Artistas y Lugares)

Se introdujo el concepto de "Perfil de Entidad", que permite a un usuario actuar como un actor relevante en el ecosistema:

- **Modelado:** Se utiliza una relación 1-a-1 entre `Usuario` y `PerfilEntidad`.
- **Tipificación:** Distinción interna mediante el campo `tipo` (`artista` | `lugar`).
- **Endpoints:** Obtención de perfil por `usuario_id` y creación de nuevos perfiles con metadatos específicos (dirección, URL de Google Maps, etc.).

### 3. Evolución de la API de Comentarios

Los comentarios pasaron de ser solo "lectura vinculada a eventos" a recursos independientes:

- **Edición y Borrado:** Implementación de `PATCH` y `DELETE` sobre comentarios específicos.
- **Jerarquía:** Soporte para `padre_id`, preparando el terreno para hilos de conversación, aunque la recursividad aún no está definida en el nivel de Prisma (relación `@relation`).

---

## Decisiones Arquitectónicas y Técnica

### Mapeo de Datos (Store Logic)

Se expandió significativamente `backend/src/store.ts` con funciones mapeadoras (`mapUsuario`, `mapPerfilEntidad`).

- **Razón:** Mantener la consistencia entre el formato de la base de datos (`snake_case`) y el estándar del API (`camelCase`), aislando al resto de la aplicación de los detalles de implementación de Prisma.

### Desacoplamiento de Rutas

Se crearon archivos de rutas independientes (`usuarios.ts`, `perfiles.ts`) para evitar que `app.ts` crezca indefinidamente. Cada módulo es responsable de sus propias validaciones de tipo y manejo de errores HTTP (404 para recursos no encontrados, 400 para inputs inválidos).

---

## Problemas Detectados y Soluciones

| Problema                        | Impacto                                                     | Solución Aplicada / Sugerida                                                                                                   |
| :------------------------------ | :---------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **Roles como Strings**          | Riesgo de inconsistencia de datos (ej: "admin" vs "ADMIN"). | Se implementó una unión de tipos en TypeScript como parche temporal, pero se recomienda migrar a `Enums` de Prisma.            |
| **Relación 1:1 Usuario/Perfil** | Un usuario no puede ser artista y local simultáneamente.    | Aceptado como limitación de la V1 para simplificar el lanzamiento, documentado para futura refactorización.                    |
| **Recursividad de Comentarios** | Dificultad para obtener hilos completos de forma eficiente. | Se agregó `padre_id` en la BD, pero se requiere configurar la relación `@relation` en `schema.prisma` para queries recursivas. |

---

## Próximos Pasos (Roadmap)

1.  **Refactorización de Esquema (ChatGPT Suggestion):** Migrar los campos de estado y rol a `Enums` de Prisma para garantizar integridad referencial.
2.  **Relación Muchos-a-Muchos en Eventos:** Implementar la tabla intermedia para permitir múltiples artistas por evento, superando la limitación del campo único `entidad_lugar_id`.
3.  **Integración Frontend:** Actualizar los servicios de `web/src/services` para consumir estos nuevos endpoints y permitir la edición de perfiles desde la interfaz de usuario.

---

_Documento generado por Gemini CLI en base a los cambios de la rama `backend-update`._
