`generator client {`  
 `provider = "prisma-client-js"`  
`}`

`datasource db {`  
 `provider = "postgresql"`  
 `url      = env("DATABASE_URL")`  
`}`

`enum RolUsuario {`  
 `miembro`  
 `artista`  
 `lugar`  
 `moderador`  
 `admin`  
`}`

`enum TipoEntidad {`  
 `ARTISTA`  
 `LUGAR`  
`}`

`enum EstadoEvento {`  
 `PENDIENTE`  
 `PUBLICADO`  
 `RECHAZADO`  
 `ARCHIVADO`  
`}`

`model Usuario {`  
 `id                String            @id @default(uuid())`  
 `email             String            @unique`  
 `nombre_mostrar    String`  
 `rol               RolUsuario        @default(miembro)`

`creado_en         DateTime          @default(now())`  
 `actualizado_en    DateTime          @updatedAt`

`eventos_creados   Evento[]`  
 `comentarios       Comentario[]`  
 `perfiles          PerfilEntidad[]`

`@@index([rol])`  
`}`

`model PerfilEntidad {`  
 `id                String            @id @default(uuid())`

`usuario_id        String?`  
 `usuario           Usuario?          @relation(fields: [usuario_id], references: [id], onDelete: SetNull)`

`nombre            String`  
 `tipo              TipoEntidad`

`descripcion       String?`  
 `direccion         String?`  
 `gmaps_url         String?`

`imagen_url        String?`

`reclamado         Boolean           @default(false)`

`creado_en         DateTime          @default(now())`  
 `actualizado_en    DateTime          @updatedAt`

`eventos_lugar     Evento[]`

`eventos_artista   EventoArtista[]`

`@@index([tipo])`  
 `@@index([nombre])`  
`}`

`model Evento {`  
 `id                      String              @id @default(uuid())`

`creado_por_usuario_id   String?`  
 `creado_por              Usuario?            @relation(fields: [creado_por_usuario_id], references: [id], onDelete: SetNull)`

`titulo                  String`  
 `descripcion             String?`

`inicia_en               DateTime`  
 `termina_en              DateTime?`

`estado                  EstadoEvento        @default(PENDIENTE)`

`entidad_lugar_id        String?`  
 `lugar                   PerfilEntidad?      @relation(fields: [entidad_lugar_id], references: [id], onDelete: SetNull)`

`posible_duplicado       Boolean             @default(false)`

`imagen_url              String?`

`creado_en               DateTime            @default(now())`  
 `actualizado_en          DateTime            @updatedAt`

`comentarios             Comentario[]`

`artistas                EventoArtista[]`

`@@index([estado])`  
 `@@index([inicia_en])`  
 `@@index([creado_por_usuario_id])`  
 `@@index([entidad_lugar_id])`  
`}`

`model EventoArtista {`  
 `evento_id           String`  
 `artista_id          String`

`evento              Evento          @relation(fields: [evento_id], references: [id], onDelete: Cascade)`

`artista             PerfilEntidad   @relation(fields: [artista_id], references: [id], onDelete: Cascade)`

`creado_en           DateTime        @default(now())`

`@@id([evento_id, artista_id])`

`@@index([artista_id])`  
`}`

`model Comentario {`  
 `id                  String          @id @default(uuid())`

`evento_id           String`  
 `evento              Evento          @relation(fields: [evento_id], references: [id], onDelete: Cascade)`

`usuario_id          String?`  
 `usuario             Usuario?        @relation(fields: [usuario_id], references: [id], onDelete: SetNull)`

`padre_id            String?`  
 `padre               Comentario?     @relation("ComentarioRespuesta", fields: [padre_id], references: [id], onDelete: Cascade)`

`respuestas          Comentario[]    @relation("ComentarioRespuesta")`

`cuerpo              String`

`creado_en           DateTime        @default(now())`  
 `actualizado_en      DateTime        @updatedAt`

`@@index([evento_id])`  
 `@@index([usuario_id])`  
 `@@index([padre_id])`  
`}`

Cambios principales respecto a tu versión:

enums en vez de TEXT libre,  
`@updatedAt` automático,  
comentarios recursivos completos,  
relación muchos-a-muchos evento/artistas,  
múltiples perfiles por usuario,  
índices importantes,  
relaciones bien definidas,  
`Cascade` y `SetNull` consistentes.

Para aplicarlo:

Reemplazá tu `schema.prisma`  
Ejecutá:

`npx prisma migrate dev` \--name `init`

Si ya tenés migraciones rotas o de prueba:

`npx prisma migrate reset`

Eso borra la base y la recrea. Solo hacelo en desarrollo.

Después:

`npx prisma generate`

Con este esquema ya pueden construir:

feed,  
detalle,  
perfiles,  
comentarios,  
moderación,  
artistas múltiples,  
lugares,  
autenticación,  
publicación de eventos,

sin que el modelo quede demasiado complejo para mantener.
