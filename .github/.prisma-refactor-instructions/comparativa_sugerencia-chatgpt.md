# Sugerencia de Esquema Prisma (Refactor Completo)

Este documento contiene la propuesta de esquema optimizado para **Eventos DSW**. Resuelve las limitaciones detectadas tras la integración de la rama `backend-update`.

## Esquema Propuesto

```prisma
/**
 * Sugerencia de Esquema Refactorizado.
 * Este modelo soluciona las limitaciones de tipado, flexibilidad de perfiles y relaciones muchos-a-muchos.
 */

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

/**
 * Enums para garantizar integridad de datos.
 */
enum RolUsuario {
  miembro
  artista
  lugar
  moderador
  admin
}

enum TipoEntidad {
  ARTISTA
  LUGAR
}

enum EstadoEvento {
  PENDIENTE
  PUBLICADO
  RECHAZADO
  ARCHIVADO
}

/**
 * Modelo de Usuario.
 * Ahora soporta múltiples perfiles y roles tipados.
 */
model Usuario {
  id                String            @id @default(uuid())
  email             String            @unique
  nombre_mostrar    String
  rol               RolUsuario        @default(miembro)

  creado_en         DateTime          @default(now())
  actualizado_en    DateTime          @updatedAt

  // Relaciones
  eventos_creados   Evento[]          @relation("EventosCreados")
  comentarios       Comentario[]
  perfiles          PerfilEntidad[]

  @@index([rol])
}

/**
 * Modelo de Perfil de Entidad.
 * Permite que un usuario tenga múltiples identidades (Artista, Lugar, etc).
 */
model PerfilEntidad {
  id                String            @id @default(uuid())

  usuario_id        String?
  usuario           Usuario?          @relation(fields: [usuario_id], references: [id], onDelete: SetNull)

  nombre            String
  tipo              TipoEntidad

  descripcion       String?
  direccion         String?
  gmaps_url         String?

  imagen_url        String?

  reclamado         Boolean           @default(false)

  creado_en         DateTime          @default(now())
  actualizado_en    DateTime          @updatedAt

  // Relaciones
  eventos_lugar     Evento[]
  eventos_artista   EventoArtista[]

  @@index([tipo])
  @@index([nombre])
}

/**
 * Modelo de Evento.
 * Corazón del sistema, ahora con soporte para múltiples artistas invitados.
 */
model Evento {
  id                      String              @id @default(uuid())

  creado_por_usuario_id   String?
  creado_por              Usuario?            @relation("EventosCreados", fields: [creado_por_usuario_id], references: [id], onDelete: SetNull)

  titulo                  String
  descripcion             String?

  inicia_en               DateTime
  termina_en              DateTime?

  estado                  EstadoEvento        @default(PENDIENTE)

  entidad_lugar_id        String?
  lugar                   PerfilEntidad?      @relation(fields: [entidad_lugar_id], references: [id], onDelete: SetNull)

  posible_duplicado       Boolean             @default(false)

  imagen_url              String?

  creado_en               DateTime            @default(now())
  actualizado_en          DateTime            @updatedAt

  // Relaciones
  comentarios             Comentario[]
  artistas                EventoArtista[]

  @@index([estado])
  @@index([inicia_en])
  @@index([creado_por_usuario_id])
  @@index([entidad_lugar_id])
}

/**
 * Tabla intermedia para relación Muchos-a-Muchos entre Eventos y Artistas.
 */
model EventoArtista {
  evento_id           String
  artista_id          String

  evento              Evento          @relation(fields: [evento_id], references: [id], onDelete: Cascade)
  artista             PerfilEntidad   @relation(fields: [artista_id], references: [id], onDelete: Cascade)

  creado_en           DateTime        @default(now())

  @@id([evento_id, artista_id])
  @@index([artista_id])
}

/**
 * Modelo de Comentario.
 * Implementa recursividad real para hilos de conversación.
 */
model Comentario {
  id                  String          @id @default(uuid())

  evento_id           String
  evento              Evento          @relation(fields: [evento_id], references: [id], onDelete: Cascade)

  usuario_id          String?
  usuario             Usuario?        @relation(fields: [usuario_id], references: [id], onDelete: SetNull)

  padre_id            String?
  padre               Comentario?     @relation("ComentarioRespuesta", fields: [padre_id], references: [id], onDelete: Cascade)

  respuestas          Comentario[]    @relation("ComentarioRespuesta")

  cuerpo              String

  creado_en           DateTime        @default(now())
  actualizado_en      DateTime        @updatedAt

  @@index([evento_id])
  @@index([usuario_id])
  @@index([padre_id])
}
```

## Cambios Principales y Beneficios

1.  **Enums en vez de Strings:** Se garantiza que solo valores válidos entren en `rol`, `tipo` y `estado`.
2.  **Relación Muchos-a-Muchos (Evento/Artista):** Permite registrar múltiples bandas o artistas en un solo evento.
3.  **Recursividad de Comentarios:** Define correctamente la relación `@relation` para permitir consultas anidadas y hilos de conversación reales.
4.  **Flexibilidad de Perfiles:** Un usuario puede tener múltiples perfiles asociados (un usuario que es artista y también gestiona un local).
5.  **Índices de Rendimiento:** Se añaden `@@index` en campos críticos para búsquedas frecuentes.
6.  **Integridad Referencial:** Uso consistente de `onDelete: Cascade` y `SetNull`.

## Pasos para la Aplicación

1.  **Reemplazo:** Copiar el contenido anterior en `backend/prisma/schema.prisma`.
2.  **Reset de Base de Datos:**
    ```bash
    npx prisma migrate reset
    ```
    _(Advertencia: Esto borrará los datos actuales. Solo realizar en entorno de desarrollo)._
3.  **Generación de Cliente:**
    ```bash
    npx prisma generate
    ```
4.  **Refactor de Store:** Actualizar `backend/src/store.ts` para manejar los nuevos Enums y la lógica de múltiples artistas.
